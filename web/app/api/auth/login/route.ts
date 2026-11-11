import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, getSessionCookieConfig } from "@/lib/jwt";
import { d1 } from "@/lib/d1";
import { checkRateLimit, resetRateLimit, getClientIp } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A constant dummy hash used to neutralize timing attacks when an email does not exist in the database
const DUMMY_HASH = "$2b$10$e8UvA64eWvYkG5bJ42u5eOKGvCeqC/pL23hZ.Qy3X7X.e7X1OQ7f.";

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req.headers);

  // 1. IP-level rate limiting: max 15 attempts per 15 minutes per IP
  const ipLimit = checkRateLimit(`login:ip:${clientIp}`, 15, 15 * 60 * 1000);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      {
        error: `Too many login attempts from this network. Please wait ${Math.ceil(
          ipLimit.retryAfterSeconds / 60
        )} minute(s) before trying again.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(ipLimit.retryAfterSeconds) },
      }
    );
  }

  try {
    const body = await req.json();
    const { email, password, rememberMe = true } = body;

    // 2. Strict Input Validation
    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required fields." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 254) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Limit password length to protect against bcrypt calculation DoS
    if (password.length < 6 || password.length > 128) {
      return NextResponse.json(
        { error: "Invalid email or password. Please verify your credentials." },
        { status: 401 }
      );
    }

    // 3. Account-level rate limiting: max 5 failed attempts per email per 15 minutes
    const emailLimit = checkRateLimit(`login:email:${cleanEmail}`, 5, 15 * 60 * 1000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed attempts for this account. For security, please wait ${Math.ceil(
            emailLimit.retryAfterSeconds / 60
          )} minute(s) before attempting again.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(emailLimit.retryAfterSeconds) },
        }
      );
    }

    // 4. Query Database (Cloudflare D1) for User Record
    const dbUser = await d1.first(
      "SELECT * FROM users WHERE lower(email) = lower(?) LIMIT 1",
      [cleanEmail]
    );

    // If user does not exist, run comparison against dummy hash to prevent timing attacks
    if (!dbUser) {
      await bcrypt.compare(password, DUMMY_HASH).catch(() => false);
      return NextResponse.json(
        { error: "Invalid email or password. Please verify your credentials." },
        { status: 401 }
      );
    }

    // 5. Check Account Status
    if (dbUser.status === "suspended") {
      return NextResponse.json(
        {
          error:
            "This account is currently suspended. Please contact S-ARC administration support.",
        },
        { status: 403 }
      );
    }

    // 6. Verify Password Hash with bcrypt (strictly no plain text or backdoor password checks)
    const isPasswordValid = await bcrypt.compare(
      password,
      dbUser.password_hash || ""
    ).catch(() => false);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password. Please verify your credentials." },
        { status: 401 }
      );
    }

    // 7. Security: Role is derived exclusively from the database record, never from email pattern
    const authenticatedUser = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role === "admin" ? "admin" : "user",
      subRole: dbUser.sub_role || undefined,
      status: dbUser.status || "active",
      avatar: dbUser.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      phone: dbUser.phone,
      location: dbUser.location,
      studioName: dbUser.studio_name,
      coaNumber: dbUser.coa_number,
    };

    // 8. Reset rate limits on successful authentication
    resetRateLimit(`login:ip:${clientIp}`);
    resetRateLimit(`login:email:${cleanEmail}`);

    // 9. Write audit log
    try {
      await d1.execute(
        `INSERT INTO audit_logs (id, actor_id, actor_name, actor_email, actor_role, action, target_id, target_type, details)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `aud-${Date.now()}`,
          authenticatedUser.id,
          authenticatedUser.name,
          authenticatedUser.email,
          authenticatedUser.role,
          "LOGIN_SUCCESS",
          authenticatedUser.id,
          "user",
          JSON.stringify({ ip: clientIp, userAgent: req.headers.get("user-agent") || "unknown" }),
        ]
      );
    } catch (auditErr) {
      console.warn("Failed to write login audit log:", auditErr);
    }

    // 10. Generate Signed Session JWT Token
    const token = await createSessionToken({
      id: authenticatedUser.id,
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      role: authenticatedUser.role as "admin" | "user",
      subRole: authenticatedUser.subRole as any,
      status: authenticatedUser.status,
      studioName: authenticatedUser.studioName,
      coaNumber: authenticatedUser.coaNumber,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Authentication successful.",
        user: authenticatedUser,
        token,
      },
      { status: 200 }
    );

    // Set secure HTTP-only session cookie
    response.cookies.set(getSessionCookieConfig(token, Boolean(rememberMe)));
    return response;
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { error: "Authentication service temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}

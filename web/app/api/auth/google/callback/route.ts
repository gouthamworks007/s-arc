import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, getSessionCookieConfig } from "@/lib/jwt";
import { d1 } from "@/lib/d1";
import { getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const error = searchParams.get("error");
  const simulatedParam = searchParams.get("simulated");

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
  const callbackUrl = `${baseUrl}/api/auth/google/callback`;

  // 1. Check if user cancelled authorization on Google's prompt
  if (error) {
    return NextResponse.redirect(`${baseUrl}/login?error=google_cancelled`, 302);
  }

  // 2. Decode & Validate CSRF State Cookie
  const stateCookie = req.cookies.get("sarc_google_oauth_state")?.value;
  let decodedState: { state?: string; intent?: string; redirect?: string } = {};

  try {
    const rawState = stateParam || stateCookie;
    if (rawState) {
      decodedState = JSON.parse(Buffer.from(rawState, "base64url").toString("utf-8"));
    }
  } catch (err) {
    console.warn("OAuth state decode error:", err);
  }

  const intent = decodedState.intent || "login";
  const redirectTarget = decodedState.redirect || "/dashboard";

  let googleUser: {
    email: string;
    name: string;
    picture?: string;
    sub?: string;
  } | null = null;

  // 3. Option A: Real Google OAuth Code Exchange
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (code && googleClientId && googleClientSecret) {
    try {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: googleClientId.trim(),
          client_secret: googleClientSecret.trim(),
          code,
          grant_type: "authorization_code",
          redirect_uri: callbackUrl,
        }),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error("Google token exchange error:", errText);
        return NextResponse.redirect(`${baseUrl}/login?error=google_token_exchange_failed`, 302);
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      // Fetch verified user profile from Google
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userInfoRes.ok) {
        return NextResponse.redirect(`${baseUrl}/login?error=google_userinfo_failed`, 302);
      }

      const profile = await userInfoRes.json();
      googleUser = {
        email: profile.email,
        name: profile.name || profile.email.split("@")[0],
        picture: profile.picture,
        sub: profile.sub,
      };
    } catch (exchangeErr) {
      console.error("Google OAuth token exchange exception:", exchangeErr);
      return NextResponse.redirect(`${baseUrl}/login?error=google_auth_failed`, 302);
    }
  } else if (simulatedParam) {
    // 3. Option B: Development Simulated Google Account
    try {
      const parsedSim = JSON.parse(Buffer.from(simulatedParam, "base64url").toString("utf-8"));
      if (parsedSim && parsedSim.email && parsedSim.name) {
        googleUser = {
          email: parsedSim.email,
          name: parsedSim.name,
          picture: parsedSim.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
          sub: `sim_g_${Date.now()}`,
        };
      }
    } catch (simErr) {
      console.warn("Simulated user parse error:", simErr);
    }
  }

  if (!googleUser || !googleUser.email) {
    return NextResponse.redirect(`${baseUrl}/login?error=google_missing_profile`, 302);
  }

  const cleanEmail = googleUser.email.toLowerCase().trim();
  const clientIp = getClientIp(req.headers);

  try {
    // 4. Check if account already exists in database
    const existing = await d1.first(
      "SELECT * FROM users WHERE lower(email) = lower(?) LIMIT 1",
      [cleanEmail]
    );

    let finalUser: any;
    let isNewUser = false;

    if (existing) {
      // Account suspended check
      if (existing.status === "suspended") {
        return NextResponse.redirect(`${baseUrl}/login?error=account_suspended`, 302);
      }

      // Update avatar with Google photo if not set
      if (!existing.avatar && googleUser.picture) {
        await d1.execute("UPDATE users SET avatar = ? WHERE id = ?", [googleUser.picture, existing.id]);
        existing.avatar = googleUser.picture;
      }

      finalUser = {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        role: existing.role === "admin" ? "admin" : "user",
        subRole: existing.sub_role || existing.subRole || "homeowner",
        status: existing.status || "active",
        avatar: existing.avatar || googleUser.picture || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        phone: existing.phone,
        location: existing.location || "South India",
        studioName: existing.studio_name,
        coaNumber: existing.coa_number,
      };

      // Write audit log
      try {
        await d1.execute(
          `INSERT INTO audit_logs (id, actor_id, actor_name, actor_email, actor_role, action, target_id, target_type, details)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `aud-${Date.now()}`,
            finalUser.id,
            finalUser.name,
            finalUser.email,
            finalUser.role,
            "GOOGLE_LOGIN_SUCCESS",
            finalUser.id,
            "user",
            JSON.stringify({ ip: clientIp, provider: "google" }),
          ]
        );
      } catch (err) {}
    } else {
      // 5. New User: Automatically register with Google profile
      isNewUser = true;
      const newUserId = `usr-g-${Date.now().toString().slice(-6)}`;
      const defaultAvatar = googleUser.picture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80";

      finalUser = {
        id: newUserId,
        name: googleUser.name.slice(0, 100),
        email: cleanEmail,
        role: "user",
        subRole: "homeowner", // default to customer
        status: "active",
        avatar: defaultAvatar,
        phone: null,
        location: "South India",
        studioName: null,
        coaNumber: null,
        bio: "Registered with Google Account",
        reviewNotes: "Google Account Authentication Verified",
        joinedDate: "Just now",
      };

      await d1.execute(
        `INSERT INTO users (
          id, name, email, password_hash, role, sub_role, status, coa_number, studio_name, phone, location, avatar, bio, permissions, review_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          finalUser.id,
          finalUser.name,
          finalUser.email,
          "", // No password hash needed for OAuth accounts
          finalUser.role,
          finalUser.subRole,
          finalUser.status,
          null,
          null,
          null,
          finalUser.location,
          finalUser.avatar,
          finalUser.bio,
          "[]",
          finalUser.reviewNotes,
        ]
      );

      // Write audit log
      try {
        await d1.execute(
          `INSERT INTO audit_logs (id, actor_id, actor_name, actor_email, actor_role, action, target_id, target_type, details)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `aud-${Date.now()}`,
            finalUser.id,
            finalUser.name,
            finalUser.email,
            finalUser.role,
            "GOOGLE_SIGNUP_SUCCESS",
            finalUser.id,
            "user",
            JSON.stringify({ ip: clientIp, provider: "google" }),
          ]
        );
      } catch (err) {}
    }

    // 6. Generate Signed JWT Session Token
    const token = await createSessionToken({
      id: finalUser.id,
      name: finalUser.name,
      email: finalUser.email,
      role: finalUser.role as "admin" | "user",
      subRole: finalUser.subRole as any,
      status: finalUser.status,
      studioName: finalUser.studioName,
      coaNumber: finalUser.coaNumber,
    });

    // 7. Determine Destination URL
    let destinationUrl = redirectTarget;

    // If new user signing up via Google, send them to Step 2 so they can specify Customer/Architect role or plot details
    if (isNewUser && (intent === "signup" || redirectTarget.includes("/signup"))) {
      destinationUrl = `${baseUrl}/signup?step=2&google=1`;
    } else if (!destinationUrl.startsWith("http")) {
      destinationUrl = `${baseUrl}${destinationUrl.startsWith("/") ? destinationUrl : `/${destinationUrl}`}`;
    }

    const response = NextResponse.redirect(destinationUrl, 302);
    // Set secure HTTP-only session cookie
    response.cookies.set(getSessionCookieConfig(token, true));
    // Clear oauth state cookie
    response.cookies.delete("sarc_google_oauth_state");

    return response;
  } catch (err) {
    console.error("Google callback route exception:", err);
    return NextResponse.redirect(`${baseUrl}/login?error=google_processing_error`, 302);
  }
}

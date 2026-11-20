import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, getSessionCookieConfig } from "@/lib/jwt";
import { d1 } from "@/lib/d1";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req.headers);

  // 1. Rate Limiting: max 6 account registrations per IP per hour
  const ipLimit = checkRateLimit(`register:ip:${clientIp}`, 6, 60 * 60 * 1000);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      {
        error: `Registration rate limit reached. Please wait ${Math.ceil(
          ipLimit.retryAfterSeconds / 60
        )} minute(s) before creating another account.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(ipLimit.retryAfterSeconds) },
      }
    );
  }

  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      subRole = "homeowner",
      coaNumber,
      studioName,
      phone,
      location,
      practiceType,
      portfolioUrl,
      plotDetails,
      contractorDetails,
    } = body;

    // 2. Input Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email address is required." },
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

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { error: "Password must not exceed 128 characters." },
        { status: 400 }
      );
    }

    // 3. Prevent Admin Role Escalation: Public registrations are strictly standard users
    const safeRole: "user" = "user";
    const allowedSubRoles = ["homeowner", "architect", "contractor"];
    const safeSubRole = allowedSubRoles.includes(subRole) ? subRole : "homeowner";

    // 4. Check if account already exists
    const existing = await d1.first(
      "SELECT id FROM users WHERE lower(email) = lower(?) LIMIT 1",
      [cleanEmail]
    );

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    // 5. Strong Password Hashing (11 salt rounds for high resistance)
    const salt = await bcrypt.genSalt(11);
    const passwordHash = await bcrypt.hash(password, salt);

    const isArchitect = safeSubRole === "architect";
    // Architects must be verified by Admin before publishing blueprints
    const status = isArchitect ? "pending_verification" : "active";

    // Build rich profile summary & review notes
    let profileBio = "";
    let reviewNotes = "";

    if (safeSubRole === "homeowner" && plotDetails) {
      profileBio = `${plotDetails.district || location || "Kerala"} • ${plotDetails.cents ? `${plotDetails.cents} Cents` : "Residential Plot"} • ${plotDetails.preferredStyle || "Regional Modern"}`.trim();
      reviewNotes = `Homeowner Profile | Land: ${plotDetails.status || "Owns plot"} | Size: ${plotDetails.cents || "Standard"} Cents | Location: ${plotDetails.district || location || "Kerala"} | Budget: ${plotDetails.budgetRange || "Flexible"} | Timeline: ${plotDetails.timeline || "Exploring"}`;
    } else if (safeSubRole === "architect") {
      profileBio = `${studioName || "Architectural Practice"} (${coaNumber || "CoA Reg"}) • ${location || "South India"}`;
      reviewNotes = `Architect Credentials: CoA ${coaNumber || "Pending"} submitted for ${practiceType || "practice"}. Studio: ${studioName || name}. Base: ${location || "Kerala"}.`;
    } else if (safeSubRole === "contractor") {
      profileBio = `${contractorDetails?.firmName || studioName || "Turnkey Contracting"} • ${(contractorDetails?.operatingDistricts || [location || "Kerala"]).join(", ")}`;
      reviewNotes = `Contractor Firm: ${contractorDetails?.firmName || name} | Capacity: ${contractorDetails?.capacityPerYear || "Flexible"} proj/yr | Experience: ${contractorDetails?.yearsInPractice || "3+ yrs"}`;
    }

    const defaultAvatar = safeSubRole === "architect"
      ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
      : safeSubRole === "contractor"
      ? "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80"
      : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80";

    const resolvedLocation = (
      plotDetails?.district ||
      location ||
      (safeSubRole === "homeowner" ? "Kerala, India" : "South India")
    ).trim().slice(0, 100);

    const newUser = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: name.trim().slice(0, 100),
      email: cleanEmail,
      role: safeRole,
      subRole: safeSubRole as "homeowner" | "architect" | "contractor",
      status,
      coaNumber: coaNumber ? String(coaNumber).trim().slice(0, 50) : null,
      studioName: (studioName || contractorDetails?.firmName) ? String(studioName || contractorDetails?.firmName).trim().slice(0, 120) : null,
      phone: phone ? String(phone).trim().slice(0, 30) : null,
      location: resolvedLocation,
      avatar: defaultAvatar,
      bio: profileBio,
      reviewNotes,
      practiceType: practiceType || undefined,
      portfolioUrl: portfolioUrl || undefined,
      plotDetails: plotDetails || undefined,
      contractorDetails: contractorDetails || undefined,
      joinedDate: "Just now",
    };

    // 6. Save to Database
    await d1.execute(
      `INSERT INTO users (
        id, name, email, password_hash, role, sub_role, status, coa_number, studio_name, phone, location, avatar, bio, permissions, review_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newUser.id,
        newUser.name,
        newUser.email,
        passwordHash,
        newUser.role,
        newUser.subRole,
        newUser.status,
        newUser.coaNumber,
        newUser.studioName,
        newUser.phone,
        newUser.location,
        newUser.avatar,
        newUser.bio,
        "[]",
        newUser.reviewNotes,
        newUser.plotDetails,
        newUser.contractorDetails,
      ]
    );

    // 7. Audit log the registration event
    try {
      await d1.execute(
        `INSERT INTO audit_logs (id, actor_id, actor_name, actor_email, actor_role, action, target_id, target_type, details)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `aud-${Date.now()}`,
          newUser.id,
          newUser.name,
          newUser.email,
          "user",
          "USER_REGISTERED",
          newUser.id,
          "user",
          JSON.stringify({
            subRole: newUser.subRole,
            ip: clientIp,
            location: newUser.location,
            plotDetails: newUser.plotDetails,
          }),
        ]
      );
    } catch (auditErr) {
      console.warn("Failed to write register audit log:", auditErr);
    }

    // 8. Generate JWT Token
    const token = await createSessionToken({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      subRole: newUser.subRole,
      status: newUser.status,
      studioName: newUser.studioName || undefined,
      coaNumber: newUser.coaNumber || undefined,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: isArchitect
          ? "Architect registration submitted. Council of Architecture credentials are under administrative review."
          : "Account created successfully.",
        user: newUser,
        token,
      },
      { status: 201 }
    );

    response.cookies.set(getSessionCookieConfig(token, true));
    return response;
  } catch (err: any) {
    console.error("Register route error:", err);
    return NextResponse.json(
      { error: "Registration service temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}

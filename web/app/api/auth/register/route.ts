import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, getSessionCookieConfig } from "@/lib/jwt";
import { d1 } from "@/lib/d1";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role = "user", subRole = "homeowner", coaNumber, studioName, phone, location } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required fields" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists in D1
    const existing = await d1.first("SELECT id FROM users WHERE lower(email) = lower(?)", [cleanEmail]);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const isArchitect = subRole === "architect";
    // Super Admin cannot be created via public register; Admin nomination starts as pending_verification
    const safeRole: "user" | "admin" = role === "admin" ? "admin" : "user";
    const isAdminNominee = safeRole === "admin";
    // Only Super Admin can approve architects and admins
    const status = (isArchitect || isAdminNominee) ? "pending_verification" : "active";

    const newUser = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      email: cleanEmail,
      role: safeRole,
      subRole: subRole as "homeowner" | "architect" | "contractor",
      status,
      coaNumber: coaNumber || null,
      studioName: studioName || null,
      phone: phone || null,
      location: location || "South India",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      joinedDate: "Just now",
    };

    // Save directly to Cloudflare D1
    await d1.execute(
      `INSERT INTO users (
        id, name, email, password_hash, role, sub_role, status, coa_number, studio_name, phone, location, avatar
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ]
    );

    // Generate JWT Token
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

    response.cookies.set(getSessionCookieConfig(token));
    return response;
  } catch (err: any) {
    console.error("Register route error:", err);
    return NextResponse.json(
      { error: "Registration failed. Internal server error." },
      { status: 500 }
    );
  }
}

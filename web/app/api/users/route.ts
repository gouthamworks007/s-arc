import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-middleware";
import { d1 } from "@/lib/d1";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await requireRole(req, ["admin"]);
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const roleFilter = url.searchParams.get("role");
  const search = url.searchParams.get("q")?.toLowerCase();

  try {
    let sql = `
      SELECT 
        id, 
        name, 
        email, 
        role, 
        sub_role AS subRole, 
        status, 
        coa_number AS coaNumber, 
        studio_name AS studioName, 
        phone, 
        location, 
        avatar, 
        bio, 
        permissions, 
        review_notes AS reviewNotes, 
        created_at AS joinedDate 
      FROM users 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (roleFilter && roleFilter !== "all") {
      sql += " AND role = ?";
      params.push(roleFilter);
    }

    if (search) {
      sql += " AND (lower(name) LIKE ? OR lower(email) LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY created_at DESC";

    const rows = await d1.query(sql, params);

    const users = rows.map((u: any) => ({
      ...u,
      role: u.role === "super_admin" ? "admin" : u.role,
      permissions: typeof u.permissions === "string" ? JSON.parse(u.permissions || "[]") : (u.permissions || []),
    }));

    return NextResponse.json({
      total: users.length,
      users,
    });
  } catch (err: any) {
    console.error("D1 users fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch users from Cloudflare D1" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = await requireRole(req, ["admin"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { name, email, role = "user", subRole = null, location = "Kochi, Kerala", password = "password123" } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required to create an account." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newId = `usr-${Date.now().toString().slice(-4)}`;
    const effectiveSubRole = subRole || (role === "admin" ? null : "homeowner");

    await d1.execute(
      `INSERT INTO users (
        id, name, email, password_hash, role, sub_role, status, location, avatar
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        name.trim(),
        cleanEmail,
        passwordHash,
        role,
        effectiveSubRole,
        "active",
        location,
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      ]
    );

    // Audit log in Cloudflare D1
    await d1.execute(
      `INSERT INTO audit_logs (id, actor_id, actor_name, actor_email, actor_role, action, target_id, target_type, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `aud-${Date.now()}`,
        user?.id || "admin",
        user?.name || "Admin",
        user?.email || "admin@admin.com",
        "admin",
        "CREATE_USER",
        newId,
        "user",
        JSON.stringify({ createdEmail: cleanEmail, role }),
      ]
    );

    const createdUser = {
      id: newId,
      name,
      email: cleanEmail,
      role,
      subRole: effectiveSubRole,
      status: "active",
      location,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      joinedDate: "Just now",
    };

    return NextResponse.json(
      {
        success: true,
        message: `Account created for ${name}`,
        user: createdUser,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("D1 create user error:", err);
    return NextResponse.json({ error: "Failed to create user in Cloudflare D1" }, { status: 500 });
  }
}

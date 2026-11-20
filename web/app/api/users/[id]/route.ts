import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { d1 } from "@/lib/d1";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const user = await d1.first(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [id]
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role === "super_admin" ? "admin" : user.role,
        subRole: user.sub_role || user.subRole,
        status: user.status,
        coaNumber: user.coa_number || user.coaNumber,
        studioName: user.studio_name || user.studioName,
        phone: user.phone,
        location: user.location,
        avatar: user.avatar,
        bio: user.bio,
        reviewNotes: user.review_notes || user.reviewNotes,
        joinedDate: user.created_at || user.joinedDate,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (err: any) {
    console.error("D1 get user error:", err);
    return NextResponse.json({ error: "Failed to fetch user from Cloudflare D1" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) {
    return errorResponse || NextResponse.json({ error: "Authentication required. Please sign in." }, { status: 401 });
  }

  const { id } = params;
  const isAdmin = user.role === "admin";
  const isSelf = user.id === id;

  // Enforce ownership: only self or admin can edit a profile
  if (!isAdmin && !isSelf) {
    return NextResponse.json(
      { error: "Forbidden: You are not authorized to update another user's profile." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    // Prevent privilege escalation: only administrators can change role, status, or permissions
    if (!isAdmin) {
      if (typeof body.role !== "undefined" || typeof body.status !== "undefined" || typeof body.permissions !== "undefined") {
        return NextResponse.json(
          { error: "Forbidden: Only administrators can modify user role, permissions, or verification status." },
          { status: 403 }
        );
      }
    }

    const existingUser = await d1.first("SELECT id, role, sub_role, status FROM users WHERE id = ? LIMIT 1", [id]);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateClauses: string[] = [];
    const queryParams: any[] = [];

    // Fields editable by profile owner or admin
    if (typeof body.name === "string" && body.name.trim()) {
      updateClauses.push("name = ?");
      queryParams.push(body.name.trim().slice(0, 100));
    }

    const studioName = body.studio_name ?? body.studioName;
    if (typeof studioName === "string") {
      updateClauses.push("studio_name = ?");
      queryParams.push(studioName.trim().slice(0, 120));
    }

    const coaNumber = body.coa_number ?? body.coaNumber;
    if (typeof coaNumber === "string") {
      updateClauses.push("coa_number = ?");
      queryParams.push(coaNumber.trim().toUpperCase().slice(0, 50));
    }

    if (typeof body.phone === "string") {
      updateClauses.push("phone = ?");
      queryParams.push(body.phone.trim().slice(0, 30));
    }

    if (typeof body.location === "string") {
      updateClauses.push("location = ?");
      queryParams.push(body.location.trim().slice(0, 100));
    }

    const avatar = body.avatar ?? body.image;
    if (typeof avatar === "string") {
      updateClauses.push("avatar = ?");
      queryParams.push(avatar.trim());
    }

    if (typeof body.bio === "string") {
      updateClauses.push("bio = ?");
      queryParams.push(body.bio.trim().slice(0, 2000));
    }

    const subRole = body.sub_role ?? body.subRole;
    if (typeof subRole === "string" && ["homeowner", "architect", "contractor"].includes(subRole)) {
      updateClauses.push("sub_role = ?");
      queryParams.push(subRole);
    }

    const reviewNotes = body.review_notes ?? body.reviewNotes;
    if (typeof reviewNotes === "string") {
      updateClauses.push("review_notes = ?");
      queryParams.push(reviewNotes);
    }

    // Admin-only fields
    if (isAdmin) {
      if (body.status && ["active", "suspended", "pending_verification"].includes(body.status)) {
        updateClauses.push("status = ?");
        queryParams.push(body.status);
      }
      if (body.role && ["admin", "user"].includes(body.role)) {
        updateClauses.push("role = ?");
        queryParams.push(body.role);
      }
      const reviewNotes = body.review_notes ?? body.reviewNotes;
      if (typeof reviewNotes !== "undefined") {
        updateClauses.push("review_notes = ?");
        queryParams.push(reviewNotes);
      }
    }

    if (updateClauses.length === 0) {
      return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
    }

    updateClauses.push("updated_at = datetime('now')");
    queryParams.push(id);

    await d1.execute(
      `UPDATE users SET ${updateClauses.join(", ")} WHERE id = ?`,
      queryParams
    );

    // Record audit event in Cloudflare D1
    await d1.execute(
      `INSERT INTO audit_logs (id, actor_id, actor_name, actor_email, actor_role, action, target_id, target_type, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `aud-${Date.now()}`,
        user.id,
        user.name,
        user.email,
        user.role,
        isAdmin && body.status ? (body.status === "active" ? "ADMIN_APPROVAL" : "ADMIN_UPDATE_USER") : "UPDATE_PROFILE",
        id,
        "user",
        JSON.stringify({ updatedFields: Object.keys(body) }),
      ]
    );

    // Retrieve updated user record
    const updated = await d1.first(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [id]
    );

    return NextResponse.json({
      success: true,
      message: isSelf ? "Profile updated successfully." : `User ${id} updated by Admin in Cloudflare D1.`,
      user: updated ? {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role === "super_admin" ? "admin" : updated.role,
        subRole: updated.sub_role || updated.subRole,
        status: updated.status,
        coaNumber: updated.coa_number || updated.coaNumber,
        studioName: updated.studio_name || updated.studioName,
        phone: updated.phone,
        location: updated.location,
        avatar: updated.avatar,
        bio: updated.bio,
        reviewNotes: updated.review_notes || updated.reviewNotes,
        updatedAt: updated.updated_at,
      } : null,
    });
  } catch (err: any) {
    console.error("D1 update user error:", err);
    return NextResponse.json({ error: "Failed to update user in Cloudflare D1" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only Admin can delete users
  if (user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Only administrators can delete accounts." },
      { status: 403 }
    );
  }

  const { id } = params;

  // Security guard: Prevent self-deletion or deletion of the primary platform admin
  if (id === user.id || id === "usr-admin-01") {
    return NextResponse.json(
      { error: "Forbidden: The primary platform administrator account cannot be deleted." },
      { status: 403 }
    );
  }

  try {
    await d1.execute("DELETE FROM users WHERE id = ?", [id]);

    await d1.execute(
      `INSERT INTO audit_logs (id, actor_id, actor_name, actor_email, actor_role, action, target_id, target_type, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `aud-${Date.now()}`,
        user.id,
        user.name,
        user.email,
        "admin",
        "DELETE_USER",
        id,
        "user",
        JSON.stringify({ deletedUserId: id }),
      ]
    );

    return NextResponse.json({
      success: true,
      message: `User ${id} deleted from Cloudflare D1 by Admin`,
    });
  } catch (err: any) {
    console.error("D1 delete user error:", err);
    return NextResponse.json({ error: "Failed to delete user from Cloudflare D1" }, { status: 500 });
  }
}

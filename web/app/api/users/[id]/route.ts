import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-middleware";
import { d1 } from "@/lib/d1";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await requireRole(req, ["super_admin", "admin"]);
  if (errorResponse) return errorResponse;

  const { id } = params;
  const body = await req.json();
  const { status, role, reviewNotes } = body;

  // Strict Rule: ONLY Super Admin (Tier 1) has approval authority for admin and other accounts
  if (status === "active" && user?.role !== "super_admin") {
    return NextResponse.json(
      {
        error: "Forbidden. Only Super Admin (Tier 1) has approval authority for admin and other accounts.",
        userRole: user?.role,
      },
      { status: 403 }
    );
  }

  // Only Super Admin can change user role
  if (role && user?.role !== "super_admin") {
    return NextResponse.json(
      { error: "Forbidden. Only Super Admin (Tier 1) can reassign user roles." },
      { status: 403 }
    );
  }

  // Admins (Tier 2) can only submit audit/review notes for Super Admin consideration
  if (user?.role === "admin" && status && status !== "pending_verification") {
    return NextResponse.json(
      {
        error: "Admins (Tier 2) cannot approve or activate accounts. You may only audit credentials and forward to Super Admin.",
      },
      { status: 403 }
    );
  }

  try {
    const updateClauses: string[] = [];
    const queryParams: any[] = [];

    if (status) {
      updateClauses.push("status = ?");
      queryParams.push(status);
    }
    if (role) {
      updateClauses.push("role = ?");
      queryParams.push(role);
    }
    if (typeof reviewNotes !== "undefined") {
      updateClauses.push("review_notes = ?");
      queryParams.push(reviewNotes);
    }

    if (updateClauses.length > 0) {
      updateClauses.push("updated_at = datetime('now')");
      queryParams.push(id);
      await d1.execute(
        `UPDATE users SET ${updateClauses.join(", ")} WHERE id = ?`,
        queryParams
      );
    }

    // Record audit event in Cloudflare D1
    await d1.execute(
      `INSERT INTO audit_logs (id, actor_id, actor_name, actor_email, actor_role, action, target_id, target_type, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `aud-${Date.now()}`,
        user?.id || "unknown",
        user?.name || "User",
        user?.email || "unknown@s-arc.in",
        user?.role || "user",
        user?.role === "super_admin" ? "SUPER_ADMIN_APPROVAL" : "ADMIN_AUDIT_NOTE",
        id,
        "user",
        JSON.stringify({ status, role, reviewNotes }),
      ]
    );

    return NextResponse.json({
      success: true,
      message:
        user?.role === "super_admin"
          ? `User ${id} status/role successfully approved & updated by Super Admin in Cloudflare D1.`
          : `Audit note recorded in Cloudflare D1 for User ${id} and forwarded to Super Admin for approval.`,
      updatedFields: { status, role, reviewNotes },
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
  // Only Super Admin can delete users
  const { user, errorResponse } = await requireRole(req, ["super_admin"]);
  if (errorResponse) return errorResponse;

  const { id } = params;

  try {
    await d1.execute("DELETE FROM users WHERE id = ?", [id]);

    await d1.execute(
      `INSERT INTO audit_logs (id, actor_id, actor_name, actor_email, actor_role, action, target_id, target_type, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `aud-${Date.now()}`,
        user?.id || "super-admin",
        user?.name || "Super Admin",
        user?.email || "superadmin@admin.com",
        "super_admin",
        "DELETE_USER",
        id,
        "user",
        JSON.stringify({ deletedUserId: id }),
      ]
    );

    return NextResponse.json({
      success: true,
      message: `User ${id} deleted from Cloudflare D1 by Super Admin`,
    });
  } catch (err: any) {
    console.error("D1 delete user error:", err);
    return NextResponse.json({ error: "Failed to delete user from Cloudflare D1" }, { status: 500 });
  }
}

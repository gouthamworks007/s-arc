import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-middleware";
import { d1 } from "@/lib/d1";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await requireRole(req, ["admin"]);
  if (errorResponse) return errorResponse;

  const { id } = params;
  const body = await req.json();
  const { status, role, reviewNotes } = body;

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
        user?.id || "admin",
        user?.name || "Admin",
        user?.email || "admin@admin.com",
        "admin",
        status === "active" ? "ADMIN_APPROVAL" : "ADMIN_UPDATE_USER",
        id,
        "user",
        JSON.stringify({ status, role, reviewNotes }),
      ]
    );

    return NextResponse.json({
      success: true,
      message: `User ${id} status/role successfully approved & updated by Admin in Cloudflare D1.`,
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
  // Admin can delete users
  const { user, errorResponse } = await requireRole(req, ["admin"]);
  if (errorResponse) return errorResponse;

  const { id } = params;

  try {
    await d1.execute("DELETE FROM users WHERE id = ?", [id]);

    await d1.execute(
      `INSERT INTO audit_logs (id, actor_id, actor_name, actor_email, actor_role, action, target_id, target_type, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `aud-${Date.now()}`,
        user?.id || "admin",
        user?.name || "Admin",
        user?.email || "admin@admin.com",
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

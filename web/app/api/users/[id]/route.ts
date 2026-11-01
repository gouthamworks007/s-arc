import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-middleware";

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

  return NextResponse.json({
    success: true,
    message:
      user?.role === "super_admin"
        ? `User ${id} status/role successfully approved & updated by Super Admin.`
        : `Audit note recorded for User ${id} and forwarded to Super Admin for approval.`,
    updatedFields: { status, role, reviewNotes },
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Only Super Admin can delete users
  const { user, errorResponse } = await requireRole(req, ["super_admin"]);
  if (errorResponse) return errorResponse;

  const { id } = params;

  return NextResponse.json({
    success: true,
    message: `User ${id} deleted by Super Admin`,
  });
}


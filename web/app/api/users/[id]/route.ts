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
  const { status, role } = body;

  // Only Super Admin can change user role
  if (role && user?.role !== "super_admin") {
    return NextResponse.json(
      { error: "Only Super Admin (Tier 1) can reassign user roles." },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `User ${id} updated successfully`,
    updatedFields: { status, role },
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

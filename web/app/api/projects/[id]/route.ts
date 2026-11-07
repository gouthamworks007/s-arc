import { NextRequest, NextResponse } from "next/server";
import { FEATURED_PROJECTS } from "@/lib/data";
import { requireRole } from "@/lib/auth-middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const project = FEATURED_PROJECTS.find((p) => p.id === id);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await requireRole(req, ["admin", "user"]);
  if (errorResponse) return errorResponse;

  const { id } = params;
  const body = await req.json();

  return NextResponse.json({
    success: true,
    message: `Plan ${id} updated successfully.`,
    updatedFields: body,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await requireRole(req, ["admin", "user"]);
  if (errorResponse) return errorResponse;

  const { id } = params;

  return NextResponse.json({
    success: true,
    message: `Plan ${id} deleted from catalog.`,
  });
}


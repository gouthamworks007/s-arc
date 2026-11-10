import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { d1 } from "@/lib/d1";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) {
    return (
      errorResponse ||
      NextResponse.json({ error: "Authentication required." }, { status: 401 })
    );
  }

  const { id } = params;

  try {
    const rows = await d1.query<any>(
      "SELECT * FROM saved_plots WHERE id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Plot record not found." }, { status: 404 });
    }

    const plot = rows[0];
    if (user.role !== "admin" && plot.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You cannot access another user's plot." },
        { status: 403 }
      );
    }

    return NextResponse.json({ plot });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch plot record.", details: err?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) {
    return (
      errorResponse ||
      NextResponse.json({ error: "Authentication required." }, { status: 401 })
    );
  }

  const { id } = params;

  try {
    // Check ownership
    const rows = await d1.query<any>(
      "SELECT id, user_id FROM saved_plots WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Plot record not found." }, { status: 404 });
    }

    const plot = rows[0];
    if (user.role !== "admin" && plot.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You cannot delete another user's plot." },
        { status: 403 }
      );
    }

    await d1.execute("DELETE FROM saved_plots WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Plot deleted successfully." });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to delete plot record.", details: err?.message },
      { status: 500 }
    );
  }
}


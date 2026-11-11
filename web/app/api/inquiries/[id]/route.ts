import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { d1 } from "@/lib/d1";

/**
 * Valid inquiry statuses matching D1 schema check constraint:
 * CHECK(status IN ('new', 'in_review', 'responded', 'completed'))
 */
const VALID_STATUSES = ["new", "in_review", "responded", "completed"] as const;

/**
 * Status mapping to accommodate frontend labels while strictly enforcing DB constraints
 */
const STATUS_MAP: Record<string, typeof VALID_STATUSES[number]> = {
  new: "new",
  pending: "new",
  in_review: "in_review",
  contacted: "in_review",
  responded: "responded",
  accepted: "responded",
  completed: "completed",
  closed: "completed",
};

/**
 * PATCH /api/inquiries/[id]
 * Updates consultation status and records architect response in Cloudflare D1.
 * Strictly verifies that the authenticated user is either an Administrator
 * or the Architect who owns the project referenced in this inquiry.
 */
export async function PATCH(
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
    // 1. Fetch the target inquiry
    const existing = await d1.first(
      "SELECT * FROM inquiries WHERE id = ? LIMIT 1",
      [id]
    );

    if (!existing) {
      return NextResponse.json(
        { error: `Inquiry with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    // 2. Ownership & Authorization Verification
    const isAdmin = user.role === "admin";
    let isAssignedArchitect = false;

    if (existing.project_id) {
      const project = await d1.first(
        "SELECT architect_id FROM projects WHERE id = ? OR slug = ? LIMIT 1",
        [existing.project_id, existing.project_id]
      );
      if (project && project.architect_id === user.id) {
        isAssignedArchitect = true;
      }
    }

    // Homeowners cannot alter inquiry status or architect reply text
    if (!isAdmin && !isAssignedArchitect) {
      return NextResponse.json(
        {
          error:
            "Forbidden. You do not have permission to modify consultation requests assigned to another architectural studio.",
        },
        { status: 403 }
      );
    }

    // 3. Process Updates
    const body = await req.json();
    const { status, replyText, reply_text } = body;

    const updates: string[] = [];
    const queryParams: any[] = [];

    // Map and validate status
    if (typeof status !== "undefined") {
      const rawStatus = String(status).toLowerCase().trim();
      const mappedStatus = STATUS_MAP[rawStatus];
      if (!mappedStatus) {
        return NextResponse.json(
          {
            error: `Invalid status '${status}'. Allowed statuses are: ${VALID_STATUSES.join(", ")}`,
          },
          { status: 400 }
        );
      }
      updates.push("status = ?");
      queryParams.push(mappedStatus);
    }

    // Validate reply text
    const textToSave = replyText ?? reply_text;
    if (typeof textToSave !== "undefined") {
      const cleanReply = String(textToSave).trim().slice(0, 3000);
      updates.push("reply_text = ?");
      queryParams.push(cleanReply);

      // Auto-transition to responded if not explicitly specified
      if (!status && existing.status === "new") {
        updates.push("status = ?");
        queryParams.push("responded");
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: "No changes requested.", inquiry: existing },
        { status: 200 }
      );
    }

    updates.push("updated_at = datetime('now')");
    queryParams.push(id);

    await d1.execute(
      `UPDATE inquiries SET ${updates.join(", ")} WHERE id = ?`,
      queryParams
    );

    const updated = await d1.first(
      "SELECT * FROM inquiries WHERE id = ? LIMIT 1",
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Consultation response updated successfully in Cloudflare D1.",
      inquiry: updated,
    });
  } catch (err: any) {
    console.error("PATCH /api/inquiries/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update inquiry in Cloudflare D1" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/inquiries/[id]
 * Deletes an inquiry. Accessible only by Administrators or the submitting client.
 */
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
    const existing = await d1.first(
      "SELECT * FROM inquiries WHERE id = ? LIMIT 1",
      [id]
    );

    if (!existing) {
      return NextResponse.json(
        { error: `Inquiry with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    const isAdmin = user.role === "admin";
    const isOwnerClient =
      (existing.client_email || "").toLowerCase() === user.email.toLowerCase();

    if (!isAdmin && !isOwnerClient) {
      return NextResponse.json(
        { error: "Forbidden. You cannot delete an inquiry submitted by another user." },
        { status: 403 }
      );
    }

    await d1.execute("DELETE FROM inquiries WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: `Inquiry '${id}' deleted successfully.`,
    });
  } catch (err: any) {
    console.error("DELETE /api/inquiries/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete inquiry" },
      { status: 500 }
    );
  }
}


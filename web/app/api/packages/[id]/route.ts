import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { d1 } from "@/lib/d1";
import { formatPackageRow } from "../route";

/**
 * GET /api/packages/[id]
 * Retrieves single package with access guards for drafts and archived packages
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const pkg = await d1.first(
      "SELECT * FROM project_packages WHERE id = ? LIMIT 1",
      [id]
    );

    if (!pkg) {
      return NextResponse.json({ error: "Package not found." }, { status: 404 });
    }

    // If draft or archived, only the creator architect or an admin can access it
    if (pkg.status !== "published") {
      const { user } = await authenticateRequest(req);
      const isOwner = user && user.id === pkg.architect_id;
      const isAdmin = user && user.role === "admin";

      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          { error: "Package not found." },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ package: formatPackageRow(pkg) });
  } catch (err: any) {
    console.error("GET /api/packages/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch package details." }, { status: 500 });
  }
}

/**
 * PATCH /api/packages/[id]
 * Modifies package attributes (name, description, price, deliverables, status)
 * Guarded by architect ownership check
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { id } = params;
    const existing = await d1.first(
      "SELECT * FROM project_packages WHERE id = ? LIMIT 1",
      [id]
    );

    if (!existing) {
      return NextResponse.json({ error: "Package not found." }, { status: 404 });
    }

    const isOwner = user.id === existing.architect_id;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden. You do not have permission to modify another studio's package." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updateClauses: string[] = [];
    const updateParams: any[] = [];

    if (typeof body.name !== "undefined") {
      if (typeof body.name !== "string" || body.name.trim().length < 2) {
        return NextResponse.json(
          { error: "Package name must be at least 2 characters." },
          { status: 400 }
        );
      }
      updateClauses.push("name = ?");
      updateParams.push(body.name.trim());
    }

    if (typeof body.description !== "undefined") {
      updateClauses.push("description = ?");
      updateParams.push(String(body.description || "").trim());
    }

    if (typeof body.pricePaise !== "undefined") {
      const pricePaise = body.pricePaise;
      if (typeof pricePaise !== "number" || !Number.isInteger(pricePaise) || pricePaise <= 0) {
        return NextResponse.json(
          { error: "Invalid price. Price must be a positive integer in paise." },
          { status: 400 }
        );
      }
      updateClauses.push("price_paise = ?");
      updateParams.push(pricePaise);
    }

    if (typeof body.deliverables !== "undefined") {
      if (!Array.isArray(body.deliverables) || body.deliverables.length === 0) {
        return NextResponse.json(
          { error: "Deliverables list must contain at least one item." },
          { status: 400 }
        );
      }
      const cleanDeliverables = body.deliverables
        .map((d: any) => (typeof d === "string" ? d.trim() : ""))
        .filter((d: string) => d.length > 0);

      if (cleanDeliverables.length === 0) {
        return NextResponse.json(
          { error: "Deliverables list must contain valid non-empty items." },
          { status: 400 }
        );
      }

      updateClauses.push("deliverables = ?");
      updateParams.push(JSON.stringify(cleanDeliverables));
    }

    if (typeof body.status !== "undefined") {
      const validStatuses = ["draft", "published", "archived"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status. Allowed values: draft, published, archived." },
          { status: 400 }
        );
      }
      updateClauses.push("status = ?");
      updateParams.push(body.status);
    }

    if (updateClauses.length === 0) {
      return NextResponse.json({
        message: "No fields to update.",
        package: formatPackageRow(existing),
      });
    }

    updateClauses.push("updated_at = datetime('now')");
    updateParams.push(id);

    await d1.execute(
      `UPDATE project_packages SET ${updateClauses.join(", ")} WHERE id = ?`,
      updateParams
    );

    // Audit log
    await d1.execute(
      `INSERT INTO audit_logs (id, actor_id, actor_name, actor_email, actor_role, action, target_id, target_type, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `aud-${Date.now()}`,
        user.id,
        user.name,
        user.email,
        user.role,
        "UPDATE_PACKAGE",
        id,
        "package",
        JSON.stringify({ updatedFields: Object.keys(body) }),
      ]
    );

    const updated = await d1.first(
      "SELECT * FROM project_packages WHERE id = ? LIMIT 1",
      [id]
    );

    return NextResponse.json({
      message: "Architectural package updated successfully.",
      package: formatPackageRow(updated || existing),
    });
  } catch (err: any) {
    console.error("PATCH /api/packages/[id] error:", err);
    return NextResponse.json({ error: "Failed to update package." }, { status: 500 });
  }
}

/**
 * DELETE /api/packages/[id]
 * Deletes package (requires ownership)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { id } = params;
    const existing = await d1.first(
      "SELECT * FROM project_packages WHERE id = ? LIMIT 1",
      [id]
    );

    if (!existing) {
      return NextResponse.json({ error: "Package not found." }, { status: 404 });
    }

    const isOwner = user.id === existing.architect_id;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden. You do not have permission to delete another studio's package." },
        { status: 403 }
      );
    }

    await d1.execute("DELETE FROM project_packages WHERE id = ?", [id]);

    // Audit log
    await d1.execute(
      `INSERT INTO audit_logs (id, actor_id, actor_name, actor_email, actor_role, action, target_id, target_type, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `aud-${Date.now()}`,
        user.id,
        user.name,
        user.email,
        user.role,
        "DELETE_PACKAGE",
        id,
        "package",
        JSON.stringify({ packageName: existing.name, projectId: existing.project_id }),
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Architectural package deleted successfully.",
    });
  } catch (err: any) {
    console.error("DELETE /api/packages/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete package." }, { status: 500 });
  }
}


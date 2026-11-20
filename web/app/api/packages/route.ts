import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { d1 } from "@/lib/d1";
import { ProjectPackage } from "@/lib/types";

/**
 * Format raw D1 database row into frontend ProjectPackage
 */
export function formatPackageRow(p: any): ProjectPackage & { priceFormatted: string } {
  const pricePaise = Number(p.price_paise ?? p.pricePaise) || 0;
  const priceInRupees = pricePaise / 100;
  const priceFormatted = `₹${priceInRupees.toLocaleString("en-IN")}`;

  let deliverables: string[] = [];
  try {
    deliverables = typeof p.deliverables === "string" ? JSON.parse(p.deliverables || "[]") : (p.deliverables || []);
  } catch {
    deliverables = [];
  }

  return {
    id: p.id,
    projectId: p.project_id || p.projectId,
    architectId: p.architect_id || p.architectId,
    name: p.name,
    description: p.description || "",
    pricePaise,
    priceFormatted,
    currency: p.currency || "INR",
    deliverables,
    status: p.status || "draft",
    createdAt: p.created_at || p.createdAt,
    updatedAt: p.updated_at || p.updatedAt,
  };
}

/**
 * GET /api/packages
 * Queries architectural packages with role-aware filtering
 */
export async function GET(req: NextRequest) {
  try {
    const { user } = await authenticateRequest(req);
    const { searchParams } = new URL(req.url);

    const projectId = searchParams.get("project_id") || searchParams.get("projectId");
    const architectId = searchParams.get("architect_id") || searchParams.get("architectId");
    const statusParam = searchParams.get("status");

    // Case 1: Unauthenticated Public Visitor
    if (!user) {
      if (!projectId) {
        return NextResponse.json(
          { error: "project_id query parameter is required to view package offerings." },
          { status: 400 }
        );
      }

      // Verify the target project exists and is published
      const project = await d1.first(
        "SELECT id, status FROM projects WHERE id = ? OR slug = ? LIMIT 1",
        [projectId, projectId]
      );

      if (!project || project.status !== "published") {
        return NextResponse.json(
          { error: "Architectural project not found or not published." },
          { status: 404 }
        );
      }

      const rows = await d1.query(
        "SELECT * FROM project_packages WHERE project_id = ? AND status = 'published' ORDER BY price_paise ASC",
        [project.id]
      );

      return NextResponse.json({
        packages: rows.map(formatPackageRow),
      });
    }

    // Case 2: Authenticated Administrator
    if (user.role === "admin") {
      let query = "SELECT * FROM project_packages WHERE 1=1";
      const params: any[] = [];

      if (projectId) {
        query += " AND project_id = ?";
        params.push(projectId);
      }
      if (architectId) {
        query += " AND architect_id = ?";
        params.push(architectId);
      }
      if (statusParam) {
        query += " AND status = ?";
        params.push(statusParam);
      }
      query += " ORDER BY price_paise ASC";

      const rows = await d1.query(query, params);
      return NextResponse.json({ packages: rows.map(formatPackageRow) });
    }

    // Case 3: Authenticated Architect
    if (user.subRole === "architect") {
      if (projectId) {
        // Check if the architect owns this project
        const project = await d1.first(
          "SELECT id, architect_id, status FROM projects WHERE id = ? OR slug = ? LIMIT 1",
          [projectId, projectId]
        );

        if (!project) {
          return NextResponse.json({ error: "Project not found." }, { status: 404 });
        }

        const isOwner = project.architect_id === user.id;

        if (isOwner) {
          // Owner architect can see all statuses (draft, published, archived)
          let query = "SELECT * FROM project_packages WHERE project_id = ?";
          const params: any[] = [project.id];
          if (statusParam) {
            query += " AND status = ?";
            params.push(statusParam);
          }
          query += " ORDER BY price_paise ASC";
          const rows = await d1.query(query, params);
          return NextResponse.json({ packages: rows.map(formatPackageRow) });
        } else {
          // Another architect's project: only published packages
          const rows = await d1.query(
            "SELECT * FROM project_packages WHERE project_id = ? AND status = 'published' ORDER BY price_paise ASC",
            [project.id]
          );
          return NextResponse.json({ packages: rows.map(formatPackageRow) });
        }
      }

      // No projectId provided: return all packages created by this architect
      let query = "SELECT * FROM project_packages WHERE architect_id = ?";
      const params: any[] = [user.id];
      if (statusParam) {
        query += " AND status = ?";
        params.push(statusParam);
      }
      query += " ORDER BY price_paise ASC";
      const rows = await d1.query(query, params);
      return NextResponse.json({ packages: rows.map(formatPackageRow) });
    }

    // Case 4: Authenticated Homeowner
    if (!projectId) {
      return NextResponse.json(
        { error: "project_id query parameter is required to view package offerings." },
        { status: 400 }
      );
    }

    const rows = await d1.query(
      "SELECT * FROM project_packages WHERE project_id = ? AND status = 'published' ORDER BY price_paise ASC",
      [projectId]
    );

    return NextResponse.json({ packages: rows.map(formatPackageRow) });
  } catch (err: any) {
    console.error("GET /api/packages error:", err);
    return NextResponse.json({ error: "Failed to fetch architectural packages." }, { status: 500 });
  }
}

/**
 * POST /api/packages
 * Creates a new architectural package for an architect's project
 */
export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse) return errorResponse;

    if (!user) {
      return NextResponse.json({ error: "Authentication required. Please sign in." }, { status: 401 });
    }

    // Only verified architects or admins can create packages
    const isArchitect = user.subRole === "architect";
    const isAdmin = user.role === "admin";

    if (!isArchitect && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden. Only registered architectural studios can create blueprint packages." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      projectId,
      name,
      description = "",
      pricePaise,
      currency = "INR",
      deliverables,
      status = "draft",
    } = body;

    // Field Validation
    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json({ error: "projectId is required." }, { status: 400 });
    }

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Package name is required (minimum 2 characters)." }, { status: 400 });
    }

    // Validate price: must be an integer > 0
    if (typeof pricePaise !== "number" || !Number.isInteger(pricePaise) || pricePaise <= 0) {
      return NextResponse.json(
        { error: "Invalid price. Price must be a positive integer in paise (e.g. 3500000 for ₹35,000)." },
        { status: 400 }
      );
    }

    if (!Array.isArray(deliverables) || deliverables.length === 0) {
      return NextResponse.json(
        { error: "Deliverables list is required and must contain at least one item." },
        { status: 400 }
      );
    }

    const cleanDeliverables = deliverables
      .map((d: any) => (typeof d === "string" ? d.trim() : ""))
      .filter((d: string) => d.length > 0);

    if (cleanDeliverables.length === 0) {
      return NextResponse.json(
        { error: "Deliverables list must contain valid non-empty drawing items." },
        { status: 400 }
      );
    }

    if (status !== "draft" && status !== "published") {
      return NextResponse.json(
        { error: "Initial package status must be either 'draft' or 'published'." },
        { status: 400 }
      );
    }

    // Verify target project existence and ownership
    const project = await d1.first(
      "SELECT id, architect_id, status FROM projects WHERE id = ? OR slug = ? LIMIT 1",
      [projectId, projectId]
    );

    if (!project) {
      return NextResponse.json({ error: "Architectural project not found." }, { status: 404 });
    }

    if (project.architect_id !== user.id && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden. You cannot create packages for another architect's project." },
        { status: 403 }
      );
    }

    const packageId = `pkg-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const deliverablesJson = JSON.stringify(cleanDeliverables);

    await d1.execute(
      `INSERT INTO project_packages (
        id, project_id, architect_id, name, description, price_paise, currency, deliverables, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        packageId,
        project.id,
        user.id,
        name.trim(),
        description.trim(),
        pricePaise,
        currency,
        deliverablesJson,
        status,
      ]
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
        "CREATE_PACKAGE",
        packageId,
        "package",
        JSON.stringify({ projectId: project.id, packageName: name.trim(), pricePaise, status }),
      ]
    );

    const created = await d1.first("SELECT * FROM project_packages WHERE id = ? LIMIT 1", [packageId]);

    return NextResponse.json(
      {
        message: "Architectural package created successfully.",
        package: formatPackageRow(created || {
          id: packageId,
          project_id: project.id,
          architect_id: user.id,
          name: name.trim(),
          description: description.trim(),
          price_paise: pricePaise,
          currency,
          deliverables: deliverablesJson,
          status,
        }),
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/packages error:", err);
    return NextResponse.json({ error: "Failed to create architectural package." }, { status: 500 });
  }
}


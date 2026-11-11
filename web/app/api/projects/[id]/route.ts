import { NextRequest, NextResponse } from "next/server";
import { FEATURED_PROJECTS } from "@/lib/data";
import { authenticateRequest } from "@/lib/auth-middleware";
import { d1 } from "@/lib/d1";

/**
 * Format raw D1 database row into frontend ArchitecturalProject
 */
function formatProjectRow(p: any) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    style: p.style,
    location: p.location,
    plotSize: p.plot_size || `${p.cents || 10} Cents`,
    cents: Number(p.cents) || 10,
    builtUpArea: p.built_up_area || "2,400 Sq.Ft",
    bedrooms: Number(p.bedrooms) || 3,
    floors: Number(p.floors) || 2,
    facing: p.facing || "East",
    vastuScore: Number(p.vastu_score) || 95,
    price: p.price || "₹35,000",
    priceNumeric: Number(p.price_numeric) || 35000,
    sheetCount: Number(p.sheet_count) || 42,
    status: p.status || "published",
    featured: Boolean(p.featured),
    image: p.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
    gallery: typeof p.gallery === "string" ? JSON.parse(p.gallery || "[]") : (p.gallery || []),
    floorPlanImage: p.floor_plan_image || null,
    description: p.description || "",
    highlights: typeof p.highlights === "string" ? JSON.parse(p.highlights || "[]") : (p.highlights || []),
    dimensions: {
      plotWidth: p.plot_width || "40 ft",
      plotLength: p.plot_length || "60 ft",
      setbacks: p.setbacks || "Front: 3.0m, Rear: 1.5m, Sides: 1.2m (KMBR)",
    },
    dwgAvailable: Boolean(p.dwg_available ?? 1),
    bimAvailable: Boolean(p.bim_available ?? 1),
    boqAvailable: Boolean(p.boq_available ?? 1),
    mepAvailable: Boolean(p.mep_available ?? 1),
    views: Number(p.views) || 0,
    inquiries: Number(p.inquiries_count) || 0,
    architect: {
      id: p.architect_id || "usr-arch-01",
      name: p.architect_name || "Ar. Nikhil Rajan",
      studio: p.architect_studio || "Studio Vayu",
      location: p.architect_location || "Kochi, Kerala",
      verified: true,
      image: p.architect_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    },
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

/**
 * GET /api/projects/[id]
 * Retrieves a single project blueprint from Cloudflare D1 (or fallback seed)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // 1. Check Cloudflare D1
    const row = await d1.first(
      "SELECT * FROM projects WHERE id = ? OR slug = ? LIMIT 1",
      [id, id]
    );

    if (row) {
      // Increment views count asynchronously
      d1.execute("UPDATE projects SET views = views + 1 WHERE id = ?", [row.id]).catch(() => {});
      return NextResponse.json({ project: formatProjectRow(row) });
    }

    // 2. Check Static Fallback Catalog
    const staticProject = FEATURED_PROJECTS.find(
      (p) => p.id === id || (p as any).slug === id
    );

    if (staticProject) {
      return NextResponse.json({ project: staticProject });
    }

    return NextResponse.json(
      { error: `Architectural blueprint '${id}' not found.` },
      { status: 404 }
    );
  } catch (err: any) {
    console.error("GET /api/projects/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve project details." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[id]
 * Updates an architectural project. Requires creator ownership or administrator role.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse) return errorResponse;

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = params;

  try {
    // 1. Fetch current project to verify ownership
    const existing = await d1.first(
      "SELECT * FROM projects WHERE id = ? OR slug = ? LIMIT 1",
      [id, id]
    );

    if (!existing) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    // 2. Check Ownership or Administrator Privileges
    const isOwner = user.id === existing.architect_id;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden. You do not have permission to modify this architectural blueprint." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updateClauses: string[] = [];
    const updateParams: any[] = [];

    // Whitelist allowed fields for update
    const allowedFields: Record<string, string> = {
      name: "name",
      style: "style",
      location: "location",
      builtUpArea: "built_up_area",
      price: "price",
      cents: "cents",
      plotSize: "plot_size",
      bedrooms: "bedrooms",
      floors: "floors",
      facing: "facing",
      vastuScore: "vastu_score",
      description: "description",
      image: "image",
      floorPlanImage: "floor_plan_image",
      status: "status",
      featured: "featured",
    };

    for (const [key, col] of Object.entries(allowedFields)) {
      if (typeof body[key] !== "undefined") {
        updateClauses.push(`${col} = ?`);
        if (key === "status" && !isAdmin && body[key] === "published") {
          // Non-admin architects must go through verification or approved status
          updateParams.push("published");
        } else if (key === "featured" && !isAdmin) {
          // Only admin can toggle featured
          updateParams.push(existing.featured);
        } else {
          updateParams.push(body[key]);
        }
      }
    }

    if (body.gallery && Array.isArray(body.gallery)) {
      updateClauses.push("gallery = ?");
      updateParams.push(JSON.stringify(body.gallery));
    }

    if (body.highlights && Array.isArray(body.highlights)) {
      updateClauses.push("highlights = ?");
      updateParams.push(JSON.stringify(body.highlights));
    }

    if (updateClauses.length === 0) {
      return NextResponse.json(
        { message: "No fields to update.", project: formatProjectRow(existing) },
        { status: 200 }
      );
    }

    updateClauses.push("updated_at = datetime('now')");
    updateParams.push(existing.id);

    await d1.execute(
      `UPDATE projects SET ${updateClauses.join(", ")} WHERE id = ?`,
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
        "UPDATE_PROJECT",
        existing.id,
        "project",
        JSON.stringify({ updatedFields: Object.keys(body) }),
      ]
    );

    // Fetch refreshed
    const updated = await d1.first("SELECT * FROM projects WHERE id = ? LIMIT 1", [existing.id]);

    return NextResponse.json({
      success: true,
      message: `Architectural blueprint '${existing.name}' updated successfully.`,
      project: formatProjectRow(updated || existing),
    });
  } catch (err: any) {
    console.error("PUT /api/projects/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update project listing." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Deletes or archives an architectural project. Requires creator ownership or administrator role.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse) return errorResponse;

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = params;

  try {
    const existing = await d1.first(
      "SELECT * FROM projects WHERE id = ? OR slug = ? LIMIT 1",
      [id, id]
    );

    if (!existing) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const isOwner = user.id === existing.architect_id;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden. You do not have permission to delete this project." },
        { status: 403 }
      );
    }

    await d1.execute("DELETE FROM projects WHERE id = ?", [existing.id]);

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
        "DELETE_PROJECT",
        existing.id,
        "project",
        JSON.stringify({ projectName: existing.name }),
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Blueprint '${existing.name}' (${existing.id}) deleted from catalog.`,
    });
  } catch (err: any) {
    console.error("DELETE /api/projects/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete project listing." },
      { status: 500 }
    );
  }
}

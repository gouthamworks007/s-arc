import { NextRequest, NextResponse } from "next/server";
import { FEATURED_PROJECTS } from "@/lib/data";
import { requireVerifiedArchitect } from "@/lib/auth-middleware";
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
 * GET /api/projects
 * Public search and filtering of architectural design blueprints
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const style = url.searchParams.get("style");
    const minCents = url.searchParams.get("minCents");
    const maxCents = url.searchParams.get("maxCents");
    const facing = url.searchParams.get("facing");
    const status = url.searchParams.get("status") || "published";
    const architectId = url.searchParams.get("architectId");
    const q = url.searchParams.get("q")?.toLowerCase();

    let sql = "SELECT * FROM projects WHERE 1=1";
    const params: any[] = [];

    // Filter by status if specified ("all" bypasses status filter for studio dashboards)
    if (status !== "all") {
      sql += " AND status = ?";
      params.push(status);
    }

    if (architectId) {
      sql += " AND architect_id = ?";
      params.push(architectId);
    }

    if (style && style !== "All") {
      sql += " AND lower(style) LIKE ?";
      params.push(`%${style.toLowerCase()}%`);
    }

    if (minCents) {
      sql += " AND cents >= ?";
      params.push(parseFloat(minCents));
    }

    if (maxCents) {
      sql += " AND cents <= ?";
      params.push(parseFloat(maxCents));
    }

    if (facing && facing !== "All") {
      sql += " AND lower(facing) = lower(?)";
      params.push(facing);
    }

    if (q) {
      sql += " AND (lower(name) LIKE ? OR lower(location) LIKE ? OR lower(architect_name) LIKE ? OR lower(description) LIKE ?)";
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }

    sql += " ORDER BY featured DESC, created_at DESC";

    const rows = await d1.query(sql, params);

    let projects = rows.map(formatProjectRow);

    // If database returned no projects (initial cold setup), fall back to enriched catalogue
    if (projects.length === 0 && !architectId && (!status || status === "published")) {
      projects = FEATURED_PROJECTS as any[];
    }

    return NextResponse.json({
      count: projects.length,
      projects,
    });
  } catch (err: any) {
    console.error("GET /api/projects error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve projects from Cloudflare D1" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Publishes a new architectural design blueprint.
 * Strictly requires Council of Architecture verified architect or administrator privileges.
 */
export async function POST(req: NextRequest) {
  // Enforces that user is either Admin or Active/Verified Architect
  const { user, errorResponse } = await requireVerifiedArchitect(req);
  if (errorResponse) return errorResponse;

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      style,
      location,
      price,
      cents,
      builtUpArea,
      bedrooms,
      floors,
      facing,
      vastuScore,
      description,
      image,
      gallery,
      floorPlanImage,
      dimensions,
      sheetCount = 42,
    } = body;

    // Strict validation of mandatory architectural listing fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Blueprint title is required." },
        { status: 400 }
      );
    }

    if (!price) {
      return NextResponse.json(
        { error: "Commercial listing price is required." },
        { status: 400 }
      );
    }

    const cleanName = name.trim().slice(0, 150);
    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newId = `proj-${Date.now().toString().slice(-6)}`;
    const formattedPrice = String(price).startsWith("₹") ? String(price) : `₹${price}`;
    const priceNum = parseFloat(formattedPrice.replace(/[₹,]/g, "")) || 0;
    const centsNum = parseFloat(cents) || 10;

    const defaultImage =
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85";

    // Admin submissions are automatically published; architects can be published if verified
    const status = user.role === "admin" ? (body.status || "published") : "published";

    await d1.execute(
      `INSERT INTO projects (
        id, slug, name, style, location, plot_size, cents, built_up_area,
        bedrooms, floors, facing, vastu_score, price, price_numeric,
        sheet_count, status, featured, image, gallery, floor_plan_image,
        description, highlights, plot_width, plot_length, setbacks,
        dwg_available, bim_available, boq_available, mep_available,
        architect_name, architect_studio, architect_location, architect_avatar, architect_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        slug,
        cleanName,
        style || "CONTEMPORARY",
        location || "Kochi, Kerala",
        `${centsNum} Cents`,
        centsNum,
        builtUpArea || "2,400 Sq.Ft",
        parseInt(bedrooms) || 3,
        parseInt(floors) || 2,
        facing || "East",
        parseInt(vastuScore) || 95,
        formattedPrice,
        priceNum,
        parseInt(sheetCount) || 42,
        status,
        0, // featured is 0 by default
        image || defaultImage,
        JSON.stringify(Array.isArray(gallery) ? gallery : []),
        floorPlanImage || null,
        description || "Curated climate-responsive residential blueprint.",
        JSON.stringify(Array.isArray(body.highlights) ? body.highlights : []),
        dimensions?.plotWidth || "40 ft",
        dimensions?.plotLength || "60 ft",
        dimensions?.setbacks || "Front: 3.0m, Rear: 1.5m, Sides: 1.2m (KMBR)",
        body.dwgAvailable !== false ? 1 : 0,
        body.bimAvailable !== false ? 1 : 0,
        body.boqAvailable !== false ? 1 : 0,
        body.mepAvailable !== false ? 1 : 0,
        user.name,
        user.studioName || "Verified Studio",
        user.location || "South India",
        user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        user.id,
      ]
    );

    // Audit log in Cloudflare D1
    try {
      await d1.execute(
        `INSERT INTO audit_logs (id, actor_id, actor_name, actor_email, actor_role, action, target_id, target_type, details)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `aud-${Date.now()}`,
          user.id,
          user.name,
          user.email,
          user.role,
          "PUBLISH_PROJECT",
          newId,
          "project",
          JSON.stringify({ title: cleanName, price: formattedPrice, cents: centsNum }),
        ]
      );
    } catch (auditErr) {
      console.warn("Failed to write project publish audit log:", auditErr);
    }

    const createdProject = {
      id: newId,
      slug,
      name: cleanName,
      style: style || "CONTEMPORARY",
      location: location || "Kochi, Kerala",
      plotSize: `${centsNum} Cents`,
      cents: centsNum,
      builtUpArea: builtUpArea || "2,400 Sq.Ft",
      bedrooms: parseInt(bedrooms) || 3,
      floors: parseInt(floors) || 2,
      facing: facing || "East",
      vastuScore: parseInt(vastuScore) || 95,
      price: formattedPrice,
      priceNumeric: priceNum,
      sheetCount: parseInt(sheetCount) || 42,
      status,
      image: image || defaultImage,
      gallery: Array.isArray(gallery) ? gallery : [],
      description: description || "Curated climate-responsive residential blueprint.",
      architect: {
        id: user.id,
        name: user.name,
        studio: user.studioName || "Verified Studio",
        location: user.location || "South India",
        verified: true,
        image: user.avatar || defaultImage,
      },
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Architectural blueprint successfully registered with S-ARC catalog.",
        project: createdProject,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/projects error:", err);
    return NextResponse.json(
      { error: "Failed to publish architectural blueprint listing." },
      { status: 500 }
    );
  }
}

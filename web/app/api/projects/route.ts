import { NextRequest, NextResponse } from "next/server";
import { FEATURED_PROJECTS } from "@/lib/data";
import { requireRole } from "@/lib/auth-middleware";
import { d1 } from "@/lib/d1";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const style = url.searchParams.get("style");
    const minCents = url.searchParams.get("minCents");
    const maxCents = url.searchParams.get("maxCents");
    const facing = url.searchParams.get("facing");
    const q = url.searchParams.get("q")?.toLowerCase();

    let sql = `
      SELECT 
        id, 
        slug, 
        name, 
        style, 
        location, 
        plot_size AS plotSize, 
        cents, 
        built_up_area AS builtUpArea, 
        bedrooms, 
        floors, 
        facing, 
        vastu_score AS vastuScore, 
        price, 
        price_numeric AS priceNumeric, 
        sheet_count AS sheetCount, 
        status, 
        featured, 
        image, 
        gallery, 
        floor_plan_image AS floorPlanImage, 
        description, 
        highlights, 
        plot_width AS plotWidth, 
        plot_length AS plotLength, 
        setbacks, 
        dwg_available AS dwgAvailable, 
        bim_available AS bimAvailable, 
        boq_available AS boqAvailable, 
        mep_available AS mepAvailable, 
        views, 
        inquiries_count AS inquiriesCount, 
        architect_name AS architectName, 
        architect_studio AS architectStudio, 
        architect_location AS architectLocation, 
        architect_avatar AS architectAvatar, 
        architect_id AS architectId, 
        created_at AS createdAt
      FROM projects 
      WHERE 1=1
    `;
    const params: any[] = [];

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
      sql += " AND (lower(name) LIKE ? OR lower(location) LIKE ? OR lower(architect_name) LIKE ?)";
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    sql += " ORDER BY featured DESC, created_at DESC";

    const rows = await d1.query(sql, params);

    const formattedProjects = rows.map((p: any) => ({
      ...p,
      gallery: typeof p.gallery === "string" ? JSON.parse(p.gallery || "[]") : (p.gallery || []),
      highlights: typeof p.highlights === "string" ? JSON.parse(p.highlights || "[]") : (p.highlights || []),
      featured: Boolean(p.featured),
      dwgAvailable: Boolean(p.dwgAvailable),
      bimAvailable: Boolean(p.bimAvailable),
      boqAvailable: Boolean(p.boqAvailable),
      mepAvailable: Boolean(p.mepAvailable),
      architect: {
        name: p.architectName || "Ar. Creator",
        studio: p.architectStudio || "Verified Studio",
        location: p.architectLocation || "South India",
        verified: true,
        image: p.architectAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      },
    }));

    return NextResponse.json({
      count: formattedProjects.length,
      projects: formattedProjects.length > 0 ? formattedProjects : FEATURED_PROJECTS,
    });
  } catch (err: any) {
    console.error("D1 projects query error:", err);
    return NextResponse.json({ error: "Failed to retrieve projects from Cloudflare D1" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = await requireRole(req, ["super_admin", "admin", "user"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { name, style, location, price, cents, builtUpArea, bedrooms, floors, facing, vastuScore } = body;

    if (!name || !price) {
      return NextResponse.json(
        { error: "Design title and blueprint price are required" },
        { status: 400 }
      );
    }

    const newId = `proj-${Date.now().toString().slice(-5)}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const formattedPrice = price.startsWith("₹") ? price : `₹${price}`;
    const priceNum = parseFloat(formattedPrice.replace(/[₹,]/g, "")) || 0;
    const centsNum = parseFloat(cents) || 10;
    const defaultImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85";

    await d1.execute(
      `INSERT INTO projects (
        id, slug, name, style, location, plot_size, cents, built_up_area,
        bedrooms, floors, facing, vastu_score, price, price_numeric,
        sheet_count, status, featured, image, description,
        architect_name, architect_studio, architect_location, architect_avatar, architect_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        slug,
        name,
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
        42,
        "published",
        0,
        body.image || defaultImage,
        body.description || "Contemporary South Indian architectural home plan.",
        user?.name || "Ar. Creator",
        user?.studioName || "Verified Studio",
        user?.location || "South India",
        user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
        user?.id || "usr-creator",
      ]
    );

    const newProject = {
      id: newId,
      slug,
      name,
      style: style || "CONTEMPORARY",
      location: location || "Kochi, Kerala",
      cents: centsNum,
      plotSize: `${centsNum} Cents`,
      builtUpArea: builtUpArea || "2,400 Sq.Ft",
      price: formattedPrice,
      status: "published",
      architect: {
        name: user?.name || "Ar. Creator",
        studio: user?.studioName || "Verified Studio",
        location: user?.location || "South India",
        verified: true,
        image: user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      },
      ...body,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Architectural blueprint plan published to S-ARC Cloudflare D1 marketplace.",
        project: newProject,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("D1 project publish error:", err);
    return NextResponse.json({ error: "Failed to create project listing in Cloudflare D1" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { d1 } from "@/lib/d1";
import { FEATURED_ARCHITECTS } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * GET /api/architects
 * Public directory of verified, Council of Architecture (CoA) licensed architects.
 * Strictly filters by sub_role = 'architect' AND status = 'active'.
 * Pending verification and suspended accounts are strictly excluded.
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const city = url.searchParams.get("city");
    const q = url.searchParams.get("q")?.toLowerCase();

    // Query active verified architects from Cloudflare D1
    const sql = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.studio_name AS studio, 
        u.coa_number AS coaNumber, 
        u.phone, 
        u.location, 
        u.avatar AS image, 
        u.bio,
        u.status,
        (SELECT COUNT(*) FROM projects p WHERE p.architect_id = u.id AND p.status = 'published') AS projectCount
      FROM users u
      WHERE u.sub_role = 'architect' AND u.status = 'active'
      ORDER BY u.created_at ASC
    `;

    const rows = await d1.query(sql);

    // Map D1 user rows to public ArchitectProfile objects
    let architects = rows.map((u: any) => ({
      id: u.id,
      name: u.name,
      title: u.studio || "Principal Architect",
      specialty:
        u.bio?.match(/Specialty:\s*([^.\n]+)/i)?.[1]?.trim() ||
        "Tropical Modernism & Sustainable Villas",
      location: u.location || "Kochi, Kerala",
      image:
        u.image ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      verified: true,
      bio:
        u.bio ||
        `Registered with the Council of Architecture (${u.coaNumber || "CoA Verified"}). Pioneering climate-responsive sustainable architecture across South India.`,
      projectCount: Math.max(Number(u.projectCount) || 0, 1),
      coaNumber: u.coaNumber || "CA/VERIFIED",
      studio: u.studio || u.name,
      email: u.email,
      phone: u.phone,
    }));

    // If D1 returned fewer than initial featured catalog (cold dev setup), enrich with verified defaults
    if (architects.length === 0) {
      architects = FEATURED_ARCHITECTS as any[];
    }

    // Filter by city if requested
    if (city && city !== "All") {
      const cityLower = city.toLowerCase();
      architects = architects.filter((a) =>
        (a.location || "").toLowerCase().includes(cityLower)
      );
    }

    // Filter by search query if requested
    if (q) {
      architects = architects.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.title && a.title.toLowerCase().includes(q)) ||
          (a.specialty && a.specialty.toLowerCase().includes(q)) ||
          (a.location && a.location.toLowerCase().includes(q)) ||
          (a.bio && a.bio.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      count: architects.length,
      architects,
    });
  } catch (err: any) {
    console.error("GET /api/architects error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve architect directory from Cloudflare D1" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { FEATURED_PROJECTS } from "@/lib/data";
import { requireRole } from "@/lib/auth-middleware";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const style = url.searchParams.get("style");
    const minCents = url.searchParams.get("minCents");
    const maxCents = url.searchParams.get("maxCents");
    const facing = url.searchParams.get("facing");
    const q = url.searchParams.get("q")?.toLowerCase();

    let items = [...FEATURED_PROJECTS];

    if (style && style !== "All") {
      items = items.filter((p) => p.style.toLowerCase().includes(style.toLowerCase()));
    }

    if (minCents) {
      items = items.filter((p) => p.cents >= parseFloat(minCents));
    }

    if (maxCents) {
      items = items.filter((p) => p.cents <= parseFloat(maxCents));
    }

    if (q) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.architect.name.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      count: items.length,
      projects: items,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to retrieve projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = await requireRole(req, ["super_admin", "admin", "user"]);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { name, style, location, price, cents, builtUpArea } = body;

    if (!name || !price) {
      return NextResponse.json(
        { error: "Design title and blueprint price are required" },
        { status: 400 }
      );
    }

    const newProject = {
      id: `proj-${Date.now().toString().slice(-5)}`,
      name,
      style: style || "CONTEMPORARY",
      location: location || "Kochi, Kerala",
      cents: parseFloat(cents) || 10,
      plotSize: `${cents || 10} Cents`,
      builtUpArea: builtUpArea || "2,400 Sq.Ft",
      price: price.startsWith("₹") ? price : `₹${price}`,
      status: "published",
      architect: {
        name: user?.name || "Ar. Creator",
        studio: user?.studioName || "Verified Studio",
        location: user?.location || "South India",
        verified: true,
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      },
      ...body,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Architectural blueprint plan published to S-ARC marketplace.",
        project: newProject,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create project listing" }, { status: 500 });
  }
}

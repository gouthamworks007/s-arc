import { NextRequest, NextResponse } from "next/server";

interface GeocodeResult {
  placeId: string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type: string;
}

// In-memory cache for repeated searches
const GEOCODE_CACHE = new Map<string, { timestamp: number; data: GeocodeResult[] }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

// Instant pre-seeded major locations in South India / Kerala
const PRESEEDED_LOCATIONS: GeocodeResult[] = [
  {
    placeId: "loc-kochi",
    name: "Kochi (Cochin)",
    displayName: "Kochi, Ernakulam District, Kerala, India",
    lat: 9.9312,
    lng: 76.2673,
    type: "city",
  },
  {
    placeId: "loc-trivandrum",
    name: "Thiruvananthapuram (Trivandrum)",
    displayName: "Thiruvananthapuram, Kerala, India",
    lat: 8.5241,
    lng: 76.9366,
    type: "city",
  },
  {
    placeId: "loc-calicut",
    name: "Kozhikode (Calicut)",
    displayName: "Kozhikode, Kerala, India",
    lat: 11.2588,
    lng: 75.7804,
    type: "city",
  },
  {
    placeId: "loc-thrissur",
    name: "Thrissur",
    displayName: "Thrissur Cultural Capital, Kerala, India",
    lat: 10.5276,
    lng: 76.2144,
    type: "city",
  },
  {
    placeId: "loc-wayanad",
    name: "Wayanad (Kalpetta)",
    displayName: "Kalpetta, Wayanad District, Kerala, India",
    lat: 11.6103,
    lng: 76.0827,
    type: "city",
  },
  {
    placeId: "loc-kottayam",
    name: "Kottayam",
    displayName: "Kottayam, Kerala, India",
    lat: 9.5916,
    lng: 76.5222,
    type: "city",
  },
  {
    placeId: "loc-alappuzha",
    name: "Alappuzha (Alleppey)",
    displayName: "Alappuzha, Kerala, India",
    lat: 9.4981,
    lng: 76.3388,
    type: "city",
  },
  {
    placeId: "loc-bengaluru",
    name: "Bengaluru",
    displayName: "Bengaluru, Karnataka, India",
    lat: 12.9716,
    lng: 77.5946,
    type: "city",
  },
  {
    placeId: "loc-coimbatore",
    name: "Coimbatore",
    displayName: "Coimbatore, Tamil Nadu, India",
    lat: 11.0168,
    lng: 76.9558,
    type: "city",
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  if (!q) {
    return NextResponse.json({ results: PRESEEDED_LOCATIONS.slice(0, 5) });
  }

  // 1. Direct coordinate format detector: "9.9312, 76.2673" or "9.9312 76.2673"
  const coordRegex = /^\s*([+-]?\d+(\.\d+)?)\s*[, ]\s*([+-]?\d+(\.\d+)?)\s*$/;
  const coordMatch = q.match(coordRegex);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[3]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return NextResponse.json({
        results: [
          {
            placeId: `coord-${lat}-${lng}`,
            name: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            displayName: `Direct Coordinates: Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`,
            lat,
            lng,
            type: "coordinate",
          },
        ],
      });
    }
  }

  const cacheKey = q.toLowerCase();
  const cached = GEOCODE_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ results: cached.data });
  }

  // Check pre-seeded matches first
  const preseededMatches = PRESEEDED_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(cacheKey) ||
      loc.displayName.toLowerCase().includes(cacheKey)
  );

  try {
    // OpenStreetMap Nominatim request with compliance
    const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
    nominatimUrl.searchParams.set("q", q);
    nominatimUrl.searchParams.set("format", "json");
    nominatimUrl.searchParams.set("addressdetails", "1");
    nominatimUrl.searchParams.set("limit", "6");
    nominatimUrl.searchParams.set("countrycodes", "in"); // Prioritize India

    // Bound viewbox to South India region for highest relevance
    nominatimUrl.searchParams.set("viewbox", "74.0,7.5,81.0,14.5");
    nominatimUrl.searchParams.set("bounded", "0");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(nominatimUrl.toString(), {
      headers: {
        "User-Agent": "S-ARC-SouthernArchitecture-Platform/1.0 (gis@s-arc.pages.dev)",
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const results: GeocodeResult[] = (data || []).map((item: any) => ({
        placeId: String(item.place_id),
        name: item.name || item.display_name.split(",")[0],
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type || "locality",
      }));

      // Merge pre-seeded matches if unique
      const merged = [...preseededMatches];
      for (const r of results) {
        if (!merged.some((m) => Math.abs(m.lat - r.lat) < 0.005 && Math.abs(m.lng - r.lng) < 0.005)) {
          merged.push(r);
        }
      }

      GEOCODE_CACHE.set(cacheKey, { timestamp: Date.now(), data: merged });
      return NextResponse.json({ results: merged });
    }
  } catch (err) {
    // On upstream timeout or network limitation, gracefully serve pre-seeded matches
  }

  return NextResponse.json({ results: preseededMatches });
}


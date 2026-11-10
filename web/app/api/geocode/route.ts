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

// Instant pre-seeded major locations in South India / Kerala (Including all 14 Kerala districts)
const PRESEEDED_LOCATIONS: GeocodeResult[] = [
  {
    placeId: "loc-ernakulam",
    name: "Ernakulam (Kochi)",
    displayName: "Ernakulam District, Kochi, Kerala, India",
    lat: 9.9816,
    lng: 76.2999,
    type: "city",
  },
  {
    placeId: "loc-trivandrum",
    name: "Thiruvananthapuram (Trivandrum)",
    displayName: "Thiruvananthapuram District, Kerala, India",
    lat: 8.5241,
    lng: 76.9366,
    type: "city",
  },
  {
    placeId: "loc-calicut",
    name: "Kozhikode (Calicut)",
    displayName: "Kozhikode District, Kerala, India",
    lat: 11.2588,
    lng: 75.7804,
    type: "city",
  },
  {
    placeId: "loc-thrissur",
    name: "Thrissur",
    displayName: "Thrissur District, Cultural Capital, Kerala, India",
    lat: 10.5276,
    lng: 76.2144,
    type: "city",
  },
  {
    placeId: "loc-kottayam",
    name: "Kottayam",
    displayName: "Kottayam District, Kerala, India",
    lat: 9.5916,
    lng: 76.5222,
    type: "city",
  },
  {
    placeId: "loc-alappuzha",
    name: "Alappuzha (Alleppey)",
    displayName: "Alappuzha District, Kerala, India",
    lat: 9.4981,
    lng: 76.3388,
    type: "city",
  },
  {
    placeId: "loc-kollam",
    name: "Kollam (Quilon)",
    displayName: "Kollam District, Kerala, India",
    lat: 8.8932,
    lng: 76.6141,
    type: "city",
  },
  {
    placeId: "loc-palakkad",
    name: "Palakkad",
    displayName: "Palakkad District, Kerala, India",
    lat: 10.7867,
    lng: 76.6548,
    type: "city",
  },
  {
    placeId: "loc-malappuram",
    name: "Malappuram",
    displayName: "Malappuram District, Kerala, India",
    lat: 11.0510,
    lng: 76.0711,
    type: "city",
  },
  {
    placeId: "loc-kannur",
    name: "Kannur",
    displayName: "Kannur District, Kerala, India",
    lat: 11.8745,
    lng: 75.3704,
    type: "city",
  },
  {
    placeId: "loc-kasaragod",
    name: "Kasaragod",
    displayName: "Kasaragod District, Kerala, India",
    lat: 12.4996,
    lng: 74.9869,
    type: "city",
  },
  {
    placeId: "loc-wayanad",
    name: "Wayanad (Kalpetta)",
    displayName: "Wayanad District, Kalpetta, Kerala, India",
    lat: 11.6103,
    lng: 76.0827,
    type: "city",
  },
  {
    placeId: "loc-idukki",
    name: "Idukki (Painavu)",
    displayName: "Idukki District, Kerala, India",
    lat: 9.8500,
    lng: 76.9667,
    type: "city",
  },
  {
    placeId: "loc-pathanamthitta",
    name: "Pathanamthitta",
    displayName: "Pathanamthitta District, Kerala, India",
    lat: 9.2648,
    lng: 76.7870,
    type: "city",
  },
  {
    placeId: "loc-aluva",
    name: "Aluva",
    displayName: "Aluva Municipality, Ernakulam District, Kerala",
    lat: 10.1076,
    lng: 76.3516,
    type: "city",
  },
  {
    placeId: "loc-angamaly",
    name: "Angamaly",
    displayName: "Angamaly, Ernakulam District, Kerala",
    lat: 10.1960,
    lng: 76.3860,
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

  // 0. Reverse Geocoding support: ?lat=10.1287&lng=76.3493
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  if (latParam && lngParam) {
    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);
    if (!isNaN(lat) && !isNaN(lng)) {
      // Check pre-seeded known hubs within ~1.5 km
      for (const loc of PRESEEDED_LOCATIONS) {
        const dLat = Math.abs(loc.lat - lat);
        const dLng = Math.abs(loc.lng - lng);
        if (dLat < 0.015 && dLng < 0.015) {
          return NextResponse.json({
            success: true,
            name: loc.name,
            displayName: loc.displayName,
            lat,
            lng,
          });
        }
      }

      // Query OpenStreetMap Nominatim reverse endpoint
      try {
        const revUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
        const res = await fetch(revUrl, {
          headers: {
            "User-Agent": "S-ARC-SouthernArchitecture-Platform/1.0 (gis@s-arc.pages.dev)",
            Accept: "application/json",
          },
        });
        if (res.ok) {
          const data = await res.json();
          const addr = data.address || {};
          const locality =
            addr.suburb ||
            addr.neighbourhood ||
            addr.village ||
            addr.town ||
            addr.city ||
            addr.county ||
            "Kerala Property";
          const district = addr.county || addr.state_district || "";
          const state = addr.state || "Kerala";
          const postcode = addr.postcode ? ` - ${addr.postcode}` : "";
          const name = district && locality !== district ? `${locality}, ${district}` : `${locality}, ${state}`;
          const displayName = data.display_name || `${name}${postcode}`;

          return NextResponse.json({
            success: true,
            name,
            displayName,
            lat,
            lng,
          });
        }
      } catch (err) {
        // Fallback
      }

      return NextResponse.json({
        success: true,
        name: `Plot Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        displayName: `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)} (Kerala, India)`,
        lat,
        lng,
      });
    }
  }

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

  // Check pre-seeded matches first (supports fuzzy terms like 'desam', 'desom', 'aluva', etc.)
  const preseededMatches = PRESEEDED_LOCATIONS.filter((loc) => {
    const locName = loc.name.toLowerCase();
    const locDisplay = loc.displayName.toLowerCase();
    if (locName.includes(cacheKey) || locDisplay.includes(cacheKey)) return true;
    if (
      (cacheKey.includes("desam") || cacheKey.includes("desom")) &&
      (locName.includes("desam") || locName.includes("desom"))
    ) {
      return true;
    }
    return false;
  });

  try {
    // OpenStreetMap Nominatim request with compliance
    const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
    
    const queryToSearch = q;

    nominatimUrl.searchParams.set("q", queryToSearch);
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


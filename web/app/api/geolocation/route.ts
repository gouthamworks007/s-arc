import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // 1. Check Cloudflare Edge Headers if deployed
  const cfLat = req.headers.get("cf-iplatitude");
  const cfLng = req.headers.get("cf-iplongitude");
  const cfCity = req.headers.get("cf-ipcity");
  const cfRegion = req.headers.get("cf-region");

  if (cfLat && cfLng) {
    const lat = parseFloat(cfLat);
    const lng = parseFloat(cfLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      return NextResponse.json({
        latitude: lat,
        longitude: lng,
        city: cfCity || "Your Location",
        region: cfRegion || "South India",
        source: "cloudflare-edge",
      });
    }
  }

  // 2. Extract Client IP
  const forwardedFor = req.headers.get("x-forwarded-for");
  const clientIp = forwardedFor
    ? forwardedFor.split(",")[0].trim()
    : req.headers.get("cf-connecting-ip") || "";

  // 3. Fallback to free IP Geolocation service
  try {
    const targetUrl = clientIp && !clientIp.startsWith("127.") && !clientIp.startsWith("192.168.")
      ? `https://ipapi.co/${clientIp}/json/`
      : "https://ipapi.co/json/";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "S-ARC-GIS/1.0" },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        return NextResponse.json({
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city || "Kerala",
          region: data.region || "South India",
          source: "ip-geocoding",
        });
      }
    }
  } catch (e) {
    // Ignore timeout
  }

  // 4. Default to Ernakulam / Central Kerala fallback if completely offline or local development
  return NextResponse.json({
    latitude: 9.9816,
    longitude: 76.2999,
    city: "Ernakulam",
    region: "Kerala",
    source: "default-regional",
  });
}


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

  // Helper: check if IP is private, local, loopback, or empty
  const isPrivateOrLocalIp = (ip: string) => {
    if (!ip) return true;
    if (ip === "::1" || ip === "127.0.0.1" || ip === "localhost") return true;
    if (ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
    if (
      ip.startsWith("172.16.") ||
      ip.startsWith("172.17.") ||
      ip.startsWith("172.18.") ||
      ip.startsWith("172.19.") ||
      ip.startsWith("172.2") ||
      ip.startsWith("172.30.") ||
      ip.startsWith("172.31.")
    ) {
      return true;
    }
    if (ip.startsWith("fc00:") || ip.startsWith("fd00:") || ip.startsWith("fe80:")) return true;
    return false;
  };

  // Immediate default for local development / internal requests (prevents 3s external hang)
  if (isPrivateOrLocalIp(clientIp)) {
    return NextResponse.json({
      latitude: 9.9816,
      longitude: 76.2999,
      city: "Ernakulam",
      region: "Kerala",
      source: "local-kerala-default",
    });
  }

  // 3. Fallback to free IP Geolocation service for public client IPs
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`https://ipapi.co/${clientIp}/json/`, {
      signal: controller.signal,
      headers: { "User-Agent": "S-ARC-GIS/1.0" },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude && !data.error) {
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

  // 4. Default to Ernakulam / Central Kerala fallback
  return NextResponse.json({
    latitude: 9.9816,
    longitude: 76.2999,
    city: "Ernakulam",
    region: "Kerala",
    source: "default-regional",
  });
}


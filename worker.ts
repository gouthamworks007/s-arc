import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

export interface Env {
  DB: D1Database;
  BUCKET?: R2Bucket;
  ASSETS: Fetcher;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  JWT_SECRET?: string;
  NEXT_PUBLIC_APP_URL?: string;
}

const DEFAULT_JWT_SECRET = "s-arc-secure-production-jwt-key-2026-south-arch";

// -------------------------------------------------------------
// S-ARC LIVE SECURITY & SAFETY ENGINE
// -------------------------------------------------------------

// Whitelisted Origins for Strict CORS Enforcement
const ALLOWED_ORIGINS = new Set([
  "https://southernarchitecture.in",
  "https://www.southernarchitecture.in",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

// Whitelisted File Upload Extensions for S-ARC
const ALLOWED_UPLOAD_EXTENSIONS = new Set([
  // Web-Safe Images (Thumbnails, Gallery, Avatars)
  ".jpg", ".jpeg", ".png", ".webp", ".avif",
  // Architectural CAD & BIM Packages
  ".dwg", ".dxf", ".rvt", ".skp", ".bim", ".ifc", ".zip", ".rar", ".7z",
  // Sanction & Deliverable Documents
  ".pdf"
]);

// Sliding-Window Edge Rate Limiting Cache
interface RateLimitEntry {
  count: number;
  resetTime: number;
}
const rateLimitCache = new Map<string, RateLimitEntry>();

function checkRateLimit(ip: string, action: string, maxRequests: number, windowSeconds: number): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const key = `${ip}:${action}`;

  // Periodic pruning of expired entries
  if (rateLimitCache.size > 5000) {
    for (const [k, v] of rateLimitCache.entries()) {
      if (v.resetTime < now) rateLimitCache.delete(k);
    }
  }

  const current = rateLimitCache.get(key);
  if (!current || current.resetTime < now) {
    rateLimitCache.set(key, { count: 1, resetTime: now + windowSeconds * 1000 });
    return { allowed: true };
  }

  if (current.count >= maxRequests) {
    const retryAfter = Math.ceil((current.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  current.count++;
  return { allowed: true };
}

function getCorsHeaders(request: Request): Headers {
  const headers = new Headers();
  const origin = request.headers.get("Origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Cookie");
    headers.set("Access-Control-Max-Age", "86400");
    headers.set("Vary", "Origin");
  }
  return headers;
}

function applySecurityHeaders(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  const url = new URL(request.url);

  // 1. Strict-Transport-Security (HSTS): Enforce HTTPS for 2 years with preloading
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  // 2. Prevent MIME-Type Confusion & Drive-By Downloads
  headers.set("X-Content-Type-Options", "nosniff");

  // 3. Clickjacking Protection
  headers.set("X-Frame-Options", "SAMEORIGIN");

  // 4. Referrer Policy: Strip query parameters on cross-origin requests
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // 5. Hardware & Privacy Permissions Lock-Down
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self), payment=(), usb=(), display-capture=()");

  // 6. Cross-Origin Isolation for OAuth Popups
  headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");

  // 7. Content-Security-Policy (CSP)
  if (url.pathname.startsWith("/uploads/")) {
    headers.set("Content-Security-Policy", "default-src 'none'; img-src 'self' data: blob:; style-src 'unsafe-inline'; sandbox");
  } else if (!url.pathname.startsWith("/api/")) {
    headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://challenges.cloudflare.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://lh3.googleusercontent.com https://*.googleusercontent.com https://southernarchitecture.in https://*.southernarchitecture.in https://*.tile.openstreetmap.org; media-src 'self' data: blob: https://southernarchitecture.in https://*.southernarchitecture.in; connect-src 'self' https://southernarchitecture.in https://www.southernarchitecture.in https://accounts.google.com https://www.googleapis.com https://nominatim.openstreetmap.org https://*.tile.openstreetmap.org https://cloudflareinsights.com; frame-src 'self' https://accounts.google.com https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self' https://accounts.google.com; frame-ancestors 'self'; upgrade-insecure-requests;"
    );
  }

  // 8. CORS Headers for API requests
  if (url.pathname.startsWith("/api/")) {
    const origin = request.headers.get("Origin");
    if (origin && ALLOWED_ORIGINS.has(origin)) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Access-Control-Allow-Credentials", "true");
      headers.set("Vary", "Origin");
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function getJwtKey(env: Env): Uint8Array {
  const secret = env.JWT_SECRET || DEFAULT_JWT_SECRET;
  return new TextEncoder().encode(secret);
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const item of cookieHeader.split(";")) {
    const [k, v] = item.trim().split("=");
    if (k && v) {
      cookies[k] = decodeURIComponent(v);
    }
  }
  return cookies;
}

async function authenticateUser(request: Request, env: Env): Promise<any | null> {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : cookies["sarc_session_token"];
  if (!token) return null;
  try {
    const jwtKey = getJwtKey(env);
    const { payload } = await jwtVerify(token, jwtKey, {
      issuer: "s-arc-platform",
      audience: "s-arc-users",
    });
    return payload;
  } catch {
    return null;
  }
}

function formatProjectRow(p: any) {
  if (!p) return null;
  let gallery: string[] = [];
  try {
    gallery = typeof p.gallery === "string" ? JSON.parse(p.gallery || "[]") : (Array.isArray(p.gallery) ? p.gallery : []);
  } catch {
    gallery = [];
  }
  let highlights: string[] = [];
  try {
    highlights = typeof p.highlights === "string" ? JSON.parse(p.highlights || "[]") : (Array.isArray(p.highlights) ? p.highlights : []);
  } catch {
    highlights = [];
  }

  const centsNum = Number(p.cents) || 10;
  const architect = (p.architect && typeof p.architect === "object") ? p.architect : {
    id: p.architect_id || "usr-arch-01",
    name: p.architect_name || "Ar. Nikhil Rajan",
    studio: p.architect_studio || "Studio Vayu",
    location: p.architect_location || "Kochi, Kerala",
    verified: true,
    image: p.architect_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  };

  return {
    id: p.id,
    slug: p.slug || p.id,
    name: p.name || "Architectural Blueprint",
    style: p.style || "CONTEMPORARY",
    location: p.location || "Kerala, India",
    plotSize: p.plot_size || `${centsNum} Cents`,
    cents: centsNum,
    builtUpArea: p.built_up_area || "2,400 Sq.Ft",
    bedrooms: Number(p.bedrooms) || 3,
    floors: Number(p.floors) || 2,
    facing: p.facing || "East",
    vastuScore: Number(p.vastu_score ?? p.vastuScore) || 95,
    price: p.price || "₹35,000",
    priceNumeric: Number(p.price_numeric ?? p.priceNumeric) || 35000,
    sheetCount: Number(p.sheet_count ?? p.sheetCount) || 42,
    status: p.status || "published",
    featured: Boolean(p.featured),
    image: p.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
    gallery,
    floorPlanImage: p.floor_plan_image || null,
    cadFileUrl: p.cad_file_url || null,
    cadFileName: p.cad_file_name || null,
    cadFileSize: p.cad_file_size || null,
    description: p.description || "",
    highlights,
    dimensions: p.dimensions || {
      plotWidth: p.plot_width || "40 ft",
      plotLength: p.plot_length || "60 ft",
      setbacks: p.setbacks || "Front: 3.0m, Rear: 1.5m, Sides: 1.2m (KMBR)",
    },
    dwgAvailable: Boolean(p.dwg_available ?? 1),
    bimAvailable: Boolean(p.bim_available ?? 1),
    boqAvailable: Boolean(p.boq_available ?? 1),
    mepAvailable: Boolean(p.mep_available ?? 1),
    views: Number(p.views) || 0,
    inquiries: Number(p.inquiries_count ?? p.inquiries) || 0,
    architect,
    createdAt: p.created_at || new Date().toISOString(),
    updatedAt: p.updated_at || new Date().toISOString(),
  };
}

async function handleRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);

  // 1. CORS Preflight: Handle OPTIONS requests immediately for all /api/ endpoints
  if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
    return new Response(null, { status: 204, headers: getCorsHeaders(request) });
  }

  // 2. Serve uploaded files directly from Cloudflare R2 bucket with hardened security
  if (url.pathname.startsWith("/uploads/")) {
    const rawKey = url.pathname.replace(/^\/uploads\//, "");
    // Security Defense: Block directory traversal, null bytes, backslashes, and protocol escaping
    if (rawKey.includes("..") || rawKey.startsWith("/") || rawKey.includes("\\") || rawKey.includes("\0")) {
      return new Response("Forbidden: Invalid file path", { status: 403 });
    }
    const key = decodeURIComponent(rawKey);
    if (env.BUCKET) {
      try {
        const object = await env.BUCKET.get(key);
        if (object) {
          const headers = new Headers();
          object.writeHttpMetadata(headers);
          headers.set("etag", object.httpEtag);
          headers.set("Cache-Control", "public, max-age=31536000, immutable");
          headers.set("X-Content-Type-Options", "nosniff");
          headers.set("Content-Security-Policy", "default-src 'none'; img-src 'self' data: blob:; style-src 'unsafe-inline'; sandbox");

          // For CAD/BIM archives, force secure attachment download
          const ext = key.slice(key.lastIndexOf(".")).toLowerCase();
          if ([".dwg", ".dxf", ".zip", ".rar", ".7z", ".rvt", ".skp", ".bim"].includes(ext)) {
            const safeDownloadName = (object.customMetadata?.originalName || key.split("/").pop() || "download").replace(/[^\w.-]/g, "_");
            headers.set("Content-Disposition", `attachment; filename="${safeDownloadName}"`);
          }

          return new Response(object.body, { headers });
        }
      } catch (e) {
        console.warn("R2 fetch error:", e);
      }
    }
    return env.ASSETS.fetch(request);
  }

  // Only intercept /api/ requests; everything else is served by Cloudflare Static Assets
  if (!url.pathname.startsWith("/api/")) {
    return env.ASSETS.fetch(request);
  }

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
    const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    // -------------------------------------------------------------
    // 1. GET /api/auth/google - Initiate Google OAuth
    // -------------------------------------------------------------
    if (url.pathname === "/api/auth/google" && request.method === "GET") {
      const intent = url.searchParams.get("intent") || "login";
      const redirectTarget = url.searchParams.get("redirect") || "/dashboard";

      const googleClientId = env.GOOGLE_CLIENT_ID;
      const callbackUrl = `${baseUrl}/api/auth/google/callback`;

      const stateId = crypto.randomUUID ? crypto.randomUUID() : `state_${Date.now()}`;
      const statePayload = JSON.stringify({ state: stateId, intent, redirect: redirectTarget });
      const stateCookieVal = btoa(statePayload).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

      if (!googleClientId) {
        // Fallback to dev chooser
        const devUrl = new URL(`${baseUrl}/login/google-dev`);
        devUrl.searchParams.set("intent", intent);
        devUrl.searchParams.set("redirect", redirectTarget);
        devUrl.searchParams.set("state", stateCookieVal);
        return new Response(null, {
          status: 302,
          headers: {
            Location: devUrl.toString(),
            "Set-Cookie": `sarc_google_oauth_state=${stateCookieVal}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
          },
        });
      }

      const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      googleAuthUrl.searchParams.set("client_id", googleClientId.trim());
      googleAuthUrl.searchParams.set("redirect_uri", callbackUrl);
      googleAuthUrl.searchParams.set("response_type", "code");
      googleAuthUrl.searchParams.set("scope", "openid email profile");
      googleAuthUrl.searchParams.set("state", stateCookieVal);
      googleAuthUrl.searchParams.set("prompt", "select_account");

      return new Response(null, {
        status: 302,
        headers: {
          Location: googleAuthUrl.toString(),
          "Set-Cookie": `sarc_google_oauth_state=${stateCookieVal}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
        },
      });
    }

    // -------------------------------------------------------------
    // 2. GET /api/auth/google/callback - Google OAuth Callback
    // -------------------------------------------------------------
    if (url.pathname === "/api/auth/google/callback" && request.method === "GET") {
      const code = url.searchParams.get("code");
      const stateParam = url.searchParams.get("state");
      const error = url.searchParams.get("error");
      const simulatedParam = url.searchParams.get("simulated");

      if (error) {
        return Response.redirect(`${baseUrl}/login?error=google_cancelled`, 302);
      }

      const cookies = parseCookies(request.headers.get("Cookie"));
      const stateCookie = cookies["sarc_google_oauth_state"];

      let decodedState: { intent?: string; redirect?: string } = {};
      try {
        const raw = stateParam || stateCookie;
        if (raw) {
          decodedState = JSON.parse(atob(raw.replace(/-/g, "+").replace(/_/g, "/")));
        }
      } catch (e) {}

      const intent = decodedState.intent || "login";
      const redirectTarget = decodedState.redirect || "/dashboard";

      let googleUser: { email: string; name: string; picture?: string; sub?: string } | null = null;

      const googleClientId = env.GOOGLE_CLIENT_ID;
      const googleClientSecret = env.GOOGLE_CLIENT_SECRET;
      const callbackUrl = `${baseUrl}/api/auth/google/callback`;

      if (code && googleClientId && googleClientSecret) {
        try {
          const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: googleClientId.trim(),
              client_secret: googleClientSecret.trim(),
              code,
              grant_type: "authorization_code",
              redirect_uri: callbackUrl,
            }),
          });

          if (!tokenRes.ok) {
            console.error("Google token error:", await tokenRes.text());
            return Response.redirect(`${baseUrl}/login?error=google_token_exchange_failed`, 302);
          }

          const tokenData: any = await tokenRes.json();
          const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });

          if (!userInfoRes.ok) {
            return Response.redirect(`${baseUrl}/login?error=google_userinfo_failed`, 302);
          }

          const profile: any = await userInfoRes.json();
          googleUser = {
            email: profile.email,
            name: profile.name || profile.email.split("@")[0],
            picture: profile.picture,
            sub: profile.sub,
          };
        } catch (err) {
          console.error("OAuth token exception:", err);
          return Response.redirect(`${baseUrl}/login?error=google_auth_failed`, 302);
        }
      } else if (simulatedParam) {
        try {
          const parsed = JSON.parse(atob(simulatedParam.replace(/-/g, "+").replace(/_/g, "/")));
          if (parsed && parsed.email) {
            googleUser = {
              email: parsed.email,
              name: parsed.name || parsed.email.split("@")[0],
              picture: parsed.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
              sub: `sim_${Date.now()}`,
            };
          }
        } catch (e) {}
      }

      if (!googleUser || !googleUser.email) {
        return Response.redirect(`${baseUrl}/login?error=google_missing_profile`, 302);
      }

      const cleanEmail = googleUser.email.toLowerCase().trim();
      let finalUser: any = null;
      let isNewUser = false;

      try {
        // Query D1 Database
        const existingResult = await env.DB.prepare(
          "SELECT * FROM users WHERE lower(email) = lower(?) LIMIT 1"
        ).bind(cleanEmail).first<any>();

        if (existingResult) {
          if (existingResult.status === "suspended") {
            return Response.redirect(`${baseUrl}/login?error=account_suspended`, 302);
          }
          finalUser = {
            id: existingResult.id,
            name: existingResult.name,
            email: existingResult.email,
            role: existingResult.role === "admin" ? "admin" : "user",
            subRole: existingResult.sub_role || "homeowner",
            status: existingResult.status || "active",
            avatar: existingResult.avatar || googleUser.picture,
            phone: existingResult.phone,
            location: existingResult.location || "South India",
          };
        } else {
          isNewUser = true;
          const newUserId = `usr-g-${Date.now().toString().slice(-6)}`;
          const defaultAvatar = googleUser.picture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80";

          await env.DB.prepare(
            `INSERT INTO users (id, name, email, password_hash, role, sub_role, status, avatar, location, bio, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
          ).bind(
            newUserId,
            googleUser.name.slice(0, 100),
            cleanEmail,
            "GOOGLE_OAUTH_ACCOUNT",
            "user",
            "homeowner",
            "active",
            defaultAvatar,
            "South India",
            "Registered with Google Account"
          ).run();

          finalUser = {
            id: newUserId,
            name: googleUser.name,
            email: cleanEmail,
            role: "user",
            subRole: "homeowner",
            status: "active",
            avatar: defaultAvatar,
            location: "South India",
          };
        }

        // Generate JWT Token
        const jwtKey = getJwtKey(env);
        const token = await new SignJWT({
          id: finalUser.id,
          name: finalUser.name,
          email: finalUser.email,
          role: finalUser.role,
          subRole: finalUser.subRole,
          status: finalUser.status,
        })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("7d")
          .setIssuer("s-arc-platform")
          .setAudience("s-arc-users")
          .sign(jwtKey);

        let destinationUrl = redirectTarget;
        if (isNewUser && (intent === "signup" || redirectTarget.includes("/signup"))) {
          destinationUrl = `${baseUrl}/signup?step=2&google=1`;
        } else if (!destinationUrl.startsWith("http")) {
          destinationUrl = `${baseUrl}${destinationUrl.startsWith("/") ? destinationUrl : `/${destinationUrl}`}`;
        }

        const headers = new Headers();
        headers.set("Location", destinationUrl);
        headers.append(
          "Set-Cookie",
          `sarc_session_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800; Secure`
        );
        headers.append(
          "Set-Cookie",
          "sarc_google_oauth_state=; Path=/; HttpOnly; Max-Age=0"
        );

        return new Response(null, { status: 302, headers });
      } catch (dbErr) {
        console.error("D1 Google callback error:", dbErr);
        return Response.redirect(`${baseUrl}/login?error=google_processing_error`, 302);
      }
    }

    // -------------------------------------------------------------
    // 3. GET /api/auth/me - Validate Current Session
    // -------------------------------------------------------------
    if (url.pathname === "/api/auth/me" && (request.method === "GET" || request.method === "HEAD")) {
      const cookies = parseCookies(request.headers.get("Cookie"));
      const authHeader = request.headers.get("Authorization");
      const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : cookies["sarc_session_token"];

      if (!token) {
        return Response.json({ authenticated: false, user: null }, { status: 200 });
      }

      try {
        const jwtKey = getJwtKey(env);
        const { payload } = await jwtVerify(token, jwtKey, {
          issuer: "s-arc-platform",
          audience: "s-arc-users",
        });

        const dbUser = await env.DB.prepare(
          "SELECT * FROM users WHERE id = ? LIMIT 1"
        ).bind(payload.id).first<any>();

        if (dbUser) {
          if (dbUser.status === "suspended") {
            return Response.json({ authenticated: false, error: "Account suspended", user: null }, { status: 403 });
          }
          return Response.json({
            authenticated: true,
            user: {
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email,
              role: dbUser.role === "super_admin" ? "admin" : dbUser.role,
              subRole: dbUser.sub_role || undefined,
              status: dbUser.status,
              avatar: dbUser.avatar,
              phone: dbUser.phone,
              location: dbUser.location,
              studioName: dbUser.studio_name,
              coaNumber: dbUser.coa_number,
              bio: dbUser.bio,
            },
          });
        }

        return Response.json({ authenticated: true, user: payload }, { status: 200 });
      } catch (err) {
        return Response.json({ authenticated: false, user: null }, { status: 200 });
      }
    }

    // -------------------------------------------------------------
    // 4. POST /api/auth/login - Email/Password Login
    // -------------------------------------------------------------
    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      const clientIp = request.headers.get("cf-connecting-ip") || "anonymous";
      const rate = checkRateLimit(clientIp, "login", 10, 60);
      if (!rate.allowed) {
        return Response.json(
          { success: false, message: `Too many login attempts. Please wait ${rate.retryAfter} seconds before trying again.` },
          { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
        );
      }

      try {
        const body: any = await request.json();
        const { email, password } = body;
        if (!email || !password) {
          return Response.json({ success: false, message: "Email and password required" }, { status: 400 });
        }

        const user = await env.DB.prepare(
          "SELECT * FROM users WHERE lower(email) = lower(?) LIMIT 1"
        ).bind(email.trim().toLowerCase()).first<any>();

        if (!user) {
          return Response.json({ success: false, message: "Invalid credentials" }, { status: 401 });
        }

        const isValid = bcrypt.compareSync(password, user.password_hash);
        if (!isValid) {
          return Response.json({ success: false, message: "Invalid credentials" }, { status: 401 });
        }

        const jwtKey = getJwtKey(env);
        const token = await new SignJWT({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role === "super_admin" ? "admin" : user.role,
          subRole: user.sub_role || undefined,
          status: user.status,
        })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("7d")
          .setIssuer("s-arc-platform")
          .setAudience("s-arc-users")
          .sign(jwtKey);

        const headers = new Headers({ "Content-Type": "application/json" });
        headers.set(
          "Set-Cookie",
          `sarc_session_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800; Secure`
        );

        return new Response(
          JSON.stringify({
            success: true,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role === "super_admin" ? "admin" : user.role,
              subRole: user.sub_role,
              status: user.status,
              avatar: user.avatar,
            },
          }),
          { status: 200, headers }
        );
      } catch (err: any) {
        return Response.json({ success: false, message: err.message }, { status: 500 });
      }
    }

    // -------------------------------------------------------------
    // 5. POST /api/auth/logout
    // -------------------------------------------------------------
    if (url.pathname === "/api/auth/logout" && request.method === "POST") {
      const headers = new Headers({ "Content-Type": "application/json" });
      headers.set("Set-Cookie", "sarc_session_token=; Path=/; HttpOnly; Max-Age=0");
      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    // -------------------------------------------------------------
    // 6. GET & POST /api/projects - Projects Feed from D1
    // -------------------------------------------------------------
    if (url.pathname === "/api/projects" && (request.method === "GET" || request.method === "HEAD")) {
      try {
        const style = url.searchParams.get("style");
        const status = url.searchParams.get("status");
        let query = "SELECT * FROM projects WHERE 1=1";
        const params: any[] = [];
        if (status && status !== "all") {
          query += " AND status = ?";
          params.push(status);
        }
        if (style && style !== "All") {
          query += " AND lower(style) LIKE ?";
          params.push(`%${style.toLowerCase()}%`);
        }
        query += " ORDER BY featured DESC, created_at DESC";
        const stmt = params.length > 0 ? env.DB.prepare(query).bind(...params) : env.DB.prepare(query);
        const { results } = await stmt.all();
        const formatted = (results || []).map(formatProjectRow);
        return Response.json({ count: formatted.length, projects: formatted }, { status: 200 });
      } catch (err: any) {
        return Response.json({ projects: [], error: err.message }, { status: 200 });
      }
    }

    if (url.pathname === "/api/projects" && request.method === "POST") {
      const user = await authenticateUser(request, env);
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      try {
        const body: any = await request.json().catch(() => ({}));
        const newId = `proj-${Date.now().toString().slice(-6)}`;
        const cleanName = (body.name || "Untitled Blueprint").trim().slice(0, 150);
        const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const formattedPrice = String(body.price || "₹35,000").startsWith("₹") ? String(body.price) : `₹${body.price}`;
        const priceNum = parseFloat(formattedPrice.replace(/[₹,]/g, "")) || 35000;
        const centsNum = parseFloat(body.cents) || 10;
        const status = user.role === "admin" ? (body.status || "published") : "published";

        await env.DB.prepare(
          `INSERT INTO projects (
            id, slug, name, style, location, plot_size, cents, built_up_area,
            bedrooms, floors, facing, vastu_score, price, price_numeric,
            sheet_count, status, featured, image, gallery, floor_plan_image,
            cad_file_url, cad_file_name, cad_file_size,
            description, highlights, plot_width, plot_length, setbacks,
            dwg_available, bim_available, boq_available, mep_available,
            architect_name, architect_studio, architect_location, architect_avatar, architect_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          newId,
          slug,
          cleanName,
          body.style || "CONTEMPORARY",
          body.location || "Kerala, India",
          `${centsNum} Cents`,
          centsNum,
          body.builtUpArea || "2,400 Sq.Ft",
          parseInt(body.bedrooms) || 3,
          parseInt(body.floors) || 2,
          body.facing || "East",
          parseInt(body.vastuScore) || 95,
          formattedPrice,
          priceNum,
          parseInt(body.sheetCount) || 42,
          status,
          0,
          body.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
          JSON.stringify(Array.isArray(body.gallery) ? body.gallery : []),
          body.floorPlanImage || null,
          body.cadFileUrl || null,
          body.cadFileName || null,
          body.cadFileSize || null,
          body.description || "Curated climate-responsive residential blueprint.",
          JSON.stringify(Array.isArray(body.highlights) ? body.highlights : []),
          body.dimensions?.plotWidth || "40 ft",
          body.dimensions?.plotLength || "60 ft",
          body.dimensions?.setbacks || "Front: 3.0m, Rear: 1.5m, Sides: 1.2m (KMBR)",
          body.dwgAvailable !== false ? 1 : 0,
          body.bimAvailable !== false ? 1 : 0,
          body.boqAvailable !== false ? 1 : 0,
          body.mepAvailable !== false ? 1 : 0,
          user.name,
          user.studioName || "Verified Studio",
          user.location || "South India",
          user.avatar || null,
          user.id
        ).run();

        return Response.json({ success: true, id: newId, slug }, { status: 201 });
      } catch (err: any) {
        return Response.json({ error: "Failed to create project: " + err.message }, { status: 500 });
      }
    }

    // -------------------------------------------------------------
    // 7. GET /api/plots - Saved Plots from D1
    // -------------------------------------------------------------
    if (url.pathname === "/api/plots" && (request.method === "GET" || request.method === "HEAD")) {
      try {
        const { results } = await env.DB.prepare(
          "SELECT * FROM saved_plots ORDER BY created_at DESC"
        ).all();
        return Response.json({ plots: results || [] }, { status: 200 });
      } catch (err: any) {
        return Response.json({ plots: [], error: err.message }, { status: 200 });
      }
    }

    // -------------------------------------------------------------
    // 8. GET /api/architects - Architects Directory from D1
    // -------------------------------------------------------------
    if (url.pathname === "/api/architects" && (request.method === "GET" || request.method === "HEAD")) {
      try {
        const { results } = await env.DB.prepare(
          "SELECT * FROM architects ORDER BY rating DESC"
        ).all();
        return Response.json({ architects: results || [] }, { status: 200 });
      } catch (err: any) {
        return Response.json({ architects: [], error: err.message }, { status: 200 });
      }
    }

    // -------------------------------------------------------------
    // 9. POST /api/auth/register - Email/Password Account Registration
    // -------------------------------------------------------------
    if (url.pathname === "/api/auth/register" && request.method === "POST") {
      const clientIp = request.headers.get("cf-connecting-ip") || "anonymous";
      const rate = checkRateLimit(clientIp, "register", 10, 60);
      if (!rate.allowed) {
        return Response.json(
          { error: `Too many registration attempts. Please wait ${rate.retryAfter} seconds.` },
          { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
        );
      }

      try {
        const body: any = await request.json().catch(() => ({}));
        const { name, email, password, subRole = "homeowner", coaNumber, studioName, phone, location, plotDetails, contractorDetails } = body;
        if (!name || typeof name !== "string" || !name.trim()) {
          return Response.json({ error: "Full name is required." }, { status: 400 });
        }
        if (!email || typeof email !== "string" || !email.includes("@")) {
          return Response.json({ error: "Valid email is required." }, { status: 400 });
        }
        if (!password || typeof password !== "string" || password.length < 6) {
          return Response.json({ error: "Password must be at least 6 characters." }, { status: 400 });
        }
        const cleanEmail = email.trim().toLowerCase();
        const existing = await env.DB.prepare("SELECT id FROM users WHERE lower(email) = lower(?) LIMIT 1").bind(cleanEmail).first<any>();
        if (existing) {
          return Response.json({ error: "An account with this email address already exists. Please sign in." }, { status: 409 });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const safeSubRole = ["homeowner", "architect", "contractor"].includes(subRole) ? subRole : "homeowner";
        const isArchitect = safeSubRole === "architect";
        const status = isArchitect ? "pending_verification" : "active";

        let profileBio = "";
        let reviewNotes = "";
        if (safeSubRole === "homeowner" && plotDetails) {
          profileBio = `${plotDetails.district || location || "Kerala"} • ${plotDetails.cents ? `${plotDetails.cents} Cents` : "Residential Plot"}`;
          reviewNotes = `Homeowner Profile | Land: ${plotDetails.status || "Owns plot"}`;
        } else if (safeSubRole === "architect") {
          profileBio = `${studioName || "Architectural Practice"} (${coaNumber || "CoA Reg"})`;
          reviewNotes = `Architect Credentials: CoA ${coaNumber || "Pending"} submitted for ${studioName || name}.`;
        } else if (safeSubRole === "contractor") {
          profileBio = `${contractorDetails?.firmName || studioName || "Turnkey Contracting"}`;
          reviewNotes = `Contractor Firm: ${contractorDetails?.firmName || name}`;
        }

        const newId = `usr-${Date.now().toString().slice(-6)}`;
        await env.DB.prepare(
          `INSERT INTO users (id, name, email, password_hash, role, sub_role, status, coa_number, studio_name, phone, location, bio, review_notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'user', ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
        ).bind(
          newId,
          name.trim().slice(0, 100),
          cleanEmail,
          passwordHash,
          safeSubRole,
          status,
          coaNumber ? String(coaNumber).trim().toUpperCase() : null,
          studioName ? String(studioName).trim() : null,
          phone ? String(phone).trim() : null,
          (location || "South India").trim().slice(0, 100),
          profileBio,
          reviewNotes
        ).run();

        const jwtKey = getJwtKey(env);
        const token = await new SignJWT({
          id: newId,
          name: name.trim(),
          email: cleanEmail,
          role: "user",
          subRole: safeSubRole,
          status,
        })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("7d")
          .setIssuer("s-arc-platform")
          .setAudience("s-arc-users")
          .sign(jwtKey);

        const headers = new Headers({ "Content-Type": "application/json" });
        headers.append(
          "Set-Cookie",
          `sarc_session_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800; Secure`
        );

        return new Response(JSON.stringify({
          success: true,
          user: {
            id: newId,
            name: name.trim(),
            email: cleanEmail,
            role: "user",
            subRole: safeSubRole,
            status,
          }
        }), { status: 201, headers });
      } catch (err: any) {
        return Response.json({ error: "Registration failed: " + err.message }, { status: 500 });
      }
    }

    // -------------------------------------------------------------
    // 10. GET /api/users - Admin User Directory
    // -------------------------------------------------------------
    if (url.pathname === "/api/users" && (request.method === "GET" || request.method === "HEAD")) {
      const user = await authenticateUser(request, env);
      if (!user || user.role !== "admin") {
        return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
      }
      try {
        const roleFilter = url.searchParams.get("role");
        const search = url.searchParams.get("q")?.toLowerCase();
        let sql = "SELECT id, name, email, role, sub_role AS subRole, status, coa_number AS coaNumber, studio_name AS studioName, phone, location, avatar, bio, permissions, review_notes AS reviewNotes, created_at AS joinedDate FROM users WHERE 1=1";
        const params: any[] = [];
        if (roleFilter && roleFilter !== "all") {
          sql += " AND role = ?";
          params.push(roleFilter);
        }
        if (search) {
          sql += " AND (lower(name) LIKE ? OR lower(email) LIKE ?)";
          params.push(`%${search}%`, `%${search}%`);
        }
        sql += " ORDER BY created_at DESC";
        const stmt = params.length > 0 ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
        const { results } = await stmt.all();
        const users = (results || []).map((u: any) => ({
          ...u,
          role: u.role === "super_admin" ? "admin" : u.role,
          permissions: typeof u.permissions === "string" ? JSON.parse(u.permissions || "[]") : (u.permissions || []),
        }));
        return Response.json({ total: users.length, users }, { status: 200 });
      } catch (err: any) {
        return Response.json({ error: "Failed to fetch users: " + err.message }, { status: 500 });
      }
    }

    // -------------------------------------------------------------
    // 11. POST /api/users/upgrade-request - Become Architect Application
    // -------------------------------------------------------------
    if (url.pathname === "/api/users/upgrade-request" && request.method === "POST") {
      const clientIp = request.headers.get("cf-connecting-ip") || "anonymous";
      const rate = checkRateLimit(clientIp, "upgrade", 5, 3600);
      if (!rate.allowed) {
        return Response.json(
          { error: `Too many upgrade requests submitted. Please wait ${rate.retryAfter} seconds.` },
          { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
        );
      }

      const user = await authenticateUser(request, env);
      if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      try {
        const body: any = await request.json().catch(() => ({}));
        const { practiceType = "freelance", studioName, coaNumber, phone, location, bio } = body;
        if (!coaNumber || !studioName) {
          return Response.json({ error: "CoA number and Studio name are required." }, { status: 400 });
        }
        const cleanCoa = coaNumber.trim().toUpperCase();
        const reviewNote = `Application for ${practiceType}. CoA: ${cleanCoa}. Studio: ${studioName}. Awaiting Admin verification.`;
        await env.DB.prepare(
          `UPDATE users SET sub_role = 'architect', status = 'pending_verification', coa_number = ?, studio_name = ?, phone = COALESCE(?, phone), location = COALESCE(?, location), bio = COALESCE(?, bio), review_notes = ?, updated_at = datetime('now') WHERE id = ?`
        ).bind(cleanCoa, studioName.trim(), phone || null, location || null, bio || null, reviewNote, user.id).run();

        try {
          await env.DB.prepare(
            `INSERT INTO audit_logs (id, actor_id, actor_name, actor_email, actor_role, action, target_id, target_type, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(`aud-${Date.now()}`, user.id, user.name, user.email, "user", "APPLY_ARCHITECT_UPGRADE", user.id, "user", JSON.stringify({ practiceType, studioName, coaNumber: cleanCoa })).run();
        } catch (_) {}

        return Response.json({ success: true, message: "Application submitted successfully." }, { status: 200 });
      } catch (err: any) {
        return Response.json({ error: "Upgrade request failed: " + err.message }, { status: 500 });
      }
    }

    // -------------------------------------------------------------
    // 12. /api/users/:id - Get, Update (PATCH), Delete User Profile
    // -------------------------------------------------------------
    if (url.pathname.startsWith("/api/users/") && url.pathname !== "/api/users/upgrade-request") {
      const targetUserId = decodeURIComponent(url.pathname.replace("/api/users/", ""));

      // GET /api/users/:id
      if (request.method === "GET" || request.method === "HEAD") {
        try {
          const user = await env.DB.prepare("SELECT * FROM users WHERE id = ? LIMIT 1").bind(targetUserId).first<any>();
          if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
          }
          return Response.json({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role === "super_admin" ? "admin" : user.role,
              subRole: user.sub_role,
              status: user.status,
              coaNumber: user.coa_number,
              studioName: user.studio_name,
              phone: user.phone,
              location: user.location,
              avatar: user.avatar,
              bio: user.bio,
              reviewNotes: user.review_notes,
              createdAt: user.created_at,
              updatedAt: user.updated_at,
            }
          }, { status: 200 });
        } catch (err: any) {
          return Response.json({ error: "Failed to fetch user: " + err.message }, { status: 500 });
        }
      }

      // PATCH /api/users/:id
      if (request.method === "PATCH") {
        const user = await authenticateUser(request, env);
        if (!user) {
          return Response.json({ error: "Authentication required" }, { status: 401 });
        }
        const isAdmin = user.role === "admin";
        const isSelf = user.id === targetUserId;
        if (!isAdmin && !isSelf) {
          return Response.json({ error: "Forbidden: You are not authorized to edit another user's profile." }, { status: 403 });
        }

        try {
          const body: any = await request.json().catch(() => ({}));
          const updateClauses: string[] = [];
          const queryParams: any[] = [];

          if (typeof body.name === "string" && body.name.trim()) {
            updateClauses.push("name = ?");
            queryParams.push(body.name.trim().slice(0, 100));
          }

          const studioName = body.studio_name ?? body.studioName;
          if (typeof studioName === "string") {
            updateClauses.push("studio_name = ?");
            queryParams.push(studioName.trim().slice(0, 120));
          }

          const coaNumber = body.coa_number ?? body.coaNumber;
          if (typeof coaNumber === "string") {
            updateClauses.push("coa_number = ?");
            queryParams.push(coaNumber.trim().toUpperCase().slice(0, 50));
          }

          if (typeof body.phone === "string") {
            updateClauses.push("phone = ?");
            queryParams.push(body.phone.trim().slice(0, 30));
          }

          if (typeof body.location === "string") {
            updateClauses.push("location = ?");
            queryParams.push(body.location.trim().slice(0, 100));
          }

          const avatar = body.avatar ?? body.image;
          if (typeof avatar === "string") {
            updateClauses.push("avatar = ?");
            queryParams.push(avatar.trim());
          }

          if (typeof body.bio === "string") {
            updateClauses.push("bio = ?");
            queryParams.push(body.bio.trim().slice(0, 2000));
          }

          const subRole = body.sub_role ?? body.subRole;
          if (typeof subRole === "string" && ["homeowner", "architect", "contractor"].includes(subRole)) {
            updateClauses.push("sub_role = ?");
            queryParams.push(subRole);
          }

          const reviewNotes = body.review_notes ?? body.reviewNotes;
          if (typeof reviewNotes === "string") {
            updateClauses.push("review_notes = ?");
            queryParams.push(reviewNotes);
          }

          if (isAdmin) {
            if (body.status && ["active", "suspended", "pending_verification"].includes(body.status)) {
              updateClauses.push("status = ?");
              queryParams.push(body.status);
            }
            if (body.role && ["admin", "user"].includes(body.role)) {
              updateClauses.push("role = ?");
              queryParams.push(body.role);
            }
          }

          if (updateClauses.length > 0) {
            updateClauses.push("updated_at = datetime('now')");
            queryParams.push(targetUserId);

            await env.DB.prepare(
              `UPDATE users SET ${updateClauses.join(", ")} WHERE id = ?`
            ).bind(...queryParams).run();
          }

          // Fetch fresh user state
          const updated = await env.DB.prepare("SELECT * FROM users WHERE id = ? LIMIT 1").bind(targetUserId).first<any>();
          return Response.json({
            success: true,
            message: "Profile updated successfully.",
            user: updated ? {
              id: updated.id,
              name: updated.name,
              email: updated.email,
              role: updated.role === "super_admin" ? "admin" : updated.role,
              subRole: updated.sub_role,
              status: updated.status,
              coaNumber: updated.coa_number,
              studioName: updated.studio_name,
              phone: updated.phone,
              location: updated.location,
              avatar: updated.avatar,
              bio: updated.bio,
              reviewNotes: updated.review_notes,
              updatedAt: updated.updated_at,
            } : null,
          }, { status: 200 });
        } catch (err: any) {
          return Response.json({ error: "Failed to update profile: " + err.message }, { status: 500 });
        }
      }

      // DELETE /api/users/:id
      if (request.method === "DELETE") {
        const user = await authenticateUser(request, env);
        if (!user || user.role !== "admin") {
          return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }
        if (targetUserId === user.id || targetUserId === "usr-admin-01") {
          return Response.json({ error: "Cannot delete platform admin account" }, { status: 403 });
        }
        try {
          await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(targetUserId).run();
          return Response.json({ success: true, message: `User ${targetUserId} deleted` }, { status: 200 });
        } catch (err: any) {
          return Response.json({ error: "Failed to delete user: " + err.message }, { status: 500 });
        }
      }
    }

    // -------------------------------------------------------------
    // 13. GET & DELETE /api/projects/:id - Single Project Details
    // -------------------------------------------------------------
    if (url.pathname.startsWith("/api/projects/") && (request.method === "GET" || request.method === "HEAD")) {
      const projId = decodeURIComponent(url.pathname.replace("/api/projects/", ""));
      try {
        const project = await env.DB.prepare(
          "SELECT * FROM projects WHERE id = ? OR slug = ? LIMIT 1"
        ).bind(projId, projId).first<any>();
        if (!project) {
          return Response.json({ error: "Project not found" }, { status: 404 });
        }
        return Response.json({ project: formatProjectRow(project) }, { status: 200 });
      } catch (err: any) {
        return Response.json({ error: "Failed to fetch project: " + err.message }, { status: 500 });
      }
    }

    if (url.pathname.startsWith("/api/projects/") && request.method === "DELETE") {
      const user = await authenticateUser(request, env);
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      const projId = decodeURIComponent(url.pathname.replace("/api/projects/", ""));
      try {
        await env.DB.prepare("DELETE FROM projects WHERE id = ?").bind(projId).run();
        return Response.json({ success: true }, { status: 200 });
      } catch (err: any) {
        return Response.json({ error: "Failed to delete project: " + err.message }, { status: 500 });
      }
    }

    if (url.pathname.startsWith("/api/projects/") && request.method === "PUT") {
      const user = await authenticateUser(request, env);
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      const projId = decodeURIComponent(url.pathname.replace("/api/projects/", ""));
      try {
        const body: any = await request.json().catch(() => ({}));
        const existing = await env.DB.prepare("SELECT * FROM projects WHERE id = ?").bind(projId).first<any>();
        if (!existing) {
          return Response.json({ error: "Project not found" }, { status: 404 });
        }

        const centsNum = body.cents !== undefined ? Number(body.cents) : existing.cents;
        const priceFormatted = body.price !== undefined ? (String(body.price).startsWith("₹") ? String(body.price) : `₹${body.price}`) : existing.price;
        const priceNum = parseFloat(String(priceFormatted).replace(/[₹,]/g, "")) || existing.price_numeric;

        await env.DB.prepare(
          `UPDATE projects SET
            name = COALESCE(?, name),
            style = COALESCE(?, style),
            location = COALESCE(?, location),
            plot_size = ?,
            cents = ?,
            built_up_area = COALESCE(?, built_up_area),
            bedrooms = COALESCE(?, bedrooms),
            floors = COALESCE(?, floors),
            facing = COALESCE(?, facing),
            vastu_score = COALESCE(?, vastu_score),
            price = ?,
            price_numeric = ?,
            sheet_count = COALESCE(?, sheet_count),
            status = COALESCE(?, status),
            image = COALESCE(?, image),
            gallery = COALESCE(?, gallery),
            floor_plan_image = COALESCE(?, floor_plan_image),
            cad_file_url = ?,
            cad_file_name = ?,
            cad_file_size = ?,
            description = COALESCE(?, description),
            highlights = COALESCE(?, highlights),
            plot_width = COALESCE(?, plot_width),
            plot_length = COALESCE(?, plot_length),
            setbacks = COALESCE(?, setbacks),
            dwg_available = COALESCE(?, dwg_available),
            bim_available = COALESCE(?, bim_available),
            boq_available = COALESCE(?, boq_available),
            mep_available = COALESCE(?, mep_available),
            updated_at = datetime('now')
          WHERE id = ?`
        ).bind(
          body.name !== undefined ? body.name : null,
          body.style !== undefined ? body.style : null,
          body.location !== undefined ? body.location : null,
          `${centsNum} Cents`,
          centsNum,
          body.builtUpArea !== undefined ? body.builtUpArea : null,
          body.bedrooms !== undefined ? Number(body.bedrooms) : null,
          body.floors !== undefined ? Number(body.floors) : null,
          body.facing !== undefined ? body.facing : null,
          body.vastuScore !== undefined ? Number(body.vastuScore) : null,
          priceFormatted,
          priceNum,
          body.sheetCount !== undefined ? Number(body.sheetCount) : null,
          body.status !== undefined ? body.status : null,
          body.image !== undefined ? body.image : null,
          body.gallery !== undefined ? JSON.stringify(body.gallery) : null,
          body.floorPlanImage !== undefined ? body.floorPlanImage : null,
          body.cadFileUrl !== undefined ? body.cadFileUrl : existing.cad_file_url,
          body.cadFileName !== undefined ? body.cadFileName : existing.cad_file_name,
          body.cadFileSize !== undefined ? body.cadFileSize : existing.cad_file_size,
          body.description !== undefined ? body.description : null,
          body.highlights !== undefined ? JSON.stringify(body.highlights) : null,
          body.dimensions?.plotWidth !== undefined ? body.dimensions.plotWidth : null,
          body.dimensions?.plotLength !== undefined ? body.dimensions.plotLength : null,
          body.dimensions?.setbacks !== undefined ? body.dimensions.setbacks : null,
          body.dwgAvailable !== undefined ? (body.dwgAvailable ? 1 : 0) : null,
          body.bimAvailable !== undefined ? (body.bimAvailable ? 1 : 0) : null,
          body.boqAvailable !== undefined ? (body.boqAvailable ? 1 : 0) : null,
          body.mepAvailable !== undefined ? (body.mepAvailable ? 1 : 0) : null,
          projId
        ).run();

        return Response.json({ success: true, message: "Project updated successfully" }, { status: 200 });
      } catch (err: any) {
        return Response.json({ error: "Failed to update project: " + err.message }, { status: 500 });
      }
    }

    // -------------------------------------------------------------
    // 14. /api/upload - Cloudflare R2 Multi-part File Upload
    // -------------------------------------------------------------
    if (url.pathname === "/api/upload" && request.method === "POST") {
      // 1. Edge Rate Limiting: 30 uploads per 10 minutes per IP
      const clientIp = request.headers.get("cf-connecting-ip") || "anonymous";
      const rate = checkRateLimit(clientIp, "upload", 30, 600);
      if (!rate.allowed) {
        return Response.json(
          { error: `Upload rate limit exceeded. Please wait ${rate.retryAfter} seconds before uploading again.` },
          { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
        );
      }

      // 2. Authentication Requirement: Protect storage from anonymous abuse
      const user = await authenticateUser(request, env);
      if (!user) {
        return Response.json({ error: "Unauthorized: You must be signed in to upload files." }, { status: 401 });
      }

      try {
        const contentType = request.headers.get("content-type") || "";
        if (!contentType.includes("multipart/form-data")) {
          return Response.json({ error: "Content-Type must be multipart/form-data" }, { status: 400 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const rawCategory = (formData.get("category") as string) || "plans";
        const category = ["plans", "imagery", "cad", "avatars", "documents"].includes(rawCategory)
          ? rawCategory
          : "plans";

        if (!file || typeof file === "string") {
          return Response.json({ error: "No file provided." }, { status: 400 });
        }

        const originalName = file.name || "unnamed";
        const dotIdx = originalName.lastIndexOf(".");
        const extension = dotIdx !== -1 ? originalName.slice(dotIdx).toLowerCase() : "";

        // 3. File Extension Whitelist Enforcement
        if (!ALLOWED_UPLOAD_EXTENSIONS.has(extension)) {
          return Response.json({
            error: "Security rejection: Unauthorized file extension. Permitted types: CAD/BIM (.dwg, .dxf, .rvt, .skp, .bim), documents (.pdf), and web images (.jpg, .png, .webp, .avif)."
          }, { status: 400 });
        }

        // 4. File Size Caps by Category
        const isCad = [".dwg", ".dxf", ".zip", ".rar", ".7z", ".bim", ".rvt", ".skp", ".ifc"].includes(extension);
        const isPdf = extension === ".pdf";
        const maxSize = isCad ? 100 * 1024 * 1024 : isPdf ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          return Response.json({
            error: `File too large. Maximum size for this type is ${isCad ? "100MB" : isPdf ? "25MB" : "10MB"}`
          }, { status: 400 });
        }

        // 5. Filename Sanitization & Collision-Resistant Random Key
        const sanitizedBase = (dotIdx !== -1 ? originalName.slice(0, dotIdx) : originalName)
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, "-")
          .slice(0, 50);

        const randomSuffix = crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 8);
        const uniqueKey = `${category}/${Date.now()}-${randomSuffix}-${sanitizedBase}${extension}`;

        if (env.BUCKET) {
          await env.BUCKET.put(uniqueKey, file.stream(), {
            httpMetadata: {
              contentType: file.type || "application/octet-stream",
            },
            customMetadata: {
              originalName: originalName.slice(0, 100),
              uploadedBy: user.id || user.email || "unknown",
              uploadedAt: new Date().toISOString(),
            },
          });
        }

        const publicUrl = `/uploads/${uniqueKey}`;
        const formattedSize = file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

        return Response.json({
          success: true,
          url: publicUrl,
          fileName: originalName,
          originalName,
          formattedSize,
          fileSize: formattedSize,
          category,
        }, { status: 200 });
      } catch (err: any) {
        return Response.json({ error: "Upload failed: " + err.message }, { status: 500 });
      }
    }

    // -------------------------------------------------------------
    // 15. /api/inquiries - Client Inquiries (GET, POST)
    // -------------------------------------------------------------
    if (url.pathname === "/api/inquiries") {
      if (request.method === "GET" || request.method === "HEAD") {
        const user = await authenticateUser(request, env);
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
        try {
          let sql = "SELECT * FROM inquiries";
          const params: any[] = [];
          if (user.role !== "admin") {
            sql += " WHERE architect_id = ? OR email = ?";
            params.push(user.id, user.email);
          }
          sql += " ORDER BY created_at DESC";
          const stmt = params.length > 0 ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
          const { results } = await stmt.all();
          return Response.json({ inquiries: results || [] }, { status: 200 });
        } catch (err: any) {
          return Response.json({ inquiries: [], error: err.message }, { status: 200 });
        }
      }

      if (request.method === "POST") {
        const clientIp = request.headers.get("cf-connecting-ip") || "anonymous";
        const rate = checkRateLimit(clientIp, "inquiry", 15, 300);
        if (!rate.allowed) {
          return Response.json(
            { error: `Too many inquiries submitted. Please wait ${rate.retryAfter} seconds before trying again.` },
            { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
          );
        }

        try {
          const body: any = await request.json().catch(() => ({}));
          const { name, email, phone, location, message, projectId, architectId, metadata } = body;
          if (!name || !email) {
            return Response.json({ error: "Name and email are required" }, { status: 400 });
          }
          const inqId = `inq-${Date.now().toString(36)}`;
          await env.DB.prepare(
            `INSERT INTO inquiries (id, name, email, phone, location, message, project_id, architect_id, status, metadata, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, datetime('now'))`
          ).bind(
            inqId,
            name.trim().slice(0, 100),
            email.trim().toLowerCase(),
            phone ? String(phone).trim() : null,
            location ? String(location).trim() : null,
            message ? String(message).trim() : null,
            projectId || null,
            architectId || null,
            metadata ? JSON.stringify(metadata) : "{}"
          ).run();
          return Response.json({ success: true, id: inqId, message: "Inquiry sent successfully" }, { status: 201 });
        } catch (err: any) {
          return Response.json({ error: "Failed to create inquiry: " + err.message }, { status: 500 });
        }
      }
    }

    // -------------------------------------------------------------
    // 15b. /api/inquiries/:id - Manage Single Inquiry (PATCH, DELETE)
    // -------------------------------------------------------------
    if (url.pathname.startsWith("/api/inquiries/") && request.method === "PATCH") {
      const user = await authenticateUser(request, env);
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      const inqId = decodeURIComponent(url.pathname.replace("/api/inquiries/", ""));
      try {
        const body: any = await request.json().catch(() => ({}));
        const { status, reply_text, replyText } = body;
        const text = reply_text || replyText;
        let sql = "UPDATE inquiries SET status = COALESCE(?, status)";
        const params: any[] = [status || null];
        if (text !== undefined) {
          sql += ", reply_text = ?";
          params.push(text);
        }
        sql += ", updated_at = datetime('now') WHERE id = ?";
        params.push(inqId);
        await env.DB.prepare(sql).bind(...params).run();
        return Response.json({ success: true }, { status: 200 });
      } catch (err: any) {
        return Response.json({ error: "Failed to update inquiry: " + err.message }, { status: 500 });
      }
    }

    if (url.pathname.startsWith("/api/inquiries/") && request.method === "DELETE") {
      const user = await authenticateUser(request, env);
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      const inqId = decodeURIComponent(url.pathname.replace("/api/inquiries/", ""));
      try {
        await env.DB.prepare("DELETE FROM inquiries WHERE id = ?").bind(inqId).run();
        return Response.json({ success: true }, { status: 200 });
      } catch (err: any) {
        return Response.json({ error: "Failed to delete inquiry: " + err.message }, { status: 500 });
      }
    }

    // -------------------------------------------------------------
    // 16. /api/packages - Project Packages (GET, POST, PATCH, DELETE)
    // -------------------------------------------------------------
    if (url.pathname === "/api/packages" && (request.method === "GET" || request.method === "HEAD")) {
      try {
        const projectId = url.searchParams.get("projectId");
        let sql = "SELECT * FROM project_packages WHERE 1=1";
        const params: any[] = [];
        if (projectId) {
          sql += " AND project_id = ?";
          params.push(projectId);
        }
        sql += " ORDER BY price_paise ASC";
        const stmt = params.length > 0 ? env.DB.prepare(sql).bind(...params) : env.DB.prepare(sql);
        const { results } = await stmt.all();
        const packages = (results || []).map((pkg: any) => ({
          id: pkg.id,
          projectId: pkg.project_id,
          architectId: pkg.architect_id,
          name: pkg.name,
          description: pkg.description,
          pricePaise: pkg.price_paise,
          priceFormatted: `₹${(Number(pkg.price_paise) / 100).toLocaleString("en-IN")}`,
          currency: pkg.currency || "INR",
          deliverables: typeof pkg.deliverables === "string" ? JSON.parse(pkg.deliverables || "[]") : (pkg.deliverables || []),
          status: pkg.status,
          createdAt: pkg.created_at,
          updatedAt: pkg.updated_at,
        }));
        return Response.json({ packages }, { status: 200 });
      } catch (err: any) {
        return Response.json({ packages: [], error: err.message }, { status: 200 });
      }
    }

    if (url.pathname === "/api/packages" && request.method === "POST") {
      const user = await authenticateUser(request, env);
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      try {
        const body: any = await request.json().catch(() => ({}));
        const newId = `pkg-${Date.now().toString(36)}`;
        const pricePaise = Number(body.pricePaise) || (Number(body.priceRupees || 35000) * 100);
        await env.DB.prepare(
          `INSERT INTO project_packages (id, project_id, architect_id, name, description, price_paise, currency, deliverables, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, 'INR', ?, ?, datetime('now'), datetime('now'))`
        ).bind(
          newId,
          body.projectId || "proj-001",
          user.id,
          (body.name || "Standard Deliverable Tier").trim().slice(0, 100),
          body.description || "",
          pricePaise,
          JSON.stringify(Array.isArray(body.deliverables) ? body.deliverables : []),
          body.status || "published"
        ).run();
        return Response.json({ success: true, id: newId }, { status: 201 });
      } catch (err: any) {
        return Response.json({ error: "Failed to create package: " + err.message }, { status: 500 });
      }
    }

    if (url.pathname.startsWith("/api/packages/") && request.method === "PATCH") {
      const user = await authenticateUser(request, env);
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      const pkgId = decodeURIComponent(url.pathname.replace("/api/packages/", ""));
      try {
        const body: any = await request.json().catch(() => ({}));
        const pricePaise = body.pricePaise !== undefined ? Number(body.pricePaise) : (body.priceRupees !== undefined ? Number(body.priceRupees) * 100 : undefined);
        await env.DB.prepare(
          `UPDATE project_packages SET
            name = COALESCE(?, name),
            description = COALESCE(?, description),
            price_paise = COALESCE(?, price_paise),
            deliverables = COALESCE(?, deliverables),
            status = COALESCE(?, status),
            updated_at = datetime('now')
           WHERE id = ?`
        ).bind(
          body.name !== undefined ? body.name : null,
          body.description !== undefined ? body.description : null,
          pricePaise !== undefined ? pricePaise : null,
          body.deliverables !== undefined ? JSON.stringify(body.deliverables) : null,
          body.status !== undefined ? body.status : null,
          pkgId
        ).run();
        return Response.json({ success: true }, { status: 200 });
      } catch (err: any) {
        return Response.json({ error: "Failed to update package: " + err.message }, { status: 500 });
      }
    }

    if (url.pathname.startsWith("/api/packages/") && request.method === "DELETE") {
      const user = await authenticateUser(request, env);
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      const pkgId = decodeURIComponent(url.pathname.replace("/api/packages/", ""));
      try {
        await env.DB.prepare("DELETE FROM project_packages WHERE id = ?").bind(pkgId).run();
        return Response.json({ success: true }, { status: 200 });
      } catch (err: any) {
        return Response.json({ error: "Failed to delete package: " + err.message }, { status: 500 });
      }
    }

    // Default fallback to Static Assets
    return env.ASSETS.fetch(request);
}

// -------------------------------------------------------------
// SECURE WORKER ENTRYPOINT & RESPONSE GUARANTEE
// -------------------------------------------------------------
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const response = await handleRequest(request, env, ctx);
      return applySecurityHeaders(request, response);
    } catch (err: any) {
      console.error("Worker unhandled security boundary error:", err);
      const errResponse = Response.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
      return applySecurityHeaders(request, errResponse);
    }
  },
};

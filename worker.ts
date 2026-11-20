import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  JWT_SECRET?: string;
  NEXT_PUBLIC_APP_URL?: string;
}

const DEFAULT_JWT_SECRET = "s-arc-secure-production-jwt-key-2026-south-arch";

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

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

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
    if (url.pathname === "/api/auth/me" && request.method === "GET") {
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
    // 6. GET /api/projects - Projects Feed from D1
    // -------------------------------------------------------------
    if (url.pathname === "/api/projects" && request.method === "GET") {
      try {
        const { results } = await env.DB.prepare(
          "SELECT * FROM projects ORDER BY created_at DESC"
        ).all();
        return Response.json({ projects: results || [] }, { status: 200 });
      } catch (err: any) {
        return Response.json({ projects: [], error: err.message }, { status: 200 });
      }
    }

    // -------------------------------------------------------------
    // 7. GET /api/plots - Saved Plots from D1
    // -------------------------------------------------------------
    if (url.pathname === "/api/plots" && request.method === "GET") {
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
    if (url.pathname === "/api/architects" && request.method === "GET") {
      try {
        const { results } = await env.DB.prepare(
          "SELECT * FROM architects ORDER BY rating DESC"
        ).all();
        return Response.json({ architects: results || [] }, { status: 200 });
      } catch (err: any) {
        return Response.json({ architects: [], error: err.message }, { status: 200 });
      }
    }

    // Default fallback to Static Assets
    return env.ASSETS.fetch(request);
  },
};

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

    // -------------------------------------------------------------
    // 9. POST /api/auth/register - Email/Password Account Registration
    // -------------------------------------------------------------
    if (url.pathname === "/api/auth/register" && request.method === "POST") {
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
    if (url.pathname === "/api/users" && request.method === "GET") {
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
      if (request.method === "GET") {
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
    // 13. GET /api/projects/:id - Single Project Details
    // -------------------------------------------------------------
    if (url.pathname.startsWith("/api/projects/") && request.method === "GET") {
      const projId = decodeURIComponent(url.pathname.replace("/api/projects/", ""));
      try {
        const project = await env.DB.prepare(
          "SELECT * FROM projects WHERE id = ? OR slug = ? LIMIT 1"
        ).bind(projId, projId).first<any>();
        if (!project) {
          return Response.json({ error: "Project not found" }, { status: 404 });
        }
        return Response.json({ project }, { status: 200 });
      } catch (err: any) {
        return Response.json({ error: "Failed to fetch project: " + err.message }, { status: 500 });
      }
    }

    // -------------------------------------------------------------
    // 14. /api/inquiries - Client Inquiries (GET, POST)
    // -------------------------------------------------------------
    if (url.pathname === "/api/inquiries") {
      if (request.method === "GET") {
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

    // Default fallback to Static Assets
    return env.ASSETS.fetch(request);
  },
};

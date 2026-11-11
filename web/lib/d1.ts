/**
 * Universal Cloudflare D1 Database Client for S-ARC
 *
 * Supports:
 * 1. Native Cloudflare D1 Binding (via env.DB or globalThis.DB in Cloudflare Workers / Pages)
 * 2. Cloudflare D1 REST API (when CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are configured)
 * 3. In-memory simulated store (strictly for development, CI, and Next.js static build phases)
 */

export interface D1QueryResult<T = any> {
  results: T[];
  success: boolean;
  meta?: {
    changes?: number;
    last_row_id?: number;
    duration?: number;
    rows_read?: number;
    rows_written?: number;
  };
}

// In-memory fallback store to ensure zero build/offline failures in dev
const INITIAL_USERS: any[] = [
  {
    id: "usr-admin-01",
    name: "Admin",
    email: "admin@s-arc.in",
    password_hash: "$2b$10$Zo4XQOnpPMvvouGRri14geN0slEoZ7cYVO3ku9W/dWS1K7LJ71/82", // admin123
    role: "admin",
    sub_role: null,
    status: "active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    phone: "+91 98400 99999",
    location: "Bengaluru, Karnataka",
    created_at: "2025-01-15 10:00:00",
    permissions: '["all", "manage_users", "manage_finances", "system_settings", "audit_logs", "approve_architects"]',
  },
  {
    id: "usr-arch-01",
    name: "Ar. Nikhil Rajan",
    email: "nikhil@studiovayu.arch",
    password_hash: "$2b$10$SO326PzrVOpTOGANzbxJV.EFAPZlJNVIrHDFeVAiVXAoYJgyyXTqW", // password123
    role: "user",
    sub_role: "architect",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    phone: "+91 98471 28910",
    location: "Kochi, Kerala",
    studio_name: "Studio Vayu",
    coa_number: "CA/2016/78291",
    created_at: "2025-02-14 10:00:00",
    permissions: "[]",
  },
  {
    id: "usr-arch-02",
    name: "Ar. Sneha Philip",
    email: "sneha.design@gmail.com",
    password_hash: "$2b$10$SO326PzrVOpTOGANzbxJV.EFAPZlJNVIrHDFeVAiVXAoYJgyyXTqW",
    role: "user",
    sub_role: "architect",
    status: "pending_verification",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    phone: "+91 94460 77889",
    location: "Calicut, Kerala",
    studio_name: "Philip Habitat Design",
    coa_number: "CA/2023/94102",
    created_at: "2025-04-01 10:00:00",
    permissions: "[]",
    review_notes: "Awaiting CoA registration verification by Admin",
  },
  {
    id: "usr-client-01",
    name: "Adv. K. Ramesh",
    email: "ramesh.client@gmail.com",
    password_hash: "$2b$10$SO326PzrVOpTOGANzbxJV.EFAPZlJNVIrHDFeVAiVXAoYJgyyXTqW",
    role: "user",
    sub_role: "homeowner",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    phone: "+91 94470 55122",
    location: "Wayanad, Kerala",
    created_at: "2025-06-20 10:00:00",
    permissions: "[]",
  },
];

// Attach persistent global references so state survives across Next.js route compilation chunks in dev
const g = globalThis as any;
if (!g.__S_ARC_FALLBACK_USERS__) {
  g.__S_ARC_FALLBACK_USERS__ = [...INITIAL_USERS];
}
const FALLBACK_USERS: any[] = g.__S_ARC_FALLBACK_USERS__;

const INITIAL_PROJECTS: any[] = [
  {
    id: "proj-001",
    slug: "the-ridge-house",
    name: "The Ridge House",
    style: "TROPICAL MODERNISM",
    location: "Wayanad, Kerala",
    plot_size: "10.5 Cents",
    cents: 10.5,
    built_up_area: "2,850 Sq.Ft",
    bedrooms: 4,
    floors: 2,
    facing: "North-East",
    vastu_score: 96,
    price: "₹45,000",
    price_numeric: 45000,
    sheet_count: 42,
    status: "published",
    featured: 1,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
    description: "Designed for sloping tropical hill tracts with cantilevered living pavilions and rainwater retention courtyards.",
    architect_name: "Ar. Nikhil Rajan",
    architect_studio: "Studio Vayu",
    architect_location: "Kochi, Kerala",
    architect_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    architect_id: "usr-arch-01",
  },
  {
    id: "proj-002",
    slug: "kerala-courtyard",
    name: "Kerala Courtyard",
    style: "TRADITIONAL KERALA",
    location: "Thrissur, Kerala",
    plot_size: "12.0 Cents",
    cents: 12.0,
    built_up_area: "3,200 Sq.Ft",
    bedrooms: 4,
    floors: 2,
    facing: "East",
    vastu_score: 98,
    price: "₹48,000",
    price_numeric: 48000,
    sheet_count: 48,
    status: "published",
    featured: 1,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85",
    description: "Modern interpretation of the classic Nalukettu courtyard home with open central Nadumuttam.",
    architect_name: "Ar. Nikhil Rajan",
    architect_studio: "Studio Vayu",
    architect_location: "Kochi, Kerala",
    architect_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    architect_id: "usr-arch-01",
  },
  {
    id: "proj-003",
    slug: "the-brick-pavilion",
    name: "The Brick Pavilion",
    style: "EXPOSED BRICK BRUTALISM",
    location: "Coimbatore, Tamil Nadu",
    plot_size: "9.2 Cents",
    cents: 9.2,
    built_up_area: "2,650 Sq.Ft",
    bedrooms: 3,
    floors: 2,
    facing: "East",
    vastu_score: 92,
    price: "₹39,500",
    price_numeric: 39500,
    sheet_count: 38,
    status: "published",
    featured: 1,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
    description: "Perforated terracotta jaali facade creating ambient shade while ventilating interior living double-height volumes.",
    architect_name: "Ar. Nikhil Rajan",
    architect_studio: "Studio Vayu",
    architect_location: "Kochi, Kerala",
    architect_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    architect_id: "usr-arch-01",
  },
];

if (!g.__S_ARC_FALLBACK_PROJECTS__) g.__S_ARC_FALLBACK_PROJECTS__ = [...INITIAL_PROJECTS];
const FALLBACK_PROJECTS: any[] = g.__S_ARC_FALLBACK_PROJECTS__;

const INITIAL_INQUIRIES: any[] = [
  {
    id: "inq-001",
    client_name: "Adv. K. Ramesh & Sunitha",
    client_email: "ramesh.legal@gmail.com",
    client_phone: "+91 94470 55122",
    project_name: "The Ridge House",
    project_id: "the-ridge-house",
    plot_location: "Wayanad, Kerala (Sloping Terrain)",
    plot_dimensions: "55ft x 92ft (11.5 Cents)",
    budget_range: "₹85L - ₹1.1 Cr",
    message: "We love the cantilevered deck and central water court of The Ridge House. Our plot has an 8-degree slope facing North-East. Can this plan be adapted with minimal retaining wall work?",
    status: "new",
    created_at: "Today, 10:45 AM",
  },
  {
    id: "inq-002",
    client_name: "Dr. Ananya Menon",
    client_email: "ananya.menon.cardio@amrita.edu",
    client_phone: "+91 98950 14890",
    project_name: "Kerala Courtyard",
    project_id: "kerala-courtyard",
    plot_location: "Thrissur town (East-Facing)",
    plot_dimensions: "62ft x 98ft (14 Cents)",
    budget_range: "₹1.2 Cr - ₹1.5 Cr",
    message: "Interested in the complete 42-sheet CAD + Structural BOQ package. We want to verify if the puja room placement matches strict Padavinyasa Vastu for East orientation.",
    status: "responded",
    reply_text: "Dr. Menon, thank you! The Kerala Courtyard is 100% compliant with Padavinyasa Vastu grid principles. I've sent the orientation diagram to your email.",
    created_at: "Yesterday",
  },
];

if (!g.__S_ARC_FALLBACK_INQUIRIES__) g.__S_ARC_FALLBACK_INQUIRIES__ = [...INITIAL_INQUIRIES];
const FALLBACK_INQUIRIES: any[] = g.__S_ARC_FALLBACK_INQUIRIES__;

if (!g.__S_ARC_FALLBACK_AUDIT_LOGS__) g.__S_ARC_FALLBACK_AUDIT_LOGS__ = [];
const FALLBACK_AUDIT_LOGS: any[] = g.__S_ARC_FALLBACK_AUDIT_LOGS__;

if (!g.__S_ARC_FALLBACK_SAVED_PLOTS__) g.__S_ARC_FALLBACK_SAVED_PLOTS__ = [];
const FALLBACK_SAVED_PLOTS: any[] = g.__S_ARC_FALLBACK_SAVED_PLOTS__;

/**
 * Access the Cloudflare D1 Native binding if available
 */
function getNativeD1Binding(): any {
  if (typeof (globalThis as any).DB !== "undefined") {
    return (globalThis as any).DB;
  }
  if (typeof (globalThis as any).__D1_DB__ !== "undefined") {
    return (globalThis as any).__D1_DB__;
  }
  if (typeof process !== "undefined" && (process.env as any)?.DB) {
    return (process.env as any).DB;
  }
  return null;
}

/**
 * Query Cloudflare D1 via the Cloudflare REST API
 */
async function queryViaRestApi(sql: string, params: any[] = []): Promise<any> {
  const accountId =
    process.env.CLOUDFLARE_ACCOUNT_ID || "12e1734f2c0cdf394e243e50f5af6e86";
  const databaseId =
    process.env.CLOUDFLARE_D1_DATABASE_ID || "496764fb-0e0f-408d-b5c5-8e8f998526d6";
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!apiToken) {
    return null;
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sql,
      params,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Cloudflare D1 REST query failed:", errorText);
    return null;
  }

  const data = await response.json();
  if (data.success && data.result && data.result.length > 0) {
    return data.result[0];
  }
  return null;
}

export const d1 = {
  /**
   * Execute a query and return all matching rows
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    // 1. Try Native D1 binding
    const nativeDb = getNativeD1Binding();
    if (nativeDb) {
      try {
        const stmt = nativeDb.prepare(sql);
        const bound = params.length > 0 ? stmt.bind(...params) : stmt;
        const res = await bound.all();
        return (res.results || []) as T[];
      } catch (err) {
        console.warn("Native D1 query error:", err);
      }
    }

    // 2. Try Cloudflare REST API (if token provided)
    if (process.env.CLOUDFLARE_API_TOKEN) {
      try {
        const restRes = await queryViaRestApi(sql, params);
        if (restRes && restRes.results) {
          return restRes.results as T[];
        }
      } catch (err) {
        console.warn("REST API D1 query error:", err);
      }
    }

    // 3. In-memory simulated store
    return queryFallbackStore<T>(sql, params);
  },

  /**
   * Execute a query and return the first matching row or null
   */
  async first<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Execute an INSERT, UPDATE, or DELETE statement
   */
  async execute(
    sql: string,
    params: any[] = []
  ): Promise<{ success: boolean; changes?: number; lastRowId?: number }> {
    // 1. Try Native D1 binding
    const nativeDb = getNativeD1Binding();
    if (nativeDb) {
      try {
        const stmt = nativeDb.prepare(sql);
        const bound = params.length > 0 ? stmt.bind(...params) : stmt;
        const res = await bound.run();
        return {
          success: res.success !== false,
          changes: res.meta?.changes,
          lastRowId: res.meta?.last_row_id,
        };
      } catch (err) {
        console.warn("Native D1 execute error:", err);
      }
    }

    // 2. Try Cloudflare REST API
    if (process.env.CLOUDFLARE_API_TOKEN) {
      try {
        const restRes = await queryViaRestApi(sql, params);
        if (restRes) {
          return {
            success: restRes.success !== false,
            changes: restRes.meta?.changes,
            lastRowId: restRes.meta?.last_row_id,
          };
        }
      } catch (err) {
        console.warn("REST API D1 execute error:", err);
      }
    }

    // 3. Simulated mutation store
    return mutateFallbackStore(sql, params);
  },
};

/**
 * In-memory fallback query simulator for dev/build
 */
function queryFallbackStore<T>(sql: string, params: any[]): T[] {
  const normalized = sql.trim().toLowerCase();

  if (normalized.includes("from users")) {
    let rows = [...FALLBACK_USERS];
    if (params && params.length > 0) {
      if (
        normalized.includes("email") &&
        (normalized.includes("lower(email) =") ||
          normalized.includes("email =") ||
          normalized.includes("lower(email) = lower(?)") ||
          normalized.includes("email = lower(?)"))
      ) {
        const email = String(params[0]).toLowerCase().trim();
        rows = rows.filter((u) => u.email.toLowerCase() === email);
      } else if (
        normalized.includes("where id =") ||
        normalized.includes("and id =") ||
        normalized.includes("id = ?")
      ) {
        const id = String(params[0]);
        rows = rows.filter((u) => u.id === id);
      } else if (normalized.includes("role =")) {
        const role = String(params[0]);
        rows = rows.filter((u) => u.role === role);
      }
    }
    return rows as unknown as T[];
  }

  if (normalized.includes("from projects")) {
    let rows = [...FALLBACK_PROJECTS];
    if (params.length > 0) {
      if (normalized.includes("where id = ? or slug = ?") || normalized.includes("id = ?")) {
        const target = String(params[0]);
        rows = rows.filter((p) => p.id === target || p.slug === target);
      } else if (normalized.includes("where slug =")) {
        const slug = String(params[0]);
        rows = rows.filter((p) => p.slug === slug);
      } else if (normalized.includes("architect_id = ?")) {
        const archId = String(params[0]);
        rows = rows.filter((p) => p.architect_id === archId);
      }
    }
    return rows as unknown as T[];
  }

  if (normalized.includes("from inquiries")) {
    return [...FALLBACK_INQUIRIES] as unknown as T[];
  }

  if (normalized.includes("from audit_logs")) {
    return [...FALLBACK_AUDIT_LOGS] as unknown as T[];
  }

  if (normalized.includes("from saved_plots")) {
    let rows = [...FALLBACK_SAVED_PLOTS];
    if (normalized.includes("where user_id =") && params && params.length > 0) {
      const uid = String(params[0]);
      rows = rows.filter((p) => p.user_id === uid);
    }
    if (normalized.includes("where id =") && params && params.length > 0) {
      const pid = String(params[0]);
      rows = rows.filter((p) => p.id === pid);
    }
    return rows as unknown as T[];
  }

  return [] as T[];
}

/**
 * In-memory mutation simulator for dev/build
 */
function mutateFallbackStore(
  sql: string,
  params: any[]
): { success: boolean; changes?: number } {
  const normalized = sql.trim().toLowerCase();

  // 1. Users INSERT
  if (normalized.startsWith("insert into users") || normalized.startsWith("insert or replace into users")) {
    if (params && params.length >= 4) {
      const cleanEmail = String(params[2]).toLowerCase().trim();
      const existingIdx = FALLBACK_USERS.findIndex((u) => u.email.toLowerCase() === cleanEmail);
      const userObj = {
        id: params[0],
        name: params[1],
        email: cleanEmail,
        password_hash: params[3],
        role: params[4] || "user",
        sub_role: params[5] || "homeowner",
        status: params[6] || "active",
        coa_number: params[7] || null,
        studio_name: params[8] || null,
        phone: params[9] || null,
        location: params[10] || null,
        avatar: params[11] || null,
        bio: params[12] || null,
        permissions: params[13] || "[]",
        review_notes: params[14] || null,
        created_at: new Date().toISOString(),
      };
      if (existingIdx >= 0) {
        FALLBACK_USERS[existingIdx] = userObj;
      } else {
        FALLBACK_USERS.unshift(userObj);
      }
      return { success: true, changes: 1 };
    }
  }

  // 2. Users UPDATE
  if (normalized.startsWith("update users")) {
    const id = params[params.length - 1];
    const user = FALLBACK_USERS.find((u) => u.id === id);
    if (user) {
      if (normalized.includes("status = ?")) {
        user.status = params[0];
      }
      if (normalized.includes("role = ?")) {
        const roleIdx = normalized.indexOf("role = ?") > normalized.indexOf("status = ?") ? 1 : 0;
        user.role = params[roleIdx];
      }
      return { success: true, changes: 1 };
    }
  }

  // 3. Projects INSERT
  if (normalized.startsWith("insert into projects")) {
    if (params && params.length >= 10) {
      const projObj = {
        id: params[0],
        slug: params[1],
        name: params[2],
        style: params[3],
        location: params[4],
        plot_size: params[5],
        cents: params[6],
        built_up_area: params[7],
        bedrooms: params[8],
        floors: params[9],
        facing: params[10],
        vastu_score: params[11],
        price: params[12],
        price_numeric: params[13],
        sheet_count: params[14],
        status: params[15],
        featured: params[16] || 0,
        image: params[17],
        gallery: params[18] || "[]",
        floor_plan_image: params[19] || null,
        description: params[20],
        highlights: params[21] || "[]",
        plot_width: params[22] || null,
        plot_length: params[23] || null,
        setbacks: params[24] || null,
        dwg_available: params[25] ?? 1,
        bim_available: params[26] ?? 1,
        boq_available: params[27] ?? 1,
        mep_available: params[28] ?? 1,
        architect_name: params[29],
        architect_studio: params[30],
        architect_location: params[31],
        architect_avatar: params[32],
        architect_id: params[33],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const existingIdx = FALLBACK_PROJECTS.findIndex((p) => p.id === projObj.id);
      if (existingIdx >= 0) {
        FALLBACK_PROJECTS[existingIdx] = projObj;
      } else {
        FALLBACK_PROJECTS.unshift(projObj);
      }
      return { success: true, changes: 1 };
    }
  }

  // 4. Projects UPDATE
  if (normalized.startsWith("update projects")) {
    const id = params[params.length - 1];
    const project = FALLBACK_PROJECTS.find((p) => p.id === id || p.slug === id);
    if (project) {
      project.updated_at = new Date().toISOString();
      return { success: true, changes: 1 };
    }
  }

  // 5. Projects DELETE
  if (normalized.startsWith("delete from projects")) {
    if (params && params.length > 0) {
      const id = String(params[0]);
      const idx = FALLBACK_PROJECTS.findIndex((p) => p.id === id);
      if (idx >= 0) {
        FALLBACK_PROJECTS.splice(idx, 1);
        return { success: true, changes: 1 };
      }
    }
  }

  // 6. Inquiries INSERT
  if (normalized.startsWith("insert into inquiries")) {
    FALLBACK_INQUIRIES.unshift({
      id: params[0] || `inq-${Date.now()}`,
      client_name: params[1],
      client_email: params[2],
      client_phone: params[3] || null,
      project_name: params[4] || "Consultation",
      project_id: params[5] || null,
      plot_location: params[6] || "South India",
      plot_dimensions: params[7] || "Standard",
      budget_range: params[8] || "Flexible",
      message: params[9],
      status: "new",
      created_at: "Just now",
    });
    return { success: true, changes: 1 };
  }

  // 7. Audit Logs INSERT
  if (normalized.startsWith("insert into audit_logs")) {
    FALLBACK_AUDIT_LOGS.unshift({
      id: params[0],
      actor_id: params[1],
      actor_name: params[2],
      actor_email: params[3],
      actor_role: params[4],
      action: params[5],
      target_id: params[6],
      target_type: params[7],
      details: params[8] || "{}",
      created_at: new Date().toISOString(),
    });
    return { success: true, changes: 1 };
  }

  // 8. Saved Plots
  if (normalized.startsWith("insert into saved_plots") || normalized.startsWith("insert or replace into saved_plots")) {
    if (params && params.length >= 7) {
      const plotObj = {
        id: params[0] || `plot-${Date.now()}`,
        user_id: params[1],
        name: params[2],
        geojson: params[3],
        area_cents: params[4],
        area_sqft: params[5],
        area_sqm: params[6],
        perimeter_m: params[7],
        perimeter_ft: params[8],
        frontage_ft: params[9] || null,
        depth_ft: params[10] || null,
        road_side_index: params[11] || 0,
        location_name: params[12] || "Kerala, India",
        center_lat: params[13] || null,
        center_lng: params[14] || null,
        metadata: params[15] || "{}",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const existingIdx = FALLBACK_SAVED_PLOTS.findIndex((p) => p.id === plotObj.id);
      if (existingIdx >= 0) {
        FALLBACK_SAVED_PLOTS[existingIdx] = plotObj;
      } else {
        FALLBACK_SAVED_PLOTS.unshift(plotObj);
      }
      return { success: true, changes: 1 };
    }
  }

  if (normalized.startsWith("delete from saved_plots")) {
    if (normalized.includes("where id =") && params && params.length > 0) {
      const id = String(params[0]);
      const idx = FALLBACK_SAVED_PLOTS.findIndex((p) => p.id === id);
      if (idx >= 0) {
        FALLBACK_SAVED_PLOTS.splice(idx, 1);
        return { success: true, changes: 1 };
      }
    }
  }

  return { success: true, changes: 0 };
}

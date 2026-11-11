# S-ARC Database Architecture & Cloudflare D1 Specification

## 1. Overview & Single Source of Truth

Cloudflare D1 is the primary relational database powering the S-ARC platform. D1 is a serverless, distributed SQLite database running directly at Cloudflare Edge locations.

> [!NOTE]
> **Prisma Deprecation Notice**: Legacy Prisma configuration (`web/prisma/schema.prisma` and `web/lib/prisma.ts`) is deprecated. All active API routes and services query Cloudflare D1 directly via `web/lib/d1.ts` to ensure edge compatibility and zero cold-start latency.

---

## 2. Table Schema Definitions

### Table: `users`
Stores user identities, hashed credentials, role assignments, and Council of Architecture (CoA) metadata.

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
  sub_role TEXT DEFAULT 'homeowner' CHECK(sub_role IN ('homeowner', 'architect', 'contractor')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'pending_verification')),
  coa_number TEXT,
  studio_name TEXT,
  phone TEXT,
  location TEXT,
  avatar TEXT,
  bio TEXT,
  permissions TEXT DEFAULT '[]',
  review_notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
```

### Table: `projects`
Stores architectural blueprint plans, technical dimensions, KMBR setbacks, pricing, and 42-sheet package availability.

```sql
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  style TEXT NOT NULL,
  location TEXT NOT NULL,
  plot_size TEXT NOT NULL,
  cents REAL NOT NULL DEFAULT 10.0,
  built_up_area TEXT NOT NULL,
  bedrooms INTEGER DEFAULT 3,
  floors INTEGER DEFAULT 2,
  facing TEXT DEFAULT 'East',
  vastu_score INTEGER DEFAULT 95,
  price TEXT NOT NULL,
  price_numeric REAL DEFAULT 0,
  sheet_count INTEGER DEFAULT 42,
  status TEXT DEFAULT 'published' CHECK(status IN ('published', 'draft', 'archived')),
  featured INTEGER DEFAULT 0,
  image TEXT NOT NULL,
  gallery TEXT DEFAULT '[]',
  floor_plan_image TEXT,
  description TEXT NOT NULL,
  highlights TEXT DEFAULT '[]',
  plot_width TEXT,
  plot_length TEXT,
  setbacks TEXT,
  dwg_available INTEGER DEFAULT 1,
  bim_available INTEGER DEFAULT 1,
  boq_available INTEGER DEFAULT 1,
  mep_available INTEGER DEFAULT 1,
  views INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  architect_name TEXT,
  architect_studio TEXT,
  architect_location TEXT,
  architect_avatar TEXT,
  architect_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_style ON projects(style);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_cents ON projects(cents);
```

### Table: `inquiries`
Client consultations connecting homeowners and architectural studios.

```sql
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  project_name TEXT,
  project_id TEXT,
  plot_location TEXT,
  plot_dimensions TEXT,
  budget_range TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK(status IN ('new', 'in_review', 'responded', 'completed')),
  reply_text TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_client_email ON inquiries(client_email);
```

### Table: `saved_plots`
Stores measured geospatial land boundaries, computed areas, and KMBR setbacks.

```sql
CREATE TABLE IF NOT EXISTS saved_plots (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  geojson TEXT NOT NULL,
  area_cents REAL NOT NULL,
  area_sqft REAL NOT NULL,
  area_sqm REAL NOT NULL,
  perimeter_m REAL NOT NULL,
  perimeter_ft REAL NOT NULL,
  frontage_ft REAL,
  depth_ft REAL,
  road_side_index INTEGER DEFAULT 0,
  location_name TEXT DEFAULT 'Kerala, India',
  center_lat REAL,
  center_lng REAL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_saved_plots_user_id ON saved_plots(user_id);
```

### Table: `audit_logs`
Immutable audit ledger for security compliance and tracking all administrative actions.

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  actor_name TEXT,
  actor_email TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  target_id TEXT,
  target_type TEXT,
  details TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
```

---

## 3. Applying Database Migrations

Run migrations using Wrangler against your Cloudflare D1 instance:

```bash
# Execute initial schema
npx wrangler d1 execute s-arc-db --file=./migrations/0001_initial_schema.sql

# Seed initial verified accounts and catalogues
npx wrangler d1 execute s-arc-db --file=./migrations/0002_seed.sql

# Execute saved plots table migration
npx wrangler d1 execute s-arc-db --file=./migrations/0003_saved_plots.sql
```

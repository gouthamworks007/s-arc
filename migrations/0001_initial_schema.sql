-- S-ARC Cloudflare D1 Database Schema
-- Distributed Edge Database for Southern Architectural Marketplace & 3-Tier RBAC

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('super_admin', 'admin', 'user')),
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

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  actor_name TEXT,
  actor_email TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  target_id TEXT,
  target_type TEXT,
  details TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);


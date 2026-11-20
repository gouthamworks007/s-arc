-- S-ARC Cloudflare D1 Database Migration 0005
-- Phase 2A: Fixed-Price Architectural Package System

CREATE TABLE IF NOT EXISTS project_packages (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  architect_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_paise INTEGER NOT NULL CHECK(price_paise > 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  deliverables TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (architect_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_packages_project_id ON project_packages(project_id);
CREATE INDEX IF NOT EXISTS idx_packages_architect_id ON project_packages(architect_id);
CREATE INDEX IF NOT EXISTS idx_packages_status ON project_packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_project_status ON project_packages(project_id, status);

-- Seed Baseline Architectural Packages for Featured Projects

-- 1. The Ridge House (proj-001 / Ar. Nikhil Rajan / usr-arch-01)
INSERT OR IGNORE INTO project_packages (
  id, project_id, architect_id, name, description, price_paise, currency, deliverables, status
) VALUES (
  'pkg-ridge-01',
  'proj-001',
  'usr-arch-01',
  'Essential Permit Set',
  'Sanction-ready 2D drawings formatted specifically for KMBR local municipality clearance and setting out.',
  3500000,
  'INR',
  '["Ground Floor Setting Out Plan (1:50)", "First Floor Dimensioned Layout", "Front & Rear Elevation Schematics", "Building Longitudinal Cross-Section", "KMBR Municipal Sanction Drawing Sheet"]',
  'published'
);

INSERT OR IGNORE INTO project_packages (
  id, project_id, architect_id, name, description, price_paise, currency, deliverables, status
) VALUES (
  'pkg-ridge-02',
  'proj-001',
  'usr-arch-01',
  'Executive Builder Package',
  'Comprehensive architectural and structural blueprint package for turnkey contractor execution.',
  6500000,
  'INR',
  '["Complete 2D Architectural Working Drawings", "Detailed Foundation & Column Layouts", "RCC Slab & Beam Rebar Schedules", "Electrical Conduit & Distribution Routing", "Plumbing, Waste Water & Rainwater Schematics", "Window & Door Joinery Schedule"]',
  'published'
);

INSERT OR IGNORE INTO project_packages (
  id, project_id, architect_id, name, description, price_paise, currency, deliverables, status
) VALUES (
  'pkg-ridge-03',
  'proj-001',
  'usr-arch-01',
  'Complete Master BIM & BOQ Package',
  'Turnkey architectural master set with parametric 3D model, material quantities, and full technical specifications.',
  9500000,
  'INR',
  '["Complete 42-Sheet Architectural & Structural Set", "Parametric 3D BIM Model (Revit / SketchUp)", "Detailed Material & Quantity Takeoff (BOQ)", "MEP Electrical, Sanitary & Solar Conduit Schematics", "High-Resolution 4K Photorealistic Renders", "Foundation Cross-Ventilation Analysis"]',
  'published'
);

-- Draft package for testing draft access restrictions
INSERT OR IGNORE INTO project_packages (
  id, project_id, architect_id, name, description, price_paise, currency, deliverables, status
) VALUES (
  'pkg-ridge-draft',
  'proj-001',
  'usr-arch-01',
  'Custom Interior Detail Addon (Draft)',
  'Internal drafting package including bespoke teak joinery and lighting fixtures.',
  2500000,
  'INR',
  '["Bespoke Teak Joinery Details", "Courtyard Water Feature Plumbing", "Mood Lighting Automation Schematic"]',
  'draft'
);


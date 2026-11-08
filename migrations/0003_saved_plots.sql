-- S-ARC Cloudflare D1 Migration 0003: Saved Plots Table for Plot Intelligence
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
  location_name TEXT,
  center_lat REAL,
  center_lng REAL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_saved_plots_user_id ON saved_plots(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_plots_created_at ON saved_plots(created_at);


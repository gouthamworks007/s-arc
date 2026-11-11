-- Migration 0004: Add CAD package and technical drawing deliverable columns to projects
ALTER TABLE projects ADD COLUMN cad_file_url TEXT;
ALTER TABLE projects ADD COLUMN cad_file_name TEXT;
ALTER TABLE projects ADD COLUMN cad_file_size TEXT;

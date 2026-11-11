-- S-ARC Cloudflare D1 Database Seed Data
-- RBAC Default Accounts, Initial Projects, Inquiries & Settings

-- 1. Users
INSERT OR REPLACE INTO users (
  id, name, email, password_hash, role, sub_role, status, coa_number, studio_name, phone, location, avatar, bio, permissions, review_notes
) VALUES
(
  'usr-admin-01',
  'Admin',
  'admin@s-arc.in',
  '$2b$10$Zo4XQOnpPMvvouGRri14geN0slEoZ7cYVO3ku9W/dWS1K7LJ71/82',
  'admin',
  NULL,
  'active',
  NULL,
  NULL,
  '+91 98400 99999',
  'Bengaluru, Karnataka',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'Platform Administrator & Council of Architecture Auditor',
  '["all", "manage_users", "manage_finances", "system_settings", "audit_logs", "approve_architects"]',
  NULL
),
(
  'usr-admin-02',
  'Sarah Thomas',
  'sarah.admin@s-arc.in',
  '$2b$10$SO326PzrVOpTOGANzbxJV.EFAPZlJNVIrHDFeVAiVXAoYJgyyXTqW',
  'admin',
  NULL,
  'active',
  NULL,
  NULL,
  '+91 94471 22334',
  'Kochi, Kerala',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  'Platform Operations Manager',
  '["verify_architects", "moderate_listings", "manage_users"]',
  NULL
),
(
  'usr-admin-pending-01',
  'Jayashankar Menon',
  'jayashankar.nominee@s-arc.in',
  '$2b$10$SO326PzrVOpTOGANzbxJV.EFAPZlJNVIrHDFeVAiVXAoYJgyyXTqW',
  'admin',
  NULL,
  'pending_verification',
  NULL,
  NULL,
  '+91 94475 88990',
  'Calicut, Kerala',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  'Regional Operations Candidate',
  '["moderate_listings", "manage_users"]',
  'Nominated candidate for operations. Awaiting Admin verification.'
),
(
  'usr-arch-01',
  'Ar. Nikhil Rajan',
  'nikhil@studiovayu.arch',
  '$2b$10$SO326PzrVOpTOGANzbxJV.EFAPZlJNVIrHDFeVAiVXAoYJgyyXTqW',
  'user',
  'architect',
  'active',
  'CA/2016/78291',
  'Studio Vayu',
  '+91 98471 28910',
  'Kochi, Kerala',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'Pioneering climate-responsive tropical minimalism across South India.',
  '[]',
  NULL
),
(
  'usr-arch-02',
  'Ar. Sneha Philip',
  'sneha.design@gmail.com',
  '$2b$10$SO326PzrVOpTOGANzbxJV.EFAPZlJNVIrHDFeVAiVXAoYJgyyXTqW',
  'user',
  'architect',
  'pending_verification',
  'CA/2023/94102',
  'Philip Habitat Design',
  '+91 94460 77889',
  'Calicut, Kerala',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  'Vernacular fusion and sustainable timber framing specialist.',
  '[]',
  'Awaiting CoA registration verification by Super Admin'
),
(
  'usr-client-01',
  'Adv. K. Ramesh',
  'ramesh.client@gmail.com',
  '$2b$10$SO326PzrVOpTOGANzbxJV.EFAPZlJNVIrHDFeVAiVXAoYJgyyXTqW',
  'user',
  'homeowner',
  'active',
  NULL,
  NULL,
  '+91 94470 55122',
  'Wayanad, Kerala',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  'Homeowner building high-range family estate in Wayanad',
  '[]',
  NULL
);

-- 2. Initial Architectural Projects
INSERT OR REPLACE INTO projects (
  id, slug, name, style, location, plot_size, cents, built_up_area, bedrooms, floors, facing, vastu_score,
  price, price_numeric, sheet_count, status, featured, image, description,
  architect_name, architect_studio, architect_location, architect_avatar, architect_id
) VALUES
(
  'proj-001',
  'the-ridge-house',
  'The Ridge House',
  'TROPICAL MODERNISM',
  'Wayanad, Kerala',
  '11.5 Cents',
  11.5,
  '3,200 Sq.Ft',
  3,
  2,
  'North-East',
  98,
  '₹48,000',
  48000,
  46,
  'published',
  1,
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
  'Cantilevered tropical pavilion suspended over tea plantation contours with passive cross-ventilation shafts.',
  'Ar. Nikhil Rajan',
  'Studio Vayu',
  'Kochi, Kerala',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'usr-arch-01'
),
(
  'proj-002',
  'kerala-courtyard',
  'Kerala Courtyard',
  'CONTEMPORARY VERNACULAR',
  'Thrissur, Kerala',
  '14 Cents',
  14.0,
  '3,850 Sq.Ft',
  4,
  2,
  'East',
  100,
  '₹62,000',
  62000,
  52,
  'published',
  1,
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
  'Modern Nadumuttam open atrium with copper-clad rainwater catchment and exposed laterite stone masonry.',
  'Ar. Sneha Philip',
  'Philip Habitat Design',
  'Calicut, Kerala',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  'usr-arch-02'
),
(
  'proj-003',
  'minimal-brick-pavilion',
  'The Brick Pavilion',
  'EXPOSED BRICK BRUTALISM',
  'Coimbatore, Tamil Nadu',
  '9.2 Cents',
  9.2,
  '2,650 Sq.Ft',
  3,
  2,
  'East',
  92,
  '₹39,500',
  39500,
  38,
  'published',
  1,
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85',
  'Perforated terracotta jaali facade creating ambient shade while ventilating interior living double-height volumes.',
  'Ar. Nikhil Rajan',
  'Studio Vayu',
  'Kochi, Kerala',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'usr-arch-01'
);

-- 3. Inquiries
INSERT OR REPLACE INTO inquiries (
  id, client_name, client_email, client_phone, project_name, project_id, plot_location, plot_dimensions, budget_range, message, status
) VALUES
(
  'inq-001',
  'Adv. K. Ramesh & Sunitha',
  'ramesh.legal@gmail.com',
  '+91 94470 55122',
  'The Ridge House',
  'the-ridge-house',
  'Wayanad, Kerala (Sloping Terrain)',
  '55ft x 92ft (11.5 Cents)',
  '₹85L - ₹1.1 Cr',
  'We love the cantilevered deck and central water court of The Ridge House. Our plot has an 8-degree slope facing North-East. Can this plan be adapted with minimal retaining wall work?',
  'new'
),
(
  'inq-002',
  'Dr. Ananya Menon',
  'ananya.menon.cardio@amrita.edu',
  '+91 98950 14890',
  'Kerala Courtyard',
  'kerala-courtyard',
  'Thrissur town (East-Facing)',
  '62ft x 98ft (14 Cents)',
  '₹1.2 Cr - ₹1.5 Cr',
  'Interested in the complete 42-sheet CAD + Structural BOQ package. We want to verify if the puja room placement matches strict Padavinyasa Vastu for East orientation.',
  'responded'
);

-- 4. Initial Audit Log
INSERT OR REPLACE INTO audit_logs (
  id, actor_id, actor_name, actor_email, actor_role, action, target_id, target_type, details
) VALUES
(
  'aud-001',
  'usr-admin-01',
  'Admin',
  'admin@s-arc.in',
  'admin',
  'SYSTEM_INITIALIZE',
  's-arc-db',
  'd1_database',
  '{"event": "Cloudflare D1 edge database initialized with single admin RBAC architecture"}'
);

-- 5. Platform Settings
INSERT OR REPLACE INTO platform_settings (key, value) VALUES
('platform_commission_percent', '10.0'),
('auto_approve_architects', 'false'),
('maintenance_mode', 'false'),
('min_listing_price', '25000.0'),
('payout_escrow_hold_days', '7');


# S-ARC Feature Classification & Status Matrix

**Classification Standard:**
- **Category A**: Fully implemented and tested (production-ready, verified with automated tests/database persistence)
- **Category B**: Implemented but requires verification (functional code exists but lacks automated tests or live environment validation)
- **Category C**: Partially implemented (core logic exists, but has missing endpoints, disconnects, or partial state sync)
- **Category D**: UI-only or mock implementation (`useState` mocks, `setTimeout` simulations, hardcoded demo personas)
- **Category E**: Not implemented (no frontend flow, no backend API, no database table)
- **Category F**: Blocked by external configuration (requires external API keys, merchant accounts, or third-party cloud infrastructure)

---

## Master Feature Classification Matrix

| Feature | Category | Primary Files Involved | Current Reality | Blockers / Next Step |
| :--- | :---: | :--- | :--- | :--- |
| **User Registration & Signup** | **A** | `web/app/signup/page.tsx`<br>`web/app/api/auth/register/route.ts` | Complete. BCrypt hashing, JWT generation, HTTP-only cookie, D1 user row created. | None. Verified in test suite. |
| **User Login & Session** | **A** | `web/app/login/page.tsx`<br>`web/app/api/auth/login/route.ts`<br>`web/lib/jwt.ts` | Complete. Authenticates email/password against D1, issues signed JWT session, sets secure cookie. | None. Verified in test suite. |
| **Role-Based Access Control (RBAC)** | **A** | `web/lib/auth-middleware.ts`<br>`web/app/api/auth/me/route.ts` | Complete. Enforces `admin`, `user` (homeowner, architect, contractor) and verification status (`active`, `pending_verification`, `suspended`). | None. Verified in test suite. |
| **Architect Verification Workflow** | **A** | `web/app/api/users/upgrade-request/route.ts`<br>`web/app/api/users/[id]/route.ts`<br>`web/components/dashboard/AdminView.tsx` | Complete. User requests upgrade with CoA number; Admin reviews and approves/rejects via PATCH in D1 with audit log. | None. Verified in test suite. |
| **Unverified Architect Guard** | **A** | `web/lib/auth-middleware.ts` (`requireVerifiedArchitect`) | Complete. Strictly denies pending or unverified architects from creating/publishing blueprints with HTTP 403. | None. Verified in test suite. |
| **Admin User Moderation & Deletion** | **A** | `web/app/api/users/[id]/route.ts`<br>`web/components/dashboard/AdminView.tsx` | Complete. Admin can delete malicious users with safety guard protecting primary admin (`usr-admin-01`). | None. Verified in test suite. |
| **Admin Audit Trail** | **A** | `web/app/api/users/[id]/route.ts`<br>`web/components/dashboard/AdminView.tsx`<br>D1 `audit_logs` table | Complete. Records immutable timestamps, actor ID, action name, target, and payload JSON for all administrative events. | None. |
| **Platform Governance Settings** | **A** | `web/app/api/settings/route.ts`<br>`web/components/dashboard/AdminView.tsx`<br>D1 `platform_settings` table | Complete. Commission rate, escrow hold days, and maintenance mode persisted in D1. | None. |
| **Blueprint Catalog & Filtering** | **A** | `web/app/designs/page.tsx`<br>`web/app/api/projects/route.ts`<br>`web/components/SmartSearch.tsx` | Complete. Multi-parameter filtering by style, cent range, facing, search term, and sorting backed by D1 SQL. | None. |
| **Project CRUD Persistence (Architect)** | **A** | `web/app/api/projects/route.ts`<br>`web/app/api/projects/[id]/route.ts`<br>`web/components/dashboard/ProjectEditModal.tsx` | Complete. Verified architects can create, update, publish/unpublish, and delete projects with ownership checks. | None. |
| **Plot Intelligence GIS Mapping** | **A** | `web/components/plot-intelligence/PlotMapWorkspace.tsx`<br>`web/lib/map-config.ts` | Complete. MapLibre GL 4 with licensed Esri World Imagery + hybrid reference labels. Top-down survey view. | None. |
| **Geospatial Dimension Calculations** | **A** | `web/components/plot-intelligence/PlotMapWorkspace.tsx`<br>`web/lib/plan-matching.ts` | Complete. Turf.js computes square meters, Kerala Cents, square feet, perimeter, frontage, and setbacks. | None. |
| **Saved Plot Survey Persistence** | **A** | `web/app/api/plots/route.ts`<br>`web/app/api/plots/[id]/route.ts`<br>`web/components/plot-intelligence/PlotMapWorkspace.tsx` | Complete. Saves GeoJSON, dimensional telemetry, center coordinates, and location to D1 `saved_plots`. Full CRUD. | None. Verified in test suite. |
| **Architectural Plan Matching Engine** | **A** | `web/lib/plan-matching.ts`<br>`web/app/plot-intelligence/page.tsx` | Complete. 100-point compatibility score checking plot ratio, minimum frontage/depth, KMBR setbacks, and facing. | None. |
| **Homeowner Consultation Requests** | **A** | `web/app/designs/[id]/ProjectDetailClient.tsx`<br>`web/components/plot-intelligence/ConsultArchitectModal.tsx`<br>`web/app/api/inquiries/route.ts` | Complete. Replaced local mock state. Requires auth (401 guard), validates fields, associates with project/architect, prevents duplicates, persists to D1. | None. Verified in test suite. |
| **Architect Inquiry Management** | **A** | `web/components/dashboard/InquiriesTab.tsx`<br>`web/app/api/inquiries/route.ts`<br>`web/app/api/inquiries/[id]/route.ts` | Complete. Removed demo localStorage dependency. Fetches live D1 inquiries, strictly isolates by studio, supports status transitions and responses via `PATCH /api/inquiries/[id]`. | None. Verified in test suite. |
| **Architect Directory Page** | **A** | `web/app/architects/page.tsx`<br>`web/app/api/architects/route.ts` | Complete. Connected to live D1 query. Only displays verified active architects (`status = 'active'`, `sub_role = 'architect'`). Pending/suspended architects are excluded. | None. Verified in test suite. |
| **Studio Profile Synchronization** | **A** | `web/components/dashboard/StudioProfileTab.tsx`<br>`web/app/api/users/[id]/route.ts` | Complete. Persists profile edits to Cloudflare D1 with ownership checks (403 for cross-user edits, role escalation protection). Updates retain after page reload. | None. Verified in test suite. |
| **Architect Registration (Seller Modal)** | **A** | `web/components/SellerModal.tsx`<br>`web/app/api/auth/register/route.ts`<br>`web/app/api/users/upgrade-request/route.ts` | Complete. Replaced setTimeout simulation. Registers new accounts with `sub_role: 'architect'` and `status: 'pending_verification'`, or submits upgrade requests if already logged in. | None. Verified in test suite. |
| **Floor Plan Blueprint Viewer** | **A** | `web/app/designs/[id]/ProjectDetailClient.tsx` | Complete. Removed generic hardcoded SVG mock. Renders real project `floorPlanImage` with aspect ratio, pan/zoom lightbox modal, and proper empty state when unavailable. | None. Verified in test suite. |
| **Design Detail Pages** | **B** | `web/app/designs/[id]/page.tsx`<br>`web/app/designs/[id]/ProjectDetailClient.tsx` | Functional rendering of specifications, gallery, narrative, and related designs. Dynamic project slugs verified. | Minor: verify related designs click-through. |
| **Wishlist & Design Shortlisting** | **C** | `web/lib/savedProjectsContext.tsx`<br>`web/components/CompareModal.tsx` | Shortlists up to 4 designs and provides side-by-side spec comparison, but stores **only in browser `localStorage`**. No database sync across devices. | Needs `wishlists` D1 table and sync API (Phase 2). |
| **Project Image Uploads** | **C** | `web/components/dashboard/ProjectEditModal.tsx` | Architects can specify project images by pasting external URLs or selecting presets, but cannot upload image files from their device. | Needs Cloudflare R2 / S3 file upload integration (Phase 4). |
| **Sample Drawing Download** | **D** | `web/app/designs/[id]/ProjectDetailClient.tsx` | "Download Sample Sheet" sets `sampleDownloaded = true` locally for 3 seconds. No file download takes place. | Needs real sample PDF download link. |
| **Purchase CAD Package Button** | **D** | `web/app/designs/[id]/ProjectDetailClient.tsx` | "Purchase CAD Package" button sets `checkoutInitiated = true` and renders `<div ...>Escrow Gateway Initialized</div>`. No order is created and no checkout occurs. | Needs real checkout flow (Phase 3). |
| **Purchased Blueprint Packages List** | **D** | `web/components/dashboard/HomeownerView.tsx` | Displays 1 hardcoded mock item ("The Ridge House" ₹85,000) exclusively for demo account; permanently empty for real accounts. | Needs `orders` table in D1 (Phase 3). |
| **Homeowner CAD Package Download** | **D** | `web/components/dashboard/HomeownerView.tsx` | "Download CAD Package" button sets a 3-second temporary state (`setDownloadSuccess(id)`). No file is downloaded. | Needs secure timed download endpoint (Phase 4). |
| **CAD Drawing Deliverables Upload** | **D** | `web/components/dashboard/ProjectEditModal.tsx` | "Included Technical Deliverables" consists solely of boolean checkboxes (`dwg_available`, `bim_available`, etc.). No file upload mechanism exists for CAD archives. | Needs Cloudflare R2 object storage integration (Phase 4). |
| **Payment Provider Integration** | **E / F**| `web/package.json`<br>`web/app/api/checkout/` | Completely absent. No Razorpay / Stripe SDK installed, no checkout endpoints, no payment verification, no webhook listener. | Blocked by external payment gateway keys (Phase 3). |
| **Order & Transaction Persistence** | **E** | `migrations/`<br>D1 Database | No `orders`, `purchases`, `licenses`, or `transactions` tables exist in D1. | Requires D1 schema migration (Phase 3). |
| **Architect Sales & Revenue Dashboard**| **E** | `web/components/dashboard/ArchitectView.tsx` | Completely absent. Architects have no interface to track sales, earnings, platform commission deductions, or payouts. | Requires `orders` D1 table and sales UI (Phase 3). |
| **Secure Timed File Delivery System** | **E / F**| `web/app/api/files/download/route.ts` | Completely absent. No presigned download links, no encrypted asset storage, no tokenized access for purchased blueprints. | Blocked by external Cloudflare R2 bucket setup (Phase 4). |
| **Duplicate Payment Prevention** | **E** | Server API / D1 | Completely absent. No idempotency keys or transaction integrity checks. | Implement in checkout API (Phase 3). |

---

## Classification Breakdown

```
Category A (Fully implemented & tested):      20 features (61%)  [+6 in Phase 1]
Category B (Implemented, needs verification):  1 feature  ( 3%)
Category C (Partially implemented):            2 features ( 6%)  [-3 in Phase 1]
Category D (UI-only or mock implementation):   5 features (15%)  [-3 in Phase 1]
Category E (Not implemented):                  5 features (15%)
Category F (Blocked by external config):       0 standalone (subsumed by E)
```

- **Functional Core (A + B)**: **64%** (Security, RBAC, Inquiries Loop, Studio Sync, Verified Directory, GIS Plot Intelligence, Project CRUD, Admin Approvals/Moderation, D1 Persistence).
- **Incomplete / Disconnected (C + D)**: **21%** (Wishlist sync, Image/CAD uploads, Sample sheet download, Purchase mockups).
- **Unimplemented Commercial Systems (E + F)**: **15%** (Payment gateway, Orders table, R2 file storage, Secure downloads, Sales dashboard).

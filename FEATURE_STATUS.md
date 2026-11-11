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
| **Design Detail Pages** | **B** | `web/app/designs/[id]/page.tsx`<br>`web/app/designs/[id]/ProjectDetailClient.tsx` | Functional rendering of specifications, gallery, narrative, and related designs. Requires verification on dynamic project slugs. | Minor: slug fallback test. |
| **Plot Intelligence Consultation Modal** | **B** | `web/components/plot-intelligence/ConsultArchitectModal.tsx`<br>`web/app/api/inquiries/route.ts` | Form submits real `POST /api/inquiries` with client info, measured plot telemetry, and project ID to D1. | Needs verification with non-standard characters. |
| **Architect Directory Page** | **C** | `web/app/architects/page.tsx`<br>`web/lib/data.ts` | UI displays verified architects and filters by Kerala hubs, but reads **only static hardcoded data** from `FEATURED_ARCHITECTS`. Real architects in D1 `users` do not appear. | Must connect to `GET /api/users?role=architect`. |
| **Wishlist & Design Shortlisting** | **C** | `web/lib/savedProjectsContext.tsx`<br>`web/components/CompareModal.tsx` | Shortlists up to 4 designs and provides side-by-side spec comparison, but stores **only in browser `localStorage`**. No database sync across devices. | Needs `wishlists` D1 table and sync API. |
| **Architect Studio Profile Management**| **C** | `web/components/dashboard/StudioProfileTab.tsx`<br>`web/lib/projectsContext.tsx` | Allows editing bio, CoA number, awards, and specialization, but updates **only in `localStorage`** (`sarc_studio_profile_v1`). Not synced to D1 `users` row. | Needs `PATCH /api/users/[id]` connection. |
| **Client Inquiry Management (Architect)** | **C** | `web/components/dashboard/InquiriesTab.tsx`<br>`web/lib/projectsContext.tsx`<br>`web/app/api/inquiries/route.ts` | Architect dashboard displays inquiries and has reply modal, but reads from **hardcoded demo state in localStorage**; does not fetch from D1 `inquiries` table or save replies to D1. | Needs D1 inquiry sync and reply endpoint. |
| **Project Image Uploads** | **C** | `web/components/dashboard/ProjectEditModal.tsx` | Architects can specify project images by pasting external URLs or selecting presets, but cannot upload image files from their device. | Needs Cloudflare R2 / S3 file upload integration. |
| **Floor Plan Blueprint Viewer** | **D** | `web/app/designs/[id]/ProjectDetailClient.tsx` | Renders a hardcoded static SVG schematic ("Living Room", "Dining", "Courtyard") for every design instead of displaying real project CAD/blueprint images. | Needs dynamic image rendering from `floor_plan_image`. |
| **Consultation Button on Design Details** | **D** | `web/app/designs/[id]/ProjectDetailClient.tsx` | "Request Architect Consultation" button only sets `inquirySent = true` with a static 4-hour response banner; does **not** open the consultation modal or call the API. | Connect button to `ConsultArchitectModal`. |
| **Sample Drawing Download** | **D** | `web/app/designs/[id]/ProjectDetailClient.tsx` | "Download Sample Sheet" sets `sampleDownloaded = true` locally for 3 seconds. No file download takes place. | Needs real sample PDF download link. |
| **Purchase CAD Package Button** | **D** | `web/app/designs/[id]/ProjectDetailClient.tsx` | "Purchase CAD Package" button sets `checkoutInitiated = true` and renders `<div ...>Escrow Gateway Initialized</div>`. No order is created and no checkout occurs. | Needs real checkout flow. |
| **Purchased Blueprint Packages List** | **D** | `web/components/dashboard/HomeownerView.tsx` | Displays 1 hardcoded mock item ("The Ridge House" ₹85,000) exclusively for the demo account `ramesh.client@gmail.com`; permanently empty for all real accounts. | Needs `orders` table in D1. |
| **Homeowner CAD Package Download** | **D** | `web/components/dashboard/HomeownerView.tsx` | "Download CAD Package" button sets a 3-second temporary state (`setDownloadSuccess(id)`). No file is downloaded. | Needs secure timed download endpoint. |
| **Architect Join Modal (Navbar)** | **D** | `web/components/SellerModal.tsx` | "Join as Architect" button in navbar opens modal with full Zod validation, but on submit executes `setTimeout(() => setSubmitted(true), 600)`. Does not register user. | Wire form to `POST /api/auth/register` with architect role. |
| **CAD Drawing Deliverables Upload** | **D** | `web/components/dashboard/ProjectEditModal.tsx` | "Included Technical Deliverables" consists solely of boolean checkboxes (`dwg_available`, `bim_available`, etc.). No file upload mechanism exists for CAD archives. | Needs Cloudflare R2 object storage integration. |
| **Payment Provider Integration** | **E / F**| `web/package.json`<br>`web/app/api/checkout/` | Completely absent. No Razorpay / Stripe SDK installed, no checkout endpoints, no payment verification, no webhook listener. | Blocked by external payment gateway keys. |
| **Order & Transaction Persistence** | **E** | `migrations/`<br>D1 Database | No `orders`, `purchases`, `licenses`, or `transactions` tables exist in D1. | Requires D1 schema migration. |
| **Architect Sales & Revenue Dashboard**| **E** | `web/components/dashboard/ArchitectView.tsx` | Completely absent. Architects have no interface to track sales, earnings, platform commission deductions, or payouts. | Requires `orders` D1 table and sales UI. |
| **Secure Timed File Delivery System** | **E / F**| `web/app/api/files/download/route.ts` | Completely absent. No presigned download links, no encrypted asset storage, no tokenized access for purchased blueprints. | Blocked by external Cloudflare R2 bucket setup. |
| **Duplicate Payment Prevention** | **E** | Server API / D1 | Completely absent. No idempotency keys or transaction integrity checks. | Implement in checkout API. |

---

## Classification Breakdown

```
Category A (Fully implemented & tested):      14 features (42%)
Category B (Implemented, needs verification):  2 features ( 6%)
Category C (Partially implemented):            5 features (15%)
Category D (UI-only or mock implementation):   8 features (24%)
Category E (Not implemented):                  4 features (12%)
Category F (Blocked by external config):       0 standalone (subsumed by E)
```

- **Functional Core (A + B)**: **48%** (Security, RBAC, GIS Plot Intelligence, Project CRUD, Admin Approvals/Moderation, D1 Persistence).
- **Incomplete / Disconnected (C + D)**: **39%** (Inquiries loop, Architect directory, Studio profile sync, Floor plan viewer, Design detail actions, Seller modal).
- **Unimplemented Commercial Systems (E + F)**: **13%** (Payment gateway, Orders table, R2 file storage, Secure downloads, Sales dashboard).

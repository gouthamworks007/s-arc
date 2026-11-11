# S-ARC Architectural Marketplace — Comprehensive Functional Audit

**Document Version:** 1.0.0  
**Audit Date:** November 11, 2026  
**Auditor:** Senior Full-Stack Engineer & Application Security Architect  
**Repository:** `S_ARC` (`s-arc-web` Next.js 14.2 / Cloudflare D1 / MapLibre GL)  
**Latest Reference Commits:** `df7d6dd` (Security), `1402339` (Verification), `34ac38b` (GIS Imagery), `0462fdc` (UI/UX Refinement), `0447d63` (Typography)

---

## Executive Summary

S-ARC (Southern Architecture) is an architectural commerce and GIS plot intelligence platform tailored to the South Indian market (specifically Kerala). The application features an elegant visual identity, robust GIS boundary surveying, secure JWT session encryption, and a Cloudflare D1 edge database.

However, a comprehensive functional audit of all user journeys reveals a **sharp dichotomy** between:
1. **Genuinely functional edge systems**: Authentication/RBAC, Cloudflare D1 project persistence, Admin moderation, and GIS Plot Intelligence survey calculations are fully functional and backed by SQL transactions.
2. **Mocked / Disconnected commerce subsystems**: Transaction processing, payment gateway integration, secure CAD asset storage/downloads, architect sales tracking, and homeowner purchase fulfillment exist almost entirely as frontend state simulations (`useState(false)`, `setTimeout`, or hardcoded demo persona objects).

This audit documents the exact architectural reality across all 5 core user journeys, identifies structural disconnects between client contexts and database tables, and provides an authoritative baseline before any further engineering work begins.

---

## 1. Homeowner Journey Audit

| Journey Touchpoint | Status | Architectural Reality & Data Flow |
| :--- | :---: | :--- |
| **Registration & Login** | **Fully Functional** | Users register via `/signup` and authenticate via `/login`. Handled by `POST /api/auth/register` and `POST /api/auth/login`. Passwords hashed with `bcryptjs` (salt 12). Sessions encrypted with HMAC-SHA256 JWT in HTTP-only `sarc_session` cookie and Bearer tokens. Persisted in Cloudflare D1 `users` table. |
| **Discover Architectural Designs** | **Fully Functional** | `/designs` and `/` catalog pages. Search queries, style filters, plot area (Cents) sliders, and facing orientation filters dynamically query `GET /api/projects`. Handled by `ProjectsContext` with fallback to enriched Kerala architectural catalog. |
| **Search & Filtering Engine** | **Fully Functional** | [SmartSearch.tsx](file:///c:/Users/HP/Downloads/S_ARC/web/components/SmartSearch.tsx) supports location quick-pick, plot size slider (4 to 20+ Cents with custom cent increments), shape geometry (rectangular, square, narrow, irregular), and facing direction. URL search params synchronize seamlessly with `/designs`. |
| **Design Detail Pages** | **Fully Functional** | Dynamic routes at `/designs/[id]`. Displays project hero gallery, key specifications (area, plot size, bedrooms, floors, setbacks, KMBR compliance, Vastu score), detailed architectural narrative, highlights, and similar project recommendations. |
| **Floor Plan & Drawing Previews** | **Partially Implemented (UI Mock)** | The "Floor Plan Blueprint" tab on [ProjectDetailClient.tsx](file:///c:/Users/HP/Downloads/S_ARC/web/app/designs/%5Bid%5D/ProjectDetailClient.tsx#L355-L385) toggles Ground/First/Roof views, but renders a **hardcoded static SVG schematic** (`LIVING ROOM`, `DINING`, `COURTYARD`) rather than reading the project's real `floor_plan_image` from D1. No interactive pan/zoom CAD viewer exists. |
| **Plot Compatibility & Recommendations** | **Fully Functional** | [plan-matching.ts](file:///c:/Users/HP/Downloads/S_ARC/web/lib/plan-matching.ts) implements a 100-point compatibility engine checking plot area ratio, minimum frontage, depth, setback clearance (KMBR standards), and orientation. Directly connects measured plots in Plot Intelligence to compatible designs. |
| **Architect Profiles & Directory** | **Partially Implemented** | `/architects` directory displays verified architect cards and filter by Kerala hubs (Kochi, Trivandrum, Calicut, Thrissur, Kottayam, Kannur). However, it reads exclusively from static `FEATURED_ARCHITECTS` in [data.ts](file:///c:/Users/HP/Downloads/S_ARC/web/lib/data.ts#L330). Newly verified architects in Cloudflare D1 `users` table do **not** dynamically appear here. |
| **Contact Architect & Inquiries** | **Partially Implemented** | **Plot Intelligence:** [ConsultArchitectModal.tsx](file:///c:/Users/HP/Downloads/S_ARC/web/components/plot-intelligence/ConsultArchitectModal.tsx) sends real `POST /api/inquiries` persisted in D1.<br>**Project Detail Page:** The button on [ProjectDetailClient.tsx](file:///c:/Users/HP/Downloads/S_ARC/web/app/designs/%5Bid%5D/ProjectDetailClient.tsx#L420) only sets local state `setInquirySent(true)` with a 4-hour mock response banner. It does **not** open the consultation modal or persist to D1. |
| **Wishlist & Saved Designs** | **Partially Implemented (Local-Only)** | [savedProjectsContext.tsx](file:///c:/Users/HP/Downloads/S_ARC/web/lib/savedProjectsContext.tsx) saves up to 4 shortlisted designs and powers the floating comparison bar and [CompareModal.tsx](file:///c:/Users/HP/Downloads/S_ARC/web/components/CompareModal.tsx). However, items are stored **only in browser `localStorage`**. No database table or API endpoint exists to synchronize wishlists across devices. |
| **Purchase Workflow** | **UI Mockup Only** | Clicking "Purchase CAD Package" on [ProjectDetailClient.tsx](file:///c:/Users/HP/Downloads/S_ARC/web/app/designs/%5Bid%5D/ProjectDetailClient.tsx#L311-L325) sets `checkoutInitiated = true` and renders `<div ...>Escrow Gateway Initialized</div>`. No order is created, no payment gateway is opened, and no API is called. |
| **Purchased Projects List** | **UI Mockup Only** | On [HomeownerView.tsx](file:///c:/Users/HP/Downloads/S_ARC/web/components/dashboard/HomeownerView.tsx#L107-L123), purchased packages are hardcoded exclusively for the demo account `ramesh.client@gmail.com` ("The Ridge House" ₹85,000). For any real registered user, the list is permanently empty. |
| **Secure CAD Downloads** | **UI Mockup Only** | Clicking "Download Sample Sheet" or "Download CAD Package" merely sets a 3-second boolean toast state (`setDownloadSuccess(id)`). No file download is initiated, and no object storage bucket (S3 / R2) exists to serve files. |

---

## 2. Architect Journey Audit

| Journey Touchpoint | Status | Architectural Reality & Data Flow |
| :--- | :---: | :--- |
| **Registration as Architect** | **Partially Implemented** | **Navbar Modal ([SellerModal.tsx](file:///c:/Users/HP/Downloads/S_ARC/web/components/SellerModal.tsx#L71-L76)):** Purely simulated via `setTimeout(() => setSubmitted(true), 600)`. Does not create an account or hit any API.<br>**Dashboard Upgrade:** Homeowner dashboard modal calls real `POST /api/users/upgrade-request`, setting `sub_role = 'architect'` and `status = 'pending_verification'` in D1 with audit logging. |
| **Professional Verification** | **Fully Functional** | Council of Architecture (CoA) number and studio name are recorded in D1. Administrators review, approve, or reject applications via `PATCH /api/users/[id]`. [auth-middleware.ts](file:///c:/Users/HP/Downloads/S_ARC/web/lib/auth-middleware.ts#L84-L131) (`requireVerifiedArchitect`) strictly prevents unverified or pending architects from publishing blueprints. |
| **Architect Dashboard** | **Fully Functional (Hybrid)** | [ArchitectView.tsx](file:///c:/Users/HP/Downloads/S_ARC/web/components/dashboard/ArchitectView.tsx) renders metrics (Total Views, Published Blueprints, Drafts, Inquiries), Project Grid/Table view, filter by status and facing direction, and action modals. |
| **Profile Management** | **Partially Implemented (Local-Only)** | [StudioProfileTab.tsx](file:///c:/Users/HP/Downloads/S_ARC/web/components/dashboard/StudioProfileTab.tsx) allows editing studio bio, CoA number, awards, and specialization. However, edits are saved **only to `localStorage`** (`sarc_studio_profile_v1`). They are not synced back to the Cloudflare D1 `users` table. |
| **Project Creation & Editing** | **Fully Functional** | [ProjectEditModal.tsx](file:///c:/Users/HP/Downloads/S_ARC/web/components/dashboard/ProjectEditModal.tsx) provides a 5-step workflow (Overview, Specs, Deliverables, Imagery, Preview). Calls `POST /api/projects` and `PUT /api/projects/[id]`. Validates input, calculates slug, price numbers, and persists all attributes into D1 `projects` table. |
| **Project Image Uploads** | **Partially Implemented (URL Only)** | There is no file upload component (`<input type="file" />`). Architects must either paste an external image URL (e.g. Unsplash) or pick from hardcoded preset architectural photographs. No cloud storage exists for uploaded files. |
| **Drawing / Package Uploads** | **UI Mockup Only** | "Included Technical Deliverables" in [ProjectEditModal.tsx](file:///c:/Users/HP/Downloads/S_ARC/web/components/dashboard/ProjectEditModal.tsx#L705-L765) consists only of boolean checkboxes (`dwg_available`, `bim_available`, `boq_available`, `mep_available`). There is no mechanism to upload `.dwg`, `.dxf`, `.rvt`, or `.pdf` drawing packages. |
| **Pricing Configuration** | **Fully Functional** | Architects can specify commercial blueprint pricing (e.g. ₹85,000) and sheet counts (e.g. 42 sheets). Stored as both formatted strings and `price_numeric` in D1 for sorting and calculation. |
| **Project Publishing** | **Fully Functional** | Architects can toggle projects between `published` and `draft`. When published, they immediately appear in `/designs` and `/api/projects`. Verified on server: non-verified architects are blocked with HTTP 403. |
| **Inquiry Management** | **Disconnected (Local-Only)** | [InquiriesTab.tsx](file:///c:/Users/HP/Downloads/S_ARC/web/components/dashboard/InquiriesTab.tsx) displays inquiries, filters by status, and provides a reply modal. **Critical Disconnect:** It reads hardcoded `DEFAULT_INQUIRIES` from `ProjectsContext` and persists replies to `localStorage`. It does **not** read from `GET /api/inquiries` or write replies to Cloudflare D1. |
| **Purchase & Sales History** | **Not Implemented** | There is no sales dashboard, payout ledger, or customer order view for architects. Completely absent from the architect workspace. |

---

## 3. Admin Journey Audit

| Journey Touchpoint | Status | Architectural Reality & Data Flow |
| :--- | :---: | :--- |
| **Admin Authentication & Authorization** | **Fully Functional** | Administrator credentials (`admin@s-arc.in`) verified with bcrypt. Server-side `requireAdmin` middleware enforces role `'admin'` on sensitive endpoints. Direct API access without valid admin session returns HTTP 401/403. |
| **Architect Verification & Licensing** | **Fully Functional** | "Approvals" tab in [AdminView.tsx](file:///c:/Users/HP/Downloads/S_ARC/web/components/dashboard/AdminView.tsx#L273-L384) queries `GET /api/users`. Admin can review CoA numbers, portfolio links, and studio details. Clicking "Approve License" or "Reject / Suspend" executes `PATCH /api/users/[id]` with immutable audit logging in D1. |
| **Project Moderation** | **Fully Functional** | "Moderation" tab queries `GET /api/projects?status=all`. Admin can toggle "Featured" status, change status between `published`, `draft`, and `archived`, or permanently delete blueprints via `DELETE /api/projects/[id]`. |
| **User Management** | **Fully Functional** | "Users" tab lists all registered accounts. Admin can delete malicious users or revoke roles via `DELETE /api/users/[id]`. Includes safety guard protecting primary platform administrator (`usr-admin-01`) from deletion. |
| **Reports & Platform Settings** | **Partially Implemented** | "Finances" tab allows configuring platform commission (default 10%), escrow holding period (default 7 days), and maintenance mode. Persisted in D1 `platform_settings` table via `PUT /api/settings`. However, there are no transaction reports, revenue charts, or dispute logs. |

---

## 4. Transaction System Audit

| Component | Status | Finding & Missing Architecture |
| :--- | :---: | :--- |
| **Payment Gateway Integration** | **Not Implemented** | No payment provider SDK (Razorpay, Stripe, Cashfree, or UPI) is installed in `web/package.json`. No credentials or environment variables exist. |
| **Payment Creation & Checkout API** | **Not Implemented** | No endpoint exists for initiating orders (e.g. `/api/checkout` or `/api/orders/create`). Frontend only toggles a boolean state flag. |
| **Payment Signature Verification** | **Not Implemented** | No server-side HMAC verification of payment signatures or transaction tokens. |
| **Webhook Handling** | **Not Implemented** | No webhook endpoints exist (e.g. `/api/webhooks/razorpay`) to handle asynchronous payment success, failure, or dispute events. |
| **Purchase & Order Records** | **Not Implemented** | Cloudflare D1 contains **no tables** for `orders`, `purchases`, `licenses`, or `transactions`. No schema migration exists for financial persistence. |
| **Duplicate Payment Prevention** | **Not Implemented** | No idempotency keys or database-level constraints against double-charging for the same blueprint package. |
| **Refund & Escrow Dispute Handling** | **Not Implemented** | Escrow holding period is stored only as a configuration parameter in `platform_settings`. No automated escrow hold or release logic exists. |
| **Secure Asset Delivery & Timed Links**| **Not Implemented** | No file storage exists (Cloudflare R2 or S3). No signed URLs or timed access tokens exist for downloading purchased CAD archives. |

---

## 5. Plot Intelligence (GIS) Audit

| Feature | Status | Architectural Reality & Data Flow |
| :--- | :---: | :--- |
| **Location Search & Geolocation** | **Fully Functional** | 14 Kerala administrative headquarters quick-select pills. Search input queries OpenStreetMap Nominatim reverse geocoding via `/api/geocode`. High-precision browser GPS supported with IP-based geolocation fallback (`/api/geolocation`). |
| **Satellite Map Rendering** | **Fully Functional** | MapLibre GL 4.x rendering high-resolution **Esri World Imagery** multi-CDN tiles with hybrid boundaries and place labels. Pure 2D top-down survey view (0° pitch, 0° bearing, rotation disabled). Source `maxzoom: 18` with overzooming up to zoom 22. |
| **Interactive Boundary Drawing** | **Fully Functional** | Click-to-place corner markers with dynamic cursor rubberband. Visual guideline closing to start vertex. Draggable vertex pins dynamically recalculate polygon geometry via Turf.js. |
| **Area & Dimension Calculations** | **Fully Functional** | `@turf/area` computes exact square meters. Accurately converted to Kerala Cents (1 Cent = 40.4686 m² = 435.6 sq.ft), square feet, perimeter in meters and feet, frontage length, depth, and road-facing edge index. |
| **Architectural Plan Matching** | **Fully Functional** | Evaluates measured plot against catalog blueprints using Kerala KMBR setback standards, building footprint, coverage ratio, and orientation. |
| **Plot Persistence (Cloudflare D1)** | **Fully Functional** | Authenticated users can save surveyed plots to their account via `POST /api/plots`. GeoJSON geometry, dimensional telemetry, center coordinates, and location name are persisted to D1 `saved_plots` table. Users can reload or delete plots (`DELETE /api/plots/[id]`). |

---

## 6. Technical & Architectural Audit

### 6.1 Endpoint Inventory & Status

| Route | Methods | Auth Required | Backend Target | Status |
| :--- | :---: | :---: | :---: | :---: |
| `/api/auth/register` | `POST` | Public | D1 `users` | Complete |
| `/api/auth/login` | `POST` | Public | D1 `users` | Complete |
| `/api/auth/logout` | `POST` | Public | Cookie clearance | Complete |
| `/api/auth/me` | `GET` | Authenticated | JWT Session | Complete |
| `/api/users` | `GET` | Admin only | D1 `users` | Complete |
| `/api/users/[id]` | `PATCH`, `DELETE` | Admin only | D1 `users`, `audit_logs` | Complete |
| `/api/users/upgrade-request` | `POST` | Authenticated | D1 `users`, `audit_logs` | Complete |
| `/api/projects` | `GET` | Public | D1 `projects` | Complete |
| `/api/projects` | `POST` | Verified Architect / Admin | D1 `projects` | Complete |
| `/api/projects/[id]` | `GET` | Public | D1 `projects` | Complete |
| `/api/projects/[id]` | `PUT`, `DELETE` | Creator Owner / Admin | D1 `projects` | Complete |
| `/api/plots` | `GET`, `POST` | Authenticated | D1 `saved_plots` | Complete |
| `/api/plots/[id]` | `GET`, `DELETE` | Owner / Admin | D1 `saved_plots` | Complete |
| `/api/inquiries` | `GET`, `POST` | Authenticated (GET) / Public (POST) | D1 `inquiries` | **Broken GET filter for architects** |
| `/api/settings` | `GET`, `PUT` | Admin (PUT) | D1 `platform_settings` | Complete |
| `/api/geocode` | `GET` | Public | Nominatim proxy | Complete |
| `/api/geolocation` | `GET` | Public | IP-API fallback | Complete |
| `/api/orders` | — | — | — | **Missing (Not Implemented)** |
| `/api/checkout` | — | — | — | **Missing (Not Implemented)** |
| `/api/webhooks/razorpay` | — | — | — | **Missing (Not Implemented)** |
| `/api/files/download` | — | — | — | **Missing (Not Implemented)** |
| `/api/files/upload` | — | — | — | **Missing (Not Implemented)** |

### 6.2 Database Schema Integrity (Cloudflare D1)

The database schema is defined in `migrations/0001_initial_schema.sql` and `migrations/0003_saved_plots.sql`.
- **Existing tables**: `users`, `projects`, `inquiries`, `audit_logs`, `platform_settings`, `saved_plots`.
- **Indexes**: Indexed on `email`, `role`, `status`, `slug`, `cents`, `client_email`, `user_id`.
- **Missing tables**:
  - `orders` (or `purchases`): Required for recording customer transactions, license keys, amounts, payment gateway transaction IDs, and escrow release status.
  - `project_files` (or `drawing_assets`): Required for storing metadata and R2/S3 object keys for AutoCAD `.dwg`, `.dxf`, PDF drawing sets, and high-res imagery.
  - `wishlists`: Required for persisting user saved designs across devices instead of relying on browser `localStorage`.

### 6.3 State Isolation & Data Disconnects

The audit discovered **three major state disconnects** where frontend components operate in local isolation from backend database tables:

1. **Inquiries Disconnect**:
   - `ConsultArchitectModal` in Plot Intelligence writes inquiries to D1 `inquiries` table.
   - `InquiriesTab` in the Architect dashboard reads hardcoded demo inquiries from `ProjectsContext` and saves status/replies exclusively to `localStorage`.
   - Real inquiries submitted by users are invisible to the architect.
2. **Architect Directory Disconnect**:
   - `/architects` renders static cards from [data.ts](file:///c:/Users/HP/Downloads/S_ARC/web/lib/data.ts).
   - Real architects who register and receive admin verification in D1 `users` do not appear in the directory.
3. **Studio Profile Disconnect**:
   - In `ArchitectView`, edits made in [StudioProfileTab.tsx](file:///c:/Users/HP/Downloads/S_ARC/web/components/dashboard/StudioProfileTab.tsx) write exclusively to `localStorage` (`sarc_studio_profile_v1`).
   - They are never sent to `PATCH /api/users/[id]` or updated in D1.

---

## Summary Verdict

| Layer | Score | Assessment |
| :--- | :---: | :--- |
| **Authentication & RBAC** | **95%** | Production-ready, secure JWT sessions, strict role guards, password hashing. |
| **GIS & Plot Intelligence** | **95%** | Production-ready, licensed Esri tiles, Turf.js calculations, D1 plot persistence. |
| **Project CRUD & Catalog** | **90%** | Production-ready D1 queries, ownership verification, search and filters. |
| **Admin System** | **85%** | Production-ready moderation, approvals, user management, audit logging. |
| **Architect Studio Experience** | **55%** | Partial: project creation works, but profile and inquiries are disconnected local state. |
| **Homeowner Experience** | **65%** | Partial: discovery and plot tools work, but checkout and downloads are UI mocks. |
| **Transaction & Escrow Engine**| **0%** | **Completely Unimplemented**: No payment gateway, no order records, no file storage. |
| **Overall Platform Readiness** | **62%** | High structural stability, but blocked from commercial transactions. |

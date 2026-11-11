# S-ARC Platform Blockers & External Dependencies

**Document Version:** 1.0.0  
**Audit Date:** November 11, 2026  
**Auditor:** Senior Full-Stack Engineer & Application Security Architect  

This document catalogs every critical blocker preventing S-ARC from operating as an end-to-end commercial architectural marketplace. Blockers are divided into **External Service Dependencies**, **Database Schema Gaps**, and **Architectural Disconnects**.

---

## 1. External Service Dependencies (Configuration Blockers)

### Blocker 1.1: Payment Gateway Provider Integration (Razorpay / Stripe)
- **Impact:** Commercial transactions cannot be processed. Clicking "Purchase CAD Package" only renders a simulated UI badge.
- **Root Cause:**
  - Neither `razorpay` nor `stripe` SDK is installed in `web/package.json`.
  - No merchant credentials exist in `web/.env` (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, or `STRIPE_SECRET_KEY`).
  - No payment verification or webhook endpoints exist.
- **Target Market Requirement:**
  - For South India (Kerala / INR transactions), **Razorpay** is the industry standard supporting UPI (Google Pay, PhonePe, Paytm), Netbanking (SBI, Federal Bank, South Indian Bank), credit/debit cards, and corporate GST invoicing.
- **Required Credentials from Stakeholder:**
  ```env
  NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
  RAZORPAY_KEY_SECRET="..."
  RAZORPAY_WEBHOOK_SECRET="..."
  ```

---

### Blocker 1.2: Cloud Object Storage for Architectural CAD Packages (Cloudflare R2 / AWS S3)
- **Impact:** Architects cannot upload `.dwg`, `.dxf`, `.rvt`, or `.pdf` drawing packages. Homeowners cannot download purchased blueprint archives. Architects must paste external Unsplash URLs for project images.
- **Root Cause:**
  - No object storage SDK (e.g. `@aws-sdk/client-s3` or Cloudflare R2 bindings) is configured.
  - No bucket is bound in `wrangler.toml` or `.env`.
  - Next.js server on Cloudflare Workers / Vercel cannot store multi-megabyte CAD zip files (40–100 MB) on local disk.
- **Required Infrastructure from Stakeholder:**
  - A **Cloudflare R2 Bucket** (e.g. `s-arc-cad-assets`) with S3-compatible API credentials:
  ```env
  R2_ACCOUNT_ID="..."
  R2_ACCESS_KEY_ID="..."
  R2_SECRET_ACCESS_KEY="..."
  R2_BUCKET_NAME="s-arc-cad-assets"
  R2_PUBLIC_DOMAIN="https://assets.s-arc.in" # or private signed bucket
  ```

---

## 2. Database Schema Gaps (Cloudflare D1)

### Blocker 2.1: Missing Orders / Purchases Table
- **Impact:** The database has no structure to record purchases, payment references, license certificates, escrow status, or buyer-architect relationships.
- **Current State:** Cloudflare D1 schema contains only `users`, `projects`, `inquiries`, `audit_logs`, `platform_settings`, and `saved_plots`.
- **Required Migration:** A new D1 migration `0004_orders_and_licenses.sql` defining:
  - `orders` (id, user_id, project_id, amount, platform_fee, architect_earnings, currency, payment_gateway, transaction_id, status, license_key, escrow_release_date, created_at)
  - `order_downloads` (id, order_id, user_id, downloaded_at, ip_address)

---

### Blocker 2.2: Missing Project Files & Deliverables Table
- **Impact:** Technical deliverables are represented only as boolean flags (`dwg_available = 1`). There is no file registry linking specific CAD zip files, PDF sets, or floor plan images to a project.
- **Required Migration:**
  - `project_files` (id, project_id, file_type, file_name, file_size, storage_key, mime_type, is_sample, created_at)

---

### Blocker 2.3: Missing Wishlist / Shortlist Table
- **Impact:** Homeowners' shortlisted designs and plot comparisons are stored exclusively in browser `localStorage`. If a user clears their browser cache or logs in from another device/mobile phone, all saved designs are lost.
- **Required Migration:**
  - `saved_designs` (id, user_id, project_id, created_at, UNIQUE(user_id, project_id))

---

## 3. Architectural & Code Disconnects

### Blocker 3.1: Inquiry Loop Disconnect Between Homeowner and Architect
- **Problem:**
  - `ConsultArchitectModal.tsx` in Plot Intelligence writes to the D1 `inquiries` table.
  - `InquiriesTab.tsx` in the Architect dashboard reads hardcoded demo inquiries from `ProjectsContext` and persists replies to `localStorage`.
  - The API endpoint `GET /api/inquiries` filters by `client_email = user.email` for all non-admins, completely blocking architects from seeing inquiries placed for their projects.
  - There is no `PATCH /api/inquiries/[id]` endpoint to update inquiry status or save replies in D1.
- **Resolution:**
  1. Update `GET /api/inquiries` so that verified architects can retrieve all inquiries where `project_id IN (SELECT id FROM projects WHERE architect_id = ?)`.
  2. Implement `PATCH /api/inquiries/[id]` allowing architects to update status and submit reply text into D1.
  3. Wire `InquiriesTab.tsx` to fetch from `GET /api/inquiries` and save via `PATCH /api/inquiries/[id]`.
  4. Display architect replies to the homeowner in `HomeownerView.tsx`.

---

### Blocker 3.2: Disconnected "Join as Architect" Navbar Modal ([SellerModal.tsx](file:///c:/Users/HP/Downloads/S_ARC/web/components/SellerModal.tsx))
- **Problem:**
  - The prominent "Join as Architect" button in the top navigation bar opens `SellerModal.tsx`.
  - Submitting this form runs a dummy `setTimeout(() => setSubmitted(true), 600)`. It does not create an account or request verification.
  - A user who fills out this form believes they have applied, but no data is sent anywhere.
- **Resolution:**
  - Wire `SellerModal.tsx` to:
    - If user is logged in: Call `POST /api/users/upgrade-request` with CoA number and studio details.
    - If user is not logged in: Call `POST /api/auth/register` with `role: "user"`, `subRole: "architect"`, and initiate the verification request.

---

### Blocker 3.3: UI Mockup Buttons on Project Detail Page ([ProjectDetailClient.tsx](file:///c:/Users/HP/Downloads/S_ARC/web/app/designs/%5Bid%5D/ProjectDetailClient.tsx))
- **Problem:**
  - "Request Architect Consultation": Only sets `inquirySent = true` locally.
  - "Download Sample Sheet": Only sets `sampleDownloaded = true` locally.
  - "Purchase CAD Package": Only sets `checkoutInitiated = true` locally.
- **Resolution:**
  - Wire "Request Architect Consultation" to open `ConsultArchitectModal.tsx` prefilled with the current project.
  - Wire "Download Sample Sheet" to download an actual curated sample architectural sheet (PDF).
  - Connect "Purchase CAD Package" to the checkout workflow once the payment engine is in place.

---

### Blocker 3.4: Disconnected Architect Directory ([/architects](file:///c:/Users/HP/Downloads/S_ARC/web/app/architects/page.tsx))
- **Problem:**
  - `/architects` renders exclusively from static hardcoded array `FEATURED_ARCHITECTS` in `lib/data.ts`.
  - Verified architects approved in D1 do not appear in the directory.
- **Resolution:**
  - Create `GET /api/architects` (or enhance `GET /api/users?role=architect&status=active`) that returns verified architects from D1, falling back to featured architects.
  - Wire `/architects` page to render dynamically from this API.

---

## 4. Blocker Resolution Priority Matrix

| Blocker ID | Description | Complexity | Priority | Can Proceed Locally Without External Accounts? |
| :--- | :--- | :---: | :---: | :---: |
| **3.1** | Fix Inquiries Loop (API filter + Architect Tab sync) | Low | **Immediate** | **YES** (Uses existing D1 database) |
| **3.2** | Wire SellerModal to Real Upgrade/Register API | Low | **Immediate** | **YES** (Uses existing D1 database) |
| **3.3** | Wire Project Detail Page Consultation Button to Modal | Low | **Immediate** | **YES** (Reuses existing modal) |
| **3.4** | Connect Architect Directory to D1 Verified Users | Medium | **High** | **YES** (Uses existing D1 database) |
| **2.1** | Create `orders` D1 Migration Table | Medium | **High** | **YES** (D1 migration script) |
| **2.3** | Create `saved_designs` D1 Wishlist Table & Sync API | Low | **High** | **YES** (D1 migration script) |
| **1.1** | Razorpay India Integration (Test Mode API Keys) | Medium | **Critical** | Needs Razorpay Test Keys (Sandbox) |
| **1.2** | Cloudflare R2 / S3 Asset Storage for CAD Packages | High | **Critical** | Needs R2/S3 Bucket or Local File Mock |
| **2.2** | CAD File Registry & Signed Timed Download Links | High | **Critical** | Depends on 1.2 & 2.1 |

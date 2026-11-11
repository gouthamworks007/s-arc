# S-ARC Marketplace Implementation Roadmap

**Document Version:** 1.0.0  
**Audit Date:** November 11, 2026  
**Auditor:** Senior Full-Stack Engineer & Application Security Architect  

This roadmap details the sequential engineering plan to elevate S-ARC from its current hybrid state (62% functional) to a complete, production-grade architectural marketplace (100% functional).

The implementation is divided into **5 discrete, verifiable phases**. Each phase specifies the exact files involved, dependencies, implementation details, and strict acceptance criteria.

---

## Roadmap Overview

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Internal Loop Closure & Data Flow Unification                                    │
│ Connect all existing UI mocks to already-functional D1 database tables & APIs.           │
│ (Inquiries loop, SellerModal, Project detail inquiry button, Studio profile D1 sync)    │
└────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: Database Schema Expansion (Orders, Files, Wishlists)                             │
│ Execute D1 migration 0004 defining orders, order_downloads, project_files, saved_designs.│
└────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: Transaction & Escrow Engine (Razorpay Test Sandbox)                             │
│ Install Razorpay SDK, order creation API, HMAC verification, webhook handler, licenses.  │
└────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: CAD Asset Storage & Secure Timed Delivery (Cloudflare R2 / S3)                   │
│ R2 bucket binding, presigned upload URLs for architects, tokenized download links.       │
└────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 5: User Dashboards, Wishlist Sync & End-to-End Verification                        │
│ Homeowner purchased orders view, Architect sales ledger, cross-device wishlist, tests.   │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Internal Loop Closure & Data Flow Unification

**Objective:** Eliminate all frontend mockups that can be resolved immediately using existing D1 tables and API infrastructure, requiring zero new external accounts or cloud services.

### 1.1 Wire Project Detail Inquiry Button to Real Modal
- **Files Involved:**
  - `web/app/designs/[id]/ProjectDetailClient.tsx`
  - `web/components/plot-intelligence/ConsultArchitectModal.tsx`
- **What to Implement:**
  - Import `ConsultArchitectModal` into `ProjectDetailClient.tsx`.
  - Replace the local `setInquirySent(true)` mock button with an `onClick` handler opening `ConsultArchitectModal` prefilled with the current project data.
- **Acceptance Criteria:**
  - Clicking "Request Architect Consultation" on any project page opens the modal.
  - Submitting the form calls `POST /api/inquiries` and creates a real row in D1.

### 1.2 Fix Inquiries Authorization & Architect Inquiries Tab
- **Files Involved:**
  - `web/app/api/inquiries/route.ts`
  - `web/app/api/inquiries/[id]/route.ts` (New Route)
  - `web/components/dashboard/InquiriesTab.tsx`
  - `web/lib/projectsContext.tsx`
- **What to Implement:**
  - In `GET /api/inquiries`: Update the SQL query so that when the authenticated user is an architect (`user.subRole === "architect"`), it returns inquiries where `project_id IN (SELECT id FROM projects WHERE architect_id = ?)`.
  - Create `PATCH /api/inquiries/[id]` allowing the project's architect (or admin) to update inquiry status (`in_review`, `responded`, `completed`) and submit a `reply_text`.
  - In `InquiriesTab.tsx`: Replace `localStorage` inquiries state with a live fetch from `GET /api/inquiries` and save replies via `PATCH /api/inquiries/[id]`.
- **Acceptance Criteria:**
  - Inquiries submitted from plot intelligence or project detail pages immediately appear in the architect's dashboard.
  - Architect replies are persisted in D1 and visible to the homeowner.

### 1.3 Wire Navbar "Join as Architect" Modal ([SellerModal.tsx](file:///c:/Users/HP/Downloads/S_ARC/web/components/SellerModal.tsx))
- **Files Involved:**
  - `web/components/SellerModal.tsx`
  - `web/app/api/users/upgrade-request/route.ts`
  - `web/app/api/auth/register/route.ts`
- **What to Implement:**
  - Replace the simulated `setTimeout` in `SellerModal.tsx`.
  - If the user is authenticated: Call `POST /api/users/upgrade-request` with CoA number and studio details.
  - If unauthenticated: Call `POST /api/auth/register` with `subRole: "architect"` and submit the upgrade request.
- **Acceptance Criteria:**
  - Submitting `SellerModal` creates a user or upgrade record in D1 with `status = 'pending_verification'`.
  - Application immediately appears in Admin Dashboard under the "Approvals" tab.

### 1.4 Synchronize Architect Studio Profile to Cloudflare D1
- **Files Involved:**
  - `web/components/dashboard/StudioProfileTab.tsx`
  - `web/app/api/users/[id]/route.ts`
- **What to Implement:**
  - Update `StudioProfileTab.tsx` so clicking "Save Studio Profile" calls `PATCH /api/users/[id]` with `studioName`, `bio`, `phone`, `location`, and `coaNumber`.
- **Acceptance Criteria:**
  - Profile edits persist across browsers and page reloads via the D1 `users` table.

---

## Phase 2: Database Schema Expansion (D1 Migration 0004)

**Objective:** Add complete schema support for orders, customer licenses, file assets, and cross-device wishlists.

### 2.1 Author D1 Migration Script `migrations/0004_commerce_and_assets.sql`
- **Tables to Create:**
  1. `orders`:
     ```sql
     CREATE TABLE IF NOT EXISTS orders (
       id TEXT PRIMARY KEY,
       order_number TEXT UNIQUE NOT NULL,
       user_id TEXT NOT NULL,
       project_id TEXT NOT NULL,
       amount_inr REAL NOT NULL,
       platform_fee_inr REAL NOT NULL,
       architect_payout_inr REAL NOT NULL,
       currency TEXT DEFAULT 'INR',
       status TEXT NOT NULL DEFAULT 'created' CHECK(status IN ('created', 'paid', 'escrow_hold', 'released', 'refunded', 'failed')),
       payment_gateway TEXT DEFAULT 'razorpay',
       gateway_order_id TEXT,
       gateway_payment_id TEXT,
       gateway_signature TEXT,
       license_number TEXT UNIQUE,
       escrow_release_date TEXT,
       created_at TEXT DEFAULT (datetime('now')),
       updated_at TEXT DEFAULT (datetime('now')),
       FOREIGN KEY (user_id) REFERENCES users(id),
       FOREIGN KEY (project_id) REFERENCES projects(id)
     );
     ```
  2. `project_files`:
     ```sql
     CREATE TABLE IF NOT EXISTS project_files (
       id TEXT PRIMARY KEY,
       project_id TEXT NOT NULL,
       file_type TEXT NOT NULL CHECK(file_type IN ('cad_archive', 'dwg', 'dxf', 'bim_model', 'boq_sheet', 'sample_pdf', 'elevation_image')),
       file_name TEXT NOT NULL,
       file_size_bytes INTEGER NOT NULL,
       storage_key TEXT NOT NULL,
       mime_type TEXT NOT NULL,
       is_sample INTEGER DEFAULT 0,
       created_at TEXT DEFAULT (datetime('now')),
       FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
     );
     ```
  3. `saved_designs` (Wishlists):
     ```sql
     CREATE TABLE IF NOT EXISTS saved_designs (
       id TEXT PRIMARY KEY,
       user_id TEXT NOT NULL,
       project_id TEXT NOT NULL,
       created_at TEXT DEFAULT (datetime('now')),
       UNIQUE(user_id, project_id),
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
       FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
     );
     ```
- **Acceptance Criteria:**
  - Migration executes cleanly via local D1 runner and Prisma test suite.
  - Foreign keys, indices, and status check constraints verified.

---

## Phase 3: Transaction & Escrow Engine (Razorpay Integration)

**Objective:** Implement end-to-end checkout, payment verification, and order creation.

### 3.1 Razorpay SDK & Environment Configuration
- **Dependencies:** Install `razorpay` (`npm install razorpay`) in `web/`.
- **Environment Variables:** Configure test keys in `web/.env`:
  ```env
  RAZORPAY_KEY_ID="rzp_test_..."
  RAZORPAY_KEY_SECRET="..."
  RAZORPAY_WEBHOOK_SECRET="..."
  ```

### 3.2 Payment APIs
- **Create Order:** `POST /api/checkout/create-order`
  - Validates project listing price and active status in D1.
  - Calculates S-ARC commission (10% standard from `platform_settings`) and architect payout.
  - Calls Razorpay Orders API: `razorpay.orders.create({ amount: price * 100, currency: 'INR', ... })`.
  - Creates pending record in `orders` table.
- **Verify Payment:** `POST /api/checkout/verify`
  - Validates Razorpay HMAC signature (`crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id)`).
  - Updates order status to `paid` and `escrow_hold`.
  - Generates immutable license certificate number: `SARC-LIC-YYYY-XXXXX`.
  - Sets `escrow_release_date` based on platform settings holding days (7 days).
- **Webhook Listener:** `POST /api/webhooks/razorpay`
  - Handles asynchronous payment captured, payment failed, and refund events.

### 3.3 Frontend Checkout Flow
- **Files Involved:**
  - `web/app/designs/[id]/ProjectDetailClient.tsx`
  - `web/components/checkout/CheckoutModal.tsx` (New Component)
- **What to Implement:**
  - Add Razorpay Checkout script loader.
  - Replace mock "Purchase CAD Package" button with a checkout modal displaying order summary, license terms (single-family construction license), tax/fee breakdown, and Razorpay standard checkout popup.
- **Acceptance Criteria:**
  - User can complete a test checkout with Razorpay test UPI/Cards.
  - Real order row is inserted into D1 `orders` table with generated license key.
  - Signature verification prevents forged payment callbacks.

---

## Phase 4: CAD Asset Storage & Secure Timed Delivery

**Objective:** Enable architects to upload real CAD archives and homeowners to securely download purchased blueprints.

### 4.1 Cloudflare R2 / S3 Integration
- **Storage Strategy:**
  - Cloudflare R2 provides zero-egress fee object storage.
  - Configure private bucket `s-arc-cad-assets`.
- **Upload API:** `POST /api/files/upload-url` (Architects only)
  - Issues presigned PUT URL for `.zip`, `.dwg`, `.pdf` files.
  - Enforces 150 MB file size limit and verified architect authorization.
  - Records file metadata in `project_files` table upon upload completion.
- **Download API:** `GET /api/files/download/[orderId]` (Homeowners only)
  - Verifies that the requesting user owns the order in `orders` table and `status IN ('paid', 'escrow_hold', 'released')`.
  - Issues a **signed, 15-minute temporary download URL** (or streams encrypted stream).
  - Records audit timestamp in `order_downloads` table.

### 4.2 Frontend Integration
- **Project Edit Modal:** Add CAD archive and sample PDF upload dropzone in `ProjectEditModal.tsx` deliverables tab.
- **Homeowner Dashboard:** Replace the mock download in `HomeownerView.tsx` with a live link calling `GET /api/files/download/[orderId]`.

---

## Phase 5: Dashboards, Wishlist Sync & End-to-End Verification

**Objective:** Complete the user and architect interfaces with live commercial data and perform end-to-end automated testing.

### 5.1 Homeowner Purchased Orders View
- **File:** `web/components/dashboard/HomeownerView.tsx`
- **What to Implement:**
  - Replace the demo persona check (`isDemoClient`) with a live query to `GET /api/orders/my-orders`.
  - Render purchased packages with project title, architect studio, purchase date, amount paid, license certificate number, and one-click CAD package download.

### 5.2 Architect Sales & Revenue Ledger
- **File:** `web/components/dashboard/ArchitectView.tsx`
- **What to Implement:**
  - Add "Sales & Royalties" tab to the architect workspace.
  - Displays total blueprint licenses sold, gross sales, platform commission deducted, net payout balance, and pending escrow releases.

### 5.3 Cross-Device Wishlist Sync
- **Files:** `web/lib/savedProjectsContext.tsx`, `web/app/api/wishlist/route.ts` (New)
- **What to Implement:**
  - Synchronize `sarc_saved_designs` with D1 `saved_designs` whenever the user is logged in.
  - Persist shortlists seamlessly across desktop and mobile.

### 5.4 Automated Verification Test Suite
- **Author Tests:**
  - `scripts/verify-checkout.mjs`: Tests order creation, HMAC signature verification, duplicate payment rejection, and license generation.
  - `scripts/verify-files.mjs`: Tests presigned URL generation, file type validation, and unauthorized download rejection (403 for non-purchased blueprints).
  - `scripts/verify-inquiries-loop.mjs`: Tests client inquiry submission, architect retrieval, and architect reply persistence.

---

## Recommended Execution Order & Timeline

| Step | Phase | Scope | Primary Deliverable | Prerequisite |
| :---: | :---: | :--- | :--- | :--- |
| **1** | **Phase 1** | Internal Loop Closure | Fix inquiries loop, SellerModal, project detail consultation button, studio profile D1 sync | None (Uses existing code & D1) |
| **2** | **Phase 2** | Database Migration | Run `0004_commerce_and_assets.sql` adding `orders`, `project_files`, `saved_designs` | None |
| **3** | **Phase 3** | Payment Sandbox | Install Razorpay, create order API, verify signature, webhook handler, checkout modal | Razorpay Test API Keys |
| **4** | **Phase 4** | Asset Storage | Cloudflare R2 bucket binding, presigned upload URLs, timed download endpoints | R2 Bucket or Local Dev Mock |
| **5** | **Phase 5** | Fulfillment & Ledger | Homeowner purchased blueprints view, architect sales ledger, wishlist sync, test suite | Phases 2, 3, 4 |

---

## Verification & Acceptance Criteria for Full Platform Completion

A feature is considered **100% Complete** only when all of the following conditions are met:
1. **Zero Mocked States**: No `useState` booleans simulating payments or downloads remain in production routes.
2. **Server-Side Authorization**: Every action (purchasing, downloading, replying, verifying) is validated on the server via JWT and D1 SQL checks.
3. **Audit Trail**: Every financial transaction and administrative review generates an immutable row in `audit_logs` and `orders`.
4. **Automated Test Coverage**: All tests in `npm run test` or `node scripts/verify-*` execute with code 0.
5. **Production Build Success**: `npm run build` compiles all 31+ routes cleanly with zero TypeScript or Next.js build errors.

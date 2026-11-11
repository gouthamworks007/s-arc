# S-ARC Development Status — Phase 1: Internal Loop Closure

**Document Version:** 1.0.0  
**Date:** November 11, 2026  
**Status:** Completed & Verified (12 / 12 Automated Tests Passing)  
**Lead Engineer:** Senior Full-Stack Engineer & Application Security Architect  
**Repository:** `S_ARC` (`s-arc-web` Next.js 14.2 / Cloudflare D1 / MapLibre GL)  
**Target Git Branch:** `main`

---

## 1. Executive Summary

Phase 1 ("Internal Loop Closure") transitioned the S-ARC platform from a collection of partially isolated frontend mock components to an integrated, edge-persisted architectural marketplace. All core internal loops connecting homeowners, verified architects, and the Cloudflare D1 database have been wired, secured, and validated without redesigning the UI or compromising established branding tokens (`#171717`, `#AD8065`, `#F5F4F1`).

---

## 2. Tasks Completed

### Task 1 — Homeowner Consultation Requests
- **Problem**: Project details page previously simulated consultation submission with a local boolean state flag (`inquirySent = true`) and a hardcoded response banner.
- **Solution**:
  - Replaced local mock state in `web/app/designs/[id]/ProjectDetailClient.tsx` with `ConsultArchitectModal.tsx`.
  - Implemented server-side authentication check returning HTTP 401 for unauthenticated visitors.
  - Implemented server-side duplicate prevention checking for identical active inquiries within a 15-minute window (HTTP 409).
  - Associated inquiries with target project, owning architect, and verified client email in Cloudflare D1 `inquiries` table.

### Task 2 — Architect Inquiry Management
- **Problem**: `InquiriesTab.tsx` loaded hardcoded demo inquiries from `ProjectsContext` and wrote status updates/replies strictly to browser `localStorage`. Real inquiries in D1 were inaccessible.
- **Solution**:
  - Rewrote `web/components/dashboard/InquiriesTab.tsx` to fetch live inquiries from `GET /api/inquiries`.
  - Implemented role-based isolation in `GET /api/inquiries`:
    - Architects receive inquiries only for projects owned by their studio (or submitted by their email).
    - Homeowners receive inquiries only submitted under their account email.
    - Administrators can inspect all consultations platform-wide.
  - Implemented `PATCH /api/inquiries/[id]` supporting status transitions (`new`, `in_review`, `responded`, `completed`) and replies (`reply_text`).
  - Added authorization guards returning HTTP 403 when non-owners attempt modifications.
  - Added support for deleting inquiries via `DELETE /api/inquiries/[id]`.

### Task 3 — Architect Directory
- **Problem**: `/architects` rendered static mock cards from `FEATURED_ARCHITECTS` in `data.ts`. Real registered architects verified by administrators in D1 never appeared in the public directory.
- **Solution**:
  - Created `GET /api/architects` querying D1 `users` table for `sub_role = 'architect' AND status = 'active'`.
  - Calculated real-time published project counts via subquery.
  - Strictly excluded pending verification (`status = 'pending_verification'`) and suspended accounts.
  - Updated `web/app/architects/page.tsx` to consume dynamic API data with clean loading skeletons and empty states while preserving city hub filters (Kochi, Trivandrum, Calicut, etc.).

### Task 4 — Studio Profile Synchronization
- **Problem**: `StudioProfileTab.tsx` wrote updates exclusively to `localStorage` (`sarc_studio_profile_v1`). Changes were lost upon switching browsers or clearing cache.
- **Solution**:
  - Updated `web/app/api/users/[id]/route.ts` with `GET` and `PATCH` handlers:
    - Allowed architects and homeowners to edit their own profile fields (`name`, `studio_name`, `bio`, `phone`, `location`, `avatar`, `coa_number`).
    - Enforced ownership checking returning HTTP 403 when modifying another user's profile.
    - Enforced privilege escalation guards returning HTTP 403 when non-administrators attempt to alter `role`, `status`, or `permissions`.
  - Updated `StudioProfileTab.tsx` to fetch fresh profile data on mount and persist saves via `PATCH /api/users/[id]` with saving, saved, and error indicators.
  - Profile updates retain persistently across page reloads.

### Task 5 — Architect Registration (Seller Modal)
- **Problem**: "Join as Architect" button in navbar opened `SellerModal.tsx` which executed `setTimeout(() => setSubmitted(true), 600)` without creating a database account.
- **Solution**:
  - Updated `SellerModal.tsx` to handle both authenticated and unauthenticated scenarios:
    - If user is logged in: Submits upgrade application via `POST /api/users/upgrade-request`.
    - If user is not logged in: Registers a new account via `POST /api/auth/register` with `subRole: 'architect'` and password field (min 6 characters).
  - Newly created architect accounts default to `status: 'pending_verification'` in Cloudflare D1.
  - Rendered server validation errors (e.g. HTTP 409 duplicate email, invalid CoA format).
  - Added verification confirmation screen displaying submission status and CoA review instructions.

### Task 6 — Real Floor Plan Viewer
- **Problem**: `ProjectDetailClient.tsx` rendered a static generic SVG schematic for all blueprints instead of displaying the project's actual blueprint image.
- **Solution**:
  - Removed generic SVG mock from `ProjectDetailClient.tsx`.
  - Wired `project.floorPlanImage` with high-resolution image rendering and aspect ratio constraints.
  - Added interactive enlarged blueprint lightbox modal for close inspection.
  - Added clean empty state ("Floor Plan Unavailable") explaining that custom schematics are provided upon architect consultation.

---

## 3. Automated Verification Results

A comprehensive verification suite (`scripts/verify-phase1.mjs`) was authored and executed against the live Next.js application.

```
==================================================================
   S-ARC PHASE 1: INTERNAL LOOP CLOSURE VERIFICATION SUITE
==================================================================

[PASS] Criterion 1: Homeowner submits consultation request
       Evidence: HTTP 201, inquiryId: inq-858459, project: The Ridge House

[PASS] Criterion 2: Unauthenticated consultation request is rejected (401)
       Evidence: HTTP 401, error: "Authentication required. Please sign in."

[PASS] Criterion 3: Architect receives only their own inquiries
       Evidence: HTTP 200, count: 3, found submitted inquiry: true

[PASS] Criterion 4: Architect cannot modify another architect's inquiry (403)
       Evidence: HTTP 403, error: "Forbidden. You do not have permission to modify consultation requests assigned to another architectural studio."

[PASS] Criterion 5: Homeowner cannot access another homeowner's inquiry
       Evidence: Homeowner B sees inquiry of A: false, Homeowner PATCH status: HTTP 403 (Forbidden. You do not have permission to modify consultation requests assigned to another architectural studio.)

[PASS] Criterion 6: Verified architects appear in /api/architects directory
       Evidence: HTTP 200, verified architects count: 1, Ar. Nikhil Rajan present: true

[PASS] Criterion 7: Pending architects do not appear in directory
       Evidence: usr-arch-02 (pending) present: false, new pending architect present: false

[PASS] Criterion 8: Studio profile changes persist after reload in D1
       Evidence: PATCH HTTP 200, GET verified studioName: "Studio Vayu 4166", bio matches: true

[PASS] Criterion 9: Users cannot modify another user's profile or escalate roles (403)
       Evidence: Cross-user edit: HTTP 403 (Forbidden: You are not authorized to update another user's profile.), Role escalation attempt: HTTP 403 (Forbidden: Only administrators can modify user role, permissions, or verification status.)

[PASS] Criterion 10: Architect registration creates pending_verification state
       Evidence: HTTP 201, subRole: architect, status: "pending_verification"

[PASS] Criterion 11: Generic SVG is no longer used as floor plan
       Evidence: Uses project.floorPlanImage: true, Generic SVG mock removed: true

[PASS] Criterion 12: Missing floor plan displays proper empty state
       Evidence: Empty state message present in ProjectDetailClient.tsx: true

==================================================================
VERIFICATION SUMMARY: 12 / 12 PASSED (100%)
==================================================================
```

### TypeScript & Production Build Verification
- **TypeScript Typecheck (`tsc --noEmit`)**: 0 errors, exit code 0.
- **Next.js Production Build (`npm run build`)**: 32 / 32 static and dynamic pages compiled and exported to `web/out/` successfully, exit code 0.

---

## 4. Modified & Created Files Inventory

| File | Status | Description |
| :--- | :---: | :--- |
| `web/app/api/inquiries/route.ts` | Modified | Added authentication, role-based isolation (architect vs homeowner), duplicate prevention. |
| `web/app/api/inquiries/[id]/route.ts` | **Created** | Supported `PATCH` (status updates, responses) with ownership validation and `DELETE`. |
| `web/app/api/architects/route.ts` | **Created** | Public API querying D1 `users` for active verified architects (`status = 'active'`). |
| `web/app/api/users/[id]/route.ts` | Modified | Added `GET` and profile owner `PATCH` with cross-user and role-escalation 403 guards. |
| `web/app/api/auth/me/route.ts` | Modified | Added `bio` field to returned user profile payload. |
| `web/components/plot-intelligence/ConsultArchitectModal.tsx` | Modified | Added auth guard, form validation, error display, and D1 submission. |
| `web/app/designs/[id]/ProjectDetailClient.tsx` | Modified | Wired consultation button to modal; replaced SVG with real `floorPlanImage` viewer. |
| `web/components/dashboard/InquiriesTab.tsx` | Modified | Connected to `GET /api/inquiries` and `PATCH /api/inquiries/[id]` for status and replies. |
| `web/app/architects/page.tsx` | Modified | Connected to `/api/architects` for live directory data. |
| `web/components/dashboard/StudioProfileTab.tsx` | Modified | Connected to `PATCH /api/users/[id]` with persistent D1 synchronization. |
| `web/components/SellerModal.tsx` | Modified | Added real registration (`POST /api/auth/register`) and upgrade requests. |
| `web/lib/d1.ts` | Modified | Updated fallback store simulator for inquiries filtering, slugs, and user profile updates. |
| `scripts/verify-phase1.mjs` | **Created** | Automated test suite verifying all 12 Phase 1 acceptance criteria. |
| `FEATURE_STATUS.md` | Modified | Updated master feature matrix (Category A increased from 42% to 61%). |
| `MARKETPLACE_AUDIT.md` | Modified | Documented resolution of state disconnects and updated platform readiness score. |
| `DEVELOPMENT_STATUS.md` | **Created** | Authoritative report of Phase 1 implementation and verification. |

---

## 5. Next Steps Roadmap

1. **Phase 2 — Wishlist & Cross-Device Persistence**:
   - Create `wishlists` table migration in D1 (`id`, `user_id`, `project_id`, `created_at`).
   - Create `GET`, `POST`, `DELETE` `/api/wishlist` endpoints.
   - Sync `savedProjectsContext.tsx` with D1 for authenticated homeowners.
2. **Phase 3 — Commercial Transaction System (Razorpay Integration)**:
   - Create `orders` and `transactions` tables in D1.
   - Install Razorpay SDK; implement `/api/checkout` order creation.
   - Implement `/api/checkout/verify` signature verification and `/api/webhooks/razorpay`.
   - Update `HomeownerView.tsx` with real purchased blueprint records and order status.
   - Update `ArchitectView.tsx` with sales ledger and revenue tracking.
3. **Phase 4 — Cloudflare R2 Secure CAD Asset Delivery**:
   - Setup Cloudflare R2 bucket binding.
   - Implement authenticated presigned download URLs with expiration tokens.
   - Provide CAD drawing set uploads (`.dwg`, `.pdf`, `.bim`) for verified architects.

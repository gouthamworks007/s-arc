# S-ARC (Southern Architecture) — System Architecture

## 1. Architectural Overview

S-ARC is a high-performance architectural commerce, collaboration, and geospatial intelligence platform tailored specifically to the South Indian context (focusing initially on Kerala's 14 districts, expanding to Tamil Nadu and Karnataka).

The architecture bridges three core user segments:
1. **Landowners & Homeowners**: Requiring parcel-calibrated plot intelligence, topographical analysis, Kerala Municipality Building Rules (KMBR) setbacks, and curated tropical architectural blueprints.
2. **Council of Architecture (CoA) Verified Architects & Studios**: Requiring verified profile showcases, 42-sheet construction package listing management, client consultation pipeline, and secure design monetization.
3. **Engineers & Contractors**: Accessing structural BOQ, MEP layout sheets, and regional turnkey delivery schedules.
4. **Platform Administrators**: Overseeing governance, CoA verification audits, listing moderation, financial escrow, and immutable audit logs.

```
+-----------------------------------------------------------------------------------+
|                                 S-ARC CLIENT TIER                                 |
|   Next.js 14 App Router | React 18 | Tailwind CSS | Framer Motion | MapLibre GL   |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | HTTPS / REST / JWT (HttpOnly)
                                          v
+-----------------------------------------------------------------------------------+
|                              S-ARC EDGE API ROUTER                                |
|   Next.js API Handlers | JOSE HS256 Token Validation | In-Memory Sliding Limiter   |
|   - /api/auth/*       (Register, Login, Me, Logout)                               |
|   - /api/projects/*   (List, Filter, Details, Publish, Modify, Delete)           |
|   - /api/plots/*      (GIS Geometry, Setbacks, Saved Parcels)                     |
|   - /api/users/*      (RBAC, Verification Workflow, Administration)              |
|   - /api/inquiries/*  (Consultation Pipeline, Messages)                           |
+-----------------------------------------+-----------------------------------------+
                                          |
                   +----------------------+----------------------+
                   |                                             |
                   v                                             v
+--------------------------------------+     +--------------------------------------+
|       CLOUDFLARE D1 DATABASE         |     |          CLOUDFLARE R2 BUCKET        |
| - users (RBAC & CoA credentials)     |     | - CAD Packages (.dwg, .dxf)          |
| - projects (42-sheet metadata)       |     | - Structural BOQ & Calculations      |
| - inquiries & saved_plots            |     | - High-Res Renders & Axonometrics    |
| - audit_logs (immutable ledger)      |     | - Verification ID & CoA Documents    |
+--------------------------------------+     +--------------------------------------+
```

---

## 2. Core Functional Modules

### A. Satellite Plot Intelligence (GIS & KMBR Engine)
- **MapLibre GL & Geospatial Projections**: Direct client-side canvas rendering with zero WebGL rotation locks (strict 0° North-up survey alignment).
- **Tile Pipeline**: High-resolution Google Satellite Hybrid tiles (`mt0`-`mt3.google.com/vt/lyrs=y`) resolving sub-meter parcel imagery across all 14 Kerala districts.
- **Turf.js Geometric Engine**:
  - Polygon boundary validation and auto-closing with self-intersection detection.
  - Dual-unit land area computation (Cents, Square Feet, Square Meters, Acres).
  - Continuous aspect ratio and boundary dimension calculation.
- **KMBR Automated Setbacks**: Computes front, rear, and side setback buffers according to Kerala Municipality Building Rules based on plot area, road frontage index, and building height.
- **Intelligent Design Matching**: Filters the marketplace catalogue against the measured plot width, depth, and area to recommend viable architectural designs.

### B. Architectural Design Marketplace
- **Curated Catalog**: Search and multi-attribute filtering (Cents range, architectural style, facing orientation, Vastu score, bedroom count).
- **42-Sheet Drawing Package Standard**:
  - Architectural: Floor plans, exterior elevations, sectional elevations, door/window schedules.
  - Structural: Foundation footing layouts, column schedules, slab reinforcement details.
  - MEP: Conduit runs, plumbing riser diagrams, sanitary drainage, rainwater harvesting.
  - BOQ: Quantity takeoffs, material specifications, laterite/brick masonry estimates.
- **Inside Out Architectural Explorer**: Real-time axonometric, floorplan, dimension, and spatial volume visualizer.

### C. Multi-Role Dashboard & Verification State Machine
- **Homeowner View**: Saved plots, consultation inquiries, purchased drawing packages, plot intelligence reports.
- **Architect Studio View**: Listing management, design upload with live validation, client leads pipeline, practice profile editor.
- **Admin Governance View**:
  - Verification queue: Reviews submitted Council of Architecture (CoA) licenses.
  - Listing moderation: Reviews architectural blueprints before platform listing.
  - User management: Status activation, suspension, and role updates.
  - Audit logs: Immutable history of all administrative actions.

---

## 3. Data & State Synchronization

- **Client State**:
  - React Contexts (`AuthContext`, `ProjectsContext`) provide responsive optimistic updates.
  - On mount, state synchronizes with server-side endpoints (`/api/auth/me`, `/api/projects?status=all`).
- **Server Persistence**:
  - Cloudflare D1 distributed SQLite database stores transactional records.
  - Native D1 binding is prioritized in Cloudflare runtime; Cloudflare REST API is supported for hybrid deployments.

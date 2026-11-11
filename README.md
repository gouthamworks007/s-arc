# S-ARC — Southern Architecture Platform

<div align="center">

![S-ARC Logo](web/public/logo.png)

**Curated Architectural Commerce & Collaboration Platform**  
*Connecting discerning homeowners, verified architects, and engineers across South India.*

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Cloudflare D1](https://img.shields.io/badge/Cloudflare-D1_Edge_DB-f38020?style=flat-square&logo=cloudflare)](https://developers.cloudflare.com/d1/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-Geospatial_GIS-3969a4?style=flat-square)](https://maplibre.org/)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)]()

</div>

---

## 1. Platform Overview

**S-ARC (Southern Architecture)** is a specialized architectural commerce and intelligence platform designed specifically for the South Indian built-environment market, initially focused on Kerala. 

Unlike generic real estate portals or freelance directories, S-ARC provides:
1. **Curated Architectural Design Marketplace**: Vetted, climate-adaptive residential and commercial blueprints packaged into complete construction-ready drawing sets (40–55 detailed A1 sheets including Architectural, Structural, MEP schematics, and BOQ quantity takeoffs).
2. **Interactive 2D Blueprint Zoom Viewer**: High-resolution technical floor plan inspection with multi-level floor toggles, panning, and responsive scaling.
3. **Architect CAD & Blueprint Upload Engine**: Secure multipart upload pipeline for verified Council of Architecture (COA) professionals to upload master `.dwg`, `.dxf`, `.pdf`, `.bim`, and `.zip` technical packages.
4. **Smart Plot Intelligence**: Interactive satellite GIS workspace (powered by MapLibre GL and Turf.js) that calculates plot boundaries, area in Cents and Sq.Ft, orientation azimuths, and KMBR (Kerala Municipality Building Rules) municipal setback buffers, automatically recommending matching architectural plans.
5. **Verified Architect Directory & Studio Profiles**: Public discovery of licensed practitioners filtered by regional hubs (Kochi, Trivandrum, Calicut, Thrissur, Kottayam).
6. **Escrow-Guarded Consultations**: Direct collaboration pipeline connecting prospective homeowners to architects for contour adaptation, site supervision, and municipal clearance.
7. **Role-Based Access Control (RBAC)**: Secure multi-tier authentication for Homeowners, Licensed Architects, and System Administrators with cryptographic session integrity.

---

## 2. Architectural Design System

S-ARC employs a minimalist architectural aesthetic rooted in regional natural materials (terracotta, laterite stone, teak, and exposed concrete):

- **Palette Tokens**:
  - `Charcoal`: `#171717` (Deep architectural graphite)
  - `Muted Copper`: `#AD8065` (Warm terracotta accent)
  - `Warm Grey`: `#F5F4F1` (Soft stone background)
  - `Warm Border`: `#E8E6E2` (Subtle tactile divider)
  - `Secondary Text`: `#777777`
- **Typography Direction**:
  - **Headings & Serif Elements**: `Cormorant Garamond` (Classical editorial serif with discretionary ligatures disabled for modern restraint).
  - **Interface & Technical Data**: `Space Grotesk` (Engineered, proportional sans-serif for measurements, metadata, and coordinates).
- **Spatial Geometry**: Smooth rounded corners (`rounded-2xl`, `rounded-full` controls) reflecting tactile craftsmanship and WCAG 2.2 AA compliant focus rings.

---

## 3. Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14.2 (App Router)**, React 18, TypeScript 5 | Server-rendered pages, static generation, API routes |
| **Edge Database** | **Cloudflare D1 (Edge SQLite)** | Serverless globally distributed relational database |
| **Geospatial GIS Engine** | **MapLibre GL 6.17**, **Turf.js 7.4** | Interactive satellite plot measurement & KMBR setback geometry |
| **Satellite Imagery** | **Google Satellite Hybrid Tiles** | High-resolution aerial imagery across all 14 Kerala districts |
| **Authentication & Cryptography** | **Jose (JWT)**, **bcryptjs (cost 11)** | Stateless HTTP-only sessions, tamper-proof bearer tokens |
| **Styling & Layout** | **Tailwind CSS 3.4**, PostCSS, Autoprefixer | Design token styling, responsive grids, dark/warm modes |
| **Icons & Media** | **Lucide React**, Next.js Image Optimization | Vector iconography and lazy-loaded architectural photography |

---

## 4. Repository & Directory Structure

```
S_ARC/
├── docs/                           # Central platform documentation
│   ├── ARCHITECTURE.md             # System architecture & component topology
│   ├── DATABASE.md                 # Cloudflare D1 schema, tables & indexes
│   ├── API_REFERENCE.md            # Complete REST endpoint specifications
│   ├── SECURITY.md                 # Threat model, RBAC & security policies
│   ├── DEPLOYMENT.md               # Cloudflare Pages / Workers deployment guide
│   ├── DEVELOPMENT_STATUS.md       # Implementation & audit verification report
│   ├── MARKETPLACE_AUDIT.md        # Comprehensive marketplace functional audit
│   ├── IMPLEMENTATION_ROADMAP.md   # Phased development & feature roadmap
│   ├── FEATURE_STATUS.md           # Master platform capabilities matrix
│   ├── BLOCKERS.md                 # Resolution log of critical blockers
│   ├── specs/                      # Product design specifications
│   └── assets/                     # Architecture diagrams and design assets
├── migrations/                     # Cloudflare D1 SQL migrations
│   ├── 0001_initial_schema.sql     # Core tables (users, projects, inquiries, audit_logs)
│   ├── 0002_seed.sql               # Seed data for verified studios & catalog
│   ├── 0003_saved_plots.sql        # Geospatial plot boundaries & measurements
│   └── 0004_cad_deliverables.sql   # CAD deliverable package metadata columns
├── scripts/                        # Automated test suites & verification harnesses
│   ├── verify-phase1.mjs           # 12-criterion Phase 1 internal loop verification
│   ├── verify-upload.mjs           # 8-criterion architect upload test suite
│   ├── verify-auth.mjs             # Authentication & session verification
│   ├── verify-architect.mjs        # COA registration & verification audit
│   ├── verify-database.mjs         # D1 schema integrity & query verification
│   └── verify-security.mjs         # RBAC, spoofing, and timing attack tests
├── web/                            # Next.js web application
│   ├── app/                        # Next.js App Router (pages & API routes)
│   │   ├── api/                    # Backend REST API routes
│   │   │   ├── architects/         # Public verified architect directory
│   │   │   ├── auth/               # Register, Login, Me, Logout
│   │   │   ├── inquiries/          # Consultation requests & replies
│   │   │   ├── plots/              # Saved geospatial plots & analysis
│   │   │   ├── projects/           # Architectural design catalog & CRUD
│   │   │   ├── upload/             # Guarded blueprint & CAD upload handler
│   │   │   └── users/              # User profiles & verification upgrades
│   │   ├── architects/             # Architect discovery directory page
│   │   ├── dashboard/              # Multi-tier role dashboard (Homeowner/Architect/Admin)
│   │   ├── designs/                # Curated architectural catalog & filter grid
│   │   │   └── [id]/               # Design details, blueprint viewer & purchasing
│   │   ├── plot-intelligence/      # Interactive satellite GIS workspace
│   │   ├── login/ & signup/        # Authentication pages
│   │   └── globals.css             # Design tokens, typography & WCAG focus rings
│   ├── components/                 # Reusable React components
│   │   ├── dashboard/              # StudioProfile, Inquiries, ProjectEditModal
│   │   ├── plot-intelligence/      # MapWorkspace, LocationSearch, Recommendations
│   │   └── ...                     # Hero, Navbar, Footer, FeaturedDesigns
│   ├── lib/                        # Shared utilities, contexts & edge database
│   │   ├── d1.ts                   # Unified Cloudflare D1 edge database interface
│   │   ├── auth-middleware.ts      # Server-side RBAC guards (requireVerifiedArchitect)
│   │   ├── jwt.ts                  # Cryptographic JWT signing & verification
│   │   ├── map-config.ts           # Satellite tile provider & GIS coordinates
│   │   ├── plan-matching.ts        # KMBR setback & plot compatibility matcher
│   │   └── types.ts                # TypeScript type definitions
│   ├── public/                     # Static assets & uploads directory
│   │   ├── uploads/                # plans/, cad/, imagery/ (strictly guarded)
│   │   └── logo.png, logo.svg      # S-ARC branding assets
│   ├── next.config.mjs             # Next.js security headers & compiler config
│   ├── tailwind.config.ts          # Color palette tokens & typography
│   └── tsconfig.json               # TypeScript compiler configuration
├── package.json                    # Workspace root scripts & dependencies
└── wrangler.toml                   # Cloudflare Pages / D1 configuration
```

---

## 5. Getting Started

### Prerequisites
- **Node.js**: `v20.x` or `v24.x`
- **npm** or **pnpm**
- **Cloudflare Wrangler CLI** (optional for remote D1 execution): `npm install -g wrangler`

### Local Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/S_ARC.git
   cd S_ARC
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment configuration into `web/.env`:
   ```bash
   cp web/.env.example web/.env
   ```
   Ensure `JWT_SECRET` is set to a secure string (minimum 32 characters in production).

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 6. Development & Build Scripts

Run these commands from the repository root:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server at `http://localhost:3000` |
| `npm run build` | Compiles the production build, runs typechecking, and generates static export |
| `npm run start` | Starts the production server |
| `npm run typecheck` | Executes TypeScript typecheck (`tsc --noEmit`) with zero errors |
| `npm run lint` | Runs Next.js ESLint checks |
| `npm run admin:provision` | Provisions a secure administrative user account directly into D1 |

---

## 7. Automated Verification & Testing Suites

S-ARC includes automated regression and capability verification suites:

```bash
# Run all automated verification suites
npm run test:all

# Run Phase 1 Internal Loop Closure suite (12/12 passing)
npm run test:phase1

# Run Architect Plan & Deliverable Upload suite (8/8 passing)
npm run test:upload

# Run Security & RBAC authorization tests
npm run test:security

# Run Database schema & D1 integrity tests
npm run test:database

# Run Authentication & Session test suite
npm run test:auth
```

---

## 8. Database Architecture & Migrations

S-ARC runs on **Cloudflare D1** (Serverless Edge SQLite) with local in-memory fallback during development.

### Applying Migrations to Cloudflare D1:

```bash
# Apply all schema migrations sequentially
npm run d1:migrate:all

# Or execute individual migrations:
npm run d1:migrate:initial   # Table schema (users, projects, inquiries, audit_logs)
npm run d1:migrate:seed      # Seed verified Kerala studios and curated blueprints
npm run d1:migrate:plots     # Saved geospatial plot table
npm run d1:migrate:cad       # CAD deliverable package metadata columns

# Check database contents:
npm run d1:status
```

---

## 9. Security & Access Control

- **Edge Cryptography**: User passwords hashed using `bcryptjs` (salt rounds: 11) with constant-time dummy comparisons preventing user enumeration.
- **Signed Tokens**: JWT authentication via `jose` with strict expiration, issuer/audience validation, and secret entropy checks (>32 bytes required).
- **Role Hierarchy**:
  - `homeowner`: Discovers blueprints, requests consultations, saves plots and designs.
  - `architect`: Studio portfolio management, blueprint publishing, inquiry replies, CAD package uploads (guarded by Council of Architecture status verification).
  - `admin`: Platform moderation, architect credential review, audit log inspection.
- **Security Headers**: HSTS, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and restrictive `Permissions-Policy`.

---

## 10. Documentation Index

For in-depth technical documentation, refer to the [`docs/`](docs/) directory:
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Comprehensive technical architecture.
- [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md) — Complete REST endpoint contracts.
- [`docs/DATABASE.md`](docs/DATABASE.md) — Relational schema and indexing design.
- [`docs/SECURITY.md`](docs/SECURITY.md) — Threat modeling, authorization matrix, and audit controls.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Cloudflare Pages & Workers deployment instructions.
- [`docs/DEVELOPMENT_STATUS.md`](docs/DEVELOPMENT_STATUS.md) — Detailed engineering progress and verification logs.
- [`docs/MARKETPLACE_AUDIT.md`](docs/MARKETPLACE_AUDIT.md) — Functional audit across Homeowner, Architect, and Admin journeys.
- [`docs/IMPLEMENTATION_ROADMAP.md`](docs/IMPLEMENTATION_ROADMAP.md) — Upcoming engineering milestones.

---

<div align="center">

**S-ARC (Southern Architecture)** &copy; 2026. All rights reserved.

</div>

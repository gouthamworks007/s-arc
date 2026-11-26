# S-ARC Website Services Inventory

Last verified: **2026-11-26**  
Production domain: **`https://southernarchitecture.in`** (`www.southernarchitecture.in` / `s-arc.gouthamkrishnan991.workers.dev`)

This document tracks every infrastructure service, external API, DNS/email provider, Cloudflare binding, and Worker secret used by **S-ARC (Southern Architecture)**. Update this file whenever a service, provider, or credential is added or replaced.

---

## 1. Core Hosting, Compute & Source Control

| Service | Role | Identifiers / Endpoints | Config Location |
| :--- | :--- | :--- | :--- |
| **Cloudflare Workers & Assets** | Serves `./web/out` static Next.js build + all live `/api/*` & `/uploads/*` routes | Worker: `s-arc` · Account ID: `12e1734f2c0cdf394e243e50f5af6e86` (`gouthamkrishnan991@gmail.com`) | `wrangler.toml`, `worker.ts` |
| **Cloudflare DNS** | Authoritative DNS, proxying, SSL/TLS, Worker custom domain routes | Zone: `southernarchitecture.in` · Zone ID: `4b49dca98449b1ab309fce463a25bf6b` | Cloudflare Dashboard |
| **GitHub** | Git source repository (`main` branch) | `https://github.com/gouthamworks007/s-arc.git` | `.git` |
| **Next.js 14 (App Router)** | Static frontend generation (`web/out`) & local dev API routes | Workspace: `web/` | `web/package.json`, `web/next.config.mjs` |

---

## 2. Database & File Storage

| Service | Role | Identifiers / Binding | Notes |
| :--- | :--- | :--- | :--- |
| **Cloudflare D1** | Primary edge SQLite relational database (`users`, `projects`, `inquiries`, `saved_plots`, `project_packages`, `platform_settings`, `audit_logs`) | Name: `s-arc-db` · ID: `496764fb-0e0f-408d-b5c5-8e8f998526d6` · Binding: `env.DB` | Schemas & seeds in `migrations/` |
| **Cloudflare R2** | Object storage for uploaded avatars, showcase images, PDFs, and CAD/BIM packages (`.dwg`, `.dxf`, `.rvt`, `.skp`, `.zip`) | Bucket: `s-arc-uploads` · Binding: `env.BUCKET` | Served at `/uploads/*` & `POST /api/upload` in `worker.ts` |
| **Browser `localStorage`** | Client-side UI cache / offline fallback (auth cache, project cache, maintenance subscriber notice) | `sarc_*` keys | `web/lib/authContext.tsx`, `web/lib/projectsContext.tsx` |
| **PostgreSQL / Prisma** *(Legacy/Unused in prod)* | Listed in dependencies & `.env.example`; runtime uses Cloudflare D1 | `@prisma/client` | `web/package.json`, `web/.env.example` |

---

## 3. Business Email (Receiving & Sending)

| Service | Role | Active Configuration | Limits / Notes |
| :--- | :--- | :--- | :--- |
| **Cloudflare Email Routing** *(Active Inbound)* | Receives & forwards mail sent to `@southernarchitecture.in` | Rule `6b0b3bae2c3f4f1abfb03ad998809ee0`: `contact@southernarchitecture.in` -> `southernarchitecture1@gmail.com` (`MX`: `route1/2/3.mx.cloudflare.net`) | Free, unlimited inbound routing |
| **Resend** *(Active Outbound)* | Primary transactional email API for website forms (`POST /api/newsletter`, `/api/contact`, `/api/inquiries`, `/api/users/upgrade-request`, architect inquiry replies) | Verified subdomain: `email.southernarchitecture.in` (`efe26763-2f31-45d6-a672-aa4dc6d61f83`, `ap-northeast-1`) · Sender: `contact@email.southernarchitecture.in` · `reply_to: contact@southernarchitecture.in` · Endpoint: `https://api.resend.com/emails` | Free tier: **100 emails/day** (3,000/month); requires Worker secret `RESEND_API_KEY` |
| **Cloudflare Email Service** *(Fallback Binding)* | Native `env.EMAIL` binding (`[[send_email]]`) | Onboarded domain: `southernarchitecture.in` (`tag: 47606f9746f3405ab5123b2f475d6708`) · Bounce DNS on `cf-bounce.southernarchitecture.in` | Free Workers plan restricts sends to verified destination addresses only (`southernarchitecture1@gmail.com`); used only if `RESEND_API_KEY` & `BREVO_API_KEY` are unset |
| **Brevo** *(Standby Support)* | Optional alternative transactional email API supported in code | Endpoint: `https://api.brevo.com/v3/smtp/email` | Inactive unless `BREVO_API_KEY` secret is added and `RESEND_API_KEY` is removed |

---

## 4. Authentication & Security

| Service | Role | Endpoints / Usage | Credentials |
| :--- | :--- | :--- | :--- |
| **Google OAuth 2.0** | "Continue with Google" login & signup | `accounts.google.com/o/oauth2/v2/auth`, `oauth2.googleapis.com/token`, `googleapis.com/oauth2/v3/userinfo` | Worker secrets: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| **JWT (`jose`) + `bcryptjs`** | Stateless session tokens (`sarc_session_token` HttpOnly cookie) & password hashing | Issuer: `s-arc-platform` · Audience: `s-arc-users` | Worker secret: `JWT_SECRET` |
| **Cloudflare Security Headers & Rate Limiter** | Edge HSTS, CSP, CORS, R2 path validation, in-memory sliding-window rate limits | Configured in `worker.ts` | CSP allows Google OAuth, OpenStreetMap, Cloudflare Insights & Challenges |

---

## 5. Maps, Satellite Imagery & GIS

| Service | Role | Endpoints / Libraries | Notes |
| :--- | :--- | :--- | :--- |
| **MapLibre GL & Turf.js** | Interactive parcel polygon drawing, area in Cents/Sq.Ft, KMBR setback geometry | `maplibre-gl` (`6.17.0`), `@turf/turf` (`7.4.0`), local worker `/maplibre-gl-worker.mjs` | `web/components/plot-intelligence/PlotMapWorkspace.tsx` |
| **Esri / ArcGIS Online** *(Default Satellite)* | Satellite imagery & boundary reference labels | `server.arcgisonline.com` & `services.arcgisonline.com` (`World_Imagery`, `World_Boundaries_and_Places`) | `web/lib/map-config.ts` |
| **CARTO + OpenStreetMap** *(Default Standard Map)* | 2D street/top-down raster map tiles | `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png` | `web/lib/map-config.ts` |
| **Mapbox / MapTiler** *(Optional)* | Optional commercial satellite tile overrides via env vars | `NEXT_PUBLIC_MAPBOX_TOKEN`, `NEXT_PUBLIC_MAPTILER_KEY`, `NEXT_PUBLIC_SATELLITE_TILE_URL` | Currently unset in production |
| **OpenStreetMap Nominatim** | Location search & reverse geocoding (Next.js API route) | `https://nominatim.openstreetmap.org/search` & `/reverse` | `web/app/api/geocode/route.ts` |
| **Cloudflare Geo Headers + `ipapi.co`** | Initial map center detection from visitor IP (Next.js API route) | `cf-iplatitude`/`cf-iplongitude` headers or `https://ipapi.co/{ip}/json/` | `web/app/api/geolocation/route.ts` |

---

## 6. Media, Typography & Direct Contact

| Service | Role | Where Used |
| :--- | :--- | :--- |
| **Unsplash (`images.unsplash.com`, `plus.unsplash.com`)** | Seeded / default architectural renders & studio avatar images | `web/next.config.mjs`, `worker.ts`, `web/lib/data.ts` |
| **WhatsApp (`wa.me`)** | Direct studio support link on Maintenance Screen | `https://wa.me/919446077889` in `web/components/MaintenanceScreen.tsx` |
| **Local Self-Hosted Fonts (`next/font/local`)** | Bundled `Cormorant Garamond` & `Space Grotesk` `.ttf` fonts | `web/app/layout.tsx` |

---

## 7. Production Worker Secrets & Bindings

- **Encrypted Worker Secrets (`secret_text`):** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, `RESEND_API_KEY`
- **Public `[vars]`:** `NEXT_PUBLIC_APP_URL = "https://southernarchitecture.in"`
- **Bindings:**
  - `DB` -> Cloudflare D1 (`s-arc-db`)
  - `BUCKET` -> Cloudflare R2 (`s-arc-uploads`)
  - `EMAIL` -> Cloudflare Send Email (unrestricted)
  - `ASSETS` -> `./web/out` static bundle

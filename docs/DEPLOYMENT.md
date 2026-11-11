# S-ARC Cloudflare Deployment Architecture

## 1. Cloudflare Architecture Overview

S-ARC leverages Cloudflare's edge platform for low latency, zero cold starts, and distributed security across India:

```
[ DNS / CDN / DDoS Protection ]
               │
               ▼
[ Cloudflare Pages / Workers (Next.js Edge & SSR) ]
        │                       │
        ▼                       ▼
[ Cloudflare D1 Database ]   [ Cloudflare R2 Storage ]
 (Distributed Edge SQLite)   (CAD Drawings, BOQs, Renders)
```

---

## 2. Configuration Files

### Root `wrangler.toml`

```toml
name = "s-arc-platform"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = "./web/out"

# Cloudflare D1 Native Edge Database Binding
[[d1_databases]]
binding = "DB"
database_name = "s-arc-db"
database_id = "496764fb-0e0f-408d-b5c5-8e8f998526d6"

# Cloudflare R2 Object Storage for Architectural Asset Packages
[[r2_buckets]]
binding = "ASSETS_BUCKET"
bucket_name = "s-arc-assets"
```

---

## 3. Environment Variables Configuration

Set these environment variables in Cloudflare Pages / Workers Dashboard or `.env.local`:

| Variable Name | Description | Required | Example |
| :--- | :--- | :--- | :--- |
| `JWT_SECRET` | 32+ character key for HS256 session token signing | **Yes** | `a9f8b4c2e1d7a6b5c4d3e2f10987654321` |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account Identifier | Yes (REST) | `12e1734f2c0cdf394e243e50f5af6e86` |
| `CLOUDFLARE_D1_DATABASE_ID` | Cloudflare D1 UUID | Yes (REST) | `496764fb-0e0f-408d-b5c5-8e8f998526d6` |
| `CLOUDFLARE_API_TOKEN` | API Token with D1 Edit permissions | Hybrid Mode | `CF_PAT_...` |
| `NEXT_PUBLIC_APP_URL` | Production application URL | **Yes** | `https://s-arc.in` |
| `NEXT_PUBLIC_SATELLITE_TILE_URL` | High-res satellite imagery tile URL template | Optional | Google Hybrid or Esri tiles |

---

## 4. Deployment Instructions

### Option A: Cloudflare Pages with Next-on-Pages (Recommended for SSR & Dynamic API Routes)

```bash
cd web
npm run build
npx @cloudflare/next-on-pages
npx wrangler pages deploy .vercel/output/static --project-name=s-arc-platform
```

### Option B: Cloudflare Workers with Static Assets

```bash
# Build Next.js application & generate static assets
cd web
npm run build

# Deploy assets and edge handlers via Wrangler
cd ..
npx wrangler deploy
```

---

## 5. Cloudflare R2 Architectural Asset Storage Pipeline

All 42-sheet architectural drawing packages, AutoCAD `.dwg` files, structural calculations, and high-resolution render galleries are stored in Cloudflare R2:
- Direct S3-compatible API or signed URLs for secure downloads.
- Purchased packages generate time-limited signed download tokens (15-minute expiry).

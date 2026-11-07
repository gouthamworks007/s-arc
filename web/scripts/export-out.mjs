import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webDir = path.resolve(__dirname, "..");
const nextDir = path.join(webDir, ".next");
const outDir = path.join(webDir, "out");
const serverAppDir = path.join(nextDir, "server", "app");
const staticDir = path.join(nextDir, "static");
const publicDir = path.join(webDir, "public");

console.log("-> Synchronizing Next.js production build artifacts to web/out...");

// 1. Clean and ensure fresh outDir exists
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

// 2. Copy static assets: .next/static -> out/_next/static
const outNextStaticDir = path.join(outDir, "_next", "static");
fs.mkdirSync(outNextStaticDir, { recursive: true });
if (fs.existsSync(staticDir)) {
  fs.cpSync(staticDir, outNextStaticDir, { recursive: true, force: true });
  console.log("  ✓ Static bundles copied to web/out/_next/static");
}

// 3. Copy public directory assets -> out/
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, outDir, { recursive: true, force: true });
  console.log("  ✓ Public assets copied to web/out");
}

// 4. Recursively copy all prerendered HTML, XML, TXT files from server/app to out/
let htmlCount = 0;
let assetCount = 0;
function copyStaticFiles(srcDir, targetDir) {
  if (!fs.existsSync(srcDir)) return;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);

    if (entry.isDirectory()) {
      // Skip internal dynamic route templates like [id] and metadata directories
      if (entry.name !== "[id]" && entry.name !== "api" && !entry.name.endsWith(".txt") && !entry.name.endsWith(".xml")) {
        const subTargetDir = path.join(targetDir, entry.name);
        fs.mkdirSync(subTargetDir, { recursive: true });
        copyStaticFiles(srcPath, subTargetDir);
      }
    } else if (entry.name === "robots.txt.body") {
      fs.copyFileSync(srcPath, path.join(outDir, "robots.txt"));
      assetCount++;
    } else if (entry.name === "sitemap.xml.body") {
      fs.copyFileSync(srcPath, path.join(outDir, "sitemap.xml"));
      assetCount++;
    } else if (entry.name.endsWith(".html")) {
      let destName = entry.name;
      if (destName === "_not-found.html") {
        destName = "404.html";
      }
      fs.copyFileSync(srcPath, path.join(targetDir, destName));
      htmlCount++;

      // Create folder/index.html mirror for clean routing support
      if (destName.endsWith(".html") && destName !== "index.html" && destName !== "404.html") {
        const slug = destName.replace(/\.html$/, "");
        const subFolder = path.join(targetDir, slug);
        fs.mkdirSync(subFolder, { recursive: true });
        fs.copyFileSync(srcPath, path.join(subFolder, "index.html"));
      }
    } else if (entry.name.endsWith(".xml") || entry.name.endsWith(".txt") || entry.name.endsWith(".json")) {
      fs.copyFileSync(srcPath, path.join(targetDir, entry.name));
      assetCount++;
    }
  }
}

copyStaticFiles(serverAppDir, outDir);
console.log(`  ✓ Copied ${htmlCount} prerendered HTML pages and ${assetCount} metadata assets to web/out`);

// 5. Ensure 404.html exists
const out404 = path.join(outDir, "404.html");
if (!fs.existsSync(out404) && fs.existsSync(path.join(outDir, "index.html"))) {
  fs.copyFileSync(path.join(outDir, "index.html"), out404);
}

// 6. Ensure robots.txt exists as a file in out/
const outRobots = path.join(outDir, "robots.txt");
const robotsStat = fs.existsSync(outRobots) ? fs.statSync(outRobots) : null;
if (!robotsStat || robotsStat.isDirectory()) {
  if (robotsStat && robotsStat.isDirectory()) {
    fs.rmSync(outRobots, { recursive: true, force: true });
  }
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/

Sitemap: https://s-arc.pages.dev/sitemap.xml
`;
  fs.writeFileSync(outRobots, robotsTxt, "utf8");
  console.log("  ✓ Generated fallback robots.txt in web/out");
}

// 7. Ensure sitemap.xml exists as a file in out/
const outSitemap = path.join(outDir, "sitemap.xml");
const sitemapStat = fs.existsSync(outSitemap) ? fs.statSync(outSitemap) : null;
if (!sitemapStat || sitemapStat.isDirectory()) {
  if (sitemapStat && sitemapStat.isDirectory()) {
    fs.rmSync(outSitemap, { recursive: true, force: true });
  }
  const now = new Date().toISOString();
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://s-arc.pages.dev/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://s-arc.pages.dev/designs</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://s-arc.pages.dev/architects</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://s-arc.pages.dev/styles</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://s-arc.pages.dev/how-it-works</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
  fs.writeFileSync(outSitemap, sitemapXml, "utf8");
  console.log("  ✓ Generated fallback sitemap.xml in web/out");
}

console.log("✓ Successfully prepared web/out for Cloudflare production deployment.\n");


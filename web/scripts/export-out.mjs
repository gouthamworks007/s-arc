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

// 1. Ensure outDir exists
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

// 4. Recursively copy all prerendered HTML files from server/app to out/
let htmlCount = 0;
function copyHtmlFiles(srcDir, targetDir) {
  if (!fs.existsSync(srcDir)) return;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);

    if (entry.isDirectory()) {
      // Skip internal dynamic route templates like [id]
      if (entry.name !== "[id]" && entry.name !== "api") {
        const subTargetDir = path.join(targetDir, entry.name);
        fs.mkdirSync(subTargetDir, { recursive: true });
        copyHtmlFiles(srcPath, subTargetDir);
      }
    } else if (entry.name.endsWith(".html")) {
      let destName = entry.name;
      if (destName === "_not-found.html") {
        destName = "404.html";
      }
      fs.copyFileSync(srcPath, path.join(targetDir, destName));
      htmlCount++;
    }
  }
}

copyHtmlFiles(serverAppDir, outDir);
console.log(`  ✓ Copied ${htmlCount} prerendered HTML pages to web/out`);

// 5. Ensure 404.html exists
const out404 = path.join(outDir, "404.html");
if (!fs.existsSync(out404) && fs.existsSync(path.join(outDir, "index.html"))) {
  fs.copyFileSync(path.join(outDir, "index.html"), out404);
}

console.log("✓ Successfully prepared web/out for Cloudflare production deployment.\n");


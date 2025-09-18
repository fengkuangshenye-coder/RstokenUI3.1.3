// scripts/fix-router.js
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const appDir = path.join(root, "src", "app");
const pagesDir = path.join(root, "src", "pages");
const appPage = path.join(appDir, "page.tsx");
const pagesIndex = path.join(pagesDir, "index.tsx");

function rmrf(p) {
  if (!fs.existsSync(p)) return;
  fs.rmSync(p, { recursive: true, force: true });
  console.log(`[fix-router] removed: ${p}`);
}

try {
  const hasPagesIndex = fs.existsSync(pagesIndex);
  const hasAppPage = fs.existsSync(appPage);

  if (hasPagesIndex && hasAppPage) {
    // 优先保留 Pages Router，删除 app 目录
    rmrf(appDir);
    console.log("[fix-router] Found both routers. Kept Pages Router and removed src/app/");
  } else {
    console.log("[fix-router] OK. No router conflict.");
  }
} catch (e) {
  console.error("[fix-router] error:", e);
  // 不要让脚本失败而阻断构建
  process.exit(0);
}




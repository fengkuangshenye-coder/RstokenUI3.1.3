// scripts/fix-router.js
// 移除 Next.js App Router 与 Pages Router 冲突文件
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const pagesDir = path.join(root, "pages");
const appDir = path.join(root, "app");

// 要删除的冲突文件（如果存在）
const conflictFiles = [
  "index.tsx",
  "index.jsx",
  "_app.tsx",
  "_app.jsx",
  "_document.tsx",
  "_document.jsx"
].map(f => path.join(pagesDir, f));

function rm(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        fs.unlinkSync(filePath);
        console.log("✔ removed file:", path.relative(root, filePath));
      }
    }
  } catch (e) {
    console.warn("skip:", filePath, e.message);
  }
}

function rmdirIfEmpty(dir) {
  try {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    // 如果只剩下 api/，则保留；如果完全空了，就删除
    if (items.length === 0) {
      fs.rmdirSync(dir);
      console.log("✔ removed empty folder:", path.relative(root, dir));
    } else if (items.length === 1 && items[0] === "api") {
      console.log("ℹ keep 'pages/api' for serverless functions");
    } else {
      console.log("ℹ keep 'pages' with:", items.join(", "));
    }
  } catch (e) {
    console.warn("skip rmdir:", dir, e.message);
  }
}

(function main() {
  console.log("— Fix Next.js app/pages router conflict —");

  // 若没有 app 目录，就不做任何事（说明是 Pages Router 项目）
  if (!fs.existsSync(appDir)) {
    console.log("No 'app' dir found, skip.");
    return;
  }

  // 有 app 目录 => 强制删除 pages 下冲突文件
  if (fs.existsSync(pagesDir)) {
    conflictFiles.forEach(rm);
    rmdirIfEmpty(pagesDir);
  }

  console.log("Done.");
})();



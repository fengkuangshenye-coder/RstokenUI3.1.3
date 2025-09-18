// scripts/fix-router.js
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const pagesDir = path.join(root, "pages");

// 这些是会与 App Router 冲突的典型文件
const candidates = [
  path.join(pagesDir, "index.tsx"),
  path.join(pagesDir, "index.jsx"),
  path.join(pagesDir, "_app.tsx"),
  path.join(pagesDir, "_app.jsx"),
  path.join(pagesDir, "_document.tsx"),
  path.join(pagesDir, "_document.jsx"),
];

function safeUnlink(p) {
  try {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      fs.unlinkSync(p);
      console.log("✔ removed:", path.relative(root, p));
    }
  } catch (e) {
    console.warn("skip:", p, e.message);
  }
}

function cleanupEmptyPagesDir() {
  try {
    if (!fs.existsSync(pagesDir)) return;
    const remain = fs.readdirSync(pagesDir);
    // pages 目录如果为空就删掉；如果还留有 api/ 之类就保留
    if (remain.length === 0) {
      fs.rmdirSync(pagesDir);
      console.log("✔ removed empty folder: pages");
    } else {
      console.log("ℹ keep 'pages' folder with:", remain.join(", "));
    }
  } catch (e) {
    console.warn("skip removing 'pages':", e.message);
  }
}

console.log("— Fix Next.js app/pages router conflict —");
candidates.forEach(safeUnlink);
cleanupEmptyPagesDir();
console.log("Done.");

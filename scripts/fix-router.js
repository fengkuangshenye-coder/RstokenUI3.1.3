// scripts/fix-router.js
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const pagesDir = path.join(root, "pages");

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
    // 如果只剩 api 或空，可以保留；如果空就删除
    if (remain.length === 0) {
      fs.rmdirSync(pagesDir);
      console.log("✔ removed empty folder:", "pages");
    } else {
      console.log("ℹ keep 'pages' folder with:", remain.join(", "));
    }
  } catch (e) {
    console.warn("skip removing 'pages':", e.message);
  }
}

console.log("— Fix Next.js router conflict —");
candidates.forEach(safeUnlink);
cleanupEmptyPagesDir();
console.log("Done.");

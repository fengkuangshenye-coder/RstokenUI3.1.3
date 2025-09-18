// scripts/fix-router.js
const fs = require("fs");
const path = require("path");

const appPage = path.join(process.cwd(), "app", "page.tsx");
const pagesIndex = path.join(process.cwd(), "pages", "index.tsx");

try {
  // 确保不是双路由并存
  if (fs.existsSync(appPage) && fs.existsSync(pagesIndex)) {
    fs.unlinkSync(pagesIndex);
    console.log('Removed "pages/index.tsx" because "app/page.tsx" exists.');
  }

  // 如果两边都没有主页，自动建一个 App Router 的
  if (!fs.existsSync(appPage) && !fs.existsSync(pagesIndex)) {
    fs.mkdirSync(path.join(process.cwd(), "app"), { recursive: true });
    fs.writeFileSync(
      appPage,
      `export default function Page(){return <div style={{color:"#fff",padding:"24px"}}>Hello RSUI</div>}\n`,
      "utf8"
    );
    console.log('Created "app/page.tsx".');
  }
} catch (e) {
  console.warn("[fix-router] skipped:", e?.message);
}



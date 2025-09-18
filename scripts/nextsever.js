/**
 * nextsever —— 一键修常见 Next/Tailwind/Recharts/Router 问题，并可直接 dev/build/start
 * 用法：
 *   node scripts/nextsever.js --fix
 *   node scripts/nextsever.js --dev [--port 3000]
 *   node scripts/nextsever.js --build
 *   node scripts/nextsever.js --start [--port 3000]
 *   node scripts/nextsever.js --install   // 按需自动安装缺失依赖
 */

"use strict";

const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const net = require("net");

const CWD = process.cwd();
const SRC = path.join(CWD, "src");

function log(ok, msg) { console.log(`${ok ? "✔" : "•"} ${msg}`); }
function warn(msg) { console.warn(`! ${msg}`); }
function exists(p) { try { fs.accessSync(p); return true; } catch { return false; } }
function read(p) { return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : ""; }
function write(p, content) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, content); }
function jsonRead(p) { try { return JSON.parse(read(p) || "{}"); } catch { return {}; } }
function jsonWrite(p, obj) { write(p, JSON.stringify(obj, null, 2) + "\n"); }
function run(cmd, args, opts={}) { cp.spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32", ...opts }); }

function getFlag(flag, def) {
  const i = process.argv.findIndex(a => a === flag);
  if (i === -1) return def;
  const v = process.argv[i+1];
  if (!v || v.startsWith("--")) return true;
  return v;
}

async function findOpenPort(start=3000, end=3010) {
  const tryPort = (port) => new Promise((resolve) => {
    const server = net.createServer()
      .once("error", () => resolve(false))
      .once("listening", () => { server.close(() => resolve(true)); })
      .listen(port, "0.0.0.0");
  });
  for (let p=start; p<=end; p++) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await tryPort(p);
    if (ok) return p;
  }
  return start;
}

/* ---------------------- 修复项 ---------------------- */
function fixRouterConflict() {
  const app1 = path.join(CWD, "app");
  const app2 = path.join(SRC, "app");
  const pages = path.join(CWD, "pages");
  const pagesSrc = path.join(SRC, "pages");
  const hasApp = exists(app1) || exists(app2);
  const hasPages = exists(pages) || exists(pagesSrc);
  if (hasApp && hasPages) {
    const target = exists(app2) ? app2 : app1;
    const disabled = `${target}__disabled_${Date.now()}`;
    fs.renameSync(target, disabled);
    log(true, `检测到 App/Pages 冲突，已禁用：${path.relative(CWD, disabled)}`);
  } else {
    log(true, "Router 检查通过（无冲突）");
  }
}

function ensurePostcssConfig() {
  const p = path.join(CWD, "postcss.config.js");
  const want = `module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
`;
  const cur = read(p);
  if (!cur.includes('"@tailwindcss/postcss"') && !cur.includes("'@tailwindcss/postcss'")) {
    write(p, want);
    log(true, "已写入 postcss.config.js（@tailwindcss/postcss）");
  } else {
    log(true, "postcss.config.js 已正确配置 @tailwindcss/postcss");
  }
}

function ensureGlobalsCss() {
  const p = path.join(SRC, "styles", "globals.css");
  const base = `@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #__next { height: 100%; }
`;
  let cur = read(p);
  if (!cur.trim()) {
    write(p, base);
    log(true, "已写入 src/styles/globals.css");
  } else if (!cur.includes("@tailwind base")) {
    write(p, base + "\n" + cur);
    log(true, "已补齐 src/styles/globals.css 的 @tailwind 指令");
  } else {
    log(true, "globals.css 检查通过");
  }
}

function ensureTsconfig() {
  const p = path.join(CWD, "tsconfig.json");
  const j = jsonRead(p);
  j.compilerOptions = j.compilerOptions || {};
  const c = j.compilerOptions;
  c.baseUrl = c.baseUrl || ".";
  c.paths = c.paths || { "@/*": ["src/*"] };
  c.esModuleInterop = true;
  c.skipLibCheck = true;
  j.include = Array.from(new Set([...(j.include || []), "next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]));
  jsonWrite(p, j);
  log(true, "tsconfig.json 检查/修复完成");
}

function ensurePkgScriptsAndEngines() {
  const p = path.join(CWD, "package.json");
  const j = jsonRead(p);
  j.scripts = j.scripts || {};
  j.scripts["prebuild"] = j.scripts["prebuild"] || "node scripts/fix-router.js";
  j.scripts["build"] = j.scripts["build"] || "next build";
  j.scripts["dev"] = j.scripts["dev"] || "next dev";
  j.scripts["start"] = j.scripts["start"] || "next start";
  j.scripts["nextsever:fix"] = "node scripts/nextsever.js --fix";
  j.scripts["nextsever:dev"] = "node scripts/nextsever.js --dev";
  j.scripts["nextsever:build"] = "node scripts/nextsever.js --build";
  j.scripts["nextsever:start"] = "node scripts/nextsever.js --start";
  j.engines = j.engines || {};
  j.engines.node = j.engines.node || ">=18.18.0 <23";
  jsonWrite(p, j);
  log(true, "package.json scripts/engines 已检查/补齐");
}

function ensureFixRouterFile() {
  const p = path.join(CWD, "scripts", "fix-router.js");
  if (exists(p)) { log(true, "scripts/fix-router.js 已存在"); return; }
  const content = `// scripts/fix-router.js
const fs = require('fs');
const path = require('path');
const CWD = process.cwd();
function exists(p) { try { fs.accessSync(p); return true; } catch { return false; } }
const app1 = path.join(CWD, "app");
const app2 = path.join(CWD, "src", "app");
const pages1 = path.join(CWD, "pages");
const pages2 = path.join(CWD, "src", "pages");
const hasApp = exists(app1) || exists(app2);
const hasPages = exists(pages1) || exists(pages2);
if (hasApp && hasPages) {
  const target = exists(app2) ? app2 : app1;
  const disabled = \`\${target}__disabled_\${Date.now()}\`;
  require('fs').renameSync(target, disabled);
  console.log("[fix-router] Found both routers. Kept Pages Router and removed", disabled);
} else {
  console.log("[fix-router] OK. No router conflict.");
}
`;
  write(p, content);
  log(true, "已写入 scripts/fix-router.js");
}

function ensureTailwindConfig() {
  const p = path.join(CWD, "tailwind.config.ts");
  if (!exists(p)) return;
  let cur = read(p);
  const wantContent = [
    "'./pages/**/*.{ts,tsx,js,jsx,mdx}'",
    "'./src/**/*.{ts,tsx,js,jsx,mdx}'",
  ];
  let changed = false;
  wantContent.forEach((pat) => {
    if (!cur.includes(pat)) { cur = cur.replace("content: [", `content: [\n    ${pat},`); changed = true; }
  });
  if (changed) { write(p, cur); log(true, "tailwind.config.ts 已补充 content globs"); }
  else { log(true, "tailwind.config.ts 检查通过"); }
}

function ensureRsuiImports() {
  const rsui = path.join(SRC, "components", "RSUI32.tsx");
  if (!exists(rsui)) return;
  let s = read(rsui);

  // 1) OracleGlobe 改为默认导入
  if (s.includes('import { OracleGlobe } from "./OracleGlobe"')) {
    s = s.replace('import { OracleGlobe } from "./OracleGlobe"', 'import OracleGlobe from "./OracleGlobe"');
    log(true, "RSUI32.tsx：已将 { OracleGlobe } 改为默认导入");
  }

  // 2) 注入 Recharts Pie 的 label 渲染器（修复 TS unknown）
  const helperMarker = "renderPiePercentLabel";
  if (!s.includes(helperMarker)) {
    const afterImport = s.indexOf("from \"recharts\"") >= 0 ? s.indexOf("from \"recharts\"") : s.indexOf("from 'recharts'");
    if (afterImport >= 0) {
      const endLine = s.indexOf("\n", afterImport);
      const helper = `

// --- auto-injected by nextsever: typed label renderer for Recharts Pie
type PieLabelPayload = { percent?: number };
const renderPiePercentLabel = ({ percent }: PieLabelPayload) => \`\${(((percent ?? 0) * 100)).toFixed(0)}%\`;
`;
      s = s.slice(0, endLine + 1) + helper + s.slice(endLine + 1);
      log(true, "RSUI32.tsx：已注入 Pie 标签渲染器");
    }
  }

  // 3) 将 <Pie label={...percent...}> 改成 label={renderPiePercentLabel}
  if (/label=\{[^}]*percent[^}]*\}/m.test(s)) {
    s = s.replace(/label=\{[^}]*percent[^}]*\}/m, "label={renderPiePercentLabel}");
    if (!/labelLine=/.test(s)) {
      s = s.replace(/(<Pie[\\s\\S]*?)(>)/m, (_m, a, b) => a + `\n  labelLine={false}\n` + b);
    }
    log(true, "RSUI32.tsx：已替换 Pie 的 label 为 renderPiePercentLabel");
  }

  write(rsui, s);
}

/** ✅ 修复点：去掉有风险的正则，改用字符串检测，避免 Unterminated group */
function ensureOracleGlobeDefaultExport() {
  const p = path.join(SRC, "components", "OracleGlobe.tsx");
  if (!exists(p)) return;
  let s = read(p);

  // 已有默认导出就跳过
  if (/export\s+default\s+function\s+OracleGlobe/.test(s) || /export\s+default\s+OracleGlobe/.test(s)) {
    log(true, "OracleGlobe.tsx：默认导出已存在");
    return;
  }

  // 文件中存在函数或常量定义时，补上一行默认导出
  if (s.includes("function OracleGlobe(") || s.includes("const OracleGlobe =")) {
    if (!s.endsWith("\n")) s += "\n";
    s += "\nexport default OracleGlobe;\n";
    write(p, s);
    log(true, "OracleGlobe.tsx：已补充 export default OracleGlobe");
  } else {
    log(true, "OracleGlobe.tsx：未检测到 OracleGlobe 定义（跳过）");
  }
}

function ensureDeps(install = false) {
  const p = path.join(CWD, "package.json");
  const j = jsonRead(p);
  j.dependencies = j.dependencies || {};
  j.devDependencies = j.devDependencies || {};
  const needDeps = {
    "next": j.dependencies.next || "14.2.7",
    "react": j.dependencies.react || "18.2.0",
    "react-dom": j.dependencies["react-dom"] || "18.2.0",
    "lucide-react": j.dependencies["lucide-react"] || "0.426.0",
    "recharts": j.dependencies.recharts || "^2.12.7",
    "clsx": j.dependencies.clsx || "^2.1.1",
    "class-variance-authority": j.dependencies["class-variance-authority"] || "^0.7.0",
    "tailwind-merge": j.dependencies["tailwind-merge"] || "^2.2.1",
    "@radix-ui/react-accordion": j.dependencies["@radix-ui/react-accordion"] || "^1.2.0",
    "tailwindcss": j.dependencies.tailwindcss || "^3.4.10",
    "postcss": j.dependencies.postcss || "^8.4.40",
    "autoprefixer": j.dependencies.autoprefixer || "^10.4.20",
    "@tailwindcss/postcss": j.dependencies["@tailwindcss/postcss"] || "^4.0.0"
  };
  const needDev = {
    "typescript": j.devDependencies.typescript || "^5.4.5",
    "@types/react": j.devDependencies["@types/react"] || "^18.2.66",
    "@types/node": j.devDependencies["@types/node"] || "^20.12.7"
  };
  let changed = false;
  for (const [k, v] of Object.entries(needDeps)) { if (!j.dependencies[k]) { j.dependencies[k] = v; changed = true; } }
  for (const [k, v] of Object.entries(needDev)) { if (!j.devDependencies[k]) { j.devDependencies[k] = v; changed = true; } }
  if (changed) {
    jsonWrite(p, j);
    log(true, "package.json 依赖已补齐");
    if (install) { log(true, "正在安装缺失依赖（npm install）..."); run("npm", ["install"]); }
    else { warn("依赖有变更：请运行 `npm install` 安装"); }
  } else {
    log(true, "依赖检查通过");
  }
}

/* ---------------------- 主流程 ---------------------- */
(async function main() {
  const doFix = !!getFlag("--fix", false) || !!getFlag("--dev", false) || !!getFlag("--build", false) || !!getFlag("--start", false);
  const doInstall = !!getFlag("--install", false);
  const portArg = getFlag("--port", null);
  const cmdDev = !!getFlag("--dev", false);
  const cmdBuild = !!getFlag("--build", false);
  const cmdStart = !!getFlag("--start", false);

  if (doFix) {
    ensurePkgScriptsAndEngines();
    ensureFixRouterFile();
    fixRouterConflict();
    ensurePostcssConfig();
    ensureGlobalsCss();
    ensureTailwindConfig();
    ensureTsconfig();
    ensureRsuiImports();
    ensureOracleGlobeDefaultExport();
    ensureDeps(doInstall);
    log(true, "全部修复步骤完成");
  }

  if (cmdDev) {
    const port = portArg ? Number(portArg) : await findOpenPort(3000, 3010);
    log(true, `以 Next Dev 启动，端口：${port}`);
    run("npx", ["next", "dev", "-p", String(port)]);
    return;
  }

  if (cmdBuild) {
    log(true, "开始构建（next build）");
    run("npx", ["next", "build"]);
    return;
  }

  if (cmdStart) {
    const port = portArg ? Number(portArg) : 3000;
    log(true, `以 Next Start 启动，端口：${port}`);
    run("npx", ["next", "start", "-p", String(port)]);
    return;
  }

  if (!doFix && !cmdDev && !cmdBuild && !cmdStart) {
    console.log(`
用法：
  node scripts/nextsever.js --fix [--install]
  node scripts/nextsever.js --dev [--port 3000]
  node scripts/nextsever.js --build
  node scripts/nextsever.js --start [--port 3000]
`);
  }
})();

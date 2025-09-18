const fs = require("fs");
const path = require("path");
const file = path.join(process.cwd(), "src", "components", "RSUI32.tsx");
if (!fs.existsSync(file)) {
  console.log("[fix-rsui32] skip: src/components/RSUI32.tsx not found");
  process.exit(0);
}
let s = fs.readFileSync(file, "utf8");

// 全角符号转 ASCII
s = s
  .replace(/[“”]/g, '"')
  .replace(/[‘’]/g, "'")
  .replace(/，/g, ",")
  .replace(/；/g, ";")
  .replace(/：/g, ":")
  .replace(/（/g, "(")
  .replace(/）/g, ")")
  .replace(/【/g, "[")
  .replace(/】/g, "]")
  .replace(/。/g, ".")
  .replace(/\u00A0/g, " ");

// Recharts 标签函数：percent 类型兜底
s = s.replace(
  /label=\{\(\{\s*percent\s*\}\)\s*=>\s*`?\$\{\(percent\s*\*\s*100\)\.toFixed\(0\)\}%`?\s*\}\}/g,
  'label={(entry: any) => `${((entry?.percent ?? 0) * 100).toFixed(0)}%`}'
);

// OracleGlobe 使用 default 导入
s = s.replace(
  /import\s*\{\s*OracleGlobe\s*\}\s*from\s*["']\.\/OracleGlobe["'];?/g,
  'import OracleGlobe from "./OracleGlobe";'
);

fs.writeFileSync(file, s, "utf8");
console.log("[fix-rsui32] RSUI32.tsx 已修复");

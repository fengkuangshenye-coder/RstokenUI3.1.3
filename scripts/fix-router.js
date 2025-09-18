const fs = require("fs");
const path = require("path");
const CWD = process.cwd();
const app1 = path.join(CWD, "app");
const app2 = path.join(CWD, "src", "app");
function rm(p){ if (fs.existsSync(p)) fs.rmSync(p, { recursive:true, force:true }); }

if (fs.existsSync(app1) || fs.existsSync(app2)) {
  rm(app1); rm(app2);
  console.log("[fix-router] Removed App Router directories to keep Pages Router.");
} else {
  console.log("[fix-router] OK. No router conflict.");
}

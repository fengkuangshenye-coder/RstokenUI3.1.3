param(
  [switch],
  [switch],
  [switch],
  [int] = 3000
)

Continue = "Stop"

function Info(){ Write-Host "∙ " -ForegroundColor Cyan }
function Ok(){ Write-Host "✔ " -ForegroundColor Green }
function Warn(){ Write-Host "! " -ForegroundColor Yellow }
function Err(){ Write-Host "✘ " -ForegroundColor Red }

#--------------- 基础检查 ---------------
 = Get-Location
if (!(Test-Path "\package.json")) {
  Err "未在项目根目录运行。请切到项目根再执行。当前："
  exit 1
}

New-Item -ItemType Directory -Path "\scripts" -Force | Out-Null
New-Item -ItemType Directory -Path "\src\components\ui" -Force | Out-Null
New-Item -ItemType Directory -Path "\src\pages" -Force | Out-Null
New-Item -ItemType Directory -Path "\src\styles" -Force | Out-Null
New-Item -ItemType Directory -Path "\src\lib" -Force | Out-Null
Ok "目录就绪"

#--------------- package.json 修复（scripts/engines/deps） ---------------
 = "\package.json"
  = Get-Content  -Raw -Encoding UTF8
 =  | ConvertFrom-Json

if (-not .scripts) {  | Add-Member -MemberType NoteProperty -Name scripts -Value (@{}) }
.scripts.prebuild = "node scripts/fix-router.js"
.scripts."fix:rsui32" = "node scripts/fix-rsui32.js"
.scripts.build = "next build"
.scripts.dev   = "next dev"
.scripts.start = "next start"

if (-not .engines) {  | Add-Member -MemberType NoteProperty -Name engines -Value (@{}) }
.engines.node = "20.x"

function EnsureDep(,,=False) {
   =  ? .devDependencies : .dependencies
  if (-not ) {
    if () {  | Add-Member NoteProperty devDependencies (@{}) }
    else {  | Add-Member NoteProperty dependencies (@{}) }
     =  ? .devDependencies : .dependencies
  }
  . = 
}

# runtime deps
EnsureDep "next" "14.2.7" False
EnsureDep "react" "18.2.0" False
EnsureDep "react-dom" "18.2.0" False
EnsureDep "recharts" "2.12.7" False
EnsureDep "clsx" "2.1.1" False
EnsureDep "class-variance-authority" "0.7.0" False
EnsureDep "tailwind-merge" "2.2.1" False
EnsureDep "lucide-react" "0.400.0" False
EnsureDep "@radix-ui/react-accordion" "1.2.0" False
EnsureDep "@radix-ui/react-slot" "1.0.2" False

# dev deps（Tailwind v3 + PostCSS8）
EnsureDep "typescript" "5.4.5" True
EnsureDep "@types/react" "18.2.66" True
EnsureDep "@types/node" "20.14.10" True
EnsureDep "tailwindcss" "3.4.13" True
EnsureDep "postcss" "8.4.47" True
EnsureDep "autoprefixer" "10.4.19" True

# 删除 tailwind v4 的 @tailwindcss/postcss（避免冲突）
if (.dependencies.'@tailwindcss/postcss') { .dependencies.PSObject.Properties.Remove('@tailwindcss/postcss') }
if (.devDependencies.'@tailwindcss/postcss') { .devDependencies.PSObject.Properties.Remove('@tailwindcss/postcss') }

 | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 
Ok "package.json 已修复（scripts/engines/deps）"

#--------------- fix-router.js ---------------
 = @'
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
'@
Set-Content -Encoding UTF8 "\scripts\fix-router.js" 
Ok "scripts/fix-router.js 就绪"

#--------------- fix-rsui32.js ---------------
 = @'
const fs = require("fs");
const path = require("path");
const file = path.join(process.cwd(), "src", "components", "RSUI32.tsx");
if (!fs.existsSync(file)) {
  console.log("[fix-rsui32] skip: src/components/RSUI32.tsx not found");
  process.exit(0);
}
let s = fs.readFileSync(file, "utf8");

// 全角 -> ASCII
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

// Recharts label percent 类型兜底
s = s.replace(
  /label=\{\(\{\s*percent\s*\}\)\s*=>\s*?\$\{\(percent\s*\*\s*100\)\.toFixed\(0\)\}%?\s*\}\}/g,
  'label={(entry: any) => ${((entry?.percent ?? 0) * 100).toFixed(0)}%}'
);

// OracleGlobe 用 default 导入
s = s.replace(
  /import\s*\{\s*OracleGlobe\s*\}\s*from\s*["']\.\/OracleGlobe["'];?/,
  'import OracleGlobe from "./OracleGlobe";'
);

fs.writeFileSync(file, s, "utf8");
console.log("[fix-rsui32] RSUI32.tsx 已修复");
'@
Set-Content -Encoding UTF8 "\scripts\fix-rsui32.js" 
Ok "scripts/fix-rsui32.js 就绪"

#--------------- postcss.config.js（Tailwind v3） ---------------
 = @'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
'@
Set-Content -Encoding UTF8 "\postcss.config.js" 
Ok "postcss.config.js 就绪"

#--------------- tailwind.config.ts ---------------
 = @'
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx,js,jsx}",
    "./src/components/**/*.{ts,tsx,js,jsx}",
    "./src/app/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)"
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out"
      }
    }
  },
  plugins: [],
} satisfies Config;
'@
Set-Content -Encoding UTF8 "\tailwind.config.ts" 
Ok "tailwind.config.ts 就绪（支持 border-border 等语义色）"

#--------------- globals.css ---------------
 = @'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 222 47% 5%;
  --foreground: 210 40% 98%;
  --muted: 215 27.9% 16.9%;
  --muted-foreground: 217.9 10.6% 64.9%;
  --popover: 222 47% 5%;
  --popover-foreground: 210 40% 98%;
  --card: 222 47% 7%;
  --card-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --primary: 199 89% 60%;
  --primary-foreground: 222 47% 5%;
  --secondary: 263 83% 71%;
  --secondary-foreground: 222 47% 5%;
  --accent: 173 100% 43%;
  --accent-foreground: 222 47% 5%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
}

html, body, #__next { height: 100%; }
body { background-color: hsl(var(--background)); color: hsl(var(--foreground)); }
'@
Set-Content -Encoding UTF8 "\src\styles\globals.css" 
Ok "src/styles/globals.css 就绪"

#--------------- tsconfig.json ---------------
 = @'
{
  "compilerOptions": {
    "target": "ES2021",
    "lib": ["ES2021", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "preserve",
    "resolveJsonModule": true,
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["node", "react"]
  },
  "include": ["next-env.d.ts", "src/**/*", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
'@
Set-Content -Encoding UTF8 "\tsconfig.json" 
Ok "tsconfig.json 就绪（@/ 路径别名）"

#--------------- src/lib/utils.ts ---------------
 = @'
import { type ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
'@
Set-Content -Encoding UTF8 "\src\lib\utils.ts" 
Ok "src/lib/utils.ts 就绪"

#--------------- UI 组件：button/card/badge/accordion/input ---------------
 = @'
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-95",
        secondary: "bg-secondary text-secondary-foreground hover:opacity-95",
        outline: "border border-border bg-transparent hover:bg-muted/30",
        ghost: "hover:bg-muted/30",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-95"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-6",
        icon: "h-10 w-10 p-0"
      }
    },
    defaultVariants: { variant: "default", size: "default" }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp: any = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
'@
Set-Content -Encoding UTF8 "\src\components\ui\button.tsx" 

 = @'
import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-border bg-card text-card-foreground shadow", className)}
      {...props}
    />
  );
}
function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}
function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />;
}
function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardContent };
'@
Set-Content -Encoding UTF8 "\src\components\ui\card.tsx" 

 = @'
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "secondary",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" }) {
  const styles =
    variant === "default"
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-muted-foreground";
  return <div className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs", styles, className)} {...props} />;
}
'@
Set-Content -Encoding UTF8 "\src\components\ui\badge.tsx" 

 = @'
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("border-b border-border", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-left font-medium transition-all hover:underline",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn("overflow-hidden text-sm data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up", className)}
    {...props}
  >
    <div className="pb-4 pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
'@
Set-Content -Encoding UTF8 "\src\components\ui\accordion.tsx" 

 = @'
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        , className)}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
'@
Set-Content -Encoding UTF8 "\src\components\ui\input.tsx" 

Ok "UI 组件已写入（含 border-border 语义色支持）"

#--------------- Pages Router 入口 ---------------
 = @'
import "@/styles/globals.css";
import Head from "next/head";
import RSUI32 from "@/components/RSUI32";

export default function Home() {
  return (
    <>
      <Head>
        <title>RStoken UI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <RSUI32 />
    </>
  );
}
'@
Set-Content -Encoding UTF8 "\src\pages\index.tsx" 
Ok "src/pages/index.tsx 就绪"

#--------------- 删除 App Router 与缓存 ---------------
if (Test-Path "\app")     { Remove-Item "\app" -Recurse -Force }
if (Test-Path "\src\app") { Remove-Item "\src\app" -Recurse -Force }
if (Test-Path "\.next")   { Remove-Item "\.next" -Recurse -Force }
if (Test-Path "\.turbo")  { Remove-Item "\.turbo" -Recurse -Force }
Ok "已删除 App Router 与构建缓存"

#--------------- 运行 RSUI32 修复 ---------------
try { node "\scripts\fix-rsui32.js" | Write-Host } catch { Warn .Exception.Message }

#--------------- 安装依赖 ---------------
if () {
  Info "安装依赖（npm install）..."
  npm install | Write-Host
  Ok "依赖安装完成"
} else {
  Warn "跳过安装依赖（如需自动安装请加 -Install）"
}

#--------------- 启动 / 构建 ---------------
function Kill-PortIfBusy(){
  try {
     = netstat -ano | Select-String ":\s+.*LISTENING\s+(\d+)$"
    if () {
      22648 = [int](.Matches.Groups[1].Value)
      Warn "端口  被进程 22648 占用，尝试结束..."
      Stop-Process -Id 22648 -Force -ErrorAction SilentlyContinue
      Start-Sleep -s 1
      Ok "端口  已释放"
    }
  } catch {}
}

if () {
  Info "开始构建..."
  npm run build
  Ok "构建完成"
} elseif () {
  Kill-PortIfBusy 
  Info "启动开发服务器（端口 ）..."
   = ""
  npm run dev
} else {
  Ok "修复完成。如需启动：npm run dev；如需打包：npm run build"
}

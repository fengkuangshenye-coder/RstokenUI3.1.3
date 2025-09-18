// app/page.tsx
"use client";

import dynamic from "next/dynamic";

// 你的主组件（禁用 SSR 渲染）
const RSUI32 = dynamic(() => import("@/components/RSUI32"), { ssr: false });

export default function Page() {
  return <RSUI32 />;
}

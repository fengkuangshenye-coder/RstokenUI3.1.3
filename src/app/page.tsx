import dynamic from "next/dynamic";

// RSUI32 是 Client 组件，使用动态导入避免 SSR 与 Recharts 的冲突
const RSUI32 = dynamic(() => import("@/components/RSUI32"), { ssr: false });

export default function Page() {
  return <RSUI32 />;
}

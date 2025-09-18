// app/page.tsx
// 如果 tsconfig 已配置 "@/..." 别名：
import RSUI32 from "@/components/RSUI32";

// 如果你的别名尚未生效，请改用相对路径（取消下一行注释并删除上面一行）：
// import RSUI32 from "../src/components/RSUI32";

export default function Page() {
  return <RSUI32 />;
}

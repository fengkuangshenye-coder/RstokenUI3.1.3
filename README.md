# RStoken UI 3.2

🚀 **人生币 RStoken 前端 UI（基于 Next.js + TailwindCSS + React）**  
实现了星空粒子背景、三层视差、预言机球体、私募流程、代币经济学看板等模块。

---

## ✨ 功能特性

- 🌌 **科技感背景**
  - 星空粒子（Canvas 动效）
  - 渐变动画背景
  - 三层视差

- 🧭 **交互动效**
  - 卡片 3D Tilt 悬浮
  - ScrollReveal 扫描线动画
  - 顶部滚动进度条

- 📊 **代币经济**
  - Donut 分配图
  - 动态 KPI 指标
  - 供给调节示意图

- 🔐 **私募流程**
  - Approve → Contribute → Claim
  - BNB/USDT 快速输入
  - 价格预估 + 复制金库地址

- 🌍 **Oracle Globe**
  - 多源预言机节点可视化
  - 动态旋转、轨迹、发光球体

---

## 📂 项目结构

```bash
.
├── pages/
│   └── index.tsx              # 主入口页面
├── src/components/
│   ├── RSUI32.tsx             # 主 UI 组件
│   ├── StarfieldCanvas.tsx    # 星空粒子背景
│   ├── OracleGlobe.tsx        # 预言机地球球体
│   └── Title.tsx              # 标题组件
├── public/
│   └── ...                    # 静态资源
├── tailwind.config.ts         # Tailwind 配置
├── .gitignore                 # Git 忽略文件
├── package.json               # 项目依赖
└── README.md                  # 说明文档

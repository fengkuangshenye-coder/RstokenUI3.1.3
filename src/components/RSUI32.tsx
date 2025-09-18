"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  Activity,
  PauseCircle,
  Wallet,
  Sparkles,
  Users,
  Github,
  Twitter,
  MessageCircle,
  FileText,
  ExternalLink,
  Rocket,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// 本地组件（你已添加）
import { StarfieldCanvas } from "./StarfieldCanvas";
import { OracleGlobe } from "./OracleGlobe";

/* =======================
   基础配置
   ======================= */
const CFG = {
  token: {
    name: "RStoken",
    symbol: "RST",
    chain: "BSC",
    decimals: 18,
    contract: "【可填主网地址】",
    oracleRegistry: "【可填主网地址】",
    vault: "【可填金库地址】",
  },
  links: {
    scan: "#",
    privateSale: "#", // 私募链接（首批信任用户）
    whitepaper: "#",
    github: "#",
    twitter: "#",
    telegram: "#",
    discord: "#",
    chinaHub: "#",
  },
  privateSale: {
    timeUTC: "【可填UTC时间】",
    payAssets: ["BNB", "USDT"],
    liquidityLock: "【可填期限】",
  },
  distribution: [
    { name: "社区与流动性", value: 42 },
    { name: "生态基金", value: 23 },
    { name: "团队与顾问(锁仓)", value: 20 },
    { name: "市场与运营", value: 15 },
  ],
};

const DONUT_COLORS = ["#00D1FF", "#7CFFB2", "#F5B700", "#8A7CFF"];

const analyticsDemo = [
  { t: "Mon", delta: 12, applied: 10 },
  { t: "Tue", delta: 8, applied: 7 },
  { t: "Wed", delta: 14, applied: 11 },
  { t: "Thu", delta: 6, applied: 5 },
  { t: "Fri", delta: 9, applied: 8 },
  { t: "Sat", delta: 7, applied: 6 },
  { t: "Sun", delta: 11, applied: 9 },
];

/* =======================
   小型 UI 组件
   ======================= */
function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-20 reveal-section">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight title-gradient">{title}</h2>
          {subtitle && <p className="text-muted-foreground mt-2 max-w-3xl">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-sm text-muted-foreground hover:text-foreground transition">
      {children}
    </a>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-black/20 px-3 py-2 border border-white/10 card-tilt">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right truncate max-w-[60%]">{value}</span>
    </div>
  );
}

function Kpi({ title, value, desc }: { title: string; value: string; desc?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 card-tilt">
      <p className="text-muted-foreground text-xs">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      {desc && <p className="text-xs text-muted-foreground mt-1">{desc}</p>}
    </div>
  );
}

function RoadItem({ q, items }: { q: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 card-tilt">
      <p className="text-cyan-300 font-semibold mb-2">{q}</p>
      <ul className="list-disc list-inside text-muted-foreground space-y-1">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function ArrowTop() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 mr-2">
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  );
}

/* =======================
   动效 & 自定义 Hook
   ======================= */
function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const h = document.documentElement;
    const onScroll = () => {
      const scrolled = h.scrollTop;
      const height = h.scrollHeight - h.clientHeight;
      setP(height ? scrolled / height : 0);
      h.style.setProperty("--scroll", String(scrolled));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return p;
}

function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("revealed");
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal-section").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useToast() {
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const push = (text: string) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200);
  };
  const ui = (
    <div className="fixed top-16 right-4 space-y-2 z-[60]">
      {toasts.map((t) => (
        <div key={t.id} className="px-3 py-2 rounded-lg bg-black/60 border border-white/10 shadow-lg text-sm backdrop-blur">
          {t.text}
        </div>
      ))}
    </div>
  );
  return { push, ui } as const;
}

function useTilt() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".card-tilt"));
    const onMove = (e: MouseEvent) => {
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(800px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
      });
    };
    const onLeave = () => els.forEach((el) => (el.style.transform = ""));
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);
}

/* =======================
   私募模块（UI）
   ======================= */
const RATE_RST_PER_USD = 500; // 示例：1 USD = 500 RST

function PrivateSalePanel({ onToast }: { onToast: (s: string) => void }) {
  const [asset, setAsset] = useState<"BNB" | "USDT">("BNB");
  const [amount, setAmount] = useState<number>(1);
  const [bnbPrice, setBnbPrice] = useState<number>(560);
  const [step, setStep] = useState<0 | 1 | 2>(0); // 0 Approve 1 Contribute 2 Claim

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const r = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT");
        const j = await r.json();
        const p = parseFloat(j?.price);
        if (!isNaN(p)) setBnbPrice(p);
      } catch {
        // 忽略错误，使用兜底价格
      }
    };
    fetchPrice();
    const id = setInterval(fetchPrice, 30000);
    return () => clearInterval(id);
  }, []);

  const usd = asset === "BNB" ? amount * bnbPrice : amount; // USDT 面值即 USD
  const rst = Math.floor(usd * RATE_RST_PER_USD).toLocaleString();
  const quicks = asset === "BNB" ? [1, 5, 10] : [100, 500, 1000];

  const next = () => {
    if (step === 0) {
      onToast("Approve 成功");
      setStep(1);
    } else if (step === 1) {
      onToast("Contribute 已提交");
      setStep(2);
    } else {
      onToast("已领取");
    }
  };

  return (
    <Card className="bg-white/5 border-white/10 card-tilt">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-cyan-300" /> 私募（仅首批信任用户）
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Button
            variant={asset === "BNB" ? "default" : "outline"}
            className={asset === "BNB" ? "btn-neon" : ""}
            onClick={() => setAsset("BNB")}
          >
            BNB
          </Button>
          <Button
            variant={asset === "USDT" ? "default" : "outline"}
            className={asset === "USDT" ? "btn-neon" : ""}
            onClick={() => setAsset("USDT")}
          >
            USDT
          </Button>
          <span className="text-muted-foreground ml-auto">时间(UTC)：{CFG.privateSale.timeUTC}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {quicks.map((q) => (
            <Button key={q} variant="secondary" onClick={() => setAmount(q)}>
              {q} {asset}
            </Button>
          ))}
        </div>

        <div className="grid gap-2">
          <label className="text-muted-foreground">参与金额（{asset}）</label>
          <Input
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value || 0))}
            className="bg-black/20 border-white/10"
            type="number"
            min={0}
          />
          <p className="text-xs text-muted-foreground">
            预计可得：<span className="text-cyan-300 font-medium">{rst} RST</span>
            <span className="ml-2">{asset === "BNB" ? `按 BNB ≈ $${bnbPrice.toFixed(2)} 折算` : `按 USDT ≈ $1.00 折算`}</span>
          </p>
        </div>

        {/* 步骤条 */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { k: 0, t: "Approve" },
            { k: 1, t: "Contribute" },
            { k: 2, t: "Claim" },
          ].map((s) => (
            <div
              key={s.k}
              className={`rounded-lg px-3 py-2 border border-white/10 bg-black/30 flex items-center justify-center ${
                step >= s.k ? "ring-1 ring-cyan-500/50 shadow-[0_0_24px_#22d3ee40]" : ""
              }`}
            >
              {s.t}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button className="flex-1 btn-neon" onClick={next}>
            {step === 0 ? "Approve" : step === 1 ? "Contribute" : "Claim"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(CFG.token.vault);
                onToast("已复制合约地址");
              } catch {
                onToast("复制失败");
              }
            }}
          >
            复制金库地址
          </Button>
        </div>

        <div className="pt-2 text-xs text-muted-foreground">
          <p>
            开盘后可点击 <span className="text-cyan-300">Claim 手续费领取</span>。
          </p>
          <p>合约地址与 ABI 接入后，按钮将上链交互。</p>
        </div>
      </CardContent>
    </Card>
  );
}

/* =======================
   页面骨架
   ======================= */
export default function RSUI32() {
  const progress = useScrollProgress();
  useScrollReveal();
  useTilt();
  const { push, ui } = useToast();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative">
      {/* 背景：星空 + 视差 + 渐变 */}
      <TechBackground />

      {/* 滚动进度条 */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-white/5 z-50">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-sky-500 to-fuchsia-500 transition-[width] duration-75"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-sm supports-[backdrop-filter]:bg-slate-900/60 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-cyan-500/20 grid place-items-center">
              <Sparkles className="h-4 w-4 text-cyan-300" />
            </div>
            <span className="font-semibold">
              {CFG.token.name} <span className="text-cyan-300">({CFG.token.symbol})</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="#about">介绍</NavLink>
            <NavLink href="#tokenomics">代币经济</NavLink>
            <NavLink href="#private">私募</NavLink>
            <NavLink href="#roadmap">路线图</NavLink>
            <NavLink href="#community">社区</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="secondary">
              <a href={CFG.links.whitepaper} target="_blank" rel="noreferrer">
                <FileText className="h-4 w-4 mr-2" />
                规划书
              </a>
            </Button>
            <Button asChild size="sm" className="btn-neon">
              <a href={CFG.links.privateSale} target="_blank" rel="noreferrer">
                <Wallet className="h-4 w-4 mr-2" />
                参与私募
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight title-gradient">
              {CFG.token.name}（人生币）：跟随全球人口变化的智能代币
            </h1>
            <p className="text-muted-foreground mt-4 text-base md:text-lg">
              “一个生命的诞生 +1，一次离世 -1”。多源预言机驱动供给变动，
              <span className="text-cyan-300">透明</span>、
              <span className="text-cyan-300">可验证</span>、与现实世界紧密映射。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="btn-neon">
                <a href={CFG.links.privateSale} target="_blank" rel="noreferrer">
                  <Wallet className="h-4 w-4 mr-2" />
                  参与私募
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={CFG.links.scan} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  查看合约
                </a>
              </Button>
              <Button asChild variant="secondary">
                <a href="#tokenomics">
                  <Activity className="h-4 w-4 mr-2" />
                  代币经济
                </a>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="secondary">链：{CFG.token.chain}</Badge>
              <Badge variant="secondary">代号：{CFG.token.symbol}</Badge>
              <Badge variant="secondary">精度：{CFG.token.decimals}</Badge>
              <Badge variant="secondary">供应：动态</Badge>
              <Badge variant="secondary">预言机：每小时心跳</Badge>
              <Badge variant="secondary">冷却：10秒</Badge>
              <Badge variant="secondary">治理：单签（预留多签/DAO）</Badge>
            </div>
          </div>
          <div className="grid gap-4">
            <Card className="bg-white/5 border-white/10 card-tilt">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">关键护栏</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-white/5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 mb-2" />
                  <p className="font-medium">多源预言机</p>
                  <p className="text-muted-foreground">EIP-712 多签名报告，quorum 校验</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <PauseCircle className="h-4 w-4 text-amber-400 mb-2" />
                  <p className="font-medium">熔断与恢复</p>
                  <p className="text-muted-foreground">异常触发 pause，恢复带冷却</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <Activity className="h-4 w-4 text-sky-400 mb-2" />
                  <p className="font-medium">迟滞+平滑</p>
                  <p className="text-muted-foreground">忽略毛刺，平滑供应变动</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <Wallet className="h-4 w-4 text-fuchsia-400 mb-2" />
                  <p className="font-medium">手续费透明</p>
                  <p className="text-muted-foreground">费率上限10%，链上披露</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 card-tilt">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">快速入口</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <a href={CFG.links.github} target="_blank" rel="noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={CFG.links.twitter} target="_blank" rel="noreferrer">
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={CFG.links.telegram} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Telegram
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={CFG.links.discord} target="_blank" rel="noreferrer">
                    <Users className="h-4 w-4 mr-2" />
                    Discord
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <DividerParallax />
      </section>

      {/* About */}
      <Section id="about" title="项目介绍" subtitle="RStoken（人生币）将全球人口净变动映射为代币供给的增减，过程全链上披露、可验证、可审计。">
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10 card-tilt">
            <CardContent className="p-5">
              <p className="font-semibold mb-1">现实映射</p>
              <p className="text-muted-foreground">以公开统计数据为依据，按净增量调整供应。</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10 card-tilt">
            <CardContent className="p-5">
              <p className="font-semibold mb-1">极致透明</p>
              <p className="text-muted-foreground">增发/销毁、费用与参数改动全部写链。</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10 card-tilt">
            <CardContent className="p-5">
              <p className="font-semibold mb-1">稳健运行</p>
              <p className="text-muted-foreground">多源聚合、冷却与熔断，降低异常冲击。</p>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Tokenomics */}
      <Section id="tokenomics" title="代币经济模型" subtitle="供应动态、迟滞滤波与平滑因子，配合单周期上限与时间锁，形成稳健的供给调节体系。">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-white/5 border-white/10 card-tilt">
            <CardHeader>
              <CardTitle>基础信息</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
              <InfoRow label="代号" value={CFG.token.symbol} />
              <InfoRow label="链" value={CFG.token.chain} />
              <InfoRow label="精度" value={String(CFG.token.decimals)} />
              <InfoRow
                label="合约地址"
                value={
                  <a className="text-cyan-300 hover:underline" href={CFG.links.scan} target="_blank" rel="noreferrer">
                    {CFG.token.contract}
                  </a>
                }
              />
              <InfoRow label="Oracle Registry" value={<span>{CFG.token.oracleRegistry}</span>} />
              <InfoRow label="供应属性" value="动态：按净增量Δ并经平滑应用" />
            </CardContent>
          </Card>

          {/* Donut */}
          <Card className="bg-white/5 border-white/10 card-tilt">
            <CardHeader>
              <CardTitle>初始分配占比</CardTitle>
            </CardHeader>
            <CardContent className="relative" style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CFG.distribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {CFG.distribution.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <p className="text-xs text-muted-foreground">分配占比</p>
                <p className="text-xl font-semibold">100%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mt-6 text-sm">
          <Kpi title="迟滞带" value="过滤微小波动" desc="|Δ| 小于阈值不应用" />
          <Kpi title="平滑因子" value="0.8–1.2×" desc="降低单周期冲击" />
          <Kpi title="时间锁" value="24 小时" desc="参数变更排期执行" />
        </div>
      </Section>

      {/* 私募 */}
      <Section id="private" title="私募与上架" subtitle="仅面向首批信任项目的用户开放；公开交易将于上架后进行。">
        <div className="grid lg:grid-cols-3 gap-4">
          <PrivateSalePanel onToast={push} />
          <Card className="bg-white/5 border-white/10 lg:col-span-2 card-tilt">
            <CardHeader>
              <CardTitle>资金用途（示例）</CardTitle>
            </CardHeader>
            <CardContent className="text-sm grid md:grid-cols-2 gap-3">
              <ul className="list-disc list-inside text-muted-foreground leading-7">
                <li>流动性注入：【可填】%</li>
                <li>技术研发与审计：【可填】%</li>
                <li>市场与生态：【可填】%</li>
                <li>合规与储备：【可填】%</li>
              </ul>
              <div className="rounded-xl border border-white/10 p-3 bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">全球数据预言机（示意）</p>
                  <span className="text-xs text-muted-foreground">实时心跳 / 多源聚合</span>
                </div>
                <OracleGlobe height={260} speed={0.06} neon className="w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Roadmap */}
      <Section id="roadmap" title="路线图" subtitle="以稳定运行为核心，逐步扩展生态与治理。">
        <div className="grid lg:grid-cols-4 gap-4 text-sm">
          <RoadItem q="Q1" items={["测试网部署与验证", "预言机 DRY RUN", "官网与看板上线"]} />
          <RoadItem q="Q2" items={["主网上线与私募", "第三方审计报告", "数据源扩容与容错"]} />
          <RoadItem q="Q3" items={["支付网关对接", "电商/社区积分试点", "分红模块治理讨论(默认关闭)"]} />
          <RoadItem q="Q4" items={["多签/DAO 治理切换提案", "跨链桥 PoC(可选)", "年度透明度报告"]} />
        </div>
      </Section>

      {/* Compliance */}
      <Section id="compliance" title="透明度与合规" subtitle="仅使用公开统计数据；关键参数变更需 24h 链上排期；源代码可验证。">
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10 card-tilt">
            <CardContent className="p-5">
              <p className="font-semibold mb-1">合约公开</p>
              <p className="text-muted-foreground">BscScan 验证，事件全量披露。</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10 card-tilt">
            <CardContent className="p-5">
              <p className="font-semibold mb-1">时间锁</p>
              <p className="text-muted-foreground">参数变更须 24 小时后执行。</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10 card-tilt">
            <CardContent className="p-5">
              <p className="font-semibold mb-1">隐私友好</p>
              <p className="text-muted-foreground">不涉及个人身份数据，仅用公开统计/百科。</p>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Analytics demo */}
      <Section id="analytics" title="数据看板（示例）" subtitle="实际上线后可接入你的 Indexer 或第三方服务替换为真实数据。">
        <div className="grid lg:grid-cols-3 gap-4">
          <Kpi title="本周净增量(Δ)" value={"+67"} desc="多源中位数" />
          <Kpi title="实际应用(Δ')" value={"+55"} desc="平滑后" />
          <Kpi title="拒绝率" value={"2.8%"} desc="异常/过期/幅度过大" />
        </div>
        <Card className="bg-white/5 border-white/10 mt-6 card-tilt">
          <CardHeader>
            <CardTitle>Δ vs Δ' (示意)</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsDemo}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis dataKey="t" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="delta" name="Δ" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="applied" name="Δ'" stroke="#0ea5e9" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Section>

      {/* FAQ */}
      <Section id="faq" title="常见问题 (FAQ)">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="q1">
            <AccordionTrigger>为什么供应是动态的？</AccordionTrigger>
            <AccordionContent>
              每小时读取公开人口数据，多源校验后将净增量映射到代币供应；小幅波动由迟滞阈值过滤，并通过平滑因子降低冲击。
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2">
            <AccordionTrigger>你们能随意改参数或增发吗？</AccordionTrigger>
            <AccordionContent>
              关键参数变更有 24h 时间锁，链上排期与执行全可查；增发/销毁依据预言机报告，且有单周期上限与冷却保护。
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q3">
            <AccordionTrigger>手续费是多少？</AccordionTrigger>
            <AccordionContent>
              默认 0%，上限 ≤10%；全部进入公开 feeVault，用于技术、审计、合规与生态建设，所有提取事件可查。
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q4">
            <AccordionTrigger>预言机异常会怎样？</AccordionTrigger>
            <AccordionContent>
              多源聚合 + 异常拒绝 + 连续拒绝触发熔断；必要时可 pause 全局，恢复前有冷却保护。
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q5">
            <AccordionTrigger>是否收集个人数据？</AccordionTrigger>
            <AccordionContent>不。只使用公开统计与百科信息，不涉及个人身份数据。</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <span className="font-semibold">{CFG.token.name}</span>
            </div>
            <p className="text-muted-foreground">Life in Numbers, Value in Motion.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium mb-2">文档</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>
                  <a className="hover:text-cyan-300" href={CFG.links.whitepaper} target="_blank" rel="noreferrer">
                    规划书
                  </a>
                </li>
                <li>
                  <a className="hover:text-cyan-300" href={CFG.links.github} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                </li>
                <li>
                  <a className="hover:text-cyan-300" href="#analytics">
                    数据看板
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">联系</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>商务：bd@【可填域名】</li>
                <li>媒体：press@【可填域名】</li>
                <li>支持：dev@【可填域名】</li>
              </ul>
            </div>
          </div>
          <div className="flex md:justify-end items-start gap-2">
            <Button
              asChild
              variant="outline"
            >
              <a href="#" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                <ArrowTop /> 返回顶部
              </a>
            </Button>
          </div>
        </div>
      </footer>

      {/* Toast UI */}
      {ui}

      {/* 额外样式 & 动效 */}
      <ExtraStyles />
    </div>
  );
}

/* =======================
   分割线 & 背景 & 样式
   ======================= */
function DividerParallax() {
  return (
    <div className="relative h-28 md:h-36 overflow-hidden -mb-8 mt-10">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent" />
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
        <defs>
          <linearGradient id="grad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#00D1FF" stopOpacity=".2" />
            <stop offset="100%" stopColor="#8A7CFF" stopOpacity=".2" />
          </linearGradient>
        </defs>
        <path
          fill="url(#grad)"
          d="M0,224L60,213.3C120,203,240,181,360,192C480,203,600,245,720,266.7C840,288,960,288,1080,245.3C1200,203,1320,117,1380,74.7L1440,32L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        />
      </svg>
    </div>
  );
}

function TechBackground() {
  return (
    <>
      <StarfieldCanvas />
      <ParallaxLayers />
      <div className="fixed inset-0 -z-10 gradient-shift" />
      <div className="fixed inset-0 -z-10 noise" />
    </>
  );
}

function ParallaxLayers() {
  return (
    <>
      <div className="parallax layer-1" />
      <div className="parallax layer-2" />
      <div className="parallax layer-3" />
    </>
  );
}

function ExtraStyles() {
  return (
    <style>{`
      /* 渐变动画背景 */
      .gradient-shift {
        background: radial-gradient(1200px 600px at 20% 10%, rgba(0,209,255,.10), transparent),
                    radial-gradient(1000px 500px at 80% 20%, rgba(138,124,255,.10), transparent),
                    radial-gradient(1000px 600px at 50% 90%, rgba(0,194,168,.10), transparent);
        animation: gradientShift 20s ease-in-out infinite alternate;
      }
      @keyframes gradientShift {
        0% { filter: hue-rotate(0deg) saturate(1); }
        100% { filter: hue-rotate(25deg) saturate(1.2); }
      }

      /* 视差层 */
      .parallax { position: fixed; left:0; right:0; height:50vh; pointer-events:none; z-index:-1; }
      .layer-1 { top:20vh; background: radial-gradient(60% 80% at 50% 50%, rgba(13,148,136,0.08), transparent); transform: translateY(calc(var(--scroll,0) * .15)); }
      .layer-2 { top:40vh; background: radial-gradient(50% 60% at 30% 70%, rgba(56,189,248,0.07), transparent); transform: translateY(calc(var(--scroll,0) * .25)); }
      .layer-3 { top:60vh; background: radial-gradient(60% 70% at 70% 30%, rgba(99,102,241,0.08), transparent); transform: translateY(calc(var(--scroll,0) * .35)); }

      /* 噪点覆盖（SVG 噪声） */
      .noise { background-image: url('data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/></filter><rect width="120" height="120" filter="url(#n)" opacity=".035"/></svg>`)}'); mix-blend-mode: soft-light; }

      /* 标题渐变 */
      .title-gradient { background: linear-gradient(90deg,#fff, #9ae6ff 30%, #c7b8ff 60%, #fff); -webkit-background-clip: text; background-clip:text; color: transparent; }

      /* 霓虹按钮 */
      .btn-neon { position: relative; background: linear-gradient(90deg,#06b6d4,#4f46e5); box-shadow: 0 0 32px rgba(34,211,238,.35), inset 0 0 12px rgba(255,255,255,.15); border: none; }
      .btn-neon:hover { filter: brightness(1.05); box-shadow: 0 0 48px rgba(34,211,238,.45), inset 0 0 12px rgba(255,255,255,.25); }
      .btn-neon:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(34,211,238,.35), 0 0 32px rgba(34,211,238,.35); }

      html { --scroll: 0px; }

      @media (prefers-reduced-motion: reduce) {
        .gradient-shift { animation: none !important; }
        .card-tilt { transform: none !important; transition: none !important; }
      }

      /* ScrollReveal 扫描线入场 */
      .reveal-section { opacity: 0; transform: translateY(24px); position: relative; }
      .reveal-section::before { content:""; position:absolute; inset:0 0 60% 0; background: repeating-linear-gradient(0deg, rgba(255,255,255,.06) 0, rgba(255,255,255,.06) 1px, transparent 2px, transparent 6px); opacity:0; pointer-events:none; }
      .reveal-section.revealed { opacity: 1; transform: none; transition: opacity .8s ease, transform .8s ease; }
      .reveal-section.revealed::before { animation: scan 1.2s ease 1; }
      @keyframes scan { 0% { opacity:.7; transform: translateY(-40%);} 100% { opacity:0; transform: translateY(40%);} }

      /* 卡片 Tilt 过渡 */
      .card-tilt { transition: transform .15s ease, box-shadow .2s ease; will-change: transform; }
      .card-tilt:hover { box-shadow: 0 10px 30px rgba(0,0,0,.25), 0 0 30px rgba(34,211,238,.15); }
    `}</style>
  );
}

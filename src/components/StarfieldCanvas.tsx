import React, { useEffect, useRef } from "react";

interface OracleGlobeProps {
  className?: string;
  height?: number;
  speed?: number;
  neon?: boolean;
}

export function OracleGlobe({
  className = "",
  height = 260,
  speed = 0.06,
  neon = true,
}: OracleGlobeProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const running = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapperRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    let w = wrap.clientWidth;
    let h = height;
    let R = Math.min(w, h) * 0.38;
    const cx = w * 0.35;
    const cy = h * 0.52;

    function resize() {
      w = wrap.clientWidth;
      h = height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(w, h) * 0.38;
    }
    resize();

    // --- 工具函数 ---
    const latLonToXYZ = (lat: number, lon: number, r = 1) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return {
        x: -r * Math.sin(phi) * Math.cos(theta),
        z: r * Math.sin(phi) * Math.sin(theta),
        y: r * Math.cos(phi),
      };
    };

    const rotate = (p: any, ry: number, rx: number) => {
      const cosy = Math.cos(ry), siny = Math.sin(ry);
      let x = p.x * cosy - p.z * siny;
      let z = p.x * siny + p.z * cosy;
      let y = p.y;
      const cosx = Math.cos(rx), sinx = Math.sin(rx);
      return { x, y: y * cosx - z * sinx, z: y * sinx + z * cosx };
    };

    const proj = (p: any) => {
      const f = 1.4;
      const m = (R * f) / (p.z + 2.6);
      return { x: cx + p.x * m, y: cy + p.y * m, z: p.z };
    };

    const lineStrip = (points: any[], stroke: string, alpha = 0.7, width = 1) => {
      ctx.globalAlpha = alpha;
      ctx.lineWidth = width;
      ctx.strokeStyle = stroke;
      ctx.beginPath();
      let first = true;
      for (const P of points) {
        const r = rotate(P, rotY, rotX);
        if (r.z < -0.2) continue;
        const s = proj(r);
        if (first) {
          ctx.moveTo(s.x, s.y);
          first = false;
        } else ctx.lineTo(s.x, s.y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const drawNode = (p: any) => {
      const r = rotate(p, rotY, rotX);
      if (r.z < -0.15) return;
      const s = proj(r);
      ctx.save();
      if (neon) {
        ctx.shadowColor = "rgba(0,255,220,0.8)";
        ctx.shadowBlur = 12;
      }
      ctx.fillStyle = "#67e8f9";
      ctx.beginPath();
      ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawArc = (a: any, b: any, t: number) => {
      const mid = { x: (a.x + b.x) * 0.5, y: (a.y + b.y) * 0.5 + 0.18, z: (a.z + b.z) * 0.5 };
      lineStrip([a, mid, b], "rgba(103,232,249,0.5)", 0.6, 1);
      [a, mid, b].forEach((pt, i) => {
        if (i === 0) return;
        const r = rotate(pt, rotY, rotX);
        if (r.z < -0.1) return;
        const s = proj(r);
        ctx.save();
        ctx.fillStyle = "white";
        ctx.shadowColor = "rgba(103,232,249,0.9)";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    const background = () => {
      const g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.4);
      g.addColorStop(0, "rgba(13,148,136,0.10)");
      g.addColorStop(1, "rgba(2,6,23,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const scanH = 2;
      const offset = (performance.now() / 900) % 6;
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "rgba(94,234,212,0.06)";
      for (let y = 0; y < h; y += 6) ctx.fillRect(0, y + offset, w, scanH);
      ctx.globalCompositeOperation = "source-over";
    };

    // --- 数据 ---
    const meridians = [];
    const parallels = [];
    for (let lon = -150; lon <= 180; lon += 30) {
      const line = [];
      for (let lat = -80; lat <= 80; lat += 5) line.push(latLonToXYZ(lat, lon));
      meridians.push(line);
    }
    for (let lat = -60; lat <= 60; lat += 20) {
      const line = [];
      for (let lon = -180; lon <= 180; lon += 5) line.push(latLonToXYZ(lat, lon));
      parallels.push(line);
    }

    const ORB_NODES = [
      { lat: 37.77, lon: -122.41 },
      { lat: 51.5, lon: -0.12 },
      { lat: 1.29, lon: 103.85 },
      { lat: 22.54, lon: 114.06 },
      { lat: 35.68, lon: 139.69 },
      { lat: 40.71, lon: -74.0 },
    ].map((p) => latLonToXYZ(p.lat, p.lon));

    const links = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]].map(([a, b]) => ({
      a: ORB_NODES[a],
      b: ORB_NODES[b],
      t: Math.random(),
    }));

    // --- 动画循环 ---
    let mx = 0, my = 0, rotY = 0, rotX = -0.1, raf = 0, last = performance.now();

    const onMove = (ev: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mx = ((ev.clientX - rect.left) / rect.width - 0.5) * 0.6;
      my = ((ev.clientY - rect.top) / rect.height - 0.5) * 0.6;
    };
    canvas.addEventListener("mousemove", onMove);

    const io = new IntersectionObserver(([entry]) => {
      running.current = entry.isIntersecting;
    });
    io.observe(wrap);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!running.current) return;

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      rotY += speed * dt;
      rotX += (my - rotX) * 0.08;
      rotY += mx * 0.01;

      ctx.clearRect(0, 0, w, h);
      background();

      if (neon) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.shadowColor = "rgba(59,130,246,0.35)";
        ctx.shadowBlur = 40;
        ctx.strokeStyle = "rgba(59,130,246,0.35)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      meridians.forEach((line) => lineStrip(line, "rgba(148,163,184,0.18)", 0.8));
      parallels.forEach((line) => lineStrip(line, "rgba(148,163,184,0.14)", 0.7));
      ORB_NODES.forEach(drawNode);
      links.forEach((L) => {
        L.t += dt * 0.6;
        if (L.t > 1) L.t -= 1;
        drawArc(L.a, L.b, L.t);
      });
    };
    raf = requestAnimationFrame(frame);

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      io.disconnect();
    };
  }, [height, speed, neon]);

  return (
    <div ref={wrapperRef} className={className}>
      <canvas ref={canvasRef} />
    </div>
  );
}


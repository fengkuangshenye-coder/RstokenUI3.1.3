// src/components/OracleGlobe.tsx
import React, { useEffect, useRef } from "react";

export function OracleGlobe({
  className = "",
  height = 260,
  speed = 0.06,
  neon = true,
}: {
  className?: string;
  height?: number;
  speed?: number;
  neon?: boolean;
}) {
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
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let R = Math.min(w, h) * 0.38;
    const cx = w * 0.35;
    const cy = h * 0.52;

    function latLonToXYZ(lat: number, lon: number, r = 1) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return {
        x: -r * Math.sin(phi) * Math.cos(theta),
        z: r * Math.sin(phi) * Math.sin(theta),
        y: r * Math.cos(phi),
      };
    }

    const meridians: { x: number; y: number; z: number }[][] = [];
    const parallels: { x: number; y: number; z: number }[][] = [];
    for (let lon = -150; lon <= 180; lon += 30) {
      const line: any[] = [];
      for (let lat = -80; lat <= 80; lat += 5)
        line.push(latLonToXYZ(lat, lon));
      meridians.push(line);
    }
    for (let lat = -60; lat <= 60; lat += 20) {
      const line: any[] = [];
      for (let lon = -180; lon <= 180; lon += 5)
        line.push(latLonToXYZ(lat, lon));
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

    const links = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
    ].map(([a, b]) => ({
      a: ORB_NODES[a],
      b: ORB_NODES[b],
      t: Math.random(),
    }));

    let mx = 0,
      my = 0;
    const onMove = (ev: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mx = ((ev.clientX - rect.left) / rect.width - 0.5) * 0.6;
      my = ((ev.clientY - rect.top) / rect.height - 0.5) * 0.6;
    };
    canvas.addEventListener("mousemove", onMove);

    const io = new IntersectionObserver(
      ([entry]) => {
        running.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    io.observe(wrap);

    let rotY = 0,
      rotX = -0.1;
    let raf = 0,
      last = performance.now();

    function rotate(p: { x: number; y: number; z: number }, ry: number, rx: number) {
      const cosy = Math.cos(ry),
        siny = Math.sin(ry);
      let x = p.x * cosy - p.z * siny;
      let z = p.x * siny + p.z * cosy;
      let y = p.y;
      const cosx = Math.cos(rx),
        sinx = Math.sin(rx);
      const y2 = y * cosx - z * sinx;
      const z2 = y * sinx + z * cosx;
      return { x, y: y2, z: z2 };
    }

    function proj(p: { x: number; y: number; z: number }) {
      const f = 1.4;
      const m = (R * f) / (p.z + 2.6);
      return { x: cx + p.x * m, y: cy + p.y * m, z: p.z };
    }

    function lineStrip(
      points: { x: number; y: number; z: number }[],
      stroke: string,
      alpha = 0.7,
      width = 1
    ) {
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
    }

    function drawNode(p: { x: number; y: number; z: number }) {
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
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (!running.current) return;

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      rotY += speed * dt;
      rotX += (my - rotX) * 0.08;
      rotY += mx * 0.01;

      ctx.clearRect(0, 0, w, h);

      meridians.forEach((line) =>
        lineStrip(line, "rgba(148,163,184,0.18)", 0.8)
      );
      parallels.forEach((line) =>
        lineStrip(line, "rgba(148,163,184,0.14)", 0.7)
      );

      ORB_NODES.forEach(drawNode);
      links.forEach((L) => {
        L.t += dt * 0.6;
        if (L.t > 1) L.t -= 1;
      });
    }
    raf = requestAnimationFrame(frame);

    const onResize = () => {
      w = wrap.clientWidth;
      canvas.style.width = `${w}px`;
      canvas.width = Math.floor(w * dpr);
      R = Math.min(w, h) * 0.38;
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousemove", onMove);
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [height, speed, neon]);

  return (
    <div ref={wrapperRef} className={className}>
      <canvas ref={canvasRef} />
    </div>
  );
}


import React from "react";

type Vec3 = { x: number; y: number; z: number };

export default function OracleGlobe({
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
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const running = React.useRef(true);

  React.useEffect(() => {
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

    function latLonToXYZ(lat: number, lon: number, r = 1): Vec3 {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -r * Math.sin(phi) * Math.cos(theta);
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);
      return { x, y, z };
    }

    const meridians: Vec3[][] = [];
    const parallels: Vec3[][] = [];
    for (let lon = -150; lon <= 180; lon += 30) {
      const line: Vec3[] = [];
      for (let lat = -80; lat <= 80; lat += 5) line.push(latLonToXYZ(lat, lon));
      meridians.push(line);
    }
    for (let lat = -60; lat <= 60; lat += 20) {
      const line: Vec3[] = [];
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

    const links = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
    ].map(([a, b]) => ({ a: ORB_NODES[a], b: ORB_NODES[b], t: Math.random() }));

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

    function rotate(p: Vec3, ry: number, rx: number): Vec3 {
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

    function proj(p: Vec3) {
      const f = 1.4;
      const m = (R * f) / (p.z + 2.6);
      return { x: cx + p.x * m, y: cy + p.y * m, z: p.z };
    }

    function lineStrip(points: Vec3[], stroke: string, alpha = 0.7, width = 1) {
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

    function drawNode(p: Vec3) {
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

    function drawArc(a: Vec3, b: Vec3, t: number) {
      const mid = {
        x: (a.x + b.x) * 0.5,
        y: (a.y + b.y) * 0.5 + 0.18,
        z: (a.z + b.z) * 0.5,
      };
      const strip = [a, mid, b];
      lineStrip(strip, "rgba(103,232,249,0.5)", 0.6, 1);

      const p1 = {
        x: a.x + (mid.x - a.x) * t,
        y: a.y + (mid.y - a.y) * t,
        z: a.z + (mid.z - a.z) * t,
      };
      const p2 = {
        x: mid.x + (b.x - mid.x) * Math.max(0, (t - 0.5) * 2),
        y: mid.y + (b.y - mid.y) * Math.max(0, (t - 0.5) * 2),
        z: mid.z + (b.z - mid.z) * Math.max(0, (t - 0.5) * 2),
      };
      [p1, p2].forEach((pt) => {
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
    }

    function background() {
      const g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.4);
      g.addColorStop(0, "rgba(13,148,136,0.10)");
      g.addColorStop(1, "rgba(2,6,23,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const scanH = 2;
      const offset = (performance.now() / 900) % 6;
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "rgba(94,234,212,0.06)";
      for (let yy = 0; yy < h; yy += 6) ctx.fillRect(0, yy + offset, w, scanH);
      ctx.globalCompositeOperation = "source-over";
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
      background();

      if (neon) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.shadowColor = "rgba(59,130,246,0.35)";
        ctx.shadowBlur = 40;
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(59,130,246,0.35)";
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




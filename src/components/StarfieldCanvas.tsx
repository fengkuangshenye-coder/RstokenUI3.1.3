import React, { useEffect, useRef } from "react";

interface StarfieldCanvasProps {
  className?: string;
  count?: number;
}

export function StarfieldCanvas({ className = "", count = 150 }: StarfieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const running = useRef(true);
  const stars = useRef<{ x: number; y: number; r: number; alpha: number; dx: number; twinkle: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    let width = window.innerWidth;
    let height = window.innerHeight;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
      ctx.scale(dpr, dpr);
    }

    resize();

    // 初始化星星，只生成一次
    if (stars.current.length === 0) {
      stars.current = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.2 + 0.2,
        alpha: Math.random(),
        dx: Math.random() * 0.05 + 0.02,
        twinkle: Math.random() * Math.PI * 2,
      }));
    }

    let raf = 0;

    function draw() {
      if (!running.current) return;
      raf = requestAnimationFrame(draw);

      ctx.clearRect(0, 0, width, height);
      for (const star of stars.current) {
        star.x -= star.dx;
        if (star.x < 0) {
          star.x = width;
          star.y = Math.random() * height;
        }

        // twinkle
        star.twinkle += 0.05;
        const brightness = 0.6 + Math.sin(star.twinkle) * 0.4;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * brightness})`;
        ctx.fill();
      }
    }

    draw();

    window.addEventListener("resize", resize);
    return () => {
      running.current = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return <canvas ref={canvasRef} className={className} />;
}


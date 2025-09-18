import React, { useEffect, useRef } from 'react';

interface OracleGlobeProps {
    className?: string;
    height?: number;
    speed?: number;
    neon?: boolean;
}

export function OracleGlobe({ className = '', height = 260, speed = 0.06, neon = true }: OracleGlobeProps) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const running = useRef(true);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const wrap = wrapperRef.current!;
        const ctx = canvas.getContext('2d')!;

        let width = wrap.clientWidth;
        let heightPx = height;
        canvas.width = width * devicePixelRatio;
        canvas.height = heightPx * devicePixelRatio;
        canvas.style.width = width + 'px';
        canvas.style.height = heightPx + 'px';
        ctx.scale(devicePixelRatio, devicePixelRatio);

        const nodes = [];
        const lines = [];

        for (let lat = -90; lat <= 90; lat += 30) {
            for (let lon = -180; lon <= 180; lon += 30) {
                nodes.push({ lat, lon });
            }
        }

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (Math.abs(nodes[i].lat - nodes[j].lat) <= 30 && Math.abs(nodes[i].lon - nodes[j].lon) <= 30) {
                    lines.push([i, j]);
                }
            }
        }

        function latLonToXYZ(lat: number, lon: number, radius: number) {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lon + 180) * (Math.PI / 180);
            const x = -radius * Math.sin(phi) * Math.cos(theta);
            const z = radius * Math.sin(phi) * Math.sin(theta);
            const y = radius * Math.cos(phi);
            return { x, y, z };
        }

        function rotateY(x: number, z: number, angle: number) {
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            return { x: x * cos - z * sin, z: z * cos + x * sin };
        }

        function rotateX(y: number, z: number, angle: number) {
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            return { y: y * cos - z * sin, z: z * cos + y * sin };
        }

        function draw() {
            if (!running.current) return;
            requestAnimationFrame(draw);

            ctx.clearRect(0, 0, width, heightPx);

            const radius = Math.min(width, heightPx) * 0.3;
            const cx = width / 2;
            const cy = heightPx / 2;
            const time = Date.now() * 0.001 * speed;

            const points = nodes.map(({ lat, lon }) => {
                let { x, y, z } = latLonToXYZ(lat, lon, radius);
                ({ x, z } = rotateY(x, z, time));
                ({ y, z } = rotateX(y, z, time * 0.7));
                const scale = 3 / (z / radius + 4);
                return { x: cx + x * scale, y: cy + y * scale, scale };
            });

            ctx.lineWidth = 1.5;
            ctx.strokeStyle = neon ? '#0ff' : 'rgba(255, 255, 255, 0.3)';

            for (const [i, j] of lines) {
                const a = points[i];
                const b = points[j];
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }

            for (const p of points) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2.5 * p.scale, 0, Math.PI * 2);
                ctx.fillStyle = neon ? '#0ff' : '#fff';
                ctx.shadowColor = neon ? '#0ff' : 'transparent';
                ctx.shadowBlur = neon ? 10 : 0;
                ctx.fill();
            }
        }

        draw();

        return () => {
            running.current = false;
        };
    }, [height, speed, neon]);

    return (
        <div ref={wrapperRef} className={className} style={{ height }}>
            <canvas ref={canvasRef} />
        </div>
    );
}

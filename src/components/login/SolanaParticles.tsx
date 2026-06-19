'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  seed: number;
  color: string;
}

/** Animated background — shiny silver particles with twinkling/glimmering effect */
export function SolanaParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrame = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const silverShades = [
      '255, 255, 255', // Pure white reflection
      '229, 231, 235', // Bright silver/gray-200
      '209, 213, 219', // Metallic silver/gray-300
      '186, 192, 203', // Light metallic blue-silver
    ];

    particles.current = Array.from({ length: 380 }).map((_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 2.5 + 1.2,
      seed: Math.random(),
      color: silverShades[i % silverShades.length],
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((p) => {
        p.x += p.vx + Math.sin(Date.now() * 0.001 + p.seed * 10) * 0.2;
        p.y += p.vy + Math.cos(Date.now() * 0.001 + p.seed * 10) * 0.2;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Twinkle/shimmer effect using sin on the seed
        const twinkle = 0.4 + Math.sin(Date.now() * 0.003 + p.seed * 50) * 0.6;
        const opacity = (0.08 + p.seed * 0.35) * twinkle;

        ctx.fillStyle = `rgba(${p.color}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[10] pointer-events-none"
      aria-hidden
    />
  );
}

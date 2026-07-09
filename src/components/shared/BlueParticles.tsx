'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  seed: number;
}

interface BlueParticlesProps {
  variant?: 'fixed' | 'section';
  className?: string;
}

export function BlueParticles({ variant = 'fixed', className = '' }: BlueParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrame = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const getContainer = () =>
      variant === 'section' ? canvas.parentElement : null;

    const initParticles = (width: number, height: number) => {
      const particleCount = variant === 'section' ? 200 : 450;
      particles.current = Array.from({ length: particleCount }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.5 + 0.5,
        seed: Math.random(),
      }));
    };

    const resize = () => {
      const container = getContainer();
      const width = variant === 'section' && container ? container.clientWidth : window.innerWidth;
      const height = variant === 'section' && container ? container.clientHeight : window.innerHeight;

      if (width === 0 || height === 0) return;

      canvas.width = width;
      canvas.height = height;

      if (particles.current.length === 0) {
        initParticles(width, height);
      }
    };

    resize();

    const resizeObserver =
      variant === 'section' && getContainer()
        ? new ResizeObserver(resize)
        : null;

    if (resizeObserver && getContainer()) {
      resizeObserver.observe(getContainer()!);
    }

    if (variant === 'fixed') {
      window.addEventListener('resize', resize);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((p) => {
        p.x += p.vx + Math.sin(Date.now() * 0.001 + p.seed * 10) * 0.2;
        p.y += p.vy + Math.cos(Date.now() * 0.001 + p.seed * 10) * 0.2;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const opacity = 0.1 + p.seed * 0.3;
        ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (variant === 'fixed') {
        window.removeEventListener('resize', resize);
      }
      resizeObserver?.disconnect();
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [variant]);

  const positionClass =
    variant === 'fixed'
      ? 'fixed inset-0 z-[5]'
      : 'absolute inset-0 z-[1]';

  return (
    <canvas
      ref={canvasRef}
      className={`${positionClass} pointer-events-none w-full h-full ${className}`}
    />
  );
}

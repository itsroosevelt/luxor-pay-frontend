'use client';

import { memo, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const CHECKOUT_DESKTOP_PREVIEW_WIDTH = 836;

export const CheckoutPreviewFrame = memo(function CheckoutPreviewFrame({
  mode,
  children,
  className,
}: {
  mode: 'mobile' | 'desktop';
  children: ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ scale: 1, height: 0 });

  useEffect(() => {
    if (mode !== 'desktop') return;

    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const update = () => {
      const width = container.getBoundingClientRect().width;
      const scale = Math.min(1, width / CHECKOUT_DESKTOP_PREVIEW_WIDTH);
      const height = inner.scrollHeight * scale;
      setLayout({ scale, height });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [mode]);

  if (mode === 'mobile') {
    return (
      <div
        className={cn(
          'mx-auto w-full max-w-[375px] overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl',
          className
        )}
      >
        <div className="max-h-[640px] overflow-y-auto overflow-x-hidden">{children}</div>
      </div>
    );
  }

  if (layout.scale >= 1) {
    return (
      <div
        className={cn(
          'mx-auto w-full max-w-[836px] overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl',
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'w-full overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl',
        className
      )}
      style={{ height: layout.height > 0 ? layout.height : undefined }}
    >
      <div
        ref={innerRef}
        className="origin-top-left"
        style={{
          width: CHECKOUT_DESKTOP_PREVIEW_WIDTH,
          transform: `scale(${layout.scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
});

'use client';

import { cn } from '@/lib/cn';

interface ChartPlaceholderProps {
  label?: string;
  className?: string;
  height?: number;
}

export function ChartPlaceholder({ label = 'Volume over time', className, height = 200 }: ChartPlaceholderProps) {
  const points = [40, 42, 38, 45, 44, 48, 46, 50, 49, 52, 51, 55];

  return (
    <div className={cn('dash-card p-5', className)}>
      <p className="text-sm font-medium text-[var(--dash-muted)] mb-4">{label}</p>
      <div className="relative" style={{ height }}>
        <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(153, 69, 255, 0.15)" />
              <stop offset="100%" stopColor="rgba(153, 69, 255, 0)" />
            </linearGradient>
          </defs>
          <polyline
            fill="none"
            stroke="rgba(153, 69, 255, 0.35)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            points={points.map((y, i) => `${(i / (points.length - 1)) * 400},${100 - y}`).join(' ')}
          />
          <polygon
            fill="url(#chartFill)"
            points={`0,100 ${points.map((y, i) => `${(i / (points.length - 1)) * 400},${100 - y}`).join(' ')} 400,100`}
          />
          <polyline
            fill="none"
            stroke="#9945ff"
            strokeWidth="2"
            points={points.map((y, i) => `${(i / (points.length - 1)) * 400},${100 - y + 5}`).join(' ')}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] text-[var(--dash-muted)] px-1">
          <span>00:00</span>
          <span>12:00</span>
          <span>23:59</span>
        </div>
      </div>
      <p className="text-xs text-[var(--dash-muted)] mt-3 italic">
        Placeholder — connect backend analytics for live Solana volume
      </p>
    </div>
  );
}

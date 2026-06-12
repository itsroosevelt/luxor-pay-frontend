'use client';

import { cn } from '@/lib/cn';

export interface RadarChartSeries {
  label: string;
  color: string;
}

interface RadarFlatLineChartProps {
  label?: string;
  series?: RadarChartSeries[];
  className?: string;
  height?: number;
}

export function RadarFlatLineChart({
  label,
  series = [],
  className,
  height = 180,
}: RadarFlatLineChartProps) {
  const flatY = 92;

  return (
    <div className={cn('space-y-3', className)}>
      {label && <p className="text-sm font-medium text-[var(--dash-muted)]">{label}</p>}
      {series.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {series.map(({ label: seriesLabel, color }) => (
            <div key={seriesLabel} className="flex items-center gap-1.5 text-xs text-[var(--dash-muted)]">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span>{seriesLabel}</span>
            </div>
          ))}
        </div>
      )}
      <div className="relative rounded-lg border border-[var(--dash-border)] bg-[var(--dash-panel-elevated)] px-3 pt-3" style={{ height }}>
        <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none" aria-hidden>
          {[25, 50, 75].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="400"
              y2={y}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
            />
          ))}
          {(series.length > 0 ? series : [{ label: 'Rate', color: '#9945ff' }]).map(
            ({ color }, index) => (
              <polyline
                key={index}
                fill="none"
                stroke={color}
                strokeWidth="2"
                opacity={series.length > 1 ? 0.85 : 1}
                points={Array.from({ length: 12 }, (_, i) => {
                  const x = (i / 11) * 400;
                  return `${x},${flatY}`;
                }).join(' ')}
              />
            )
          )}
        </svg>
        <div className="absolute inset-x-3 bottom-1 flex justify-between text-[10px] text-[var(--dash-muted)]">
          <span>90 days ago</span>
          <span>Today</span>
        </div>
      </div>
      <p className="text-xs text-[var(--dash-muted)] italic">
        Placeholder — connect backend analytics for live Solana fraud metrics
      </p>
    </div>
  );
}

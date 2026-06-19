'use client';

import { cn } from '@/lib/cn';

export interface RadarMetricItem {
  label: string;
  value: string;
  color: string;
}

interface RadarMetricLegendProps {
  metrics: RadarMetricItem[];
  className?: string;
}

export function RadarMetricLegend({ metrics, className }: RadarMetricLegendProps) {
  return (
    <div className={cn('flex flex-wrap gap-x-6 gap-y-3', className)}>
      {metrics.map(({ label, value, color }) => (
        <div key={label} className="min-w-[140px]">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs text-[var(--dash-muted)]">{label}</span>
          </div>
          <p className="text-xl font-semibold text-[var(--dash-text)] tabular-nums">{value}</p>
        </div>
      ))}
    </div>
  );
}

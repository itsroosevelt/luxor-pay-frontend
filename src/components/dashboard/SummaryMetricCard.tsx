'use client';

import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

interface SummaryMetricCardProps {
  label: string;
  value?: ReactNode;
  sublabel?: string;
  empty?: boolean;
  children?: ReactNode;
  className?: string;
}

export function SummaryMetricCard({
  label,
  value,
  sublabel,
  empty,
  children,
  className,
}: SummaryMetricCardProps) {
  return (
    <div className={cn('dash-card p-5 h-full flex flex-col min-h-[180px]', className)}>
      <p className="text-sm font-medium text-[var(--dash-muted)] mb-3">{label}</p>

      {empty ? (
        <div className="flex-1 flex items-center justify-center border border-dashed border-[var(--dash-border)] rounded-md min-h-[100px]">
          <p className="text-sm text-[var(--dash-muted)]">Sin datos</p>
        </div>
      ) : (
        <>
          {value !== undefined && value !== null && (
            <p className="text-xl font-semibold text-[var(--dash-text)] tabular-nums">{value}</p>
          )}
          {sublabel && <p className="text-xs text-[var(--dash-muted)] mt-1">{sublabel}</p>}
          {children && <div className="mt-3 flex-1 min-h-0">{children}</div>}
        </>
      )}
    </div>
  );
}

interface MiniBarChartProps {
  data: number[];
  height?: number;
  className?: string;
}

export function MiniBarChart({ data, height = 72, className }: MiniBarChartProps) {
  const max = Math.max(...data, 1);
  const hasData = data.some((v) => v > 0);

  if (!hasData) {
    return (
      <div
        className={cn(
          'flex items-center justify-center border border-dashed border-[var(--dash-border)] rounded-md',
          className
        )}
        style={{ height }}
      >
        <p className="text-sm text-[var(--dash-muted)]">No data</p>
      </div>
    );
  }

  return (
    <div className={cn('flex items-end gap-1', className)} style={{ height }}>
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-[var(--dash-accent)]/70 min-w-[4px]"
          style={{ height: `${Math.max((v / max) * 100, v > 0 ? 8 : 0)}%` }}
          title={String(v)}
        />
      ))}
    </div>
  );
}

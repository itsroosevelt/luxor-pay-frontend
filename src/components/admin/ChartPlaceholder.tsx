'use client';

import { cn } from '@/lib/cn';

export function BarChartPlaceholder({
  data,
  title,
  className,
}: {
  data: { label: string; value: number; color?: string }[];
  title?: string;
  className?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn('space-y-4', className)}>
      {title && <p className="text-sm font-medium text-[var(--dash-text)]">{title}</p>}
      <div className="flex items-end gap-2 h-40">
        {data.map((item) => (
          <div key={item.label} className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <div className="w-full flex items-end justify-center h-32">
              <div
                className="w-full max-w-[48px] rounded-t-md transition-all"
                style={{
                  height: `${(item.value / max) * 100}%`,
                  backgroundColor: item.color ?? 'var(--dash-accent)',
                  opacity: 0.85,
                }}
              />
            </div>
            <span className="text-[10px] text-[var(--dash-muted)] truncate w-full text-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DonutChartPlaceholder({
  data,
  className,
}: {
  data: { label: string; value: number; color?: string }[];
  className?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  const segments = data.reduce<
    Array<{ label: string; value: number; color?: string; start: number; end: number }>
  >((acc, item) => {
    const start = acc.length > 0 ? acc[acc.length - 1].end : 0;
    const end = start + (item.value / total) * 100;
    acc.push({ ...item, start, end });
    return acc;
  }, []);

  const gradient = segments
    .map((s) => `${s.color ?? 'var(--dash-accent)'} ${s.start}% ${s.end}%`)
    .join(', ');

  return (
    <div className={cn('flex flex-col sm:flex-row items-center gap-6', className)}>
      <div
        className="w-32 h-32 rounded-full shrink-0"
        style={{ background: `conic-gradient(${gradient})` }}
        aria-hidden
      />
      <ul className="space-y-2 flex-1 min-w-0">
        {data.map((item) => (
          <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color ?? 'var(--dash-accent)' }}
              />
              <span className="text-[var(--dash-text)] truncate">{item.label}</span>
            </span>
            <span className="text-[var(--dash-muted)] tabular-nums shrink-0">
              {Math.round((item.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

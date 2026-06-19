'use client';

import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface DashboardMetricCardProps {
  label: string;
  value: ReactNode;
  sublabel?: string;
  href?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
  className?: string;
  empty?: boolean;
}

export function DashboardMetricCard({
  label,
  value,
  sublabel,
  href,
  icon: Icon,
  trend,
  className,
  empty,
}: DashboardMetricCardProps) {
  const content = (
    <div
      className={cn(
        'dash-card p-5 h-full flex flex-col',
        href && 'hover:border-[var(--dash-accent)]/30 transition-colors cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-sm font-medium text-[var(--dash-muted)]">{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-md bg-[var(--dash-accent-soft)] flex items-center justify-center text-[var(--dash-accent)]">
            <Icon size={16} />
          </div>
        )}
      </div>

      {empty ? (
        <div className="flex-1 flex items-center justify-center py-6 border border-dashed border-[var(--dash-border)] rounded-md">
          <p className="text-sm text-[var(--dash-muted)]">No data</p>
        </div>
      ) : (
        <>
          <p className="text-2xl font-semibold text-[var(--dash-text)] tabular-nums">{value}</p>
          {(sublabel || trend) && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              {trend && (
                <span
                  className={cn(
                    'font-medium',
                    trend.positive ? 'text-emerald-400' : 'text-[var(--dash-muted)]'
                  )}
                >
                  {trend.value}
                </span>
              )}
              {sublabel && <span className="text-[var(--dash-muted)]">{sublabel}</span>}
            </div>
          )}
        </>
      )}
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

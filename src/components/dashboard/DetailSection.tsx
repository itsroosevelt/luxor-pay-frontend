'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function DetailSection({
  title,
  description,
  children,
  className,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn('dash-card overflow-hidden', className)}>
      <div className="px-5 py-4 border-b border-[var(--dash-border)] flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-[var(--dash-text)]">{title}</h2>
          {description && <p className="text-sm text-[var(--dash-muted)] mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function DetailSidebar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside className={cn('relative z-0 space-y-4 lg:sticky lg:top-6 lg:self-start', className)}>
      <div className="dash-card p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
          Detalles
        </h2>
        {children}
      </div>
    </aside>
  );
}

export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-[var(--dash-muted)]">{label}</p>
      <div className="text-sm text-[var(--dash-text)]">{children}</div>
    </div>
  );
}

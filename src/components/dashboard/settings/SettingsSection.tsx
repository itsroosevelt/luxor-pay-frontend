'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SettingsSectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

export function SettingsSection({
  title,
  description,
  action,
  children,
  className,
  footer,
}: SettingsSectionProps) {
  return (
    <section className={cn('dash-card overflow-hidden', className)}>
      <div className="px-5 py-4 border-b border-[var(--dash-border)] flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[var(--dash-text)]">{title}</h2>
          {description && (
            <p className="text-sm text-[var(--dash-muted)] mt-1 leading-relaxed">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div>{children}</div>
      {footer && (
        <div className="px-5 py-4 border-t border-[var(--dash-border)] bg-[var(--dash-surface-elevated)]">
          {footer}
        </div>
      )}
    </section>
  );
}

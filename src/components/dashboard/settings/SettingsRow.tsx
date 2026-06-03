'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SettingsRowProps {
  label: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SettingsRow({ label, children, action, className }: SettingsRowProps) {
  return (
    <div
      className={cn(
        'px-5 py-4 flex items-start justify-between gap-4 border-b border-[var(--dash-border)] last:border-b-0',
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--dash-text)]">{label}</p>
        <div className="text-sm text-[var(--dash-muted)] mt-0.5">{children}</div>
      </div>
      {action && <div className="shrink-0 pt-0.5">{action}</div>}
    </div>
  );
}

'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SettingsSectionRowProps {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsSectionRow({
  label,
  description,
  children,
  className,
}: SettingsSectionRowProps) {
  return (
    <div
      className={cn(
        'px-5 md:px-6 py-6 grid grid-cols-1 md:grid-cols-[minmax(140px,28%)_1fr] gap-3 md:gap-8 border-b border-[var(--dash-border)] last:border-b-0',
        className
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--dash-text)]">{label}</p>
        {description && (
          <p className="text-sm text-[var(--dash-muted)] mt-1 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="min-w-0 text-sm text-[var(--dash-text)]">{children}</div>
    </div>
  );
}

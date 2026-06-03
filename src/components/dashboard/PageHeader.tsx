'use client';

import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  filters?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, filters, className }: PageHeaderProps) {
  return (
    <header className={cn('dash-header', className)}>
      <div className="px-6 md:px-8 py-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--dash-text)] tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-[var(--dash-muted)] mt-1 max-w-2xl">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {filters && (
        <div className="px-6 md:px-8 pb-4 flex flex-wrap items-center gap-2">{filters}</div>
      )}
    </header>
  );
}

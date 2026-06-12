'use client';

import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
  children?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, children, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'dash-card w-full flex flex-col items-center justify-center text-center px-6 py-16',
        className
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-[var(--dash-surface-elevated)] border border-dashed border-[var(--dash-border)] flex items-center justify-center text-[var(--dash-muted)] mb-4">
          <Icon size={22} />
        </div>
      )}
      <h3 className="text-base font-semibold text-[var(--dash-text)]">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--dash-muted)] mt-2 max-w-md">{description}</p>
      )}
      {children}
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link href={action.href} className="dash-btn-primary px-4 py-2 text-sm inline-block">
              {action.label}
            </Link>
          ) : (
            <button type="button" onClick={action.onClick} className="dash-btn-primary px-4 py-2 text-sm">
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

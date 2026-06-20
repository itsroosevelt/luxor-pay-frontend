'use client';

import { cn } from '@/lib/cn';
import { ChevronDown } from 'lucide-react';

interface FilterChipProps {
  label: string;
  value?: string;
  onClick?: () => void;
  active?: boolean;
}

export function FilterChip({ label, value, onClick, active }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition-colors',
        active
          ? 'border-[var(--dash-accent)] bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]'
          : 'border-[var(--dash-border)] bg-[var(--dash-surface-elevated)] text-[var(--dash-text)] hover:bg-[rgba(255,255,255,0.08)]'
      )}
    >
      <span className="text-[var(--dash-muted)]">{label}</span>
      {value && <span className="font-medium">{value}</span>}
      <ChevronDown size={14} className="text-[var(--dash-muted)]" />
    </button>
  );
}

interface FilterRowProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterRow({ children, className }: FilterRowProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>{children}</div>
  );
}

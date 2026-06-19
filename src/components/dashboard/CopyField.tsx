'use client';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

export function CopyField({
  value,
  label,
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const copy = () => {
    navigator.clipboard.writeText(value);
    toast.success('Copied to clipboard');
  };

  return (
    <div className={cn('space-y-1', className)}>
      {label && <p className="text-xs text-[var(--dash-muted)] uppercase tracking-wide">{label}</p>}
      <div className="flex items-center gap-2 dash-card px-3 py-2 bg-[var(--dash-surface-elevated)]">
        <code className="text-xs text-[var(--dash-text)] truncate flex-1 font-mono">{value}</code>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 p-1.5 rounded-md hover:bg-[var(--dash-surface)] text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
          aria-label="Copy"
        >
          <Copy size={14} />
        </button>
      </div>
    </div>
  );
}

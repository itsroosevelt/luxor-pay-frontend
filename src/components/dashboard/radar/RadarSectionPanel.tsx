'use client';

import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

interface RadarSectionPanelProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  showExport?: boolean;
}

export function RadarSectionPanel({
  title,
  description,
  children,
  className,
  showExport = true,
}: RadarSectionPanelProps) {
  return (
    <section
      className={cn(
        'rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel)] p-5 md:p-6 space-y-5',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--dash-text)]">{title}</h2>
          <p className="text-sm text-[var(--dash-muted)] mt-1 max-w-2xl">{description}</p>
        </div>
        {showExport && (
          <button
            type="button"
            onClick={() => toast.info('Export will be available once backend analytics is connected.')}
            className="dash-btn-secondary px-3 py-1.5 text-sm inline-flex items-center gap-1.5 shrink-0"
          >
            <Download size={14} />
            Export
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

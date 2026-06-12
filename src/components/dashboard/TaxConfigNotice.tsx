'use client';

import Link from 'next/link';
import { Percent } from 'lucide-react';

interface TaxConfigNoticeProps {
  className?: string;
}

/** Inline hint that product tax behavior is configured on the Tax settings page. */
export function TaxConfigNotice({ className }: TaxConfigNoticeProps) {
  return (
    <div
      className={`dash-card p-4 flex items-start gap-3 text-sm ${className ?? ''}`}
    >
      <div className="w-8 h-8 rounded-md bg-[var(--dash-accent-soft)] flex items-center justify-center text-[var(--dash-accent)] shrink-0">
        <Percent size={16} />
      </div>
      <div className="min-w-0">
        <p className="font-medium text-[var(--dash-text)]">Tax configuration</p>
        <p className="text-[var(--dash-muted)] mt-0.5 text-xs leading-relaxed">
          Default tax rates for products and checkout are set in{' '}
          <Link href="/dashboard/tax" className="text-[var(--dash-accent)] hover:underline">
            Tax settings
          </Link>
          . Per-product overrides will be available when the backend is connected.
        </p>
      </div>
    </div>
  );
}

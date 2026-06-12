'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { dashStatusBadges } from '@/lib/dashboard/dashboard-styles';

export function RadarSidebar() {
  return (
    <aside className="space-y-4">
      <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel)] p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[var(--dash-text)]">Monitoring programs</h3>
        <p className="text-xs text-[var(--dash-muted)] leading-relaxed">
          Luxor Pay monitors on-chain settlement patterns, wallet reputation, and program-derived risk
          signals on Solana mainnet.
        </p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-sm text-[var(--dash-text)]">Solana mainnet monitoring</span>
          <span className={dashStatusBadges.success}>Compliant</span>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel)] p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[var(--dash-text)]">Resources</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <button
              type="button"
              onClick={() => toast.info('Radar documentation will be published with backend integration.')}
              className="inline-flex items-center gap-1.5 text-[var(--dash-accent)] hover:underline"
            >
              Radar for Solana payments
              <ExternalLink size={12} />
            </button>
          </li>
          <li>
            <Link
              href="/dashboard/transactions?summary=disputed"
              className="inline-flex items-center gap-1.5 text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors"
            >
              Review disputed settlements
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/settings/equipo?tab=historial"
              className="inline-flex items-center gap-1.5 text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors"
            >
              Security history
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}

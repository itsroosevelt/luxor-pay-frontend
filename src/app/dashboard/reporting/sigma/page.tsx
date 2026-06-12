'use client';

import Link from 'next/link';
import { BarChart3, Database, Receipt, Users } from 'lucide-react';
import { ReportingSectionNav, BackendNotice } from '@/components/dashboard';
import { SettingsPageHeader } from '@/components/dashboard/settings';
import { toast } from 'sonner';

const ANALYSIS_TOPICS = [
  {
    icon: BarChart3,
    title: 'Payment volume',
    description:
      'Aggregate gross and net volume by day, currency (SOL / USDC), and payment method across your Luxor Pay account.',
  },
  {
    icon: Users,
    title: 'Customers',
    description:
      'Cohort retention, new customer counts, and spend distribution tied to wallet addresses and payment links.',
  },
  {
    icon: Database,
    title: 'Settlements',
    description:
      'On-chain confirmation latency, pending vs available balance movements, and merchant wallet payouts.',
  },
] as const;

export default function ReportingSigmaPage() {
  return (
    <>
      <SettingsPageHeader
        title="Sigma"
        description="Run SQL-style queries on your Luxor Pay data for finance, operations, and reconciliation."
      />
      <div className="p-6 md:px-8 md:pb-8 max-w-[1400px] mx-auto space-y-6 pb-12">
        <ReportingSectionNav />
        <BackendNotice notImplemented />

        <div className="dash-card p-5 md:p-6 space-y-3">
          <h2 className="text-sm font-semibold text-[var(--dash-text)]">About Sigma</h2>
          <p className="text-sm text-[var(--dash-muted)] leading-relaxed max-w-3xl">
            Sigma lets you explore Luxor Pay transaction data with SQL-like reporting. Query confirmed
            settlements, customer activity, and balance events without exporting raw CSV files — ideal
            for month-end close and Solana reconciliation workflows.
          </p>
        </div>

        <section aria-labelledby="sigma-analyze-heading">
          <h2
            id="sigma-analyze-heading"
            className="text-sm font-semibold text-[var(--dash-text)] mb-3"
          >
            What you can analyze
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ANALYSIS_TOPICS.map(({ icon: Icon, title, description }) => (
              <article key={title} className="dash-card p-5 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--dash-accent-soft)] flex items-center justify-center text-[var(--dash-accent)]">
                  <Icon size={20} aria-hidden />
                </div>
                <h3 className="text-sm font-semibold text-[var(--dash-text)]">{title}</h3>
                <p className="text-sm text-[var(--dash-muted)] leading-relaxed">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="dash-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--dash-border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--dash-text)]">Query editor</h2>
              <p className="text-sm text-[var(--dash-muted)] mt-1">
                Write and save custom reports against your Luxor Pay dataset.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toast.message('Query editor — coming soon')}
              className="dash-btn-primary px-4 py-2 text-sm shrink-0"
            >
              Open query editor
            </button>
          </div>
          <div className="px-5 py-4 flex flex-wrap items-center gap-4 text-sm">
            <span className="text-[var(--dash-muted)]">
              Need live payment data now? Browse and export from Transactions.
            </span>
            <Link
              href="/dashboard/transactions"
              className="inline-flex items-center gap-1.5 font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
            >
              <Receipt size={16} aria-hidden />
              View transactions
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

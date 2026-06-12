'use client';

import Link from 'next/link';
import {
  PageHeader,
  ReportingSectionNav,
  DashboardMetricCard,
  ChartPlaceholder,
  BackendNotice,
} from '@/components/dashboard';
import { BarChart3, FileText, Receipt, ArrowRight } from 'lucide-react';

const REPORT_LINKS = [
  {
    href: '/dashboard/transactions',
    icon: Receipt,
    title: 'Payment activity',
    description: 'Filter and export confirmed on-chain settlements.',
  },
  {
    href: '/dashboard/balances',
    icon: BarChart3,
    title: 'Balance summary',
    description: 'Incoming and available balances by currency.',
  },
  {
    href: '/dashboard/reporting/sigma',
    icon: FileText,
    title: 'Sigma reports',
    description: 'Custom SQL-style reporting for finance teams.',
  },
] as const;

export default function ReportingOverviewPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Financial and operational reports for your Solana payment activity."
      />
      <div className="p-6 md:px-8 md:pb-8 max-w-[1400px] mx-auto space-y-6">
        <ReportingSectionNav />
        <BackendNotice notImplemented />
        <div className="grid sm:grid-cols-2 gap-4">
          <DashboardMetricCard label="Gross volume (7d)" value="—" sublabel="Connect backend analytics" />
          <DashboardMetricCard label="Net volume (7d)" value="—" sublabel="Connect backend analytics" />
        </div>
        <ChartPlaceholder label="Volume trend" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_LINKS.map(({ href, icon: Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 hover:bg-[var(--dash-surface-elevated)] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]">
                  <Icon size={20} />
                </div>
                <ArrowRight
                  size={16}
                  className="text-[var(--dash-muted)] group-hover:text-[var(--dash-accent)] transition-colors shrink-0 mt-1"
                />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-[var(--dash-text)]">{title}</h3>
              <p className="mt-1 text-xs text-[var(--dash-muted)] leading-relaxed">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

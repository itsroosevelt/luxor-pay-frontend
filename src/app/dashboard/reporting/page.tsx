'use client';

import Link from 'next/link';
import {
  PageHeader,
  EmptyState,
  ReportingSectionNav,
  BackendNotice,
  ChartPlaceholder,
} from '@/components/dashboard';
import { BarChart3 } from 'lucide-react';

export default function ReportingPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Payment volume, SOL/USDC mix, and on-chain confirmation rates."
      />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <ReportingSectionNav />
        <BackendNotice notImplemented />
        <ChartPlaceholder label="Gross volume" />
        <EmptyState
          icon={BarChart3}
          title="No saved reports"
          description="Export CSV or schedule email digests when your backend adds /api/v1/reporting. Until then, use Transactions for live payment data."
          action={{ label: 'View transactions', href: '/dashboard/transactions' }}
        />
        <p className="text-sm text-[var(--dash-muted)]">
          Advanced analytics:{' '}
          <Link href="/dashboard/reporting/sigma" className="text-[var(--dash-accent)]">
            Sigma
          </Link>{' '}
          ·{' '}
          <Link
            href="/dashboard/reporting/revenue-recognition"
            className="text-[var(--dash-accent)]"
          >
            Revenue recognition
          </Link>
        </p>
      </div>
    </>
  );
}

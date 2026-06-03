'use client';

import { fetchSubscriptionsApi } from '@/lib/api/billing';
import { formatCurrencyAmount } from '@/lib/format-currency';
import type { BillingSubscription } from '@luxor/contracts';
import {
  PageHeader,
  EmptyState,
  BillingSectionNav,
  BackendNotice,
  DataTable,
  type DataTableColumn,
} from '@/components/dashboard';
import { useBackendList } from '@/hooks/useBackendList';
import { Repeat } from 'lucide-react';
import { dashStatusBadges } from '@/lib/dashboard-styles';
import { cn } from '@/lib/cn';

const statusStyles: Record<BillingSubscription['status'], string> = {
  active: dashStatusBadges.success,
  past_due: dashStatusBadges.warning,
  canceled: dashStatusBadges.neutral,
  trialing: dashStatusBadges.warning,
};

const columns: DataTableColumn<BillingSubscription>[] = [
  {
    key: 'customer',
    header: 'Customer',
    render: (s) => <span>{s.customerName ?? s.customerId}</span>,
  },
  {
    key: 'amount',
    header: 'Amount',
    render: (s) => (
      <span className="tabular-nums font-medium">
        {formatCurrencyAmount(s.amount, s.currency)} / {s.interval}
      </span>
    ),
  },
  {
    key: 'wallet',
    header: 'Wallet',
    render: (s) => (
      <span className="font-mono text-xs text-[var(--dash-muted)] truncate max-w-[140px] block">
        {s.walletAddress ?? '—'}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (s) => (
      <span className={cn('capitalize', statusStyles[s.status])}>{s.status.replace('_', ' ')}</span>
    ),
  },
];

export default function BillingSubscriptionsPage() {
  const { items, loading, unavailable, notImplemented } = useBackendList(fetchSubscriptionsApi);

  return (
    <>
      <PageHeader
        title="Subscriptions"
        description="Recurring on-chain plans billed in SOL or USDC via connected wallets."
      />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <BillingSectionNav />
        <BackendNotice unavailable={unavailable} notImplemented={notImplemented} />
        {!loading && items.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="No subscriptions"
            description="Wallet-based recurring billing will appear here when your backend implements subscription endpoints."
          />
        ) : (
          <DataTable
            columns={columns}
            data={items}
            rowKey={(s) => s.id}
            loading={loading}
            loadingMessage="Loading subscriptions…"
          />
        )}
      </div>
    </>
  );
}

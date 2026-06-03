'use client';

import { apiGet } from '@/lib/api/http';
import type { DisputeRecord } from '@luxor/contracts';
import { formatCurrencyAmount } from '@/lib/format-currency';
import {
  PageHeader,
  EmptyState,
  BackendNotice,
  DataTable,
  type DataTableColumn,
} from '@/components/dashboard';
import { useBackendList } from '@/hooks/useBackendList';
import { Scale } from 'lucide-react';

const fetchDisputes = () => apiGet<DisputeRecord[]>('/api/v1/disputes');

const columns: DataTableColumn<DisputeRecord>[] = [
  {
    key: 'amount',
    header: 'Amount',
    render: (d) => (
      <span className="tabular-nums font-medium">
        {formatCurrencyAmount(d.amount, d.currency)}
      </span>
    ),
  },
  {
    key: 'reference',
    header: 'Payment',
    render: (d) => <span className="font-mono text-xs">{d.paymentReference}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (d) => <span className="capitalize text-[var(--dash-muted)]">{d.status.replace('_', ' ')}</span>,
  },
  {
    key: 'reason',
    header: 'Reason',
    render: (d) => <span className="text-sm text-[var(--dash-muted)]">{d.reason ?? '—'}</span>,
  },
];

export default function DisputesPage() {
  const { items, loading, unavailable, notImplemented } = useBackendList(fetchDisputes);

  return (
    <>
      <PageHeader
        title="Disputes"
        description="On-chain payment disputes and chargeback-style reviews for SOL/USDC."
      />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <BackendNotice unavailable={unavailable} notImplemented={notImplemented} />
        {!loading && items.length === 0 ? (
          <EmptyState
            icon={Scale}
            title="No disputes"
            description="Disputed payments will appear with their Solana transaction reference when your backend adds dispute handling."
            action={{ label: 'Transactions', href: '/dashboard/transactions' }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={items}
            rowKey={(d) => d.id}
            loading={loading}
            loadingMessage="Loading disputes…"
          />
        )}
      </div>
    </>
  );
}

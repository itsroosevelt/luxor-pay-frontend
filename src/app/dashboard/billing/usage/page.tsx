'use client';

import { apiGet } from '@/lib/api/http';
import {
  PageHeader,
  EmptyState,
  BillingSectionNav,
  BackendNotice,
  DataTable,
  type DataTableColumn,
} from '@/components/dashboard';
import { useBackendList } from '@/hooks/useBackendList';
import { Gauge } from 'lucide-react';

interface UsageRow {
  id: string;
  metric: string;
  quantity: number;
  period: string;
}

const fetchUsage = () => apiGet<UsageRow[]>('/api/v1/billing/usage');

const columns: DataTableColumn<UsageRow>[] = [
  { key: 'metric', header: 'Metric', render: (r) => <span>{r.metric}</span> },
  {
    key: 'quantity',
    header: 'Quantity',
    render: (r) => <span className="tabular-nums">{r.quantity}</span>,
  },
  { key: 'period', header: 'Period', render: (r) => <span>{r.period}</span> },
];

export default function BillingUsagePage() {
  const { items, loading, unavailable, notImplemented } = useBackendList(fetchUsage);

  return (
    <>
      <PageHeader
        title="Usage-based billing"
        description="Meter API calls, transactions, or compute — bill in SOL or USDC on Solana."
      />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <BillingSectionNav />
        <BackendNotice unavailable={unavailable} notImplemented={notImplemented} />
        {!loading && items.length === 0 ? (
          <EmptyState
            icon={Gauge}
            title="No usage records"
            description="Usage meters sync from your backend when /api/v1/billing/usage is implemented."
          />
        ) : (
          <DataTable
            columns={columns}
            data={items}
            rowKey={(r) => r.id}
            loading={loading}
            loadingMessage="Loading usage…"
          />
        )}
      </div>
    </>
  );
}

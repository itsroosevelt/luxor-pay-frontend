'use client';

import { apiGet } from '@/lib/api/http';
import type { RadarRule } from '@luxor/contracts';
import {
  PageHeader,
  EmptyState,
  BackendNotice,
  DataTable,
  type DataTableColumn,
} from '@/components/dashboard';
import { useBackendList } from '@/hooks/useBackendList';
import { Radar } from 'lucide-react';

const fetchRadar = () => apiGet<RadarRule[]>('/api/v1/radar/rules');

const columns: DataTableColumn<RadarRule>[] = [
  { key: 'name', header: 'Rule', render: (r) => <span className="font-medium">{r.name}</span> },
  {
    key: 'action',
    header: 'Action',
    render: (r) => <span className="capitalize text-[var(--dash-muted)]">{r.action}</span>,
  },
  {
    key: 'enabled',
    header: 'Status',
    render: (r) => (
      <span className={r.enabled ? 'text-emerald-400' : 'text-[var(--dash-muted)]'}>
        {r.enabled ? 'Enabled' : 'Disabled'}
      </span>
    ),
  },
];

export default function RadarPage() {
  const { items, loading, unavailable, notImplemented } = useBackendList(fetchRadar);

  return (
    <>
      <PageHeader
        title="Radar"
        description="Fraud and risk rules for high-value SOL/USDC payments and wallet velocity."
      />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <BackendNotice unavailable={unavailable} notImplemented={notImplemented} />
        {!loading && items.length === 0 ? (
          <EmptyState
            icon={Radar}
            title="No risk rules"
            description="Block suspicious wallet patterns or large USDC transfers when /api/v1/radar/rules is implemented on your backend."
          />
        ) : (
          <DataTable
            columns={columns}
            data={items}
            rowKey={(r) => r.id}
            loading={loading}
            loadingMessage="Loading rules…"
          />
        )}
      </div>
    </>
  );
}

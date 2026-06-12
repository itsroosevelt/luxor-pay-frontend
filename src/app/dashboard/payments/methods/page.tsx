'use client';

import { useMemo, useState } from 'react';
import {
  BackendNotice,
  DataTable,
  PaymentsSectionNav,
  type DataTableColumn,
} from '@/components/dashboard';
import { SettingsPageHeader } from '@/components/dashboard/settings';
import { cn } from '@/lib/cn';
import { dashStatusBadges } from '@/lib/dashboard/dashboard-styles';
import {
  countMethodsByStatus,
  filterMethodsBySummary,
  SOLANA_PAYMENT_METHODS,
  statusLabel,
  type MethodSummaryFilter,
  type SolanaPaymentMethod,
} from '@/lib/dashboard/payment-methods';

const SUMMARY_FILTERS: { id: MethodSummaryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'enabled', label: 'Enabled' },
  { id: 'disabled', label: 'Disabled' },
  { id: 'action_required', label: 'Action required' },
];

function statusBadgeClass(status: SolanaPaymentMethod['status']) {
  switch (status) {
    case 'enabled':
      return dashStatusBadges.success;
    case 'disabled':
      return dashStatusBadges.neutral;
    case 'action_required':
      return dashStatusBadges.warning;
  }
}

export default function PaymentMethodsPage() {
  const [filter, setFilter] = useState<MethodSummaryFilter>('all');
  const counts = useMemo(() => countMethodsByStatus(SOLANA_PAYMENT_METHODS), []);
  const filtered = useMemo(
    () => filterMethodsBySummary(SOLANA_PAYMENT_METHODS, filter),
    [filter]
  );

  const columns: DataTableColumn<SolanaPaymentMethod>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (method) => (
        <span className="font-medium text-[var(--dash-text)]">{method.name}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (method) => (
        <span className={statusBadgeClass(method.status)}>{statusLabel(method.status)}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (method) => <span className="text-[var(--dash-muted)]">{method.type}</span>,
    },
    {
      key: 'regions',
      header: 'Regions / popularity',
      render: (method) => <span className="text-[var(--dash-muted)]">{method.regions}</span>,
    },
  ];

  return (
    <>
      <SettingsPageHeader
        title="Payments"
        description="Solana-native payment methods available to your customers at checkout."
      />
      <div className="p-6 md:px-8 md:pb-8 w-full space-y-6 pb-12">
        <PaymentsSectionNav />
        <BackendNotice notImplemented />

        <div className="flex gap-2 overflow-x-auto pb-1">
          {SUMMARY_FILTERS.map(({ id, label }) => {
            const count = counts[id];
            const active = filter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={cn(
                  'shrink-0 dash-card px-4 py-3 min-w-[120px] text-left transition-colors',
                  active && 'ring-2 ring-[var(--dash-accent)] border-[var(--dash-accent)]'
                )}
              >
                <p className="text-xs text-[var(--dash-muted)]">{label}</p>
                <p className="text-xl font-semibold tabular-nums mt-1 text-[var(--dash-text)]">
                  {count}
                </p>
              </button>
            );
          })}
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(row) => row.id}
          footer={
            <p className="px-4 py-3 text-xs text-[var(--dash-muted)] border-t border-[var(--dash-border)]">
              {filtered.length} Solana payment method{filtered.length === 1 ? '' : 's'}. Card, bank,
              and fiat rails are not supported — Luxor Pay is Solana-only.
            </p>
          }
        />
      </div>
    </>
  );
}

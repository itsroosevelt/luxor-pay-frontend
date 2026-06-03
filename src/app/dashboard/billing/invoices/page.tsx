'use client';

import { fetchInvoicesApi } from '@/lib/api/billing';
import { formatCurrencyAmount } from '@/lib/format-currency';
import type { BillingInvoice } from '@luxor/contracts';
import { getExplorerTxUrl } from '@/web3/config/network';
import {
  PageHeader,
  EmptyState,
  BillingSectionNav,
  BackendNotice,
  DataTable,
  type DataTableColumn,
} from '@/components/dashboard';
import { useBackendList } from '@/hooks/useBackendList';
import { FileText } from 'lucide-react';

const columns: DataTableColumn<BillingInvoice>[] = [
  {
    key: 'id',
    header: 'Invoice',
    render: (i) => <span className="font-mono text-xs">{i.id}</span>,
  },
  {
    key: 'amount',
    header: 'Amount',
    render: (i) => (
      <span className="tabular-nums font-medium">{formatCurrencyAmount(i.amount, i.currency)}</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (i) => <span className="capitalize text-[var(--dash-muted)]">{i.status}</span>,
  },
  {
    key: 'onchain',
    header: 'On-chain',
    render: (i) =>
      i.onChainSignature ? (
        <a
          href={getExplorerTxUrl(i.onChainSignature)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--dash-accent)] text-sm"
        >
          View tx
        </a>
      ) : (
        <span className="text-[var(--dash-muted)]">—</span>
      ),
  },
];

export default function BillingInvoicesPage() {
  const { items, loading, unavailable, notImplemented } = useBackendList(fetchInvoicesApi);

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Send and track SOL/USDC invoices with optional Solana Pay settlement."
      />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <BillingSectionNav />
        <BackendNotice unavailable={unavailable} notImplemented={notImplemented} />
        {!loading && items.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No invoices"
            description="Invoices paid on-chain will list here with explorer links when the billing API is connected."
          />
        ) : (
          <DataTable
            columns={columns}
            data={items}
            rowKey={(i) => i.id}
            loading={loading}
            loadingMessage="Loading invoices…"
          />
        )}
      </div>
    </>
  );
}

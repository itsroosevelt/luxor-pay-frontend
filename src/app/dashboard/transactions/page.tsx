'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { listPayments } from '@/lib/payments-api';
import type { Currency, PaymentOrder } from '@luxor/contracts';
import { getExplorerTxUrl } from '@/web3/config/network';
import { toast } from 'sonner';
import {
  PageHeader,
  EmptyState,
  DataTable,
  FilterRow,
  FilterChip,
  CreatePaymentMenu,
  type DataTableColumn,
} from '@/components/dashboard';
import {
  filterActivityByTab,
  mergeBalanceActivities,
  type BalanceActivityRow,
  type BalanceActivityStatus,
  formatBalanceAmount,
} from '@/lib/balance-utils';
import {
  type PaymentSummaryFilter,
  type TransactionTab,
  computePaymentStatusCounts,
  filterPaymentsBySummary,
  formatPaymentAmount,
  paymentCustomerLabel,
  paymentMethodLabel,
  paymentRejectionReason,
  paymentStatusLabels,
} from '@/lib/transaction-utils';
import { cn } from '@/lib/cn';
import { downloadPaymentsCsv } from '@/lib/dashboard/payment-export';
import { dashStatusBadges } from '@/lib/dashboard-styles';
import {
  Receipt,
  BarChart3,
  Info,
  MoreHorizontal,
  Download,
  Columns3,
  Settings2,
} from 'lucide-react';

const PAGE_SIZE = 20;

const TRANSACTION_TABS: { id: TransactionTab; label: string }[] = [
  { id: 'payments', label: 'Payments' },
  { id: 'transfers', label: 'Transfers' },
  { id: 'topups', label: 'Top-ups' },
  { id: 'all', label: 'All activity' },
];

const SUMMARY_CARDS: { id: PaymentSummaryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'succeeded', label: 'Succeeded' },
  { id: 'refunded', label: 'Refunded' },
  { id: 'disputed', label: 'Disputed' },
  { id: 'failed', label: 'Failed' },
  { id: 'uncaptured', label: 'Uncaptured' },
];

const CURRENCIES: Currency[] = ['USDC', 'SOL'];

const VALID_TABS = new Set<TransactionTab>(['payments', 'transfers', 'topups', 'all']);

function parseTabParam(value: string | null): TransactionTab {
  if (value && VALID_TABS.has(value as TransactionTab)) {
    return value as TransactionTab;
  }
  return 'payments';
}

const paymentStatusStyles: Record<PaymentOrder['status'], string> = {
  pending: dashStatusBadges.warning,
  confirmed: dashStatusBadges.success,
  expired: dashStatusBadges.neutral,
  failed: dashStatusBadges.error,
};

const activityStatusStyles: Record<BalanceActivityStatus, string> = {
  paid: dashStatusBadges.success,
  pending: dashStatusBadges.warning,
  failed: dashStatusBadges.error,
};

const activityStatusLabels: Record<BalanceActivityStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
};

function formatTableDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTableDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function balanceTypeLabel(row: BalanceActivityRow): string {
  if (row.status === 'pending') return 'Incoming';
  if (row.status === 'paid') return 'Available';
  return '—';
}

function RangePaginationFooter({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  if (totalItems === 0) return null;
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, totalItems);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-[var(--dash-border)] text-sm text-[var(--dash-muted)]">
      <span>
        Showing {from}–{to} of {totalItems} items
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          className="dash-btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          className="dash-btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function CountFooter({ totalItems }: { totalItems: number }) {
  if (totalItems === 0) return null;
  return (
    <div className="px-4 py-3 border-t border-[var(--dash-border)] text-sm text-[var(--dash-muted)]">
      {totalItems} {totalItems === 1 ? 'item' : 'items'}
    </div>
  );
}

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseTabParam(searchParams.get('tab'));

  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryFilter, setSummaryFilter] = useState<PaymentSummaryFilter>('all');
  const [currencyFilter, setCurrencyFilter] = useState<Currency | 'all'>('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const data = await listPayments(token);
        setOrders(data);
      } catch {
        toast.error('Could not load transactions. Is the backend running?');
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const resetPagination = useCallback(() => {
    setPage(1);
    setSelected(new Set());
  }, []);

  const setTab = useCallback(
    (tab: TransactionTab) => {
      resetPagination();
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tab);
      router.replace(`/dashboard/transactions?${params.toString()}`, { scroll: false });
    },
    [resetPagination, router, searchParams]
  );

  useEffect(() => {
    if (!openMenuId) return;
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [openMenuId]);

  const statusCounts = useMemo(() => computePaymentStatusCounts(orders), [orders]);

  const filteredPayments = useMemo(() => {
    let rows = filterPaymentsBySummary(orders, summaryFilter);
    if (currencyFilter !== 'all') {
      rows = rows.filter((o) => o.currency === currencyFilter);
    }
    return [...rows].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders, summaryFilter, currencyFilter]);

  const allActivities = useMemo(() => mergeBalanceActivities(orders), [orders]);

  const transferRows = useMemo(
    () => filterActivityByTab(allActivities, 'transfers'),
    [allActivities]
  );

  const topupRows = useMemo(
    () => filterActivityByTab(allActivities, 'topups'),
    [allActivities]
  );

  const filteredActivities = useMemo(() => {
    let rows = allActivities;
    if (currencyFilter !== 'all') {
      rows = rows.filter((r) => r.currency === currencyFilter);
    }
    return rows;
  }, [allActivities, currencyFilter]);

  const paginatedPayments = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredPayments.slice(start, start + PAGE_SIZE);
  }, [filteredPayments, page]);

  const paginatedActivities = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredActivities.slice(start, start + PAGE_SIZE);
  }, [filteredActivities, page]);

  const paymentTotalPages = Math.max(1, Math.ceil(filteredPayments.length / PAGE_SIZE));
  const activityTotalPages = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE));

  const allPageSelected =
    paginatedPayments.length > 0 &&
    paginatedPayments.every((o) => selected.has(o.reference));

  const paymentColumns: DataTableColumn<PaymentOrder>[] = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          className="rounded border-[var(--dash-border)]"
          checked={allPageSelected}
          aria-label="Select all on this page"
          onChange={(e) => {
            const next = new Set(selected);
            if (e.target.checked) {
              paginatedPayments.forEach((o) => next.add(o.reference));
            } else {
              paginatedPayments.forEach((o) => next.delete(o.reference));
            }
            setSelected(next);
          }}
        />
      ),
      className: 'w-10',
      render: (o) => (
        <input
          type="checkbox"
          className="rounded border-[var(--dash-border)]"
          checked={selected.has(o.reference)}
          aria-label={`Select ${o.reference}`}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            const next = new Set(selected);
            if (e.target.checked) next.add(o.reference);
            else next.delete(o.reference);
            setSelected(next);
          }}
        />
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (o) => (
        <div className="flex flex-col gap-1 min-w-[120px]">
          <span className="font-medium tabular-nums">{formatPaymentAmount(o.amount, o.currency)}</span>
          <span className={cn('w-fit', paymentStatusStyles[o.status])}>
            {paymentStatusLabels[o.status]}
          </span>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (o) => <span>{paymentCustomerLabel(o)}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      render: (o) => (
        <span className="text-[var(--dash-muted)] tabular-nums">{formatTableDate(o.createdAt)}</span>
      ),
    },
    {
      key: 'rejection',
      header: 'Decline reason',
      render: (o) => (
        <span className="text-[var(--dash-muted)] text-sm">{paymentRejectionReason(o)}</span>
      ),
    },
    {
      key: 'method',
      header: 'Payment method',
      render: (o) => <span>{paymentMethodLabel(o)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12 text-right',
      render: (o) => (
        <div className="relative flex justify-end" ref={openMenuId === o.reference ? menuRef : undefined}>
          <button
            type="button"
            className="p-1.5 rounded-md hover:bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)]"
            aria-label="Actions"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId((id) => (id === o.reference ? null : o.reference));
            }}
          >
            <MoreHorizontal size={18} />
          </button>
          {openMenuId === o.reference && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1 z-20 min-w-[180px] dash-card py-1 shadow-lg"
            >
              {o.signature ? (
                <a
                  role="menuitem"
                  href={getExplorerTxUrl(o.signature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)]"
                  onClick={() => setOpenMenuId(null)}
                >
                  View on Solana
                </a>
              ) : null}
              <button
                type="button"
                role="menuitem"
                className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)]"
                onClick={() => {
                  void navigator.clipboard.writeText(o.reference);
                  toast.success('Reference copied');
                  setOpenMenuId(null);
                }}
              >
                Copy reference
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const transferColumns: DataTableColumn<BalanceActivityRow>[] = [
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => (
        <div className="flex flex-col gap-1 min-w-[120px]">
          <span className="font-medium tabular-nums">
            {formatBalanceAmount(row.amount, row.currency)}
          </span>
          <span className={cn('w-fit', activityStatusStyles[row.status])}>
            {activityStatusLabels[row.status]}
          </span>
        </div>
      ),
    },
    {
      key: 'destination',
      header: 'Destination',
      render: (row) => (
        <span className="text-[var(--dash-muted)] font-mono text-xs">{row.destination}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => <span>{row.typeLabel}</span>,
    },
    {
      key: 'availableOn',
      header: 'Arrives on',
      className: 'text-right',
      render: (row) => (
        <span className="text-[var(--dash-muted)] tabular-nums">
          {formatTableDateShort(row.availableOn)}
        </span>
      ),
    },
  ];

  const activityColumns: DataTableColumn<BalanceActivityRow>[] = [
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => (
        <span className="font-medium tabular-nums">
          {formatBalanceAmount(row.amount, row.currency)}
        </span>
      ),
    },
    {
      key: 'fees',
      header: 'Fees',
      render: () => <span className="text-[var(--dash-muted)]">—</span>,
    },
    {
      key: 'total',
      header: 'Total',
      render: (row) => (
        <span className="font-medium tabular-nums">
          {formatBalanceAmount(row.amount, row.currency)}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => <span>{row.typeLabel}</span>,
    },
    {
      key: 'balanceType',
      header: 'Balance type',
      render: (row) => <span>{balanceTypeLabel(row)}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => (
        <span className="text-[var(--dash-muted)] font-mono text-xs">{row.id}</span>
      ),
    },
    {
      key: 'balanceTx',
      header: 'Balance transaction',
      render: (row) => (
        <span className="text-[var(--dash-muted)] font-mono text-xs">{row.id}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (row) => (
        <span className="text-[var(--dash-muted)] tabular-nums">
          {formatTableDateShort(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'availableOn',
      header: 'Available on',
      className: 'text-right',
      render: (row) => (
        <span className="text-[var(--dash-muted)] tabular-nums">
          {formatTableDateShort(row.availableOn)}
        </span>
      ),
    },
  ];

  const showPaymentsUi = activeTab === 'payments';
  const showTransfersUi = activeTab === 'transfers';
  const showTopupsUi = activeTab === 'topups';
  const showAllUi = activeTab === 'all';

  const tabRowCount =
    activeTab === 'payments'
      ? filteredPayments.length
      : activeTab === 'transfers'
        ? transferRows.length
        : activeTab === 'topups'
          ? topupRows.length
          : filteredActivities.length;

  const isEmptyTab =
    !loading &&
    ((activeTab === 'payments' && filteredPayments.length === 0) ||
      (activeTab === 'transfers' && transferRows.length === 0) ||
      (activeTab === 'topups' && topupRows.length === 0) ||
      (activeTab === 'all' && filteredActivities.length === 0));

  const emptyTitle =
    activeTab === 'transfers'
      ? 'No transfers'
      : activeTab === 'topups'
        ? 'No top-ups'
        : activeTab === 'all'
          ? 'No activity'
          : 'No payments';

  const emptyDescription =
    activeTab === 'transfers'
      ? 'Transfers to external wallets will appear here when available on your account.'
      : activeTab === 'topups'
        ? 'Balance top-ups will appear here when available on your account.'
        : activeTab === 'all'
          ? 'Share a payment link or charge with POS to see activity.'
          : summaryFilter !== 'all' || currencyFilter !== 'all'
            ? 'No payments match the selected filters.'
            : 'Share a payment link or charge with POS to receive your first Solana payment.';

  const handleExport = () => {
    if (activeTab === 'transfers' || activeTab === 'topups') {
      toast.info('Export — coming soon');
      return;
    }
    const rows =
      activeTab === 'payments'
        ? filteredPayments
        : [...orders]
            .filter((o) => currencyFilter === 'all' || o.currency === currencyFilter)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (rows.length === 0) {
      toast.info('No data to export');
      return;
    }
    downloadPaymentsCsv(rows);
    toast.success(`Exported ${rows.length} payment${rows.length === 1 ? '' : 's'}`);
  };

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      {showPaymentsUi && <CreatePaymentMenu />}
      {showTransfersUi && (
        <button
          type="button"
          className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
          onClick={() => toast.info('Transfer management — coming soon')}
        >
          <Settings2 size={16} />
          Manage
        </button>
      )}
      {(showPaymentsUi || showTransfersUi || showAllUi) && (
        <button
          type="button"
          className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
          onClick={() => toast.info('Analytics — coming soon')}
        >
          <BarChart3 size={16} />
          Analyze
        </button>
      )}
    </div>
  );

  return (
    <>
      <PageHeader title="Transactions" actions={headerActions} />

      <div className="px-6 md:px-8 pt-4">
        <div className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-elevated)] px-4 py-3 text-sm text-[var(--dash-muted)] flex gap-3 items-start max-w-[1400px] mx-auto">
          <Info size={16} className="shrink-0 mt-0.5 text-[var(--dash-accent)]" />
          <p>
            Confirmed Luxor Pay payments are credited to your Solana wallet. Amounts and statuses
            reflect real orders from your account — no demo data.
          </p>
        </div>
      </div>

      <div className="p-6 md:px-8 md:pb-8 max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-wrap gap-1 border-b border-[var(--dash-border)]">
          {TRANSACTION_TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === id
                  ? 'border-[var(--dash-accent)] text-[var(--dash-accent)]'
                  : 'border-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {showPaymentsUi && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SUMMARY_CARDS.map(({ id, label }) => {
              const count = statusCounts[id];
              const active = summaryFilter === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSummaryFilter(id);
                    resetPagination();
                  }}
                  className={cn(
                    'shrink-0 dash-card px-4 py-3 min-w-[120px] text-left transition-colors',
                    active && 'ring-2 ring-[var(--dash-accent)] border-[var(--dash-accent)]'
                  )}
                >
                  <p className="text-xs text-[var(--dash-muted)]">{label}</p>
                  <p className="text-xl font-semibold tabular-nums mt-1 text-[var(--dash-text)]">
                    {loading ? '…' : count}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        <FilterRow className="justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {showPaymentsUi && (
              <>
                <FilterChip
                  label="Date & time"
                  value="All"
                  onClick={() => toast.info('Date filter — coming soon')}
                />
                <FilterChip
                  label="Amount"
                  value="All"
                  onClick={() => toast.info('Amount filter — coming soon')}
                />
                <FilterChip
                  label="Currency"
                  value={currencyFilter === 'all' ? 'All' : currencyFilter}
                  onClick={() => {
                    const order: Array<Currency | 'all'> = ['all', ...CURRENCIES];
                    const idx = order.indexOf(currencyFilter);
                    setCurrencyFilter(order[(idx + 1) % order.length]);
                    resetPagination();
                  }}
                  active={currencyFilter !== 'all'}
                />
                <FilterChip
                  label="Status"
                  value={SUMMARY_CARDS.find((c) => c.id === summaryFilter)?.label ?? 'All'}
                  active={summaryFilter !== 'all'}
                  onClick={() => {
                    const order = SUMMARY_CARDS.map((c) => c.id);
                    const idx = order.indexOf(summaryFilter);
                    setSummaryFilter(order[(idx + 1) % order.length]);
                    resetPagination();
                  }}
                />
                <FilterChip
                  label="Payment method"
                  value="All"
                  onClick={() => toast.info('Payment method filter — coming soon')}
                />
                <FilterChip
                  label="More filters"
                  onClick={() => toast.info('More filters — coming soon')}
                />
              </>
            )}
            {showTransfersUi && (
              <>
                <FilterChip
                  label="Date"
                  value="All"
                  onClick={() => toast.info('Date filter — coming soon')}
                />
                <FilterChip
                  label="Amount"
                  value="All"
                  onClick={() => toast.info('Amount filter — coming soon')}
                />
                <FilterChip
                  label="Status"
                  value="All"
                  onClick={() => toast.info('Status filter — coming soon')}
                />
                <FilterChip
                  label="Method"
                  value="All"
                  onClick={() => toast.info('Method filter — coming soon')}
                />
              </>
            )}
            {showTopupsUi && (
              <>
                <FilterChip
                  label="Date"
                  value="All"
                  onClick={() => toast.info('Date filter — coming soon')}
                />
                <FilterChip
                  label="Amount"
                  value="All"
                  onClick={() => toast.info('Amount filter — coming soon')}
                />
                <FilterChip
                  label="Status"
                  value="All"
                  onClick={() => toast.info('Status filter — coming soon')}
                />
              </>
            )}
            {showAllUi && (
              <>
                <FilterChip
                  label="Currency"
                  value={currencyFilter === 'all' ? 'All' : currencyFilter}
                  onClick={() => {
                    const order: Array<Currency | 'all'> = ['all', ...CURRENCIES];
                    const idx = order.indexOf(currencyFilter);
                    setCurrencyFilter(order[(idx + 1) % order.length]);
                    resetPagination();
                  }}
                  active={currencyFilter !== 'all'}
                />
                <FilterChip
                  label="Type"
                  value="All"
                  onClick={() => toast.info('Type filter — coming soon')}
                />
                <FilterChip
                  label="Balance type"
                  value="All"
                  onClick={() => toast.info('Balance type filter — coming soon')}
                />
                <FilterChip
                  label="Created"
                  value="All"
                  onClick={() => toast.info('Created date filter — coming soon')}
                />
                <FilterChip
                  label="Available on"
                  value="All"
                  onClick={() => toast.info('Available on filter — coming soon')}
                />
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="dash-btn-secondary px-3 py-1.5 text-sm inline-flex items-center gap-1.5"
              disabled={loading || tabRowCount === 0}
              onClick={handleExport}
            >
              <Download size={14} />
              Export
            </button>
            {showPaymentsUi && (
              <button
                type="button"
                className="dash-btn-secondary px-3 py-1.5 text-sm inline-flex items-center gap-1.5"
                onClick={() => toast.info('Edit columns — coming soon')}
              >
                <Columns3 size={14} />
                Edit columns
              </button>
            )}
          </div>
        </FilterRow>

        {isEmptyTab ? (
          <EmptyState
            icon={Receipt}
            title={emptyTitle}
            description={emptyDescription}
            action={
              activeTab === 'payments' || activeTab === 'all'
                ? { label: 'Create payment link', href: '/dashboard/links' }
                : undefined
            }
          />
        ) : activeTab === 'payments' ? (
          <DataTable
            columns={paymentColumns}
            data={paginatedPayments}
            rowKey={(o) => o.reference}
            loading={loading}
            loadingMessage="Loading transactions…"
            onRowClick={(o) => router.push(`/dashboard/transactions/${o.reference}`)}
            footer={
              !loading ? (
                <RangePaginationFooter
                  page={page}
                  totalPages={paymentTotalPages}
                  totalItems={filteredPayments.length}
                  onPageChange={setPage}
                />
              ) : undefined
            }
          />
        ) : activeTab === 'transfers' ? (
          <DataTable
            columns={transferColumns}
            data={transferRows}
            rowKey={(row) => row.id}
            loading={loading}
            loadingMessage="Loading transfers…"
            onRowClick={(row) => router.push(`/dashboard/transactions/${row.id}`)}
            footer={!loading ? <CountFooter totalItems={transferRows.length} /> : undefined}
          />
        ) : activeTab === 'topups' ? (
          <DataTable
            columns={transferColumns}
            data={topupRows}
            rowKey={(row) => row.id}
            loading={loading}
            loadingMessage="Loading top-ups…"
            onRowClick={(row) => router.push(`/dashboard/transactions/${row.id}`)}
            footer={!loading ? <CountFooter totalItems={topupRows.length} /> : undefined}
          />
        ) : (
          <DataTable
            columns={activityColumns}
            data={paginatedActivities}
            rowKey={(row) => row.id}
            loading={loading}
            loadingMessage="Loading activity…"
            onRowClick={(row) => router.push(`/dashboard/transactions/${row.id}`)}
            footer={
              !loading ? (
                <RangePaginationFooter
                  page={page}
                  totalPages={activityTotalPages}
                  totalItems={filteredActivities.length}
                  onPageChange={setPage}
                />
              ) : undefined
            }
          />
        )}
      </div>
    </>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { listCustomers } from '@/lib/merchant-data';
import { listPayments } from '@/lib/payments-api';
import {
  countryFlag,
  customerDescription,
  filterCustomersByTab,
  formatCustomerCreatedDate,
  formatCustomerTotalSpend,
  isStubCustomerTab,
  matchesCustomerSearch,
  type CustomerTab,
} from '@/lib/customer-utils';
import type { Customer, PaymentOrder } from '@luxor/contracts';
import {
  PageHeader,
  EmptyState,
  DataTable,
  BackendNotice,
  CustomerCreateDrawer,
  type DataTableColumn,
} from '@/components/dashboard';
import {
  Users,
  Plus,
  Download,
  LayoutGrid,
  Columns3,
  SlidersHorizontal,
  Search,
  MoreHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

const PAGE_SIZE = 20;

const TABS: { id: CustomerTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'top', label: 'Top customers' },
  { id: 'new', label: 'New customers' },
  { id: 'high-refunds', label: 'High refunds' },
  { id: 'high-disputes', label: 'High disputes' },
  { id: 'remaining-balances', label: 'Remaining balances' },
];

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
      <span className="tabular-nums">
        {from}–{to} of {totalItems} results
      </span>
      {totalPages > 1 && (
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
      )}
    </div>
  );
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<CustomerTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showMoreTabs, setShowMoreTabs] = useState(false);
  const moreTabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const [data, orders] = await Promise.all([
          listCustomers(user.uid).catch(() => [] as Customer[]),
          listPayments(token).catch(() => [] as PaymentOrder[]),
        ]);
        setCustomers(data);
        setPayments(orders);
      } catch {
        toast.error('Could not load customers.');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!showMoreTabs) return;
    const onPointerDown = (e: MouseEvent) => {
      if (moreTabsRef.current && !moreTabsRef.current.contains(e.target as Node)) {
        setShowMoreTabs(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [showMoreTabs]);

  const resetPagination = useCallback(() => {
    setPage(1);
    setSelected(new Set());
  }, []);

  const handleTabChange = useCallback(
    (next: CustomerTab) => {
      setTab(next);
      resetPagination();
    },
    [resetPagination]
  );

  const filtered = useMemo(() => {
    let list = filterCustomersByTab(customers, tab);
    list = list.filter((c) => matchesCustomerSearch(c, searchQuery));
    return list;
  }, [customers, tab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const allPageSelected =
    paginated.length > 0 && paginated.every((c) => selected.has(c.id));

  const toggleAll = () => {
    const next = new Set(selected);
    if (allPageSelected) {
      paginated.forEach((c) => next.delete(c.id));
    } else {
      paginated.forEach((c) => next.add(c.id));
    }
    setSelected(next);
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const columns: DataTableColumn<Customer>[] = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={allPageSelected}
          onChange={toggleAll}
          aria-label="Select all on this page"
          className="rounded border-[var(--dash-border)]"
        />
      ),
      className: 'w-10',
      render: (c) => (
        <input
          type="checkbox"
          checked={selected.has(c.id)}
          onClick={(e) => e.stopPropagation()}
          onChange={() => toggleOne(c.id)}
          aria-label={`Select ${c.name}`}
          className="rounded border-[var(--dash-border)]"
        />
      ),
    },
    {
      key: 'name',
      header: 'Customer',
      render: (c) => (
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[var(--dash-accent-soft)] flex items-center justify-center text-xs font-semibold text-[var(--dash-accent)] shrink-0">
            {c.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{c.name}</p>
            {c.type === 'guest' && (
              <span className="inline-flex mt-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded border border-[var(--dash-border)] text-[var(--dash-muted)] bg-[var(--dash-surface-elevated)]">
                Guest
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (c) => (
        <span className="text-[var(--dash-muted)]">{c.email ?? '—'}</span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (c) => (
        <span className="text-[var(--dash-muted)]">{customerDescription(c)}</span>
      ),
    },
    {
      key: 'country',
      header: 'Country',
      render: (c) => (
        <span title={c.countryCode ?? 'No country'}>
          {c.countryCode ? (
            <>
              <span className="text-lg">{countryFlag(c.countryCode)}</span>{' '}
              <span className="text-xs text-[var(--dash-muted)] uppercase">{c.countryCode}</span>
            </>
          ) : (
            <span className="text-[var(--dash-muted)]">—</span>
          )}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (c) => (
        <span className="text-[var(--dash-muted)] tabular-nums whitespace-nowrap">
          {formatCustomerCreatedDate(c.createdAt)}
        </span>
      ),
    },
    {
      key: 'totalSpend',
      header: 'Total spend',
      className: 'text-right',
      render: (c) => (
        <span className="font-medium tabular-nums">
          {formatCustomerTotalSpend(c, payments)}
        </span>
      ),
    },
  ];

  const isEmpty = !loading && filtered.length === 0;
  const showStubNotice = isStubCustomerTab(tab);

  const emptyTitle =
    searchQuery.trim() || tab !== 'all'
      ? 'No customers match your filters'
      : 'No customers yet';

  const emptyDescription =
    searchQuery.trim() || tab !== 'all'
      ? 'Try adjusting your search or filter tabs.'
      : 'Customers appear when payers complete Solana Pay checkout or when you add them manually. Total spend is tracked in USDC or SOL from confirmed transactions.';

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="dash-btn-secondary p-2"
        aria-label="Export customers"
        onClick={() => toast.info('Export — coming soon')}
      >
        <Download size={16} />
      </button>
      <button
        type="button"
        className="dash-btn-secondary p-2"
        aria-label="Customize layout"
        onClick={() => toast.info('Layout — coming soon')}
      >
        <LayoutGrid size={16} />
      </button>
      <button
        type="button"
        onClick={() => setShowCreateDrawer(true)}
        className="dash-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2"
      >
        <Plus size={16} />
        Add customer
      </button>
    </div>
  );

  return (
    <>
      <CustomerCreateDrawer
        open={showCreateDrawer}
        onClose={() => setShowCreateDrawer(false)}
        onCreated={(customer) => setCustomers((prev) => [customer, ...prev])}
      />

      <PageHeader title="Customers" actions={headerActions} />

      <div className="p-6 md:px-8 md:pb-8 max-w-[1400px] mx-auto space-y-4">
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleTabChange(id)}
              className={cn(
                'shrink-0 px-3 py-1.5 text-sm rounded-full border transition-colors whitespace-nowrap',
                tab === id
                  ? 'border-[var(--dash-accent)] bg-[var(--dash-accent-soft)] text-[var(--dash-accent)] font-medium'
                  : 'border-[var(--dash-border)] bg-[var(--dash-surface-elevated)] text-[var(--dash-text)] hover:bg-[rgba(255,255,255,0.08)]'
              )}
            >
              {label}
            </button>
          ))}
          <div className="relative shrink-0" ref={moreTabsRef}>
            <button
              type="button"
              aria-label="More filters"
              onClick={() => setShowMoreTabs((v) => !v)}
              className={cn(
                'px-2.5 py-1.5 text-sm rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)] hover:bg-[rgba(255,255,255,0.08)] transition-colors'
              )}
            >
              <MoreHorizontal size={16} />
            </button>
            {showMoreTabs && (
              <div
                role="menu"
                className="absolute left-0 top-full mt-1 z-20 min-w-[180px] dash-card py-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)]"
                  onClick={() => {
                    toast.info('Delinquent customers — coming soon');
                    setShowMoreTabs(false);
                  }}
                >
                  Delinquent
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)]"
                  onClick={() => {
                    toast.info('Tax exempt — coming soon');
                    setShowMoreTabs(false);
                  }}
                >
                  Tax exempt
                </button>
              </div>
            )}
          </div>
        </div>

        {showStubNotice && <BackendNotice notImplemented />}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] pointer-events-none"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                resetPagination();
              }}
              placeholder="Search by name, email, wallet, etc."
              className="dash-input w-full pl-9 pr-4 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="dash-btn-secondary px-3 py-2 text-sm inline-flex items-center gap-1.5"
              onClick={() => toast.info('Filters — coming soon')}
            >
              <SlidersHorizontal size={14} />
              Filter
            </button>
            <button
              type="button"
              className="dash-btn-secondary p-2"
              aria-label="Column settings"
              onClick={() => toast.info('Column settings — coming soon')}
            >
              <Columns3 size={16} />
            </button>
          </div>
        </div>

        {!loading && customers.length === 0 && (
          <p className="text-xs text-[var(--dash-muted)]">
            Total spend is calculated in USDC or SOL from confirmed{' '}
            <Link href="/dashboard/transactions" className="text-[var(--dash-accent)] hover:underline">
              transactions
            </Link>{' '}
            when payer wallet or contact details match a customer.
          </p>
        )}

        {isEmpty ? (
          <EmptyState
            icon={Users}
            title={emptyTitle}
            description={emptyDescription}
            action={
              tab === 'all' && !searchQuery.trim()
                ? { label: 'Add customer', onClick: () => setShowCreateDrawer(true) }
                : undefined
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={paginated}
            rowKey={(c) => c.id}
            loading={loading}
            loadingMessage="Loading customers…"
            onRowClick={(c) => router.push(`/dashboard/customers/${c.id}`)}
            footer={
              !loading ? (
                <RangePaginationFooter
                  page={page}
                  totalPages={totalPages}
                  totalItems={filtered.length}
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

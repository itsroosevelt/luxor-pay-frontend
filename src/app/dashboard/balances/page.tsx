'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchant-data';
import { listPayments } from '@/lib/payments-api';
import { listCheckoutPayments } from '@/lib/checkout-payments-local';
import { isFrontendOnly } from '@/lib/frontend-only';
import type { Currency, PaymentOrder } from '@luxor/contracts';
import {
  PageHeader,
  EmptyState,
  DataTable,
  AddFundsModal,
  TransferModal,
  SettlementCurrencyModal,
  type DataTableColumn,
} from '@/components/dashboard';
import {
  type BalanceActivityRow,
  type BalanceActivityTab,
  type BalanceActivityStatus,
  computeBalanceSummary,
  filterActivityByTab,
  formatBalanceAmount,
  mergeBalanceActivities,
} from '@/lib/balance-utils';
import { cn } from '@/lib/cn';
import { formatDecimalAmount } from '@/lib/decimal-utils';
import { dashStatusBadges } from '@/lib/dashboard-styles';
import {
  Info,
  Plus,
  ChevronDown,
  ArrowRightLeft,
  Wallet,
  Zap,
  RefreshCw,
  FileText,
  BarChart3,
  Receipt,
} from 'lucide-react';
import { toast } from 'sonner';

const ACTIVITY_TABS: { id: BalanceActivityTab; label: string }[] = [
  { id: 'transfers', label: 'Transfers' },
  { id: 'topups', label: 'Top-ups' },
  { id: 'all', label: 'All activity' },
];

const DISPLAY_CURRENCY: Currency = 'USDC';
const RECENT_ACTIVITY_LIMIT = 5;

const ACTIVITY_TAB_TO_TRANSACTIONS: Record<BalanceActivityTab, string> = {
  transfers: 'transfers',
  topups: 'topups',
  all: 'all',
};

const statusStyles: Record<BalanceActivityStatus, string> = {
  paid: dashStatusBadges.success,
  pending: dashStatusBadges.warning,
  failed: dashStatusBadges.error,
};

const statusLabels: Record<BalanceActivityStatus, string> = {
  paid: 'Paid',
  pending: 'Pendiente',
  failed: 'Failed',
};

function BalanceDot({ color }: { color: 'incoming' | 'available' }) {
  return (
    <span
      className={cn(
        'inline-block w-2 h-2 rounded-full shrink-0',
        color === 'incoming' ? 'bg-amber-400' : 'bg-violet-500'
      )}
      aria-hidden
    />
  );
}

export default function BalancesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [hasWallet, setHasWallet] = useState(false);
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(true);
  const [activityTab, setActivityTab] = useState<BalanceActivityTab>('all');
  const [transferMenuOpen, setTransferMenuOpen] = useState(false);
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const transferFromQuery = searchParams.get('transfer') === 'true';
  const [settlementCurrencyOpen, setSettlementCurrencyOpen] = useState(false);
  const transferMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const [profile, payments] = await Promise.all([
          getMerchantProfile(user.uid),
          isFrontendOnly()
            ? Promise.resolve(listCheckoutPayments(user.uid))
            : user.getIdToken().then((token) => listPayments(token)).catch(() => [] as PaymentOrder[]),
        ]);
        setHasWallet(Boolean(profile?.merchantWallet));
        setWallet(profile?.merchantWallet ?? '');
        setOrders(payments);
      } catch {
        toast.error('Could not load balances');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (transferFromQuery) {
      router.replace('/dashboard/balances/transfers/create');
    }
  }, [transferFromQuery, router]);

  useEffect(() => {
    if (!transferMenuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (transferMenuRef.current && !transferMenuRef.current.contains(e.target as Node)) {
        setTransferMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [transferMenuOpen]);

  const balanceSummary = useMemo(
    () => computeBalanceSummary(orders, DISPLAY_CURRENCY),
    [orders]
  );

  const allActivities = useMemo(() => mergeBalanceActivities(orders), [orders]);
  const filteredActivities = useMemo(
    () => filterActivityByTab(allActivities, activityTab),
    [allActivities, activityTab]
  );
  const displayedActivities = useMemo(
    () => filteredActivities.slice(0, RECENT_ACTIVITY_LIMIT),
    [filteredActivities]
  );
  const hasMoreActivities = filteredActivities.length > RECENT_ACTIVITY_LIMIT;

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
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={cn(statusStyles[row.status])}
        >
          {statusLabels[row.status]}
        </span>
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
      header: 'Tipo',
      render: (row) => <span>{row.typeLabel}</span>,
    },
    {
      key: 'availableOn',
      header: 'Available on',
      className: 'text-right',
      render: (row) => (
        <span className="text-[var(--dash-muted)] tabular-nums">
          {new Date(row.availableOn).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2 flex-wrap">
            <span>Balances</span>
            <span className="tabular-nums text-[var(--dash-text)]">
              {DISPLAY_CURRENCY}{' '}
              {loading ? '…' : formatDecimalAmount(balanceSummary.available, 2)}
            </span>
            <button
              type="button"
              className="p-1 rounded-md text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)] transition-colors"
              aria-label="Balance information"
              title="Available USDC from confirmed Luxor Pay payments. Does not reflect real-time on-chain wallet balance."
              onClick={() =>
                toast.info(
                  'Balances reflect Luxor Pay payments. For on-chain funds, check your Solana wallet.'
                )
              }
            >
              <Info size={18} />
            </button>
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/balances/transfers/create"
              className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
            >
              <ArrowRightLeft size={16} />
              Transfer
            </Link>
            <button
              type="button"
              className="dash-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2"
              onClick={() => setAddFundsOpen(true)}
            >
              <Plus size={16} />
              Add funds
            </button>
            <div className="relative" ref={transferMenuRef}>
              <button
                type="button"
                className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
                onClick={() => setTransferMenuOpen((open) => !open)}
                aria-expanded={transferMenuOpen}
                aria-haspopup="menu"
              >
                Transfer management
                <ChevronDown size={16} className={cn(transferMenuOpen && 'rotate-180', 'transition-transform')} />
              </button>
              {transferMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-1 z-20 min-w-[220px] dash-card py-1 shadow-lg"
                >
                  <Link
                    href="/dashboard/balances/transfers/create"
                    role="menuitem"
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)] transition-colors"
                    onClick={() => setTransferMenuOpen(false)}
                  >
                    New transfer
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)] transition-colors"
                    onClick={() => {
                      setTransferMenuOpen(false);
                      toast.info('Transfer history — pending backend');
                    }}
                  >
                    View history
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)] transition-colors"
                    onClick={() => {
                      setTransferMenuOpen(false);
                      toast.info('Payment settingss — pending backend');
                    }}
                  >
                    Configure payments
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
              onClick={() => setSettlementCurrencyOpen(true)}
            >
              <Plus size={16} />
              Add settlement currency
            </button>
          </div>
        }
      />

      <div className="px-6 md:px-8 pt-4">
        <div className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-elevated)] px-4 py-3 text-sm text-[var(--dash-muted)] flex gap-3 items-start max-w-[1400px] mx-auto">
          <Info size={16} className="shrink-0 mt-0.5 text-[var(--dash-accent)]" />
          <p>
            Confirmed Luxor Pay charges are credited to your configured Solana wallet. <strong className="text-[var(--dash-text)]">Incoming</strong> balance includes pending payments; <strong className="text-[var(--dash-text)]">available</strong> balance reflects confirmed on-chain transactions.
          </p>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-[1400px] mx-auto flex flex-col xl:flex-row gap-8">
        <main className="flex-1 min-w-0 space-y-8">
          <section className="dash-card overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--dash-border)] bg-[var(--dash-surface-elevated)]">
              <h2 className="text-sm font-semibold text-[var(--dash-text)]">Balance summary</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--dash-border)]">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
                      Payment type
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--dash-border)] hover:bg-[var(--dash-surface-elevated)] transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-2 font-medium">
                        <BalanceDot color="incoming" />
                        Incoming
                      </span>
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-right">
                      {loading
                        ? '…'
                        : formatBalanceAmount(balanceSummary.incoming, DISPLAY_CURRENCY)}
                    </td>
                  </tr>
                  <tr className="hover:bg-[var(--dash-surface-elevated)] transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-2 font-medium">
                        <BalanceDot color="available" />
                        Available
                      </span>
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-right font-medium">
                      {loading
                        ? '…'
                        : formatBalanceAmount(balanceSummary.available, DISPLAY_CURRENCY)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg font-semibold text-[var(--dash-text)]">Recent activity</h2>
            </div>

            <div className="flex flex-wrap gap-1 border-b border-[var(--dash-border)]">
              {ACTIVITY_TABS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActivityTab(id)}
                  className={cn(
                    'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                    activityTab === id
                      ? 'border-[var(--dash-accent)] text-[var(--dash-accent)]'
                      : 'border-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {!loading && filteredActivities.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No activity in this category"
                description={
                  activityTab === 'all'
                    ? 'Share a payment link or charge with POS to see activity here.'
                    : 'No transfers or top-ups recorded on your account yet.'
                }
                action={
                  activityTab === 'all'
                    ? { label: 'Create payment link', href: '/dashboard/links' }
                    : undefined
                }
              />
            ) : (
              <>
                <DataTable
                  columns={activityColumns}
                  data={displayedActivities}
                  rowKey={(row) => row.id}
                  loading={loading}
                  loadingMessage="Loading activity…"
                  onRowClick={(row) => router.push(`/dashboard/balances/transfers/${row.id}`)}
                />
                {hasMoreActivities && (
                  <div className="flex justify-center pt-3">
                    <Link
                      href={`/dashboard/transactions?tab=${ACTIVITY_TAB_TO_TRANSACTIONS[activityTab]}`}
                      className="text-sm font-medium text-[var(--dash-accent)] hover:underline"
                    >
                      Ver más
                    </Link>
                  </div>
                )}
              </>
            )}
          </section>
        </main>

        <aside className="xl:w-80 shrink-0 space-y-4">
          <SidebarCard
            icon={Zap}
            title="Payouts"
            subtitle="Instant transfers available"
          >
            <p className="text-sm text-[var(--dash-muted)]">
              Withdraw USDC and SOL to your cold wallet or another Solana address when the settlement
              backend is active.
            </p>
            <button
              type="button"
              disabled={!hasWallet}
              className="dash-btn-primary w-full py-2 text-sm mt-3 disabled:opacity-50"
              onClick={() => toast.info('Instant payout — pending backend')}
            >
              {hasWallet ? 'Start payout' : 'Connect wallet first'}
            </button>
            {wallet && (
              <p className="text-xs text-[var(--dash-muted)] font-mono truncate mt-2" title={wallet}>
                Destination: {wallet.slice(0, 8)}…{wallet.slice(-4)}
              </p>
            )}
          </SidebarCard>

          <SidebarCard icon={RefreshCw} title="Automatic transfers">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[var(--dash-muted)]">Schedule</span>
                <span className="text-xs px-2 py-0.5 rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface-elevated)]">
                  Disabled
                </span>
              </div>
              <p className="text-[var(--dash-muted)] text-xs">
                Set up daily or weekly automatic payouts to your merchant wallet.
              </p>
              <Link
                href="/dashboard/settings"
                className="text-sm text-[var(--dash-accent)] hover:underline inline-flex items-center gap-1"
              >
                Configure in Settings
                <ArrowRightLeft size={14} />
              </Link>
            </div>
          </SidebarCard>

          <SidebarCard icon={FileText} title="Reports">
            <ul className="space-y-2">
              <ReportLink
                icon={BarChart3}
                label="Balance summary"
                onClick={() => toast.info('Balance report — pending backend')}
              />
              <ReportLink
                icon={Receipt}
                label="Payment activity"
                href="/dashboard/transactions"
              />
              <ReportLink
                icon={Wallet}
                label="Export activity CSV"
                onClick={() => toast.info('CSV export — pending backend')}
              />
            </ul>
          </SidebarCard>
        </aside>
      </div>

      <AddFundsModal
        open={addFundsOpen}
        onClose={() => setAddFundsOpen(false)}
        currency="USDC"
        disputeBalance={0}
      />
      <TransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
      />
      <SettlementCurrencyModal
        open={settlementCurrencyOpen}
        onClose={() => setSettlementCurrencyOpen(false)}
      />
    </>
  );
}

function SidebarCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof Wallet;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="dash-card p-5 space-y-2">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-md bg-[var(--dash-accent-soft)] flex items-center justify-center text-[var(--dash-accent)] shrink-0">
          <Icon size={16} />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--dash-text)] text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-[var(--dash-muted)] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="pt-1">{children}</div>
    </div>
  );
}

function ReportLink({
  icon: Icon,
  label,
  href,
  onClick,
}: {
  icon: typeof Wallet;
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const className =
    'w-full flex items-center gap-2 px-2 py-2 text-sm text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)] rounded-md transition-colors text-left';

  if (href) {
    return (
      <li>
        <Link href={href} className={className}>
          <Icon size={16} className="text-[var(--dash-muted)] shrink-0" />
          {label}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button type="button" className={className} onClick={onClick}>
        <Icon size={16} className="text-[var(--dash-muted)] shrink-0" />
        {label}
      </button>
    </li>
  );
}

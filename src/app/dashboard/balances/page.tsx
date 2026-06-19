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
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  Copy,
  ArrowUpDown,
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
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Balances</h1>
          <button className="text-zinc-500 hover:text-white transition-colors mt-1" aria-label="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="bg-[#18181b] rounded-2xl p-6 relative overflow-hidden">
          <h2 className="text-[13px] font-medium text-white mb-6">Overview</h2>
          
          <div className="grid lg:grid-cols-[380px_1fr] gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-[#222225] rounded-[14px] p-6 border border-white/[0.04]">
                <p className="text-[13px] text-zinc-500">Total Balance</p>
                <p className="text-[36px] font-semibold text-white mt-1 mb-8 tracking-tight">$30.86</p>
                
                <div className="flex flex-wrap gap-2.5">
                  <button className="bg-white hover:bg-zinc-200 text-black rounded-[10px] py-2 px-4 text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors">
                    <ArrowUp size={14} strokeWidth={2.5} className="shrink-0" />
                    <span>Send</span>
                  </button>
                  <button className="bg-white hover:bg-zinc-200 text-black rounded-[10px] py-2 px-4 text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors">
                    <ArrowDown size={14} strokeWidth={2.5} className="shrink-0" />
                    <span>Deposit</span>
                  </button>
                  <button className="bg-white hover:bg-zinc-200 text-black rounded-[10px] py-2 px-4 text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors">
                    <ArrowUpRight size={14} strokeWidth={2.5} className="shrink-0" />
                    <span>Trade</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#222225] rounded-[14px] p-5 border border-white/[0.04]">
                  <p className="text-[22px] font-semibold text-white">11</p>
                  <p className="text-[13px] text-zinc-500 mt-1">Members</p>
                </div>
                <div className="bg-[#222225] rounded-[14px] p-5 border border-white/[0.04] flex flex-col justify-between">
                  <p className="text-[22px] font-semibold text-white">3/7</p>
                  <p className="text-[13px] text-zinc-500 mt-1 flex items-center gap-1.5">
                    Threshold
                    <Info size={14} className="text-zinc-500" />
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Chart Area */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <button className="bg-[#222225] hover:bg-zinc-800 text-white rounded-[8px] px-3 py-1.5 text-[13px] font-medium flex items-center gap-2 transition-colors border border-white/[0.04]">
                  Total
                  <ChevronDown size={14} className="text-zinc-500" />
                </button>
                <div className="flex items-center gap-1">
                  <button className="text-zinc-500 hover:text-white hover:bg-[#222225] rounded-[6px] px-2.5 py-1 text-[12px] font-medium transition-colors">
                    1W
                  </button>
                  <button className="text-zinc-500 hover:text-white hover:bg-[#222225] rounded-[6px] px-2.5 py-1 text-[12px] font-medium transition-colors">
                    1M
                  </button>
                  <button className="bg-[#222225] text-white rounded-[6px] px-2.5 py-1 text-[12px] font-medium border border-white/[0.04]">
                    1Y
                  </button>
                </div>
              </div>

              <div className="flex-1 flex gap-4 min-h-[200px]">
                {/* Y Axis */}
                <div className="flex flex-col justify-between text-[11px] text-zinc-500 py-1 font-medium">
                  <span>$47.00</span>
                  <span>$42.00</span>
                  <span>$38.00</span>
                  <span>$34.00</span>
                  <span>$29.00</span>
                  <span>$25.00</span>
                </div>
                
                {/* Grid Area */}
                <div className="flex-1 relative border-l border-b border-zinc-800/60 ml-2">
                  {/* Horizontal Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-full h-[1px] bg-zinc-800/40" />
                    ))}
                    <div className="w-full h-[1px] bg-transparent" />
                  </div>
                  
                  {/* X Axis */}
                  <div className="absolute -bottom-7 left-0 right-0 flex justify-around text-[11px] text-zinc-500 font-medium">
                    <span>May 2026</span>
                    <span>Jun 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Accounts Table Section */}
          <div className="mt-8 pt-8">
            {/* Tabs */}
            <div className="flex gap-6 border-b border-white/[0.04] mb-2">
              <button className="text-[13px] font-semibold text-white border-b-2 border-white pb-3">Accounts</button>
              <button className="text-[13px] font-medium text-zinc-500 hover:text-white pb-3 transition-colors">Coins</button>
              <button className="text-[13px] font-medium text-zinc-500 hover:text-white pb-3 transition-colors">NFTs</button>
            </div>

            {/* Table */}
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-zinc-500 font-medium">
                  <th className="py-4 font-normal">Account</th>
                  <th className="py-4 font-normal">Balance</th>
                  <th className="py-4 font-normal">Weight</th>
                  <th className="py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dash-border)]">
                {/* Row 1 */}
                <tr className="group">
                  <td className="py-4">
                    <p className="font-semibold text-white">GENESYS</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[11px] text-zinc-500 font-mono">HQ8e...ejRe</span>
                      <Copy size={12} className="text-zinc-500 cursor-pointer hover:text-white transition-colors" />
                    </div>
                  </td>
                  <td className="py-4 font-medium text-white">
                    <div className="flex items-center gap-2">
                      $17.04
                      <div className="flex -space-x-1">
                        <div className="w-4 h-4 rounded-full bg-[#1A88F8] border border-[#18181b]"></div>
                        <div className="w-4 h-4 rounded-full bg-[#8247E5] border border-[#18181b]"></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col gap-1.5 w-32">
                      <span className="font-medium text-white">55%</span>
                      <div className="h-0.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: '55%' }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 bg-[#222225] hover:bg-zinc-800 text-white rounded-[6px] transition-colors border border-white/[0.04]">
                        <ArrowUp size={14} />
                      </button>
                      <button className="p-2 bg-[#222225] hover:bg-zinc-800 text-white rounded-[6px] transition-colors border border-white/[0.04]">
                        <ArrowUpDown size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Row 2 */}
                <tr className="group">
                  <td className="py-4">
                    <p className="font-semibold text-white">10 % Fundation Vault</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[11px] text-zinc-500 font-mono">FR6m...h5JG</span>
                      <Copy size={12} className="text-zinc-500 cursor-pointer hover:text-white transition-colors" />
                    </div>
                  </td>
                  <td className="py-4 font-medium text-white">
                    <div className="flex items-center gap-2">
                      $1.76
                      <div className="flex -space-x-1">
                        <div className="w-4 h-4 rounded-full bg-[#1A88F8] border border-[#18181b]"></div>
                        <div className="w-4 h-4 rounded-full bg-[#F3BA2F] border border-[#18181b]"></div>
                        <div className="w-4 h-4 rounded-full bg-[#8247E5] border border-[#18181b]"></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col gap-1.5 w-32">
                      <span className="font-medium text-white">6%</span>
                      <div className="h-0.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: '6%' }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 bg-[#222225] hover:bg-zinc-800 text-white rounded-[6px] transition-colors border border-white/[0.04]">
                        <ArrowUp size={14} />
                      </button>
                      <button className="p-2 bg-[#222225] hover:bg-zinc-800 text-white rounded-[6px] transition-colors border border-white/[0.04]">
                        <ArrowUpDown size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Row 3 */}
                <tr className="group">
                  <td className="py-4">
                    <p className="font-semibold text-white">20 % Main Holding (Vesting)</p>
                  </td>
                  <td className="py-4 font-medium text-white">
                    <div className="flex items-center gap-2">
                      $0.00
                      <div className="flex -space-x-1">
                        <div className="w-4 h-4 rounded-full bg-[#F3BA2F] border border-[#18181b]"></div>
                        <div className="w-4 h-4 rounded-full bg-[#8247E5] border border-[#18181b]"></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col gap-1.5 w-32">
                      <span className="font-medium text-white">0%</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 bg-[#222225] hover:bg-zinc-800 text-white rounded-[6px] transition-colors border border-white/[0.04]">
                        <ArrowUp size={14} />
                      </button>
                      <button className="p-2 bg-[#222225] hover:bg-zinc-700 text-[var(--dash-text)] rounded-[6px] transition-colors border border-white/[0.04]">
                        <ArrowUpDown size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
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

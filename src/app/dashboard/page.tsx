'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { listCustomers, getMerchantProfile } from '@/lib/merchant-data';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { listPayments } from '@/lib/payments-api';
import { listCheckoutPayments } from '@/lib/checkout-payments-local';
import { isFrontendOnly } from '@/lib/frontend-only';
import { computeBalanceSummary } from '@/lib/balance-utils';
import {
  buildDailyCountSeries,
  buildDailyVolumeSeries,
  confirmedOrders,
  countNewCustomersInPeriod,
  formatCombinedVolume,
  grossVolumeInPeriod,
  hasSeriesData,
  netVolumeInPeriod,
  ordersInRange,
  periodRange,
  startOfDay,
  topCustomersBySpend,
  volumeForDay,
  yesterdayDeltaLabel,
} from '@/lib/dashboard-metrics';
import { formatPaymentAmount } from '@/lib/transaction-utils';
import type { Customer, PaymentOrder } from '@luxor/contracts';
import {
  FilterRow,
  FilterChip,
  SummaryMetricCard,
  MiniBarChart,
  VolumeSparkline,
  DemoModeBanner,
  MerchantSetupChecklist,
} from '@/components/dashboard';
import { Plus, Pencil, Send, QrCode, ArrowUp, ArrowDown, ArrowUpRight, RefreshCw, ChevronDown, Info, Copy, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

// Import develop functional wallet components and modals
import { WalletBalanceContainer } from '@/components/dashboard/WalletBalanceContainer';
import { TransferModal } from '@/components/dashboard/overview/TransferModal';
import { ReceiveModal } from '@/components/dashboard/overview/ReceiveModal';
import { TransferSuccessModal } from '@/components/dashboard/overview/TransferSuccessModal';
import { Transfer } from '@/lib/transfers-api';

const SUMMARY_DAYS = 7;
const TODAY_CHART_DAYS = 14;

export default function DashboardOverviewPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isTransferSuccessModalOpen, setIsTransferSuccessModalOpen] = useState(false);
  const [transferSuccessData, setTransferSuccessData] = useState<Transfer | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const [payments, customerList, profile] = await Promise.all([
          isFrontendOnly()
            ? Promise.resolve(listCheckoutPayments(user.uid))
            : user.getIdToken().then((token) => listPayments(token)).catch(() => [] as PaymentOrder[]),
          listCustomers(user.uid).catch(() => [] as Customer[]),
          getMerchantProfile(user.uid).catch(() => null),
        ]);
        setOrders(payments);
        setCustomers(customerList);
        setMerchantWallet(profile?.merchantWallet || null);
      } catch (e) {
        console.error(e);
        toast.error(getFirestoreErrorMessage(e, 'No se pudieron cargar los datos del panel'));
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const today = useMemo(() => startOfDay(new Date()), []);
  const yesterday = useMemo(() => {
    const d = startOfDay(new Date());
    d.setDate(d.getDate() - 1);
    return d;
  }, []);

  const todayNetVolume = useMemo(() => volumeForDay(orders, today), [orders, today]);
  const yesterdayNetVolume = useMemo(() => volumeForDay(orders, yesterday), [orders, yesterday]);
  const todayDelta = useMemo(
    () => yesterdayDeltaLabel(todayNetVolume, yesterdayNetVolume),
    [todayNetVolume, yesterdayNetVolume]
  );

  const todayChartSeries = useMemo(
    () => buildDailyVolumeSeries(orders, TODAY_CHART_DAYS),
    [orders]
  );

  const transfersToday = useMemo(
    () =>
      ordersInRange(orders, today, new Date()).filter(
        (o) => o.status === 'confirmed' || o.status === 'pending'
      ).length,
    [orders, today]
  );

  const { start: periodStart, end: periodEnd } = useMemo(
    () => periodRange(SUMMARY_DAYS),
    []
  );

  const periodConfirmed = useMemo(
    () => ordersInRange(orders, periodStart, periodEnd, (o) => o.status === 'confirmed'),
    [orders, periodStart, periodEnd]
  );

  const periodFailed = useMemo(
    () =>
      ordersInRange(orders, periodStart, periodEnd, (o) =>
        ['failed', 'expired'].includes(o.status)
      ),
    [orders, periodStart, periodEnd]
  );

  const paymentCountSeries = useMemo(
    () =>
      buildDailyCountSeries(orders, SUMMARY_DAYS, (o) => o.status === 'confirmed', periodEnd),
    [orders, periodEnd]
  );

  const grossSeries = useMemo(
    () => buildDailyVolumeSeries(orders, SUMMARY_DAYS, periodEnd),
    [orders, periodEnd]
  );

  const periodGross = useMemo(
    () => grossVolumeInPeriod(orders, periodStart, periodEnd),
    [orders, periodStart, periodEnd]
  );

  const periodNet = useMemo(
    () => netVolumeInPeriod(orders, periodStart, periodEnd),
    [orders, periodStart, periodEnd]
  );

  const newCustomers = useMemo(
    () => countNewCustomersInPeriod(customers, periodStart, periodEnd),
    [customers, periodStart, periodEnd]
  );

  const topCustomers = useMemo(
    () => topCustomersBySpend(orders, periodStart, periodEnd, 5),
    [orders, periodStart, periodEnd]
  );

  const allTimeConfirmed = useMemo(() => confirmedOrders(orders).length, [orders]);

  const placeholderAction = () => toast.message('Próximamente');

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Dashboard</h1>
        <button className="text-zinc-500 hover:text-white transition-colors mt-1" aria-label="Refresh">
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/[0.08]">
        <h2 className="text-[13px] font-medium text-white mb-6">Overview</h2>
        
        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="bg-[#222225] rounded-[14px] p-6 border border-white/[0.04]">
              <p className="text-[13px] text-zinc-400">Total Balance</p>
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
                <p className="text-[13px] text-zinc-400 mt-1">Members</p>
              </div>
              <div className="bg-[#222225] rounded-[14px] p-5 border border-white/[0.04] flex flex-col justify-between">
                <p className="text-[22px] font-semibold text-white">3/7</p>
                <p className="text-[13px] text-zinc-400 mt-1 flex items-center gap-1.5">
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
                <ChevronDown size={14} className="text-zinc-400" />
              </button>
              <div className="flex items-center gap-1">
                <button className="text-zinc-400 hover:text-white hover:bg-[#222225] rounded-[6px] px-2.5 py-1 text-[12px] font-medium transition-colors">
                  1W
                </button>
                <button className="text-zinc-400 hover:text-white hover:bg-[#222225] rounded-[6px] px-2.5 py-1 text-[12px] font-medium transition-colors">
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
                      <div className="w-4 h-4 rounded-full bg-[#1A88F8] border border-transparent"></div>
                      <div className="w-4 h-4 rounded-full bg-[#8247E5] border border-transparent"></div>
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
                      <div className="w-4 h-4 rounded-full bg-[#1A88F8] border border-transparent"></div>
                      <div className="w-4 h-4 rounded-full bg-[#F3BA2F] border border-transparent"></div>
                      <div className="w-4 h-4 rounded-full bg-[#8247E5] border border-transparent"></div>
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
                      <div className="w-4 h-4 rounded-full bg-[#F3BA2F] border border-transparent"></div>
                      <div className="w-4 h-4 rounded-full bg-[#8247E5] border border-transparent"></div>
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
                    <button className="p-2 bg-[#222225] hover:bg-zinc-700 text-white rounded-[6px] transition-colors border border-white/[0.04]">
                      <ArrowUpDown size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modals for Solana Payments (Hidden) */}
      <TransferModal 
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={(data) => {
          setTransferSuccessData(data);
          setIsTransferSuccessModalOpen(true);
        }}
      />
      
      <ReceiveModal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        merchantWallet={merchantWallet}
      />

      <TransferSuccessModal
        isOpen={isTransferSuccessModalOpen}
        onClose={() => setIsTransferSuccessModalOpen(false)}
        transferData={transferSuccessData}
      />
    </div>
  );
}

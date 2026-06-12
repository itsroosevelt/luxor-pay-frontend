'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { listCustomers } from '@/lib/merchant-data';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { listPayments } from '@/lib/payments-api';
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
} from '@/components/dashboard';
import { Plus, Pencil, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';

const SUMMARY_DAYS = 7;
const TODAY_CHART_DAYS = 14;

export default function DashboardOverviewPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const [payments, customerList] = await Promise.all([
          user.getIdToken().then((token) => listPayments(token)).catch(() => [] as PaymentOrder[]),
          listCustomers(user.uid).catch(() => [] as Customer[]),
        ]);
        setOrders(payments);
        setCustomers(customerList);
      } catch (e) {
        console.error(e);
        toast.error(getFirestoreErrorMessage(e, 'Could not load dashboard data'));
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

  const solBalance = useMemo(() => computeBalanceSummary(orders, 'SOL'), [orders]);
  const usdcBalance = useMemo(() => computeBalanceSummary(orders, 'USDC'), [orders]);

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

  const placeholderAction = () => toast.message('Coming soon');

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-10">
      {/* Section 1 — Today */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl font-semibold text-[var(--dash-text)] tracking-tight">Today</h1>
          <Link href="/dashboard/balances" className="dash-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2">
            <ArrowRightLeft size={16} />
            Transfer funds
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 dash-card p-5 space-y-4">
            <div>
              <p className="text-sm text-[var(--dash-muted)]">Net volume</p>
              <div className="flex items-baseline gap-3 mt-1 flex-wrap">
                <p className="text-3xl font-semibold tabular-nums text-[var(--dash-text)]">
                  {loading ? '…' : `${formatCombinedVolume(todayNetVolume)} units`}
                </p>
                {!loading && todayDelta && (
                  <span
                    className={
                      todayNetVolume >= yesterdayNetVolume
                        ? 'text-sm text-emerald-400'
                        : 'text-sm text-[var(--dash-muted)]'
                    }
                  >
                    {todayDelta}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--dash-muted)] mt-1">
                Confirmed SOL + USDC (combined units)
              </p>
            </div>
            <VolumeSparkline
              data={loading ? [] : todayChartSeries}
              height={220}
              emptyLabel="No volume yet — flat line at zero"
            />
          </div>

          <div className="dash-card p-5 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--dash-text)]">Tip</p>
              <p className="text-sm text-[var(--dash-muted)] mt-2">
                Charts use payment orders from local demo storage. Complete a checkout — payments
                auto-confirm after ~15s.
              </p>
            </div>
            <Link
              href="/dashboard/balances"
              className="dash-btn-secondary px-4 py-2 text-sm inline-block text-center mt-4"
            >
              View balances
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="dash-card p-5">
            <p className="text-sm text-[var(--dash-muted)] mb-1">Balance · SOL</p>
            <p className="text-xl font-semibold tabular-nums">
              {loading ? '…' : formatPaymentAmount(solBalance.available, 'SOL')}
            </p>
            {solBalance.incoming > 0 && (
              <p className="text-xs text-[var(--dash-muted)] mt-1">
                +{formatPaymentAmount(solBalance.incoming, 'SOL')} incoming
              </p>
            )}
          </div>
          <div className="dash-card p-5">
            <p className="text-sm text-[var(--dash-muted)] mb-1">Balance · USDC</p>
            <p className="text-xl font-semibold tabular-nums">
              {loading ? '…' : formatPaymentAmount(usdcBalance.available, 'USDC')}
            </p>
            {usdcBalance.incoming > 0 && (
              <p className="text-xs text-[var(--dash-muted)] mt-1">
                +{formatPaymentAmount(usdcBalance.incoming, 'USDC')} incoming
              </p>
            )}
          </div>
          <div className="dash-card p-5">
            <p className="text-sm text-[var(--dash-muted)] mb-1">Transfers</p>
            <p className="text-xl font-semibold tabular-nums">
              {loading ? '…' : transfersToday}
            </p>
            <p className="text-xs text-[var(--dash-muted)] mt-1">Today (confirmed + pending)</p>
          </div>
        </div>
      </section>

      {/* Section 2 — Your summary */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="text-xl font-semibold text-[var(--dash-text)]">Your summary</h2>
          <div className="flex flex-wrap items-center gap-2">
            <FilterRow>
              <FilterChip label="Date range" value="Last 7 days" />
              <FilterChip label="Interval" value="Daily" />
              <FilterChip label="Compare" value="Previous period" />
            </FilterRow>
            <button
              type="button"
              onClick={placeholderAction}
              className="dash-btn-primary px-3 py-1.5 text-sm inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              Add
            </button>
            <button
              type="button"
              onClick={placeholderAction}
              className="dash-btn-secondary px-3 py-1.5 text-sm inline-flex items-center gap-1.5"
            >
              <Pencil size={14} />
              Edit
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SummaryMetricCard
            label="Payments"
            value={loading ? '…' : periodConfirmed.length}
            sublabel={allTimeConfirmed > 0 ? `${allTimeConfirmed} all time` : undefined}
            empty={!loading && periodConfirmed.length === 0}
          >
            {!loading && periodConfirmed.length > 0 && (
              <MiniBarChart data={paymentCountSeries} />
            )}
          </SummaryMetricCard>

          <SummaryMetricCard
            label="Gross volume"
            value={loading ? '…' : `${formatCombinedVolume(periodGross)} units`}
            sublabel="Last 7 days · confirmed"
            empty={!loading && periodGross === 0}
          >
            {!loading && hasSeriesData(grossSeries) && (
              <VolumeSparkline data={grossSeries} height={72} emptyLabel="No data" />
            )}
          </SummaryMetricCard>

          <SummaryMetricCard
            label="Net volume"
            value={loading ? '…' : `${formatCombinedVolume(periodNet)} units`}
            sublabel="Last 7 days · after fees (MVP: same as gross)"
            empty={!loading && periodNet === 0}
          >
            {!loading && hasSeriesData(grossSeries) && (
              <VolumeSparkline data={grossSeries} height={72} emptyLabel="No data" />
            )}
          </SummaryMetricCard>

          <SummaryMetricCard
            label="Failed payments"
            value={loading ? '…' : periodFailed.length}
            sublabel="Failed or expired"
            empty={!loading && periodFailed.length === 0}
          />

          <SummaryMetricCard
            label="New customers"
            value={loading ? '…' : newCustomers}
            sublabel="Created in period"
            empty={!loading && newCustomers === 0}
          />

          <SummaryMetricCard
            label="Top customers by spend"
            empty={!loading && topCustomers.length === 0}
          >
            {!loading && topCustomers.length > 0 && (
              <ul className="space-y-2 text-sm">
                {topCustomers.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between gap-2 border-b border-[var(--dash-border)] pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-[var(--dash-text)] truncate">{row.label}</span>
                    <span className="text-[var(--dash-muted)] tabular-nums shrink-0">
                      {formatCombinedVolume(row.total)} units · {row.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SummaryMetricCard>
        </div>
      </section>
    </div>
  );
}

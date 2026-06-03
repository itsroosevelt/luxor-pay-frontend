'use client';

import { useEffect, useMemo, useState } from 'react';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { listPayments } from '@/lib/payments-api';
import type { Currency, PaymentOrder } from '@luxor/contracts';
import { formatCurrencyAmount, SUPPORTED_CURRENCIES } from '@/lib/format-currency';
import {
  buildDailyCountSeries,
  buildDailyVolumeSeries,
  confirmedOrders,
  formatCombinedVolume,
  grossVolumeInPeriod,
  hasSeriesData,
  periodRange,
  sumVolume,
} from '@/lib/dashboard-metrics';
import {
  PageHeader,
  EmptyState,
  DashboardMetricCard,
  VolumeSparkline,
  MiniBarChart,
  SummaryMetricCard,
} from '@/components/dashboard';
import { BarChart3, CheckCircle2, Receipt, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

const CHART_DAYS = 30;

function sumByCurrency(orders: PaymentOrder[], currency: Currency) {
  return sumVolume(orders.filter((o) => o.status === 'confirmed' && o.currency === currency));
}

function CurrencySplitBar({
  solVolume,
  usdcVolume,
}: {
  solVolume: number;
  usdcVolume: number;
}) {
  const total = solVolume + usdcVolume;
  if (total === 0) {
    return (
      <div className="h-3 rounded-full bg-[var(--dash-surface-elevated)] border border-[var(--dash-border)]" />
    );
  }
  const solPct = (solVolume / total) * 100;
  return (
    <div className="space-y-2">
      <div className="flex h-3 rounded-full overflow-hidden bg-[var(--dash-surface-elevated)]">
        <div
          className="bg-[#9945ff] transition-all"
          style={{ width: `${solPct}%` }}
          title={`SOL ${solPct.toFixed(1)}%`}
        />
        <div
          className="bg-[#2775ca] transition-all"
          style={{ width: `${100 - solPct}%` }}
          title={`USDC ${(100 - solPct).toFixed(1)}%`}
        />
      </div>
      <div className="flex justify-between text-xs text-[var(--dash-muted)]">
        <span>SOL {solPct.toFixed(0)}%</span>
        <span>USDC {(100 - solPct).toFixed(0)}%</span>
      </div>
    </div>
  );
}

export default function PaymentAnalyticsPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        setOrders(await listPayments(token));
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const confirmed = useMemo(() => confirmedOrders(orders), [orders]);
  const failed = useMemo(
    () => orders.filter((o) => o.status === 'failed' || o.status === 'expired'),
    [orders]
  );
  const hasData = orders.length > 0;

  const { start: periodStart, end: periodEnd } = useMemo(() => periodRange(CHART_DAYS), []);

  const volumeSeries = useMemo(
    () => buildDailyVolumeSeries(orders, CHART_DAYS, periodEnd),
    [orders, periodEnd]
  );

  const confirmedCountSeries = useMemo(
    () =>
      buildDailyCountSeries(orders, CHART_DAYS, (o) => o.status === 'confirmed', periodEnd),
    [orders, periodEnd]
  );

  const failedCountSeries = useMemo(
    () =>
      buildDailyCountSeries(
        orders,
        CHART_DAYS,
        (o) => o.status === 'failed' || o.status === 'expired',
        periodEnd
      ),
    [orders, periodEnd]
  );

  const periodVolume = useMemo(
    () => grossVolumeInPeriod(orders, periodStart, periodEnd),
    [orders, periodStart, periodEnd]
  );

  const solVolume = useMemo(() => sumByCurrency(orders, 'SOL'), [orders]);
  const usdcVolume = useMemo(() => sumByCurrency(orders, 'USDC'), [orders]);

  const successRate = useMemo(() => {
    const terminal = orders.filter((o) => o.status !== 'pending');
    if (terminal.length === 0) return null;
    return Math.round((confirmed.length / terminal.length) * 100);
  }, [orders, confirmed.length]);

  return (
    <>
      <PageHeader
        title="Payment analytics"
        description="Volume and success metrics from real on-chain payment orders."
      />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        {loading ? (
          <p className="text-sm text-[var(--dash-muted)]">Loading analytics…</p>
        ) : hasData ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardMetricCard
                label="Confirmed payments"
                value={String(confirmed.length)}
                sublabel="All time"
                icon={Receipt}
              />
              <DashboardMetricCard
                label="Failed / expired"
                value={String(failed.length)}
                sublabel="All time"
                icon={XCircle}
              />
              <DashboardMetricCard
                label="Success rate"
                value={successRate != null ? `${successRate}%` : '—'}
                sublabel="Excluding pending"
                icon={CheckCircle2}
                empty={successRate == null}
              />
              <DashboardMetricCard
                label={`Volume (${CHART_DAYS}d)`}
                value={`$${formatCombinedVolume(periodVolume)}`}
                sublabel="Confirmed · combined units"
                icon={BarChart3}
                empty={periodVolume === 0}
              />
            </div>

            <div className="dash-card p-5 space-y-4">
              <div>
                <h2 className="text-sm font-medium text-[var(--dash-text)]">Volume over time</h2>
                <p className="text-xs text-[var(--dash-muted)] mt-0.5">
                  Confirmed SOL + USDC · last {CHART_DAYS} days
                </p>
              </div>
              <VolumeSparkline
                data={volumeSeries}
                height={220}
                emptyLabel="No confirmed volume in this period"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <SummaryMetricCard
                label="Confirmed per day"
                value={confirmedCountSeries.reduce((a, b) => a + b, 0)}
                sublabel={`Last ${CHART_DAYS} days`}
                empty={!hasSeriesData(confirmedCountSeries)}
              >
                {hasSeriesData(confirmedCountSeries) && (
                  <MiniBarChart data={confirmedCountSeries} />
                )}
              </SummaryMetricCard>
              <SummaryMetricCard
                label="Failed / expired per day"
                value={failedCountSeries.reduce((a, b) => a + b, 0)}
                sublabel={`Last ${CHART_DAYS} days`}
                empty={!hasSeriesData(failedCountSeries)}
              >
                {hasSeriesData(failedCountSeries) && (
                  <MiniBarChart data={failedCountSeries} className="[&>div]:bg-red-400/70" />
                )}
              </SummaryMetricCard>
            </div>

            <div className="dash-card p-5 space-y-5">
              <div>
                <h2 className="text-sm font-medium text-[var(--dash-text)]">SOL vs USDC</h2>
                <p className="text-xs text-[var(--dash-muted)] mt-0.5">
                  Confirmed volume breakdown · all time
                </p>
              </div>
              <CurrencySplitBar solVolume={solVolume} usdcVolume={usdcVolume} />
              <div className="grid sm:grid-cols-2 gap-4">
                {SUPPORTED_CURRENCIES.map((c) => {
                  const vol = c === 'SOL' ? solVolume : usdcVolume;
                  const count = confirmed.filter((o) => o.currency === c).length;
                  return (
                    <div
                      key={c}
                      className={cn(
                        'rounded-lg border border-[var(--dash-border)] p-4',
                        'bg-[var(--dash-surface-elevated)]'
                      )}
                    >
                      <p className="text-xs text-[var(--dash-muted)]">{c} volume</p>
                      <p className="text-lg font-semibold tabular-nums mt-1">
                        {formatCurrencyAmount(vol, c)}
                      </p>
                      <p className="text-xs text-[var(--dash-muted)] mt-1">
                        {count} payment{count === 1 ? '' : 's'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            icon={BarChart3}
            title="No analytics yet"
            description="Create a payment link or POS charge — confirmed SOL and USDC orders will appear here automatically."
            action={{ label: 'Create payment link', href: '/dashboard/links' }}
          />
        )}
      </div>
    </>
  );
}

import { scanLocalMerchants } from '@/lib/admin-merchants';
import { listAllCheckoutPayments } from '@/lib/checkout-payments-local';
import {
  countForDay,
  grossVolumeInPeriod,
  isSameDay,
  ordersInRange,
  parseOrderDate,
  periodRange,
  startOfDay,
} from '@/lib/dashboard/dashboard-metrics';
import { getEnabledTokens, loadPlatformConfig } from '@/lib/platform-config';
import type { PaymentOrder } from '@luxor/contracts';

export type PlatformMetrics = {
  merchantCount: number;
  transactionCount: number;
  volumeUsd: number;
  revenueUsd: number;
  commissionPercent: number;
  activeTokens: number;
  growthPercent: number | null;
  paymentsToday: number;
  newMerchantsToday: number;
  successRatePercent: number;
  hasActivity: boolean;
};

const METRICS_PERIOD_DAYS = 30;

function countMerchantsCreatedOn(day: Date): number {
  return scanLocalMerchants().filter((m) =>
    isSameDay(parseOrderDate(m.createdAt), day)
  ).length;
}

function computeGrowthPercent(currentVolume: number, previousVolume: number): number | null {
  if (currentVolume === 0 && previousVolume === 0) return null;
  if (previousVolume === 0) return null;
  return Math.round(((currentVolume - previousVolume) / previousVolume) * 1000) / 10;
}

function previousPeriodRange(days: number): { start: Date; end: Date } {
  const { start: currentStart } = periodRange(days);
  const end = new Date(currentStart);
  end.setMilliseconds(end.getMilliseconds() - 1);
  const start = startOfDay(end);
  start.setDate(start.getDate() - (days - 1));
  return { start, end };
}

function confirmedInPeriod(orders: PaymentOrder[], start: Date, end: Date): PaymentOrder[] {
  return ordersInRange(orders, start, end, (o) => o.status === 'confirmed');
}

/** Aggregate platform KPIs from local merchants and checkout payments. */
export function computePlatformMetrics(): PlatformMetrics {
  const merchants = typeof window !== 'undefined' ? scanLocalMerchants() : [];
  const allPayments = typeof window !== 'undefined' ? listAllCheckoutPayments() : [];
  const config = typeof window !== 'undefined' ? loadPlatformConfig() : null;
  const commissionPercent = config?.globalCommissionPercent ?? 2.5;

  const today = startOfDay(new Date());
  const { start: periodStart, end: periodEnd } = periodRange(METRICS_PERIOD_DAYS);
  const { start: prevStart, end: prevEnd } = previousPeriodRange(METRICS_PERIOD_DAYS);

  const periodConfirmed = confirmedInPeriod(allPayments, periodStart, periodEnd);
  const volumeUsd = grossVolumeInPeriod(allPayments, periodStart, periodEnd);
  const prevVolumeUsd = grossVolumeInPeriod(allPayments, prevStart, prevEnd);
  const transactionCount = periodConfirmed.length;
  const revenueUsd = Math.round(volumeUsd * (commissionPercent / 100));
  const growthPercent = computeGrowthPercent(volumeUsd, prevVolumeUsd);

  const paymentsToday = countForDay(allPayments, today, (o) => o.status === 'confirmed');
  const newMerchantsToday = typeof window !== 'undefined' ? countMerchantsCreatedOn(today) : 0;

  const failedInPeriod = ordersInRange(allPayments, periodStart, periodEnd, (o) =>
    ['failed', 'expired'].includes(o.status)
  ).length;
  const successRatePercent =
    transactionCount + failedInPeriod === 0
      ? 0
      : Math.round((transactionCount / (transactionCount + failedInPeriod)) * 1000) / 10;

  const hasActivity = transactionCount > 0 || paymentsToday > 0 || newMerchantsToday > 0;

  return {
    merchantCount: merchants.length,
    transactionCount,
    volumeUsd,
    revenueUsd,
    commissionPercent,
    activeTokens: config ? getEnabledTokens(config).length : 0,
    growthPercent,
    paymentsToday,
    newMerchantsToday,
    successRatePercent,
    hasActivity,
  };
}

export type ReportChartData = {
  volumeByMonth: { label: string; value: number }[];
  transactionsByToken: { label: string; value: number; color: string }[];
  topMerchants: { name: string; volume: number }[];
};

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const TOKEN_COLORS: Record<string, string> = {
  USDC: 'var(--dash-accent)',
  SOL: '#9945FF',
  USDT: '#26A17B',
};

/** Chart data derived from local checkout payments (empty when no data). */
export function computeReportChartData(): ReportChartData {
  if (typeof window === 'undefined') {
    return { volumeByMonth: [], transactionsByToken: [], topMerchants: [] };
  }

  const payments = listAllCheckoutPayments().filter((o) => o.status === 'confirmed');
  if (payments.length === 0) {
    return { volumeByMonth: [], transactionsByToken: [], topMerchants: [] };
  }

  const now = new Date();
  const volumeByMonth: { label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    const volume = grossVolumeInPeriod(payments, monthStart, monthEnd);
    volumeByMonth.push({
      label: MONTH_LABELS[monthStart.getMonth()],
      value: Math.round(volume),
    });
  }

  const tokenCounts = new Map<string, number>();
  for (const payment of payments) {
    tokenCounts.set(payment.currency, (tokenCounts.get(payment.currency) ?? 0) + 1);
  }
  const totalTokenTx = [...tokenCounts.values()].reduce((sum, n) => sum + n, 0);
  const transactionsByToken = [...tokenCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      label,
      value: totalTokenTx > 0 ? Math.round((count / totalTokenTx) * 100) : 0,
      color: TOKEN_COLORS[label] ?? '#64748B',
    }));

  const merchants = scanLocalMerchants();
  const merchantNames = new Map(merchants.map((m) => [m.id, m.businessName]));
  const volumeByMerchant = new Map<string, number>();
  for (const payment of payments) {
    volumeByMerchant.set(
      payment.merchantId,
      (volumeByMerchant.get(payment.merchantId) ?? 0) + payment.amount
    );
  }
  const topMerchants = [...volumeByMerchant.entries()]
    .map(([id, volume]) => ({
      name: merchantNames.get(id) ?? 'Comercio sin nombre',
      volume: Math.round(volume),
    }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 4);

  return { volumeByMonth, transactionsByToken, topMerchants };
}

export const MOCK_TREASURY_BALANCES: Record<
  'SOL' | 'USDC' | 'USDT',
  { balance: number; usdValue: number }
> = {
  SOL: { balance: 0, usdValue: 0 },
  USDC: { balance: 0, usdValue: 0 },
  USDT: { balance: 0, usdValue: 0 },
};

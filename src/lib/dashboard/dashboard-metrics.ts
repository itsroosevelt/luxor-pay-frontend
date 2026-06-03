import type { Customer, PaymentOrder } from '@luxor/contracts';
import { paymentCustomerLabel } from '@/lib/transaction-utils';

export function parseOrderDate(iso: string): Date {
  return new Date(iso);
}

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function confirmedOrders(orders: PaymentOrder[]): PaymentOrder[] {
  return orders.filter((o) => o.status === 'confirmed');
}

export function sumVolume(orders: PaymentOrder[]): number {
  return orders.reduce((sum, o) => sum + o.amount, 0);
}

export function volumeForDay(orders: PaymentOrder[], day: Date): number {
  return sumVolume(
    confirmedOrders(orders).filter((o) => isSameDay(parseOrderDate(o.createdAt), day))
  );
}

export function countForDay(
  orders: PaymentOrder[],
  day: Date,
  predicate: (o: PaymentOrder) => boolean = () => true
): number {
  return orders.filter(
    (o) => predicate(o) && isSameDay(parseOrderDate(o.createdAt), day)
  ).length;
}

/** Daily totals ending on `endDate` (inclusive), oldest first. */
export function buildDailyVolumeSeries(
  orders: PaymentOrder[],
  days: number,
  endDate: Date = new Date()
): number[] {
  const end = startOfDay(endDate);
  const series: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    series.push(volumeForDay(orders, d));
  }
  return series;
}

export function buildDailyCountSeries(
  orders: PaymentOrder[],
  days: number,
  predicate: (o: PaymentOrder) => boolean,
  endDate: Date = new Date()
): number[] {
  const end = startOfDay(endDate);
  const series: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    series.push(countForDay(orders, d, predicate));
  }
  return series;
}

export function ordersInRange(
  orders: PaymentOrder[],
  start: Date,
  end: Date,
  predicate?: (o: PaymentOrder) => boolean
): PaymentOrder[] {
  const startMs = start.getTime();
  const endMs = end.getTime();
  return orders.filter((o) => {
    const t = parseOrderDate(o.createdAt).getTime();
    if (t < startMs || t > endMs) return false;
    return predicate ? predicate(o) : true;
  });
}

export function periodRange(days: number, endDate: Date = new Date()): { start: Date; end: Date } {
  const end = startOfDay(endDate);
  end.setHours(23, 59, 59, 999);
  const start = startOfDay(endDate);
  start.setDate(start.getDate() - (days - 1));
  return { start, end };
}

export function yesterdayDeltaLabel(today: number, yesterday: number): string | null {
  if (today === 0 && yesterday === 0) return null;
  if (yesterday === 0) return today > 0 ? 'vs yesterday: new activity' : null;
  const pct = ((today - yesterday) / yesterday) * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}% vs yesterday`;
}

const ESTIMATED_FEE_RATE = 0;

export function grossVolumeInPeriod(orders: PaymentOrder[], start: Date, end: Date): number {
  return sumVolume(ordersInRange(orders, start, end, (o) => o.status === 'confirmed'));
}

export function netVolumeInPeriod(orders: PaymentOrder[], start: Date, end: Date): number {
  const gross = grossVolumeInPeriod(orders, start, end);
  return gross * (1 - ESTIMATED_FEE_RATE);
}

export function topCustomersBySpend(
  orders: PaymentOrder[],
  start: Date,
  end: Date,
  limit = 5
): { label: string; total: number; count: number }[] {
  const inPeriod = ordersInRange(orders, start, end, (o) => o.status === 'confirmed');
  const map = new Map<string, { total: number; count: number }>();
  for (const o of inPeriod) {
    const label = paymentCustomerLabel(o);
    const cur = map.get(label) ?? { total: 0, count: 0 };
    map.set(label, { total: cur.total + o.amount, count: cur.count + 1 });
  }
  return [...map.entries()]
    .map(([label, stats]) => ({ label, ...stats }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function countNewCustomersInPeriod(
  customers: Customer[],
  start: Date,
  end: Date
): number {
  const startMs = start.getTime();
  const endMs = end.getTime();
  return customers.filter((c) => {
    const t = parseOrderDate(c.createdAt).getTime();
    return t >= startMs && t <= endMs;
  }).length;
}

export function formatCombinedVolume(amount: number): string {
  if (amount === 0) return '0.00';
  return amount.toFixed(2);
}

export function hasSeriesData(data: number[]): boolean {
  return data.some((v) => v > 0);
}

import type { Currency, PaymentOrder } from '@luxor/contracts';

export type BalanceActivityTab = 'transfers' | 'topups' | 'all';
export type BalanceActivityType = 'payment' | 'transfer' | 'topup';
export type BalanceActivityStatus = 'paid' | 'pending' | 'failed';

export interface BalanceActivityRow {
  id: string;
  amount: number;
  currency: Currency;
  status: BalanceActivityStatus;
  destination: string;
  type: BalanceActivityType;
  typeLabel: string;
  availableOn: string;
}

export interface BalanceSummary {
  incoming: number;
  available: number;
}

export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

export function computeBalanceSummary(
  orders: PaymentOrder[],
  currency: Currency
): BalanceSummary {
  const filtered = orders.filter((o) => o.currency === currency);
  const incoming = filtered
    .filter((o) => o.status === 'pending')
    .reduce((sum, o) => sum + o.amount, 0);
  const available = filtered
    .filter((o) => o.status === 'confirmed')
    .reduce((sum, o) => sum + o.amount, 0);
  return { incoming, available };
}

function paymentStatusToActivity(status: PaymentOrder['status']): BalanceActivityStatus {
  if (status === 'confirmed') return 'paid';
  if (status === 'pending') return 'pending';
  return 'failed';
}

function paymentTypeLabel(order: PaymentOrder): string {
  if (order.linkId) return 'Payment link';
  return 'POS / API';
}

export function ordersToActivity(orders: PaymentOrder[]): BalanceActivityRow[] {
  return orders.map((o) => ({
    id: o.reference,
    amount: o.amount,
    currency: o.currency,
    status: paymentStatusToActivity(o.status),
    destination: shortenAddress(o.recipient),
    type: 'payment',
    typeLabel: paymentTypeLabel(o),
    availableOn: o.confirmedAt ?? o.updatedAt ?? o.createdAt,
  }));
}

export function filterActivityByTab(
  rows: BalanceActivityRow[],
  tab: BalanceActivityTab
): BalanceActivityRow[] {
  if (tab === 'transfers') return rows.filter((r) => r.type === 'transfer');
  if (tab === 'topups') return rows.filter((r) => r.type === 'topup');
  return rows;
}

export function mergeBalanceActivities(orders: PaymentOrder[]): BalanceActivityRow[] {
  return ordersToActivity(orders).sort(
    (a, b) => new Date(b.availableOn).getTime() - new Date(a.availableOn).getTime()
  );
}

export function formatBalanceAmount(amount: number, currency: Currency): string {
  const decimals = currency === 'SOL' ? 4 : 2;
  return `${amount.toFixed(decimals)} ${currency}`;
}

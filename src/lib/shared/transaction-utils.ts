import type { Currency, PaymentOrder } from '@luxor/contracts';

export type TransactionTab = 'payments' | 'transfers' | 'topups' | 'all';

export type TransactionKind = 'payment' | 'transfer' | 'topup' | 'charge';

export interface TransactionRow {
  id: string;
  amount: number;
  fees: number | null;
  total: number;
  currency: Currency;
  kind: TransactionKind;
  typeLabel: string;
  balanceType: string;
  description: string;
  balanceTransactionId: string;
  createdAt: string;
  availableOn: string;
}

export const TRANSACTION_TABS: { id: TransactionTab; label: string }[] = [
  { id: 'payments', label: 'Pagos' },
  { id: 'transfers', label: 'Transferencias' },
  { id: 'topups', label: 'Recargas' },
  { id: 'all', label: 'Toda la actividad' },
];

const BALANCE_TYPE_LABELS: Record<TransactionKind, string> = {
  payment: 'Pagos',
  transfer: 'Transferencias',
  topup: 'Recargas',
  charge: 'Pagos',
};

function shortenId(value: string, head = 8, tail = 6): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

function paymentKind(order: PaymentOrder): TransactionKind {
  if (order.status === 'pending') return 'charge';
  return 'payment';
}

function paymentTypeLabel(order: PaymentOrder): string {
  if (order.status === 'pending') return 'Cargo';
  if (order.status === 'confirmed') return 'Pago';
  if (order.status === 'failed') return 'Fallido';
  return 'Expirado';
}

function paymentDescription(order: PaymentOrder): string {
  const label = order.label?.trim();
  if (label) return label.toUpperCase();
  const message = order.message?.trim();
  if (message) return message.toUpperCase();
  if (order.signature) return `TX ${order.signature.slice(0, 12).toUpperCase()}`;
  return `REF ${order.reference.slice(0, 12).toUpperCase()}`;
}

export function orderToTransactionRow(order: PaymentOrder): TransactionRow {
  const kind = paymentKind(order);
  const signedAmount =
    order.status === 'confirmed'
      ? order.amount
      : order.status === 'pending'
        ? order.amount
        : -order.amount;

  return {
    id: order.reference,
    amount: signedAmount,
    fees: null,
    total: signedAmount,
    currency: order.currency,
    kind,
    typeLabel: paymentTypeLabel(order),
    balanceType: BALANCE_TYPE_LABELS[kind],
    description: paymentDescription(order),
    balanceTransactionId: order.signature
      ? shortenId(order.signature, 10, 8)
      : shortenId(order.reference, 10, 6),
    createdAt: order.createdAt,
    availableOn: order.confirmedAt ?? order.updatedAt ?? order.createdAt,
  };
}

export function ordersToTransactionRows(orders: PaymentOrder[]): TransactionRow[] {
  return orders
    .map(orderToTransactionRow)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function filterTransactionsByTab(
  rows: TransactionRow[],
  tab: TransactionTab
): TransactionRow[] {
  if (tab === 'payments') return rows.filter((r) => r.kind === 'payment' || r.kind === 'charge');
  if (tab === 'transfers') return rows.filter((r) => r.kind === 'transfer');
  if (tab === 'topups') return rows.filter((r) => r.kind === 'topup');
  return rows;
}

export function formatSignedTransactionAmount(amount: number, currency: Currency): string {
  const decimals = currency === 'SOL' ? 4 : 2;
  const sign = amount < 0 ? '-' : '';
  return `${sign}${currency} ${Math.abs(amount).toFixed(decimals)}`;
}

export function formatTransactionFee(fees: number | null, currency: Currency): string {
  if (fees === null || fees === 0) return '—';
  return formatSignedTransactionAmount(-Math.abs(fees), currency);
}

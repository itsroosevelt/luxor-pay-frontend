import type { PaymentOrder } from '@luxor/contracts';

export type TransactionTab = 'payments' | 'transfers' | 'topups' | 'all';

export type PaymentSummaryFilter =
  | 'all'
  | 'succeeded'
  | 'refunded'
  | 'disputed'
  | 'failed'
  | 'uncaptured';

export interface PaymentStatusCounts {
  all: number;
  succeeded: number;
  refunded: number;
  disputed: number;
  failed: number;
  uncaptured: number;
}

export function computePaymentStatusCounts(orders: PaymentOrder[]): PaymentStatusCounts {
  return {
    all: orders.length,
    succeeded: orders.filter((o) => o.status === 'confirmed').length,
    refunded: 0,
    disputed: 0,
    failed: orders.filter((o) => o.status === 'failed' || o.status === 'expired').length,
    uncaptured: orders.filter((o) => o.status === 'pending').length,
  };
}

export function filterPaymentsBySummary(
  orders: PaymentOrder[],
  filter: PaymentSummaryFilter
): PaymentOrder[] {
  switch (filter) {
    case 'succeeded':
      return orders.filter((o) => o.status === 'confirmed');
    case 'failed':
      return orders.filter((o) => o.status === 'failed' || o.status === 'expired');
    case 'uncaptured':
      return orders.filter((o) => o.status === 'pending');
    case 'refunded':
    case 'disputed':
      return [];
    default:
      return orders;
  }
}

export const paymentStatusLabels: Record<PaymentOrder['status'], string> = {
  pending: 'Pending',
  confirmed: 'Succeeded',
  expired: 'Expired',
  failed: 'Failed',
};

export function paymentRejectionReason(order: PaymentOrder): string {
  if (order.status === 'failed' || order.status === 'expired') {
    return order.message?.trim() || '—';
  }
  return '—';
}

export function paymentMethodLabel(order: PaymentOrder): string {
  if (order.linkId) return 'Solana Pay link';
  if (order.solanaPayUrl) return 'Solana Pay QR';
  return 'Wallet (Phantom, Solflare)';
}

export function paymentCustomerLabel(order: PaymentOrder): string {
  const name = order.label?.trim();
  if (name) return name;
  const addr = order.recipient;
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function formatPaymentAmount(amount: number, currency: PaymentOrder['currency']): string {
  const decimals = currency === 'SOL' ? 4 : 2;
  return `${amount.toFixed(decimals)} ${currency}`;
}

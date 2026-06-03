import type { PaymentOrder } from '@luxor/contracts';
import type { TimelineEvent } from '@/components/dashboard/Timeline';

export function formatDetailDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function paymentDisplayStatus(
  status: PaymentOrder['status']
): { label: string; tone: 'success' | 'warning' | 'error' | 'neutral' } {
  switch (status) {
    case 'confirmed':
      return { label: 'Paid', tone: 'success' };
    case 'pending':
      return { label: 'Pending', tone: 'warning' };
    case 'failed':
      return { label: 'Failed', tone: 'error' };
    case 'expired':
      return { label: 'Expired', tone: 'neutral' };
  }
}

export function buildPaymentTimelineEvents(order: PaymentOrder): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: 'created',
      title: 'Payment created',
      description: order.linkId ? 'Checkout initiated via payment link' : 'Checkout initiated',
      timestamp: order.createdAt,
      status: 'completed',
    },
  ];

  if (order.status === 'pending') {
    events.push({
      id: 'pending',
      title: 'Awaiting on-chain confirmation',
      description: 'Customer submitted payment — waiting for Solana confirmation',
      timestamp: order.updatedAt,
      status: 'current',
    });
  } else if (order.status === 'confirmed') {
    events.push({
      id: 'pending',
      title: 'Payment submitted',
      description: 'Transaction detected on Solana',
      timestamp: order.updatedAt !== order.createdAt ? order.updatedAt : undefined,
      status: 'completed',
    });
    events.push({
      id: 'confirmed',
      title: 'Payment confirmed',
      description: order.signature ? 'On-chain settlement complete' : 'Payment marked as confirmed',
      timestamp: order.confirmedAt ?? order.updatedAt,
      status: 'completed',
    });
  } else {
    events.push({
      id: 'failed',
      title: order.status === 'expired' ? 'Payment expired' : 'Payment failed',
      description: order.message?.trim() || 'No additional details',
      timestamp: order.updatedAt,
      status: 'failed',
    });
  }

  return events;
}

export function buildTransferTimelineEvents(
  order: PaymentOrder,
  merchantWallet: string
): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: 'initiated',
      title: 'Transfer initiated',
      description: `Payout to ${merchantWallet.slice(0, 4)}…${merchantWallet.slice(-4)}`,
      timestamp: order.createdAt,
      status: 'completed',
    },
  ];

  if (order.status === 'pending') {
    events.push({
      id: 'in-transit',
      title: 'In transit',
      description: 'Funds pending on-chain confirmation',
      timestamp: order.updatedAt,
      status: 'current',
    });
  } else if (order.status === 'confirmed') {
    events.push({
      id: 'in-transit',
      title: 'In transit',
      description: 'Payment confirmed — crediting merchant wallet',
      timestamp: order.updatedAt !== order.createdAt ? order.updatedAt : undefined,
      status: 'completed',
    });
    events.push({
      id: 'completed',
      title: 'Completed',
      description: 'Available in your Solana wallet balance',
      timestamp: order.confirmedAt ?? order.updatedAt,
      status: 'completed',
    });
  } else {
    events.push({
      id: 'failed',
      title: 'Transfer failed',
      description: order.message?.trim() || 'Settlement did not complete',
      timestamp: order.updatedAt,
      status: 'failed',
    });
  }

  return events;
}

export function filterPaymentsForCustomer(
  orders: PaymentOrder[],
  customer: { email?: string; walletAddress?: string; name: string }
): PaymentOrder[] {
  return orders.filter((o) => {
    if (customer.walletAddress && o.recipient === customer.walletAddress) return true;
    const label = o.label?.trim().toLowerCase();
    if (label && label === customer.name.trim().toLowerCase()) return true;
    if (customer.email && label === customer.email.trim().toLowerCase()) return true;
    return false;
  });
}

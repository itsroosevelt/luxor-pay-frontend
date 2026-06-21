'use client';

import type { PaymentOrder } from '@luxor/contracts';
import { getExplorerTxUrl } from '@/web3/config/network';
import { CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';

const labels: Record<PaymentOrder['status'], string> = {
  pending: 'Awaiting payment',
  confirmed: 'Payment confirmed',
  expired: 'Expired',
  failed: 'Failed',
};

export function TransactionStatus({ order }: { order: PaymentOrder }) {
  const Icon =
    order.status === 'confirmed'
      ? CheckCircle2
      : order.status === 'pending'
        ? Clock
        : XCircle;

  const color =
    order.status === 'confirmed'
      ? 'text-primary'
      : order.status === 'pending'
        ? 'text-amber-400'
        : 'text-red-400';

  return (
    <div className="glass-panel p-4 flex items-start gap-3 text-left">
      {order.status === 'pending' ? (
        <Loader2 className={`${color} animate-spin shrink-0`} size={22} />
      ) : (
        <Icon className={`${color} shrink-0`} size={22} />
      )}
      <div>
        <p className={`font-semibold ${color}`}>{labels[order.status]}</p>
        <p className="text-xs text-gray-500 mt-1 font-mono break-all">
          Ref: {order.reference.slice(0, 12)}…
        </p>
        {order.signature && (
          <a
            href={getExplorerTxUrl(order.signature)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline mt-2 inline-block"
          >
            View on Solana Explorer
          </a>
        )}
      </div>
    </div>
  );
}

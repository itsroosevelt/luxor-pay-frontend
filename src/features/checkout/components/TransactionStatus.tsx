'use client';

import type { PaymentOrder } from '@luxor/contracts';
import { getExplorerTxUrl } from '@/web3/config/network';
import { CheckCircle2, Clock, Loader2, PenLine, RefreshCw, XCircle } from 'lucide-react';

export type TransactionPhase =
  | 'idle'
  | 'awaiting_signature'
  | 'processing'
  | 'success'
  | 'reverted';

function resolvePhase(order: PaymentOrder): TransactionPhase {
  if (order.status === 'confirmed') return 'success';
  if (order.status === 'failed') return 'reverted';
  if (order.status === 'expired') return 'reverted';
  if (order.status === 'pending' && order.signature) return 'processing';
  if (order.status === 'pending') return 'awaiting_signature';
  return 'idle';
}

const phaseLabels: Record<TransactionPhase, string> = {
  idle: 'Ready to pay',
  awaiting_signature: 'Awaiting payment',
  processing: 'Confirming on-chain',
  success: 'Payment confirmed',
  reverted: 'Payment failed',
};

const phaseDescriptions: Partial<Record<TransactionPhase, string>> = {
  awaiting_signature: 'Complete the transfer via QR or connected wallet.',
  processing: 'Your transaction is being finalized on Solana.',
  success: 'Funds have been confirmed on-chain.',
  reverted: 'This payment expired or could not be confirmed.',
};

function PhaseIcon({ phase }: { phase: TransactionPhase }) {
  const className = 'shrink-0';
  const size = 22;

  if (phase === 'processing' || phase === 'awaiting_signature') {
    return phase === 'processing' ? (
      <RefreshCw className={`${className} text-[#60A5FA] animate-spin`} size={size} />
    ) : (
      <PenLine className={`${className} text-amber-400`} size={size} />
    );
  }

  if (phase === 'success') {
    return <CheckCircle2 className={`${className} text-[#60A5FA]`} size={size} />;
  }

  if (phase === 'reverted') {
    return <XCircle className={`${className} text-red-400`} size={size} />;
  }

  return <Clock className={`${className} text-gray-400`} size={size} />;
}

function phaseColor(phase: TransactionPhase): string {
  if (phase === 'success') return 'text-[#60A5FA]';
  if (phase === 'processing') return 'text-[#60A5FA]';
  if (phase === 'awaiting_signature') return 'text-amber-400';
  if (phase === 'reverted') return 'text-red-400';
  return 'text-gray-400';
}

export function TransactionStatus({
  order,
  phase: phaseOverride,
}: {
  order: PaymentOrder;
  phase?: TransactionPhase;
}) {
  const phase = phaseOverride ?? resolvePhase(order);
  const label = phaseLabels[phase];
  const description = phaseDescriptions[phase];
  const color = phaseColor(phase);
  const isBusy = phase === 'processing' || phase === 'awaiting_signature';

  return (
    <div
      className="glass-panel p-4 flex items-start gap-3 text-left"
      aria-busy={isBusy}
      aria-live="polite"
    >
      <PhaseIcon phase={phase} />
      <div>
        <p className={`font-semibold ${color}`}>{label}</p>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        <p className="text-xs text-gray-500 mt-1 font-mono break-all">
          Ref: {order.reference.slice(0, 12)}…
        </p>
        {order.signature && (
          <a
            href={getExplorerTxUrl(order.signature)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#60A5FA] hover:underline mt-2 inline-block"
          >
            View on Solana Explorer
          </a>
        )}
        {phase === 'processing' && !order.signature && (
          <p className="text-xs text-gray-500 mt-2 inline-flex items-center gap-1">
            <Loader2 className="animate-spin" size={14} />
            Listening for on-chain confirmation…
          </p>
        )}
      </div>
    </div>
  );
}

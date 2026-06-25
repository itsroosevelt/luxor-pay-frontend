'use client';

import { useEffect, useRef } from 'react';
import type { PaymentOrder } from '@luxor/contracts';
import { verifyPayment } from '@/lib/payments-api';
import { findOnChainPaymentSignature } from '@/lib/solana-pay-verification';

const DEFAULT_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
  (process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet'
    ? 'https://api.devnet.solana.com'
    : 'https://api.mainnet-beta.solana.com');

/**
 * Hybrid polling: backend verify first, then client RPC fallback (subscriptions_qr- pattern).
 * Client RPC never writes to DB — it nudges verifyPayment when a matching tx is found.
 */
export function useHybridPaymentVerification(
  paymentOrder: PaymentOrder | null,
  options: {
    enabled?: boolean;
    pollMs?: number;
    onConfirmed: (order: PaymentOrder) => void;
    onOrderUpdate?: (order: PaymentOrder) => void;
  }
) {
  const { enabled = true, pollMs = 4000, onConfirmed, onOrderUpdate } = options;
  const onConfirmedRef = useRef(onConfirmed);
  const onOrderUpdateRef = useRef(onOrderUpdate);
  onConfirmedRef.current = onConfirmed;
  onOrderUpdateRef.current = onOrderUpdate;

  useEffect(() => {
    if (
      !enabled ||
      !paymentOrder?.reference ||
      paymentOrder.status === 'confirmed'
    ) {
      return;
    }

    let cancelled = false;
    const snapshot = paymentOrder;

    async function poll() {
      try {
        const result = await verifyPayment(snapshot.reference);
        if (cancelled) return;

        onOrderUpdateRef.current?.(result.data);
        if (result.confirmed) {
          onConfirmedRef.current(result.data);
          return;
        }

        const onChain = await findOnChainPaymentSignature({
          rpcUrl: DEFAULT_RPC,
          reference: snapshot.reference,
          recipient: snapshot.recipient,
          amount: snapshot.amount,
          currency: snapshot.currency,
        });

        if (cancelled || !onChain) return;

        const retry = await verifyPayment(snapshot.reference);
        if (cancelled) return;

        onOrderUpdateRef.current?.(retry.data);
        if (retry.confirmed) {
          onConfirmedRef.current(retry.data);
        }
      } catch {
        // Keep polling until payer completes the transfer.
      }
    }

    poll();
    const intervalId = window.setInterval(poll, pollMs);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [
    enabled,
    paymentOrder?.amount,
    paymentOrder?.currency,
    paymentOrder?.recipient,
    paymentOrder?.reference,
    paymentOrder?.status,
    pollMs,
  ]);
}

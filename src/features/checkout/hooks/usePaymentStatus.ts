'use client';

import { useCallback, useEffect, useState } from 'react';
import type { PaymentOrder } from '@luxor/contracts';
import { fetchPayment, verifyPayment } from '@/lib/payments-api';

export function usePaymentStatus(reference: string | null, pollMs = 4000) {
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!reference) return;
    try {
      const data = await fetchPayment(reference);
      setOrder(data);
      setError(null);
      if (data.status === 'pending') {
        const verified = await verifyPayment(reference);
        setOrder(verified.data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error loading payment');
    } finally {
      setLoading(false);
    }
  }, [reference]);

  useEffect(() => {
    if (!reference) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const data = await fetchPayment(reference);
        if (cancelled) return;
        setOrder(data);
        setError(null);
        if (data.status === 'pending') {
          const verified = await verifyPayment(reference);
          if (cancelled) return;
          setOrder(verified.data);
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Error loading payment');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void poll();
    const id = setInterval(() => {
      void poll();
    }, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [reference, pollMs]);

  return { order, loading, error, refresh };
}

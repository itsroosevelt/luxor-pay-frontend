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
    refresh();
    if (!reference) return;
    const id = setInterval(refresh, pollMs);
    return () => clearInterval(id);
  }, [reference, pollMs, refresh]);

  return { order, loading, error, refresh };
}

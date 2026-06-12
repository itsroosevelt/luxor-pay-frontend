'use client';

import { useCallback, useEffect, useState } from 'react';
import type { PaymentOrder } from '@luxor/contracts';
import { fetchPayment, verifyPayment } from '@/lib/payments-api';

export interface PaymentStatusResult {
  data: PaymentOrder | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
  /** @deprecated Use `data` instead */
  order: PaymentOrder | null;
  /** @deprecated Use `isLoading` instead */
  loading: boolean;
  /** @deprecated Use `errorMessage` instead */
  error: string | null;
  /** @deprecated Use `refetch` instead */
  refresh: () => Promise<void>;
}

export function usePaymentStatus(
  reference: string | null,
  pollMs = 4000
): PaymentStatusResult {
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!reference) return;

    try {
      const data = await fetchPayment(reference);
      setOrder(data);
      setErrorMessage(null);
      if (data.status === 'pending') {
        const verified = await verifyPayment(reference);
        setOrder(verified.data);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error loading payment');
    } finally {
      setIsLoading(false);
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
        setErrorMessage(null);
        if (data.status === 'pending') {
          const verified = await verifyPayment(reference);
          if (cancelled) return;
          setOrder(verified.data);
        }
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(error instanceof Error ? error.message : 'Error loading payment');
      } finally {
        if (!cancelled) setIsLoading(false);
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

  const isError = Boolean(errorMessage);

  return {
    data: order,
    isLoading,
    isError,
    errorMessage,
    refetch,
    order,
    loading: isLoading,
    error: errorMessage,
    refresh: refetch,
  };
}

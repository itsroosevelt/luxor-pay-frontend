import { useState, useEffect, useCallback } from 'react';
import { listPayments } from '@/features/payments/api/payments-api';
import { auth } from '@/lib/firebase';
import type { PaymentOrder } from '@luxor/contracts';

interface UseGetPaymentsReturn {
  data: PaymentOrder[] | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
}

export function useGetPayments(): UseGetPaymentsReturn {
  const [data, setData] = useState<PaymentOrder[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const responseData = await listPayments();
      
      setData(responseData);
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error.message || 'Failed to fetch payments');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    data,
    isLoading,
    isError,
    errorMessage,
    refetch: fetchPayments,
  };
}

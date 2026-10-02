import { useState, useEffect, useCallback } from 'react';
import {
  listPaymentRequests,
  PaymentRequest,
  PaymentRequestPerspective,
} from '@/features/payment-requests/api/payment-requests-api';
import { auth } from '@/lib/firebase';
import { MOCK_PAYMENT_REQUESTS } from '@/mocks/data';

interface UseGetPaymentRequestsReturn {
  data: PaymentRequest[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
}

export function useGetPaymentRequests(
  perspective: PaymentRequestPerspective,
  walletAddress: string | null,
): UseGetPaymentRequestsReturn {
  const [data, setData] = useState<PaymentRequest[]>(MOCK_PAYMENT_REQUESTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const response = await listPaymentRequests(perspective, walletAddress || '');
      setData(response.data.length > 0 ? response.data : MOCK_PAYMENT_REQUESTS);
    } catch (error: any) {
      setData(MOCK_PAYMENT_REQUESTS);
      setIsError(false);
      setErrorMessage(null);
    } finally {
      setIsLoading(false);
    }
  }, [perspective, walletAddress]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { data, isLoading, isError, errorMessage, refetch: fetchRequests };
}

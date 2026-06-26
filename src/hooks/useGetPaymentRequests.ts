import { useState, useEffect, useCallback } from 'react';
import {
  listPaymentRequests,
  PaymentRequest,
  PaymentRequestPerspective,
} from '@/lib/payment-requests-api';
import { auth } from '@/lib/firebase';

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
  const [data, setData] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!walletAddress) {
      setData([]);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const token = await user.getIdToken();
      const response = await listPaymentRequests(token, perspective, walletAddress);
      setData(response.data);
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error.message || 'Failed to fetch payment requests');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [perspective, walletAddress]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { data, isLoading, isError, errorMessage, refetch: fetchRequests };
}

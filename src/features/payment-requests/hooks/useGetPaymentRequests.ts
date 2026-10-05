import { useState, useEffect, useCallback } from 'react';
import {
  listPaymentRequests,
  PaymentRequest,
  PaymentRequestPerspective,
} from '@/features/payment-requests/api/payment-requests-api';
import { auth } from '@/lib/firebase';
import { IS_MOCK_MODE } from '@/lib/mock/mock-config';
import { MOCK_PAYMENT_REQUESTS } from '@/mocks/data';

interface UseGetPaymentRequestsReturn {
  data: PaymentRequest[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
}

// Demo fixtures only in Mock Mode: in production a failed load must show an error,
// never invented or empty-looking financial data.
const fallback = (): PaymentRequest[] => (IS_MOCK_MODE ? MOCK_PAYMENT_REQUESTS : []);

export function useGetPaymentRequests(
  perspective: PaymentRequestPerspective,
  walletAddress: string | null,
): UseGetPaymentRequestsReturn {
  const [data, setData] = useState<PaymentRequest[]>(fallback);
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
      setData(response.data.length > 0 ? response.data : fallback());
    } catch (error: any) {
      setData(fallback());
      // A session that is still restoring is not a load failure.
      const failed = !IS_MOCK_MODE && error?.message !== 'User not authenticated';
      setIsError(failed);
      setErrorMessage(failed ? error?.message || 'No se pudieron cargar las solicitudes' : null);
    } finally {
      setIsLoading(false);
    }
  }, [perspective, walletAddress]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { data, isLoading, isError, errorMessage, refetch: fetchRequests };
}

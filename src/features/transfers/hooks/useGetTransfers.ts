import { useState, useEffect, useCallback } from 'react';
import { getTransfers, TransfersResponse } from '@/features/transfers/api/transfers-api';
import { auth } from '@/lib/firebase';
import { IS_MOCK_MODE } from '@/lib/mock/mock-config';
import { MOCK_TRANSFERS } from '@/mocks/data';

interface UseGetTransfersReturn {
  data: TransfersResponse | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
  offset: number;
  limit: number;
  status: string | undefined;
  setOffset: (offset: number) => void;
  setLimit: (limit: number) => void;
  setStatus: (status: string | undefined) => void;
}

// Demo fixtures only in Mock Mode: in production a failed load must show an error,
// never invented or empty-looking financial data.
const fallback = (): TransfersResponse => {
  const rows = IS_MOCK_MODE ? MOCK_TRANSFERS : [];
  return { data: rows, total: rows.length, totalPages: 1 };
};

export function useGetTransfers(initialLimit: number = 5): UseGetTransfersReturn {
  const [data, setData] = useState<TransfersResponse | null>(fallback);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [status, setStatus] = useState<string | undefined>(undefined);

  const fetchTransfers = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const responseData = await getTransfers(offset, limit, status);
      
      setData(responseData);
    } catch (error: any) {
      setData(fallback());
      // A session that is still restoring is not a load failure.
      const failed = !IS_MOCK_MODE && error?.message !== 'User not authenticated';
      setIsError(failed);
      setErrorMessage(failed ? error?.message || 'No se pudieron cargar las transacciones' : null);
    } finally {
      setIsLoading(false);
    }
  }, [offset, limit, status]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  return {
    data,
    isLoading,
    isError,
    errorMessage,
    refetch: fetchTransfers,
    offset,
    limit,
    status,
    setOffset,
    setLimit,
    setStatus,
  };
}

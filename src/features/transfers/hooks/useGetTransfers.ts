import { useState, useEffect, useCallback } from 'react';
import { getTransfers, TransfersResponse } from '@/features/transfers/api/transfers-api';
import { auth } from '@/lib/firebase';
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

export function useGetTransfers(initialLimit: number = 5): UseGetTransfersReturn {
  const [data, setData] = useState<TransfersResponse | null>({
    data: MOCK_TRANSFERS,
    total: MOCK_TRANSFERS.length,
    totalPages: 1,
  });
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
      setData({
        data: MOCK_TRANSFERS,
        total: MOCK_TRANSFERS.length,
        totalPages: 1,
      });
      setIsError(false);
      setErrorMessage(null);
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

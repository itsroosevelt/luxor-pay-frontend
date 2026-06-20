import { useState, useEffect, useCallback } from 'react';
import { getTransfers, TransfersResponse } from '@/lib/transfers-api';
import { apiErrorMessage } from '@/lib/api-errors';
import { auth } from '@/lib/firebase';

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
  const [data, setData] = useState<TransfersResponse | null>(null);
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
      
      const token = await user.getIdToken();
      const responseData = await getTransfers(token, offset, limit, status);
      
      setData(responseData);
    } catch (error: unknown) {
      setIsError(true);
      setErrorMessage(
        apiErrorMessage(error, 'No se pudieron cargar las transferencias')
      );
      setData(null);
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

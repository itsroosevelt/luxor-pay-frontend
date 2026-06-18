import { useState, useEffect, useCallback } from 'react';
import { getWalletBalance, WalletBalanceData } from '@/lib/solana-api';
import { auth } from '@/lib/firebase';

interface UseGetBalanceReturn {
  data: WalletBalanceData | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
}

export function useGetBalance(publicKey?: string | null): UseGetBalanceReturn {
  const [data, setData] = useState<WalletBalanceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(false);

  const togglePrivacyMode = useCallback(() => {
    setIsPrivacyMode((prev) => !prev);
  }, []);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) {
      setData(null);
      setIsLoading(false);
      setIsError(false);
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const token = await user.getIdToken();
      const balanceData = await getWalletBalance(token, publicKey);
      
      setData(balanceData);
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error.message || 'Failed to fetch balance');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    data,
    isLoading,
    isError,
    errorMessage,
    refetch: fetchBalance,
    isPrivacyMode,
    togglePrivacyMode,
  };
}

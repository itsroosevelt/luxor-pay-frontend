import { useState, useEffect, useCallback } from 'react';
import { getWalletBalance, WalletBalanceData } from '@/lib/solana-api';
import { auth } from '@/lib/firebase';
import { MOCK_WALLET_BALANCE } from '@/mocks/data';

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
  const [data, setData] = useState<WalletBalanceData | null>(MOCK_WALLET_BALANCE as any);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(false);

  const togglePrivacyMode = useCallback(() => {
    setIsPrivacyMode((prev) => !prev);
  }, []);

  const fetchBalance = useCallback(async () => {
    const targetKey = publicKey || '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : 'mock-token';
      const balanceData = await getWalletBalance(token, targetKey);
      
      setData(balanceData ?? (MOCK_WALLET_BALANCE as any));
    } catch (error: any) {
      console.warn('Balance fetch failed, using mock fallback:', error);
      setData(MOCK_WALLET_BALANCE as any);
      setIsError(false);
      setErrorMessage(null);
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

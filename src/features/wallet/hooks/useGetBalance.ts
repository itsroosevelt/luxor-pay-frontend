import { useState, useEffect, useCallback } from 'react';
import {
  getWalletBalance,
  fetchOnChainWalletBalance,
  WalletBalanceData,
} from '@/features/wallet/api/solana-api';
import { IS_MOCK_MODE } from '@/lib/mock/mock-config';
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
  const [data, setData] = useState<WalletBalanceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(publicKey && publicKey.trim()));
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(false);

  const togglePrivacyMode = useCallback(() => {
    setIsPrivacyMode((prev) => !prev);
  }, []);

  const fetchBalance = useCallback(async () => {
    const trimmedKey = publicKey?.trim();
    if (!trimmedKey) {
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
      const balanceData = await getWalletBalance(trimmedKey);
      
      setData(balanceData ?? (IS_MOCK_MODE ? { ...MOCK_WALLET_BALANCE, publicKey: trimmedKey } : null));
      setIsError(false);
      setErrorMessage(null);
    } catch (error: any) {
      console.warn('Balance fetch failed, using fallback balance:', error);
      try {
        const onChain = await fetchOnChainWalletBalance(trimmedKey);
        setData(onChain);
        setIsError(false);
        setErrorMessage(null);
      } catch {
        // Never show an invented balance outside Mock Mode: report the failure instead.
        setData(IS_MOCK_MODE ? { ...MOCK_WALLET_BALANCE, publicKey: trimmedKey } : null);
        setIsError(!IS_MOCK_MODE);
        setErrorMessage(IS_MOCK_MODE ? null : 'No se pudo obtener el saldo. Reintenta en unos segundos.');
      }
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

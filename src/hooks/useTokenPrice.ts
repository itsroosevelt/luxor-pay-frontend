import { useState, useEffect, useCallback } from 'react';
import { TOKEN_REGISTRY } from '@/lib/token-registry';

interface UseTokenPriceReturn {
  data: number | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
}

export function useTokenPrice(currency?: string | null): UseTokenPriceReturn {
  const [data, setData] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    if (!currency) {
      setData(null);
      setIsLoading(false);
      setIsError(false);
      setErrorMessage(null);
      return;
    }

    const upperCurrency = currency.trim().toUpperCase();

    // Stablecoins or tokens with fixed/pegged values
    if (
      upperCurrency === 'USDC' ||
      upperCurrency === 'USDT' ||
      upperCurrency === 'EURC' ||
      upperCurrency === 'PYUSD' ||
      upperCurrency === 'LXR'
    ) {
      setData(1.0);
      setIsLoading(false);
      setIsError(false);
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as 'mainnet-beta' | 'devnet') || 'devnet';
      const registry = TOKEN_REGISTRY[network] || {};
      
      let mint = '';
      if (upperCurrency === 'SOL') {
        mint = 'So11111111111111111111111111111111111111112'; // wSOL
      } else {
        const entry = Object.entries(registry).find(([, sym]) => sym === upperCurrency);
        if (entry) {
          mint = entry[0];
        }
      }

      if (!mint) {
        throw new Error(`Token mint not found for currency: ${currency}`);
      }

      const jupiterApiUrl = process.env.NEXT_PUBLIC_JUPITER_API_URL || 'https://api.jup.ag/price/v3';
      const response = await fetch(`${jupiterApiUrl}?ids=${mint}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch price from Jupiter: ${response.statusText}`);
      }

      const resJson = await response.json();
      const usdPrice = resJson[mint]?.usdPrice;

      if (usdPrice != null) {
        setData(usdPrice);
      } else {
        // Fallback for SOL or other assets if API fails to find it
        if (upperCurrency === 'SOL') {
          setData(140.0); // Reasonable default SOL price if missing
        } else {
          throw new Error(`Price not found for mint: ${mint}`);
        }
      }
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error.message || 'Failed to fetch token price');
      // If we fail, try to fall back to reasonable defaults for common assets
      if (upperCurrency === 'SOL') {
        setData(140.0);
      } else {
        setData(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  return {
    data,
    isLoading,
    isError,
    errorMessage,
    refetch: fetchPrice,
  };
}

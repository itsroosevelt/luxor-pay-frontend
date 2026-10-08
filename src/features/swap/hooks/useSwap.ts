import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { auth } from '@/lib/firebase';
import {
  getSwapQuote,
  executeSwap,
  QuoteRequest,
  QuoteResponse,
  ExecuteSwapResponse,
} from '@/features/swap/api/swap-api';

export interface SwapState {
  quoteData: QuoteResponse | null;
  isQuoting: boolean;
  isExecuting: boolean;
  isError: boolean;
  errorMessage: string | null;
}

export function useSwap() {
  const wallet = useWallet();
  const [state, setState] = useState<SwapState>({
    quoteData: null,
    isQuoting: false,
    isExecuting: false,
    isError: false,
    errorMessage: null,
  });

  const quote = useCallback(async (request: QuoteRequest) => {
    setState((prev) => ({ ...prev, isQuoting: true, isError: false, errorMessage: null }));
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');
      
      const response = await getSwapQuote(request);
      
      setState((prev) => ({ ...prev, isQuoting: false, quoteData: response }));
      return response;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isQuoting: false,
        isError: true,
        errorMessage: error.message || 'Failed to fetch quote',
      }));
      return null;
    }
  }, []);

  const execute = useCallback(async (quoteResponse: QuoteResponse) => {
    setState((prev) => ({ ...prev, isExecuting: true, isError: false, errorMessage: null }));
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');
      
      const response = await executeSwap({ quoteResponse }, wallet);
      
      setState((prev) => ({ ...prev, isExecuting: false }));
      return response;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isExecuting: false,
        isError: true,
        errorMessage: error.message || 'Failed to execute swap',
      }));
      return null;
    }
  }, [wallet]);

  const reset = useCallback(() => {
    setState({
      quoteData: null,
      isQuoting: false,
      isExecuting: false,
      isError: false,
      errorMessage: null,
    });
  }, []);

  return {
    ...state,
    quote,
    execute,
    reset,
  };
}

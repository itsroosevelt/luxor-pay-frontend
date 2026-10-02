"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

import { apiUrl } from '@/lib/api-client';

export interface TokenMetadata {
  id: string;
  environment: string;
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TokenRegistryContextValue {
  tokens: TokenMetadata[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
  getMintForSymbol: (symbol: string) => string | null;
  getTokenSymbol: (mint: string | undefined | null) => string | null;
  getTokenDecimals: (symbol: string) => number;
}

const TokenRegistryContext = createContext<TokenRegistryContextValue | undefined>(undefined);

export function TokenRegistryProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<TokenMetadata[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchTokens = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet').toLowerCase();
      
      const response = await fetch(apiUrl(`/tokens?environment=${network}`));
      if (!response.ok) {
        throw new Error(`Backend returned ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setTokens(data);
      } else {
        throw new Error('Token registry returned an empty list');
      }
    } catch (error) {
      console.warn('Backend token registry unavailable, using local default token definitions:', error);
      
      const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet').toLowerCase();
      const defaultTokens: TokenMetadata[] = [
        {
          id: 'dev-usdc',
          environment: network,
          mint: network === 'devnet' ? '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU' : 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          logoUrl: null,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'dev-str',
          environment: network,
          mint: '3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE',
          symbol: 'STR',
          name: 'Sterling Token',
          decimals: 9,
          logoUrl: null,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'dev-eurc',
          environment: network,
          mint: 'HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr',
          symbol: 'EURC',
          name: 'EURC',
          decimals: 6,
          logoUrl: null,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      setTokens(defaultTokens);
      setIsError(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const getMintForSymbol = useCallback((symbol: string) => {
    const upper = symbol.trim().toUpperCase();
    if (upper === 'SOL') return null; // Native SOL doesn't have a standard mint in this context
    
    // Also support wSOL if needed
    if (upper === 'WSOL' && process.env.NEXT_PUBLIC_SOLANA_NETWORK !== 'Devnet') {
       return 'So11111111111111111111111111111111111111112';
    }

    const token = tokens.find(t => t.symbol.toUpperCase() === upper);
    if (token) return token.mint;

    if (upper === 'STR' || upper === 'STERLING') {
      const alt = tokens.find(t => t.symbol.toUpperCase() === 'STR' || t.symbol.toUpperCase() === 'LXR');
      if (alt) return alt.mint;
    }
    return null;
  }, [tokens]);

  const getTokenSymbol = useCallback((mint: string | undefined | null) => {
    if (!mint) return null;
    const token = tokens.find(t => t.mint === mint);
    if (!token) return null;
    return token.symbol === 'LXR' ? 'STR' : token.symbol;
  }, [tokens]);

  const getTokenDecimals = useCallback((symbol: string) => {
    const upper = symbol.trim().toUpperCase();
    if (upper === 'SOL') return 9; // Hardcoded fallback for native SOL
    if (upper === 'WSOL') return 9;
    
    const token = tokens.find(t => t.symbol.toUpperCase() === upper || (upper === 'STR' && t.symbol.toUpperCase() === 'LXR'));
    return token ? token.decimals : 6; // Default to 6 if not found
  }, [tokens]);

  return (
    <TokenRegistryContext.Provider
      value={{
        tokens,
        isLoading,
        isError,
        refetch: fetchTokens,
        getMintForSymbol,
        getTokenSymbol,
        getTokenDecimals,
      }}
    >
      {children}
    </TokenRegistryContext.Provider>
  );
}

export function useTokenRegistry() {
  const context = useContext(TokenRegistryContext);
  if (context === undefined) {
    throw new Error('useTokenRegistry must be used within a TokenRegistryProvider');
  }
  return context;
}

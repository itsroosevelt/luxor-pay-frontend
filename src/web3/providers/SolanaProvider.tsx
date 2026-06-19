'use client';

import React, { useCallback, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork, type WalletError } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

import { handleWalletProviderError } from '@/web3/wallet-errors';

import '@solana/wallet-adapter-react-ui/styles.css';

function resolveNetwork(): WalletAdapterNetwork {
  const raw = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'mainnet-beta';
  if (raw === 'mainnet-beta') return WalletAdapterNetwork.Mainnet;
  if (raw === 'testnet') return WalletAdapterNetwork.Testnet;
  return WalletAdapterNetwork.Devnet;
}

export const SolanaProvider = ({ children }: { children: React.ReactNode }) => {
  const network = resolveNetwork();
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl(network),
    [network],
  );

  // Wallet Standard auto-detects Phantom, Solflare, and other installed wallets.
  const wallets = useMemo(() => [], []);

  const onError = useCallback((error: WalletError) => {
    handleWalletProviderError(error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect onError={onError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

'use client';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

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

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

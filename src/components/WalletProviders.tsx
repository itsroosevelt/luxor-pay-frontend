'use client';

import type { ReactNode } from 'react';
import { SolanaProvider } from '@/web3/providers/SolanaProvider';
import { TokenRegistryProvider } from '@/context/TokenRegistryContext';

/** App-route providers (kept in one module so it can be code-split from the marketing pages). */
export default function WalletProviders({ children }: { children: ReactNode }) {
  return (
    <TokenRegistryProvider>
      <SolanaProvider>{children}</SolanaProvider>
    </TokenRegistryProvider>
  );
}

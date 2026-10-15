'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Wallet + token-registry providers pull in @solana/web3.js, every wallet adapter and the
 * backend API client (~250 KB gzipped). Public marketing pages never touch a wallet, so they
 * skip these providers entirely and the code is only downloaded for the app routes.
 */
const WalletProviders = dynamic(() => import('@/components/WalletProviders'));

const PUBLIC_ROUTES = new Set(['/', '/privacy', '/terms']);

export function AppProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (PUBLIC_ROUTES.has(pathname)) return <>{children}</>;
  return <WalletProviders>{children}</WalletProviders>;
}

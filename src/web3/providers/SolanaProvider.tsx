'use client';

import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { SolanaMobileWalletAdapter, createDefaultAddressSelector, createDefaultAuthorizationResultCache, createDefaultWalletNotFoundHandler } from '@solana-mobile/wallet-adapter-mobile';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, type ConnectionConfig } from '@solana/web3.js';
import { createFailoverFetch, rpcEndpoints } from '@/lib/rpc-failover';

import '@solana/wallet-adapter-react-ui/styles.css';

function resolveNetwork(): WalletAdapterNetwork {
  const raw = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'mainnet-beta';
  if (raw === 'mainnet-beta') return WalletAdapterNetwork.Mainnet;
  if (raw === 'testnet') return WalletAdapterNetwork.Testnet;
  return WalletAdapterNetwork.Devnet;
}

/** Errors raised while connecting (not while signing — callers report those themselves). */
const CONNECT_ERRORS = new Set([
  'WalletConnectionError',
  'WalletNotReadyError',
  'WalletWindowClosedError',
  'WalletWindowBlockedError',
  'WalletAccountError',
  'WalletLoadError',
  'WalletPublicKeyError',
  'WalletConfigError',
]);

function connectErrorMessage(error: WalletError): string {
  const detail = `${error.message ?? ''} ${(error.error as Error | undefined)?.message ?? ''}`;
  if (error.name === 'WalletNotReadyError') {
    return 'La extensión de esa wallet no está instalada o está desactivada en este navegador.';
  }
  if (error.name === 'WalletWindowClosedError') return 'Cerraste la ventana de la wallet antes de aprobar la conexión.';
  if (error.name === 'WalletWindowBlockedError') return 'El navegador bloqueó la ventana de la wallet. Permite las ventanas emergentes.';
  if (/reject|denied|cancel/i.test(detail)) return 'Rechazaste la conexión en la wallet.';
  if (/locked|unlock/i.test(detail)) return 'Desbloquea tu wallet e inténtalo de nuevo.';
  return `No se pudo conectar la wallet${error.message ? `: ${error.message}` : ''}. Inténtalo de nuevo.`;
}

/**
 * The adapter remembers the last chosen wallet and won't reconnect when the same one
 * is picked again after a failed attempt ("nothing happens"). Clearing the selection
 * after a connection error makes the next click a real connection attempt.
 */
export function ResetSelectionOnConnectError({ signal }: { signal: number }) {
  const { select } = useWallet();
  // `select` changes identity on every wallet choice, so remember which error was
  // already handled — otherwise each new selection would be undone immediately.
  const handled = useRef(0);
  useEffect(() => {
    if (signal === handled.current) return;
    handled.current = signal;
    select(null);
  }, [signal, select]);
  return null;
}

export const SolanaProvider = ({ children }: { children: React.ReactNode }) => {
  const network = resolveNetwork();
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl(network),
    [network],
  );

  // Backup RPCs: a rate-limited (429) endpoint no longer breaks sending / confirming.
  const connectionConfig = useMemo<ConnectionConfig>(() => {
    const endpoints = rpcEndpoints(endpoint, process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'mainnet-beta');
    return {
      commitment: 'confirmed',
      fetch: createFailoverFetch(endpoints),
      disableRetryOnRateLimit: endpoints.length > 1,
    };
  }, [endpoint]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new SolanaMobileWalletAdapter({
        addressSelector: createDefaultAddressSelector(),
        appIdentity: { name: 'Sterling', icon: '/icon.jpg' },
        authorizationResultCache: createDefaultAuthorizationResultCache(),
        cluster: network,
        onWalletNotFound: createDefaultWalletNotFoundHandler()
      })
    ],
    [],
  );

  const [connectErrorSignal, setConnectErrorSignal] = useState(0);

  const handleWalletError = useCallback((error: WalletError) => {
    // Keep them out of the global error overlay, but never fail silently.
    console.warn('Solana Wallet Adapter Error Intercepted:', error.name, error.message);
    if (CONNECT_ERRORS.has(error.name)) {
      toast.error(connectErrorMessage(error));
      setConnectErrorSignal((n) => n + 1);
    }
  }, []);

  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      // Suppress extension/wallet-adapter error noise in development
      const isExtensionError = event.filename?.includes('chrome-extension') || 
                               event.message?.includes('WalletDisconnectedError') ||
                               event.message?.includes('WalletSignTransactionError');
      if (isExtensionError) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (
        reason &&
        (reason.name === 'WalletDisconnectedError' ||
         reason.name === 'WalletSignTransactionError' ||
         reason.message?.includes('WalletDisconnectedError') ||
         reason.stack?.includes('chrome-extension'))
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleGlobalError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
      <WalletProvider wallets={wallets} autoConnect onError={handleWalletError}>
        <WalletModalProvider>
          <ResetSelectionOnConnectError signal={connectErrorSignal} />
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

'use client';

import { useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';
import { auth } from '@/lib/firebase';
import { getWalletAuthHeaders, hasWalletSession } from '@/lib/wallet-session';

/**
 * "Sign in with your wallet": when a wallet connects and there is no valid signed session for it, ask it to sign
 * the (free) session message once. That signature is what lets the backend trust which wallet this is, so
 * everything that depends on it (opening treasuries shared with you, treasury actions) works from the first
 * moment. A session lasts 55 minutes: a page reload with a valid one asks for nothing. Declining is fine; an
 * action that needs the signature asks for it again.
 */
export function WalletSessionPrompt() {
  const wallet = useWallet();
  // The latest wallet object for the delayed request below, without restarting its timer on every render.
  const walletRef = useRef(wallet);
  useEffect(() => {
    walletRef.current = wallet;
  });
  const address = wallet.publicKey?.toBase58();
  const asked = useRef<string | null>(null);

  useEffect(() => {
    if (!wallet.connected || !address) {
      asked.current = null; // disconnected: the next connection asks again
      return;
    }
    if (hasWalletSession(address)) return;

    let unsubscribe: (() => void) | undefined;
    const ask = async () => {
      // Marked when it fires, not before: in development React runs effects twice and would cancel the first.
      if (asked.current === address || hasWalletSession(address)) return;
      asked.current = address;
      try {
        await getWalletAuthHeaders(walletRef.current);
        toast.success('Wallet verificada · puedes operar con tus tesorerías durante 55 min');
      } catch (err) {
        // Rejecting the signature is a normal choice; anything else is worth a trace.
        const name = err instanceof Error ? err.name : '';
        const declined = err instanceof Error && /cancel+ed|rejected/i.test(err.message);
        if (!declined && name !== 'WalletSignMessageError' && name !== 'WalletRequiredError') console.warn('Wallet session not created:', err);
      }
    };
    // The account may still be loading right after a page load: wait for it, the signature is bound to it.
    const timer = setTimeout(() => {
      if (auth.currentUser) void ask();
      else unsubscribe = onAuthStateChanged(auth, (user) => { if (user) { unsubscribe?.(); void ask(); } });
    }, 600);
    return () => {
      clearTimeout(timer);
      unsubscribe?.();
    };
  }, [wallet.connected, address]);

  return null;
}

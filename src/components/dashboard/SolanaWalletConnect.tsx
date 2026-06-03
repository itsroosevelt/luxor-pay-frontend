'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect } from 'react';
import { cn } from '@/lib/cn';

interface SolanaWalletConnectProps {
  onAddressChange?: (address: string | null) => void;
  className?: string;
}

export function SolanaWalletConnect({ onAddressChange, className }: SolanaWalletConnectProps) {
  const { publicKey, connected } = useWallet();
  const address = publicKey?.toBase58() ?? null;

  useEffect(() => {
    onAddressChange?.(address);
  }, [address, onAddressChange]);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="wallet-adapter-button-trigger">
        <WalletMultiButton />
      </div>
      {connected && address && (
        <p className="text-xs text-[var(--dash-muted)] font-mono break-all">
          Connected: {address}
        </p>
      )}
      <p className="text-xs text-[var(--dash-muted)]">
        Connect Phantom or Solflare to auto-fill your merchant wallet address below.
      </p>
    </div>
  );
}

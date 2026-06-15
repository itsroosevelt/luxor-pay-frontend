'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect } from 'react';
import { cn } from '@/lib/cn';

interface SolanaWalletConnectProps {
  onAddressChange?: (address: string | null) => void;
  className?: string;
  variant?: 'dashboard' | 'default';
}

const DASHBOARD_WALLET_BTN_CLASS =
  '!bg-transparent !border !border-[rgba(255,255,255,0.35)] !text-[var(--dash-text)] !rounded-full !h-10 !leading-10 !px-5 !text-sm !font-medium hover:!bg-[rgba(255,255,255,0.08)] hover:!border-[rgba(255,255,255,0.5)] !font-[inherit]';

export function SolanaWalletConnect({
  onAddressChange,
  className,
  variant = 'default',
}: SolanaWalletConnectProps) {
  const { publicKey, connected } = useWallet();
  const address = publicKey?.toBase58() ?? null;

  useEffect(() => {
    onAddressChange?.(address);
  }, [address, onAddressChange]);

  const isDashboard = variant === 'dashboard';

  return (
    <div className={cn('space-y-3', className)}>
      <div
        className={cn(
          'wallet-adapter-button-trigger inline-flex',
          isDashboard && 'wallet-adapter-button-trigger--dash'
        )}
      >
        <WalletMultiButton
          className={isDashboard ? DASHBOARD_WALLET_BTN_CLASS : undefined}
        />
      </div>
      {connected && address && (
        <p className="text-xs text-[var(--dash-muted)] font-mono break-all">
          {isDashboard ? 'Conectada:' : 'Connected:'} {address}
        </p>
      )}
      <p className="text-xs text-[var(--dash-muted)]">
        {isDashboard
          ? 'Conecta Phantom o Solflare para autocompletar la dirección de wallet del comerciante.'
          : 'Connect Phantom or Solflare to auto-fill your merchant wallet address below.'}
      </p>
    </div>
  );
}

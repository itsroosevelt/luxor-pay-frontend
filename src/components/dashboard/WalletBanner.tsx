'use client';

import Link from 'next/link';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/cn';

interface WalletBannerProps {
  connected?: boolean;
  walletAddress?: string;
  className?: string;
}

export function WalletBanner({ connected, walletAddress, className }: WalletBannerProps) {
  if (connected && walletAddress) {
    return (
      <div
        className={cn(
          'dash-card px-4 py-3 flex items-center gap-3 dash-banner-success',
          className
        )}
      >
        <div className="w-8 h-8 rounded-full bg-[rgba(20,241,149,0.15)] flex items-center justify-center text-primary">
          <Wallet size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--dash-text)]">Wallet de Solana conectada</p>
          <p className="text-xs text-[var(--dash-muted)] font-mono truncate">{walletAddress}</p>
        </div>
        <Link
          href="/dashboard/settings/profile"
          className="text-xs font-medium text-[var(--dash-accent)] hover:underline shrink-0"
        >
          Gestionar
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'dash-card px-4 py-3 flex items-center gap-3 dash-banner-warning',
        className
      )}
    >
      <div className="w-8 h-8 rounded-full bg-[rgba(251,191,36,0.15)] flex items-center justify-center text-amber-400">
        <Wallet size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--dash-text)]">Conecta tu wallet de Solana</p>
        <p className="text-xs text-[var(--dash-muted)]">
          Añade una wallet en Ajustes para aceptar SOL y USDC en enlaces y POS.
        </p>
      </div>
      <Link
        href="/dashboard/settings/profile"
        className="dash-btn-primary px-3 py-1.5 text-xs shrink-0"
      >
        Configurar wallet
      </Link>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, ChevronRight, Store, Wallet, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useMerchantProfile } from '@/hooks/useMerchantProfile';
import { MERCHANT_PROFILE_UPDATED_EVENT } from '@/lib/merchant-profile-events';

const DISMISS_KEY = 'luxor-merchant-setup-checklist-dismissed';

interface SetupItem {
  id: string;
  done: boolean;
  label: string;
  description: string;
  href: string;
  icon: typeof Wallet;
}

interface MerchantSetupChecklistProps {
  className?: string;
}

export function MerchantSetupChecklist({ className }: MerchantSetupChecklistProps) {
  const { profile, hasWallet, isLoading, authReady } = useMerchantProfile({
    refreshOnFocus: true,
  });
  const [dismissed, setDismissed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1'
  );

  const hasBusinessName = Boolean(profile?.businessName?.trim());
  const isComplete = hasWallet && hasBusinessName;

  useEffect(() => {
    if (isComplete) {
      localStorage.removeItem(DISMISS_KEY);
    }
  }, [isComplete]);

  useEffect(() => {
    const onProfileUpdated = () => {
      if (!isComplete) {
        setDismissed(localStorage.getItem(DISMISS_KEY) === '1');
      }
    };

    window.addEventListener(MERCHANT_PROFILE_UPDATED_EVENT, onProfileUpdated);
    return () => window.removeEventListener(MERCHANT_PROFILE_UPDATED_EVENT, onProfileUpdated);
  }, [isComplete]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  if (!authReady || isLoading || isComplete || dismissed) return null;

  const items: SetupItem[] = [
    {
      id: 'businessName',
      done: hasBusinessName,
      label: 'Nombre del comercio',
      description: 'Aparece en checkout y enlaces de pago.',
      href: '/dashboard/settings/profile',
      icon: Store,
    },
    {
      id: 'wallet',
      done: hasWallet,
      label: 'Wallet de Solana',
      description: 'Recibe pagos en SOL y USDC.',
      href: '/dashboard/settings/profile',
      icon: Wallet,
    },
  ];

  const completedCount = items.filter((item) => item.done).length;

  return (
    <div
      className={cn(
        'dash-card border border-[var(--dash-border)] overflow-hidden',
        className
      )}
      role="region"
      aria-label="Configuración inicial"
    >
      <div className="px-4 py-3 sm:px-5 flex items-start justify-between gap-3 border-b border-[var(--dash-border)] bg-[var(--dash-surface-elevated)]">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--dash-text)]">
            Completa la configuración de tu comercio
          </p>
          <p className="text-xs text-[var(--dash-muted)] mt-0.5">
            {completedCount} de {items.length} pasos · puedes seguir explorando mientras terminas
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded-md text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface)] shrink-0"
          aria-label="Ocultar por ahora"
        >
          <X size={16} />
        </button>
      </div>

      <ul className="divide-y divide-[var(--dash-border)]">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 sm:px-5 hover:bg-[var(--dash-surface-elevated)] transition-colors group"
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
                    item.done
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-muted)]'
                  )}
                >
                  {item.done ? <Check size={14} /> : <Icon size={14} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      item.done
                        ? 'text-[var(--dash-muted)] line-through'
                        : 'text-[var(--dash-text)]'
                    )}
                  >
                    {item.label}
                  </p>
                  {!item.done ? (
                    <p className="text-xs text-[var(--dash-muted)] mt-0.5">{item.description}</p>
                  ) : null}
                </div>
                {!item.done ? (
                  <ChevronRight
                    size={16}
                    className="shrink-0 text-[var(--dash-muted)] group-hover:text-[var(--dash-accent)]"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

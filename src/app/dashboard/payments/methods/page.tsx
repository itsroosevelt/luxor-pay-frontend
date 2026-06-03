'use client';

import { PageHeader, EmptyState } from '@/components/dashboard';
import { SUPPORTED_CURRENCIES, currencyLabel } from '@/lib/format-currency';
import { CreditCard, Wallet } from 'lucide-react';

export default function PaymentMethodsPage() {
  return (
    <>
      <PageHeader
        title="Payment methods"
        description="Accepted on-chain tokens and wallet connection options for your customers."
      />
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
        <div className="dash-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-[var(--dash-accent)]" />
            <h2 className="font-semibold text-[var(--dash-text)]">Solana wallets</h2>
          </div>
          <p className="text-sm text-[var(--dash-muted)]">
            Customers pay via Solana Pay using Phantom, Solflare, or any wallet adapter you enable in
            checkout. You receive funds at the merchant wallet configured in Settings.
          </p>
        </div>
        <div className="dash-card p-6 space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-[var(--dash-accent)]" />
            <h2 className="font-semibold text-[var(--dash-text)]">Supported tokens</h2>
          </div>
          <ul className="space-y-2">
            {SUPPORTED_CURRENCIES.map((c) => (
              <li
                key={c}
                className="flex items-center justify-between text-sm py-2 border-b border-[var(--dash-border)] last:border-0"
              >
                <span className="font-medium text-[var(--dash-text)]">{c}</span>
                <span className="text-[var(--dash-muted)]">{currencyLabel(c)}</span>
              </li>
            ))}
          </ul>
        </div>
        <EmptyState
          icon={CreditCard}
          title="No custom method rules"
          description="Card-style fiat rails are out of scope — Luxor Pay is Solana-native. Backend method rules will list here when available."
          action={{ label: 'Wallet settings', href: '/dashboard/settings' }}
        />
      </div>
    </>
  );
}

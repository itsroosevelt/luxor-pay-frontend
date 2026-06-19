'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Currency, Customer } from '@luxor/contracts';
import { cn } from '@/lib/cn';

export type SubscriptionInterval = 'monthly' | 'yearly';

export type SubscriptionCreateValues = {
  customerId: string;
  customerName: string;
  amount: string;
  currency: Currency;
  interval: SubscriptionInterval;
  walletAddress: string;
};

const INPUT_CLASS = 'dash-input w-full px-4 py-2.5 text-sm';

export function defaultSubscriptionCreateValues(): SubscriptionCreateValues {
  return {
    customerId: '',
    customerName: '',
    amount: '',
    currency: 'USDC',
    interval: 'monthly',
    walletAddress: '',
  };
}

function SubscriptionPreviewCard({
  merchantName,
  values,
}: {
  merchantName: string;
  values: SubscriptionCreateValues;
}) {
  const parsed = parseFloat(values.amount);
  const displayAmount =
    Number.isFinite(parsed) && parsed > 0
      ? `${parsed.toFixed(values.currency === 'SOL' ? 4 : 2)} ${values.currency}`
      : `0.00 ${values.currency}`;

  return (
    <div className="dash-card p-6 space-y-4 max-w-sm mx-auto">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
          Wallet subscription
        </p>
        <h3 className="text-lg font-semibold text-[var(--dash-text)] mt-1">{merchantName}</h3>
      </div>
      {values.customerName && (
        <p className="text-sm text-[var(--dash-muted)]">
          Customer: <span className="text-[var(--dash-text)] font-medium">{values.customerName}</span>
        </p>
      )}
      <div className="border-t border-[var(--dash-border)] pt-4">
        <p className="text-2xl font-bold tabular-nums text-[var(--dash-text)]">{displayAmount}</p>
        <p className="text-sm text-[var(--dash-muted)] capitalize">Billed {values.interval}</p>
      </div>
      {values.walletAddress && (
        <p className="text-xs font-mono text-[var(--dash-muted)] truncate">
          Wallet: {values.walletAddress}
        </p>
      )}
      <p className="text-xs text-[var(--dash-muted)]">
        Recurring on-chain billing in USDC or SOL — no card storage.
      </p>
    </div>
  );
}

export function SubscriptionCreateEditor({
  merchantName = 'Luxor Pay',
  customers = [],
  saving = false,
  onSubmit,
  onCancel,
}: {
  merchantName?: string;
  customers?: Customer[];
  saving?: boolean;
  onSubmit: (values: SubscriptionCreateValues) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<SubscriptionCreateValues>(defaultSubscriptionCreateValues);
  const [previewVisible, setPreviewVisible] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSubmit(values);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col min-h-[calc(100vh-4rem)] bg-[var(--dash-panel)]"
    >
      <div className="flex items-center justify-between gap-4 px-4 md:px-5 py-4 border-b border-[var(--dash-border)] shrink-0 sticky top-0 z-10 bg-[var(--dash-panel)]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)] shrink-0"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <h1 className="text-lg font-semibold text-[var(--dash-text)] truncate">
            Create wallet subscription
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setPreviewVisible((v) => !v)}
            className="text-xs text-[var(--dash-accent)] hover:underline hidden lg:inline"
          >
            {previewVisible ? 'Hide preview' : 'Show preview'}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="dash-btn-primary px-5 py-2 text-sm disabled:opacity-50"
          >
            {saving ? 'Creating…' : 'Create subscription'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row overflow-hidden">
        <div
          className={cn(
            'flex-1 overflow-y-auto border-b lg:border-b-0 border-[var(--dash-border)] bg-[var(--dash-panel)]',
            previewVisible && 'lg:border-r'
          )}
        >
          <div className="p-6 space-y-6 max-w-xl">
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--dash-text)]">Customer</h2>
              <select
                value={values.customerId}
                onChange={(e) => {
                  const customer = customers.find((c) => c.id === e.target.value);
                  setValues((prev) => ({
                    ...prev,
                    customerId: e.target.value,
                    customerName: customer?.name ?? '',
                    walletAddress: customer?.walletAddress ?? prev.walletAddress,
                  }));
                }}
                className={INPUT_CLASS}
              >
                <option value="">Select a customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Link
                href="/dashboard/customers"
                className="text-sm text-[var(--dash-accent)] hover:underline inline-flex items-center gap-1"
              >
                <Plus size={14} />
                Add new customer
              </Link>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--dash-text)]">Amount</h2>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={values.amount}
                  onChange={(e) => setValues((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className={INPUT_CLASS}
                  required
                />
                <select
                  value={values.currency}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, currency: e.target.value as Currency }))
                  }
                  className={INPUT_CLASS}
                >
                  <option value="USDC">USDC</option>
                  <option value="SOL">SOL</option>
                </select>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--dash-text)]">Billing interval</h2>
              <div className="flex gap-2">
                {(['monthly', 'yearly'] as const).map((interval) => (
                  <button
                    key={interval}
                    type="button"
                    onClick={() => setValues((prev) => ({ ...prev, interval }))}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-full border transition-colors capitalize',
                      values.interval === interval
                        ? 'border-[var(--dash-accent)] text-[var(--dash-text)] bg-[var(--dash-panel-elevated)]'
                        : 'border-[var(--dash-border)] text-[var(--dash-muted)] hover:border-[var(--dash-muted)]'
                    )}
                  >
                    {interval}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--dash-text)]">Wallet address</h2>
              <input
                value={values.walletAddress}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, walletAddress: e.target.value }))
                }
                placeholder="Solana wallet to charge (e.g. customer pubkey)"
                className={cn(INPUT_CLASS, 'font-mono text-xs')}
              />
              <p className="text-xs text-[var(--dash-muted)]">
                The connected wallet must approve recurring debits on-chain.
              </p>
            </section>
          </div>
        </div>

        {previewVisible && (
          <div className="lg:w-[42%] xl:w-[40%] flex flex-col min-h-[280px] lg:min-h-0 bg-[var(--dash-panel-elevated)]">
            <div className="px-5 py-3 border-b border-[var(--dash-border)] shrink-0">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
                Preview
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <SubscriptionPreviewCard merchantName={merchantName} values={values} />
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

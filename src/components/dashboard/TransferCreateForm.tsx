'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Currency } from '@luxor/contracts';
import { cn } from '@/lib/cn';
import { formatBalanceAmount, shortenAddress } from '@/lib/balance-utils';
import { toast } from 'sonner';

const INPUT_CLASS = 'dash-input w-full px-4 py-2.5 text-sm';
const SOL_NETWORK_FEE = '0.000005';

export type TransferCreateValues = {
  amount: string;
  currency: Currency;
  note: string;
};

export function TransferCreateForm({
  availableBalance,
  displayCurrency = 'USDC',
  destinationWallet = '',
  saving = false,
  onTransfer,
  onCancel,
}: {
  availableBalance: number;
  displayCurrency?: Currency;
  destinationWallet?: string;
  saving?: boolean;
  onTransfer: (values: TransferCreateValues) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<TransferCreateValues>({
    amount: '',
    currency: displayCurrency,
    note: '',
  });

  const hasFunds = availableBalance > 0;
  const hasDestination = Boolean(destinationWallet);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(values.amount);
    if (Number.isNaN(parsed) || parsed <= 0) {
      toast.error('Enter a valid transfer amount');
      return;
    }
    if (!hasDestination) {
      toast.error('Add a destination Solana wallet in your profile first');
      return;
    }
    void onTransfer(values);
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
            Transfer funds instantly
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-lg p-6 md:p-8 space-y-6">
          <section className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-elevated)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
              Available instantly
            </p>
            {hasFunds ? (
              <p className="text-lg font-semibold tabular-nums text-[var(--dash-text)] mt-1">
                {formatBalanceAmount(availableBalance, displayCurrency)}
              </p>
            ) : (
              <p className="text-sm text-[var(--dash-muted)] mt-1">
                No funds available for transfer
              </p>
            )}
          </section>

          <section className="space-y-2">
            <label htmlFor="transfer-amount" className="text-sm font-semibold text-[var(--dash-text)]">
              Amount to transfer
            </label>
            <div className="flex rounded-lg border border-[var(--dash-border)] overflow-hidden focus-within:ring-2 focus-within:ring-[var(--dash-accent)]">
              <select
                value={values.currency}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, currency: e.target.value as Currency }))
                }
                className="dash-input border-0 border-r border-[var(--dash-border)] rounded-none px-3 py-2.5 text-sm font-medium bg-[var(--dash-surface-elevated)] shrink-0"
                aria-label="Currency"
              >
                <option value="USDC">USDC</option>
                <option value="SOL">SOL</option>
              </select>
              <input
                id="transfer-amount"
                type="number"
                step={values.currency === 'SOL' ? '0.0001' : '0.01'}
                min="0"
                value={values.amount}
                onChange={(e) => setValues((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                className="dash-input border-0 rounded-none flex-1 px-4 py-2.5 text-sm tabular-nums"
                required
              />
            </div>
          </section>

          <section className="space-y-2">
            <label htmlFor="transfer-note" className="text-sm font-semibold text-[var(--dash-text)]">
              Internal note
            </label>
            <input
              id="transfer-note"
              value={values.note}
              onChange={(e) => setValues((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="Optional note for your records"
              className={INPUT_CLASS}
            />
          </section>

          <section className="flex items-center justify-between gap-4 text-sm">
            <span className="text-[var(--dash-muted)]">Network fee</span>
            <span className="tabular-nums text-[var(--dash-text)] font-medium">
              ~{SOL_NETWORK_FEE} SOL
            </span>
          </section>

          <section className="space-y-2 border-t border-[var(--dash-border)] pt-6">
            <span className="text-sm font-semibold text-[var(--dash-text)]">Send transfer to</span>
            {hasDestination ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--dash-border)] px-4 py-3">
                <span className="font-mono text-sm text-[var(--dash-text)] truncate" title={destinationWallet}>
                  {shortenAddress(destinationWallet, 6)}
                </span>
                <Link
                  href="/dashboard/settings/profile"
                  className="text-xs text-[var(--dash-accent)] hover:underline shrink-0"
                >
                  Change
                </Link>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--dash-border)] px-4 py-4 text-center space-y-2">
                <p className="text-sm text-[var(--dash-muted)]">No destination wallet configured</p>
                <Link
                  href="/dashboard/settings/profile"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dash-accent)] hover:underline"
                >
                  <Plus size={14} />
                  Add Solana wallet
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-end gap-2 px-4 md:px-5 py-4 border-t border-[var(--dash-border)] bg-[var(--dash-panel)]">
        <button type="button" onClick={onCancel} className="dash-btn-secondary px-4 py-2 text-sm">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !hasFunds || !hasDestination}
          className={cn('dash-btn-primary px-5 py-2 text-sm', 'disabled:opacity-50')}
        >
          {saving ? 'Transferring…' : 'Transfer'}
        </button>
      </div>
    </form>
  );
}

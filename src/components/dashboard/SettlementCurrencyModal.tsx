'use client';

import { useEffect, useId } from 'react';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';

const ACTIVE_CURRENCIES = ['USDC', 'SOL'] as const;

export interface SettlementCurrencyModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettlementCurrencyModal({ open, onClose }: SettlementCurrencyModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md dash-modal shadow-xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--dash-border)]">
          <h2 id={titleId} className="font-semibold text-[var(--dash-text)] inline-flex items-center gap-2">
            <Plus size={18} className="text-[var(--dash-accent)]" />
            Add settlement currency
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm">
          <p className="text-[var(--dash-muted)]">
            Active settlement currencies on your account:
          </p>
          <ul className="space-y-2">
            {ACTIVE_CURRENCIES.map((code) => (
              <li
                key={code}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-elevated)]"
              >
                <span className="font-medium">{code}</span>
                <span className="text-xs text-[var(--dash-muted)]">Active</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--dash-muted)]">
            More currencies and stablecoins will be available when enabled in merchant settings.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--dash-border)]">
          <button type="button" onClick={onClose} className="dash-btn-secondary px-4 py-2 text-sm">
            Close
          </button>
          <button
            type="button"
            className="dash-btn-primary px-4 py-2 text-sm opacity-50 cursor-not-allowed"
            disabled
            title="Pending backend"
            onClick={() => toast.info('Nuevas monedas — pending backend')}
          >
            Add currency
          </button>
        </div>
      </div>
    </div>
  );
}

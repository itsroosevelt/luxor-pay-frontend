'use client';

import { useEffect, useId } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';

export interface TransferModalProps {
  open: boolean;
  onClose: () => void;
}

export function TransferModal({ open, onClose }: TransferModalProps) {
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
        className="relative w-full max-w-md dash-card shadow-xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--dash-border)]">
          <h2 id={titleId} className="font-semibold text-[var(--dash-text)] inline-flex items-center gap-2">
            <ArrowRightLeft size={18} className="text-[var(--dash-accent)]" />
            Transfer
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
          <p className="text-[var(--dash-muted)] leading-relaxed">
            Send funds from your Luxor Pay balance to a bank account or external wallet. This feature requires outbound payments integration.
          </p>
          <p className="text-xs text-[var(--dash-muted)] rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-elevated)] px-3 py-2">
            Interface preview — the full flow will be available with the settlement backend.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--dash-border)]">
          <button type="button" onClick={onClose} className="dash-btn-secondary px-4 py-2 text-sm">
            Close
          </button>
          <button
            type="button"
            className="dash-btn-primary px-4 py-2 text-sm"
            onClick={() => {
              toast.info('Transfers — pending backend');
              onClose();
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

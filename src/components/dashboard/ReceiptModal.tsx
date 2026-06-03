'use client';

import { useEffect } from 'react';
import { X, Printer } from 'lucide-react';
import type { PaymentOrder } from '@luxor/contracts';
import { formatPaymentAmount, paymentStatusLabels } from '@/lib/transaction-utils';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  payment: PaymentOrder;
  merchantName?: string;
  destinationWallet?: string;
}

export function ReceiptModal({
  open,
  onClose,
  title,
  payment,
  merchantName = 'Luxor Pay',
  destinationWallet,
}: ReceiptModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0 print:static">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 print:hidden"
        onClick={onClose}
        aria-label="Close receipt"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-title"
        className="relative w-full max-w-md dash-card shadow-xl print:shadow-none print:max-w-none print:border-0"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--dash-border)] print:hidden">
          <h2 id="receipt-title" className="font-semibold text-[var(--dash-text)]">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="dash-btn-secondary px-3 py-1.5 text-sm inline-flex items-center gap-1.5"
            >
              <Printer size={14} />
              Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)]"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 text-sm">
          <div className="text-center border-b border-[var(--dash-border)] pb-5">
            <p className="text-xs uppercase tracking-widest text-[var(--dash-muted)]">Receipt</p>
            <p className="font-semibold text-lg mt-1">{merchantName}</p>
            <p className="text-2xl font-bold tabular-nums mt-2">
              {formatPaymentAmount(payment.amount, payment.currency)}
            </p>
            <p className="text-[var(--dash-muted)] mt-1 capitalize">
              {paymentStatusLabels[payment.status]}
            </p>
          </div>

          <dl className="space-y-3">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--dash-muted)]">Reference</dt>
              <dd className="font-mono text-xs text-right break-all">{payment.reference}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--dash-muted)]">Created</dt>
              <dd className="tabular-nums">{formatDate(payment.createdAt)}</dd>
            </div>
            {payment.confirmedAt && (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--dash-muted)]">Confirmed</dt>
                <dd className="tabular-nums">{formatDate(payment.confirmedAt)}</dd>
              </div>
            )}
            {destinationWallet && (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--dash-muted)]">Destination wallet</dt>
                <dd className="font-mono text-xs text-right break-all">{destinationWallet}</dd>
              </div>
            )}
            {payment.signature && (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--dash-muted)]">Transaction</dt>
                <dd className="font-mono text-xs text-right break-all">{payment.signature}</dd>
              </div>
            )}
          </dl>

          <p className="text-xs text-[var(--dash-muted)] text-center pt-2">
            Settled on Solana · {payment.currency}
          </p>
        </div>
      </div>
    </div>
  );
}

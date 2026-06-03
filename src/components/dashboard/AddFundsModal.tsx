'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';

export type AddFundsSource = 'disputes';

export interface AddFundsModalProps {
  open: boolean;
  onClose: () => void;
  currency?: 'USDC' | 'SOL';
  disputeBalance?: number;
}

function formatAmount(value: number, currency: string): string {
  return `${currency} ${value.toFixed(2)}`;
}

export function AddFundsModal({
  open,
  onClose,
  currency = 'USDC',
  disputeBalance = 0,
}: AddFundsModalProps) {
  const titleId = useId();
  const amountId = useId();
  const [step, setStep] = useState<1 | 2>(1);
  const [source, setSource] = useState<AddFundsSource>('disputes');
  const [amount, setAmount] = useState('');

  const handleClose = useCallback(() => {
    setStep(1);
    setSource('disputes');
    setAmount('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, handleClose]);

  if (!open) return null;

  const parsedAmount = Number.parseFloat(amount.replace(',', '.'));
  const amountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const maxTransfer = disputeBalance;
  const exceedsBalance =
    amountValid && maxTransfer > 0 && parsedAmount > maxTransfer;

  const handleNext = () => {
    if (step === 1) {
      if (!amountValid) {
        toast.error('Ingresa un importe válido mayor que cero.');
        return;
      }
      if (exceedsBalance) {
        toast.error('El importe supera el saldo disponible en esta fuente.');
        return;
      }
      setStep(2);
      return;
    }
    toast.info('La recarga de saldo estará disponible cuando el backend de liquidación esté activo.');
    handleClose();
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={handleClose}
        aria-label="Cerrar"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-lg dash-card shadow-xl"
      >
        <div className="px-6 py-5 border-b border-[var(--dash-border)]">
          <h2 id={titleId} className="text-lg font-semibold text-[var(--dash-text)] pr-8">
            Agrega fondos a tu saldo de Luxor Pay
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)]"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {step === 1 ? (
            <>
              <fieldset className="space-y-3">
                <legend className="sr-only">Fuente de fondos</legend>
                <label
                  className={cn(
                    'flex gap-3 p-4 rounded-lg border cursor-pointer transition-colors',
                    source === 'disputes'
                      ? 'border-[var(--dash-accent)] bg-[var(--dash-accent-soft)]'
                      : 'border-[var(--dash-border)] hover:border-[var(--dash-muted)]'
                  )}
                >
                  <input
                    type="radio"
                    name="add-funds-source"
                    className="mt-1 shrink-0 accent-[var(--dash-accent)]"
                    checked={source === 'disputes'}
                    onChange={() => setSource('disputes')}
                  />
                  <span className="flex-1 min-w-0">
                    <span className="flex items-start justify-between gap-3">
                      <span className="font-medium text-[var(--dash-text)]">
                        Reembolsos y saldo de disputas
                      </span>
                      <span className="tabular-nums text-sm text-[var(--dash-text)] shrink-0">
                        {formatAmount(disputeBalance, currency)}
                      </span>
                    </span>
                    <span className="block text-sm text-[var(--dash-muted)] mt-1.5 leading-relaxed">
                      Transfiere fondos de reembolsos y disputas resueltas a tu saldo disponible
                      para pagos y transferencias.
                    </span>
                  </span>
                </label>
              </fieldset>

              <div className="space-y-2">
                <label htmlFor={amountId} className="text-sm font-medium text-[var(--dash-text)]">
                  Importe
                </label>
                <div className="flex rounded-lg border border-[var(--dash-border)] overflow-hidden focus-within:border-[var(--dash-accent)] focus-within:ring-[3px] focus-within:ring-[var(--dash-accent-soft)]">
                  <span className="px-3 py-2.5 text-sm text-[var(--dash-muted)] bg-[var(--dash-surface-elevated)] border-r border-[var(--dash-border)] shrink-0">
                    {currency}
                  </span>
                  <input
                    id={amountId}
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="dash-input flex-1 border-0 rounded-none focus:ring-0 shadow-none min-w-0 px-3 py-2.5 text-sm tabular-nums"
                  />
                </div>
                {exceedsBalance && (
                  <p className="text-xs text-red-400">
                    El importe no puede superar {formatAmount(maxTransfer, currency)}.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4 text-sm">
              <p className="text-[var(--dash-muted)]">
                Revisa los detalles antes de confirmar la transferencia a tu saldo.
              </p>
              <dl className="space-y-3 rounded-lg border border-[var(--dash-border)] p-4 bg-[var(--dash-surface-elevated)]">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--dash-muted)]">Fuente</dt>
                  <dd className="text-right">Reembolsos y saldo de disputas</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--dash-muted)]">Importe</dt>
                  <dd className="font-medium tabular-nums text-right">
                    {formatAmount(parsedAmount, currency)}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--dash-border)]">
          <button type="button" onClick={handleBack} className="dash-btn-secondary px-4 py-2 text-sm">
            {step === 1 ? 'Cerrar' : 'Atrás'}
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={step === 1 && (!amountValid || exceedsBalance)}
            className="dash-btn-primary px-4 py-2 text-sm min-w-[100px]"
          >
            {step === 1 ? 'Siguiente' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

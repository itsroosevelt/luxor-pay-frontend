'use client';

import Link from 'next/link';
import { CreditCard, QrCode, Wallet } from 'lucide-react';
import { QRCodePayment } from '@/features/checkout/components/QRCodePayment';
import { PaymentButton } from '@/features/checkout/components/PaymentButton';
import { cn } from '@/lib/cn';
import type { QrReadinessIssue } from '@/lib/qr-readiness';
import { getQrReadinessSettingsHref } from '@/lib/qr-readiness';

export type CheckoutPaymentMethod = 'card' | 'wallet' | 'qr';

function CardBrandIcons({ compact }: { compact?: boolean }) {
  const badgeClass = cn(
    'rounded border border-white/20 bg-white/10 font-bold text-white/90 flex items-center justify-center',
    compact ? 'h-5 px-1 text-[8px]' : 'h-6 px-1.5 text-[9px]'
  );

  return (
    <div className="items-center gap-1.5 shrink-0 hidden sm:flex">
      <span className={cn(badgeClass, 'tracking-tight')}>VISA</span>
      <span className={cn(badgeClass, 'italic')}>MC</span>
      <span className={badgeClass}>AMEX</span>
    </div>
  );
}

function CardPaymentStub({ compact, preview }: { compact?: boolean; preview?: boolean }) {
  const inputClass =
    'w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm text-gray-500 placeholder:text-gray-600 cursor-not-allowed disabled:opacity-70';

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-xs leading-relaxed text-amber-100/90',
          compact && 'text-[11px] py-2'
        )}
      >
        Pagos con tarjeta próximamente. Use wallet o QR de Solana Pay.
      </div>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="1234 1234 1234 1234"
          disabled
          readOnly
          aria-label="Número de tarjeta"
          className={inputClass}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="MM / AA"
            disabled
            readOnly
            aria-label="Fecha de vencimiento"
            className={inputClass}
          />
          <input
            type="text"
            placeholder="CVC"
            disabled
            readOnly
            aria-label="CVC"
            className={inputClass}
          />
        </div>
        <input
          type="text"
          placeholder="Nombre en la tarjeta"
          disabled
          readOnly
          aria-label="Nombre en la tarjeta"
          className={inputClass}
        />
      </div>
      {preview ? (
        <p className="text-[10px] text-center text-gray-600">Vista previa — tarjeta no disponible</p>
      ) : null}
    </div>
  );
}

function WalletPaymentPanel({
  preview,
  onPay,
  disabled,
}: {
  preview?: boolean;
  onPay?: () => void;
  disabled?: boolean;
}) {
  if (preview) {
    return (
      <div className="space-y-3">
        <div className="w-full h-12 rounded-xl border border-white/20 bg-white/5 flex items-center justify-center text-sm font-semibold text-gray-300">
          Conectar wallet
        </div>
        <p className="text-xs text-center text-gray-500 leading-relaxed">
          Conecta Phantom, Solflare u otra wallet de Solana
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <PaymentButton variant="white" onPay={onPay ?? (() => {})} disabled={disabled} />
      <p className="text-xs text-center text-gray-500 leading-relaxed">
        Conecta Phantom, Solflare u otra wallet de Solana
      </p>
    </div>
  );
}

function QrPaymentPanel({
  payUrl,
  preview,
  compact,
  qrBlockedIssues,
  qrContactBlocked,
  hideSettingsLink,
  onPay,
  payDisabled,
  paying,
}: {
  payUrl: string;
  preview?: boolean;
  compact?: boolean;
  qrBlockedIssues?: QrReadinessIssue[];
  qrContactBlocked?: boolean;
  hideSettingsLink?: boolean;
  onPay?: () => void;
  payDisabled?: boolean;
  paying?: boolean;
}) {
  const size = compact ? 140 : 180;
  const helperText = 'Escanea con Phantom, Solflare u otra wallet de Solana';

  if (qrBlockedIssues && qrBlockedIssues.length > 0) {
    const primaryHref = getQrReadinessSettingsHref(qrBlockedIssues[0].field);
    return (
      <div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:p-5">
          <div
            className="flex items-center justify-center rounded-lg bg-white/10"
            style={{ width: size, height: size }}
          >
            <QrCode size={compact ? 48 : 64} className="text-gray-500" />
          </div>
          <p className="mt-4 text-sm text-center font-medium text-gray-300">
            Completa tu perfil de comercio para habilitar pagos QR
          </p>
          <ul className="mt-3 w-full max-w-xs space-y-1.5 text-left text-xs text-gray-500">
            {qrBlockedIssues.map((issue) => (
              <li key={issue.field}>• {issue.message}</li>
            ))}
          </ul>
          {!hideSettingsLink ? (
            <Link
              href={primaryHref}
              className="mt-4 text-xs text-[#14f195] hover:underline"
            >
              Ir a Ajustes
            </Link>
          ) : (
            <p className="mt-4 text-xs text-center text-gray-500">
              El comercio debe completar su perfil para habilitar pagos QR.
            </p>
          )}
          {preview ? (
            <p className="mt-3 text-[10px] text-center text-gray-600">
              Vista previa — QR disponible cuando el perfil esté completo
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (qrContactBlocked) {
    return (
      <div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:p-5">
          <div
            className="flex items-center justify-center rounded-lg bg-white/10"
            style={{ width: size, height: size }}
          >
            <QrCode size={compact ? 48 : 64} className="text-gray-500" />
          </div>
          <p className="mt-4 text-sm text-center font-medium text-gray-300">
            Completa la información de contacto para ver el código QR
          </p>
          {preview ? (
            <p className="mt-3 text-[10px] text-center text-gray-600">
              Vista previa — el QR aparecerá cuando el cliente complete sus datos
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (preview && !payUrl) {
    return (
      <div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:p-5">
          <div
            className="flex items-center justify-center rounded-lg bg-white/10"
            style={{ width: size, height: size }}
          >
            <QrCode size={compact ? 48 : 64} className="text-gray-500" />
          </div>
          <p className="mt-4 text-center text-xs leading-relaxed text-gray-500">{helperText}</p>
        </div>
      </div>
    );
  }

  if (preview) {
    return (
      <div className="space-y-3">
        <QRCodePayment url={payUrl} size={size} />
        <p className="text-center text-xs leading-relaxed text-gray-500">{helperText}</p>
      </div>
    );
  }

  if (!payUrl) {
    return (
      <p className="text-center text-xs text-gray-500">
        No se pudo generar el código QR de pago.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <QRCodePayment url={payUrl} size={size} />
      <p className="text-center text-xs leading-relaxed text-gray-500">{helperText}</p>
      {onPay ? (
        <button
          type="button"
          onClick={onPay}
          disabled={payDisabled || paying}
          className={cn(
            'w-full rounded-lg border border-white/15 bg-white/[0.04] py-2.5 text-sm font-medium text-gray-300 transition-colors hover:border-white/25 hover:bg-white/[0.07] disabled:opacity-50',
            compact && 'py-2 text-xs'
          )}
        >
          {paying ? 'Procesando…' : 'Ya pagué (demo)'}
        </button>
      ) : null}
    </div>
  );
}

type MethodOption = {
  id: CheckoutPaymentMethod;
  label: string;
  icon: typeof Wallet;
  trailing?: React.ReactNode;
};

function PaymentMethodRow({
  option,
  selected,
  name,
  compact,
  onSelect,
  children,
}: {
  option: MethodOption;
  selected: boolean;
  name: string;
  compact?: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
}) {
  const Icon = option.icon;

  return (
    <div
      className={cn(
        'transition-colors duration-150',
        selected ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'
      )}
    >
      <label
        className={cn(
          'flex min-w-0 cursor-pointer items-center gap-3',
          compact ? 'px-3 py-2.5' : 'px-4 py-3.5'
        )}
      >
        <input
          type="radio"
          name={name}
          checked={selected}
          onChange={onSelect}
          className="h-4 w-4 shrink-0 accent-white"
        />
        <Icon size={compact ? 16 : 18} className="shrink-0 text-gray-400" />
        <span
          className={cn(
            'min-w-0 flex-1 truncate font-medium text-white',
            compact ? 'text-xs' : 'text-[15px]'
          )}
        >
          {option.label}
        </span>
        {option.trailing}
      </label>
      {selected && children ? (
        <div
          className={cn(
            'border-t border-white/10',
            compact ? 'px-3 pb-3 pt-3' : 'px-4 pb-4 pt-3'
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function CheckoutPaymentMethods({
  method,
  onMethodChange,
  payUrl = '',
  preview,
  compact,
  onPay,
  qrBlockedIssues,
  qrContactBlocked,
  payDisabled,
  hideQrSettingsLink,
  paying,
  name = 'checkout-payment-method',
}: {
  method: CheckoutPaymentMethod;
  onMethodChange: (method: CheckoutPaymentMethod) => void;
  payUrl?: string;
  preview?: boolean;
  compact?: boolean;
  onPay?: () => void;
  qrBlockedIssues?: QrReadinessIssue[];
  qrContactBlocked?: boolean;
  payDisabled?: boolean;
  hideQrSettingsLink?: boolean;
  paying?: boolean;
  name?: string;
}) {
  const options: MethodOption[] = [
    { id: 'wallet', label: 'Billetera', icon: Wallet },
    { id: 'qr', label: 'QR (Solana Pay)', icon: QrCode },
    {
      id: 'card',
      label: 'Tarjeta',
      icon: CreditCard,
      trailing: compact ? null : <CardBrandIcons compact={compact} />,
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-white/15 bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      {options.map((option, index) => (
        <div
          key={option.id}
          className={cn(index > 0 && 'border-t border-white/10')}
        >
          <PaymentMethodRow
            option={option}
            selected={method === option.id}
            name={name}
            compact={compact}
            onSelect={() => onMethodChange(option.id)}
          >
            {option.id === 'wallet' ? (
              <WalletPaymentPanel preview={preview} onPay={onPay} disabled={payDisabled || paying} />
            ) : null}
            {option.id === 'qr' ? (
              <QrPaymentPanel
                payUrl={payUrl}
                preview={preview}
                compact={compact}
                qrBlockedIssues={qrBlockedIssues}
                qrContactBlocked={qrContactBlocked}
                hideSettingsLink={hideQrSettingsLink}
                onPay={onPay}
                payDisabled={payDisabled}
                paying={paying}
              />
            ) : null}
            {option.id === 'card' ? (
              <CardPaymentStub compact={compact} preview={preview} />
            ) : null}
          </PaymentMethodRow>
        </div>
      ))}
    </div>
  );
}

'use client';

import type { ReactNode } from 'react';
import { Building2, ShieldCheck, Info } from 'lucide-react';
import type { Currency } from '@luxor/contracts';
import {
  computeCheckoutTotals,
  formatCheckoutAmount,
  type CheckoutLineItem,
} from '@/lib/payment-link-utils';
import { cn } from '@/lib/cn';
import { TokenPriceChart } from './TokenPriceChart';

export type StripeCheckoutContactFields = {
  collectEmail?: boolean;
  collectName?: boolean;
  collectCompany?: boolean;
  collectAddress?: boolean;
  collectPhone?: boolean;
};

export function StripeCheckoutLayout({
  merchantName,
  lineItems,
  currency,
  collectTaxes,
  taxIncluded,
  taxRate,
  contactFields,
  contactValues,
  onContactChange,
  children,
  statusSlot,
  compact,
  preview,
  payLabel = 'Pagar',
}: {
  merchantName: string;
  lineItems: CheckoutLineItem[];
  currency: Currency;
  collectTaxes?: boolean;
  taxIncluded?: boolean;
  taxRate?: number;
  contactFields?: StripeCheckoutContactFields;
  contactValues?: {
    email?: string;
    name?: string;
    company?: string;
    address?: string;
    phone?: string;
  };
  onContactChange?: (field: string, value: string) => void;
  children: ReactNode;
  statusSlot?: ReactNode;
  compact?: boolean;
  preview?: boolean;
  payLabel?: string;
}) {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'devnet';
  const totals = computeCheckoutTotals(lineItems, { collectTaxes, taxIncluded, taxRate });
  const showContact =
    contactFields?.collectEmail ||
    contactFields?.collectName ||
    contactFields?.collectCompany ||
    contactFields?.collectAddress ||
    contactFields?.collectPhone;

  const isMiniPreview = Boolean(preview && compact);
  const isDesktopPreview = Boolean(preview && !compact);

  const inputClass = cn(
    'w-full rounded-lg border border-white/15 bg-white/[0.04] text-white placeholder:text-gray-500 transition-colors focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/15 disabled:opacity-70',
    isMiniPreview ? 'px-2.5 py-2 text-xs' : 'px-3.5 py-2.5 text-sm'
  );

  if (preview) {
    const inputClassLight = cn(
      'w-full rounded-md border border-zinc-300 bg-white text-zinc-800 placeholder:text-zinc-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-70',
      isMiniPreview ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'
    );

    const sectionHeadingClassLight = cn(
      'font-semibold tracking-tight text-zinc-800',
      isMiniPreview ? 'text-xs' : compact ? 'text-sm' : 'text-[15px]'
    );

    return (
      <div
        className={cn(
          'bg-white text-zinc-700 flex overflow-x-hidden w-full h-full min-h-0',
          isMiniPreview ? 'flex-col text-[13px] overflow-y-auto' : 'flex-row'
        )}
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {/* Columna Izquierda: Detalle de Factura */}
        <div
          className={cn(
            'flex min-w-0 flex-col bg-[#FCFDFD] p-6 border-zinc-200',
            isMiniPreview ? 'border-b w-full' : 'w-[50%] shrink-0 border-r'
          )}
        >
          <div className="flex-1 min-w-0">
            {/* Merchant Header */}
            <div className={cn('flex items-center gap-2 mb-6')}>
              <div
                className="flex shrink-0 items-center justify-center rounded-full bg-zinc-100 font-semibold text-zinc-700 h-8 w-8 text-xs"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {merchantName.charAt(0).toUpperCase()}
              </div>
              <span
                className="min-w-0 truncate font-semibold text-zinc-600 text-sm"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {merchantName}
              </span>
            </div>

            {/* Invoice Breakdown */}
            <div>
              <p className="mb-1 text-xs text-zinc-500 font-medium">Paga a</p>
              <div className="flex items-baseline gap-1.5 mb-5">
                <span
                  className="text-3xl font-bold tabular-nums text-zinc-900"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {formatCheckoutAmount(totals.total, currency)}
                </span>
                <span
                  className="text-sm font-semibold text-zinc-500"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {currency}
                </span>
              </div>

              {/* Items list */}
              <div className="space-y-3 border-t border-zinc-100 pt-4">
                {lineItems.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex items-start justify-between gap-3 min-w-0 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-zinc-800">{item.name}</p>
                      {item.description ? (
                        <p className="mt-0.5 truncate text-[11px] text-zinc-400">{item.description}</p>
                      ) : null}
                      {item.quantity > 1 ? (
                        <p className="mt-1 text-[11px] text-zinc-400">
                          {formatCheckoutAmount(item.unitPrice, currency)} {currency} × {item.quantity}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 whitespace-nowrap tabular-nums text-zinc-600 font-medium">
                      {formatCheckoutAmount(item.unitPrice * item.quantity, currency)} {currency}
                    </span>
                  </div>
                ))}

                <div className="space-y-1.5 border-t border-zinc-100 pt-3 text-xs">
                  <div className="flex justify-between gap-3 text-zinc-500">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-medium text-zinc-600">
                      {formatCheckoutAmount(totals.subtotal, currency)} {currency}
                    </span>
                  </div>
                  {collectTaxes ? (
                    <div className="flex justify-between gap-3 text-zinc-500">
                      <span className="flex items-center gap-1">Impuesto <Info size={11} className="text-zinc-400" /></span>
                      <span className="tabular-nums font-medium text-zinc-600">
                        {formatCheckoutAmount(totals.tax, currency)} {currency}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-3 pt-1 border-t border-zinc-100/50 font-bold text-zinc-950 text-sm">
                    <span>Total adeudado</span>
                    <span className="tabular-nums">
                      {formatCheckoutAmount(totals.total, currency)} {currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Pago */}
        <div
          className={cn(
            'flex min-w-0 flex-col p-6 bg-white',
            isMiniPreview ? 'w-full' : 'w-[50%] shrink-0'
          )}
        >
          <div className="flex-1 min-w-0">
            {/* Contact info form (if visible) */}
            {showContact ? (
              <div className="mb-6">
                <section className="space-y-3">
                  <h2 className={sectionHeadingClassLight}>Pago con tarjeta</h2>
                  <div className="space-y-2.5">
                    {contactFields?.collectEmail ? (
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-zinc-500">Correo electrónico</label>
                        <input
                          type="email"
                          placeholder="correolectrónico@ejemplo.com"
                          disabled
                          className={inputClassLight}
                        />
                      </div>
                    ) : null}
                    {contactFields?.collectName ? (
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-zinc-500">Nombre completo</label>
                        <input
                          type="text"
                          placeholder="Nombre completo"
                          disabled
                          className={inputClassLight}
                        />
                      </div>
                    ) : null}
                    {contactFields?.collectPhone ? (
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-zinc-500">Teléfono</label>
                        <input
                          type="tel"
                          placeholder="Teléfono"
                          disabled
                          className={inputClassLight}
                        />
                      </div>
                    ) : null}
                    {contactFields?.collectCompany ? (
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-zinc-500">Empresa</label>
                        <input
                          type="text"
                          placeholder="Empresa"
                          disabled
                          className={inputClassLight}
                        />
                      </div>
                    ) : null}
                    {contactFields?.collectAddress ? (
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-zinc-500">Dirección</label>
                        <textarea
                          placeholder="Dirección"
                          disabled
                          rows={2}
                          className={cn(inputClassLight, 'resize-none')}
                        />
                      </div>
                    ) : null}
                  </div>
                </section>
              </div>
            ) : (
              <h2 className={cn(sectionHeadingClassLight, 'mb-4')}>Pago con tarjeta</h2>
            )}

            {/* Selector de Método de Pago y Inputs */}
            <div className="space-y-3">
              <h2 className={sectionHeadingClassLight}>Método de pago</h2>
              {children}
            </div>

            {/* Pagar Button (Stripe Blue) */}
            <div className="mt-6">
              <button
                type="button"
                disabled
                className={cn(
                  'w-full bg-[#0570DE] text-white font-medium hover:bg-[#025BB5] transition-colors focus:ring-2 focus:ring-blue-500/30 flex items-center justify-center',
                  isMiniPreview ? 'py-2 text-xs rounded-md' : 'py-2.5 text-sm rounded-lg'
                )}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {payLabel}
              </button>
            </div>
          </div>

          {/* Powered by Stripe Footer */}
          <div className="mt-6 border-t border-zinc-150 pt-4 flex items-center justify-between text-[10px] text-zinc-400">
            <span>Powered by <span className="font-semibold text-zinc-500">stripe</span></span>
            <div className="flex gap-2">
              <span className="hover:underline cursor-pointer">Condiciones</span>
              <span className="hover:underline cursor-pointer">Privacidad</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sectionHeadingClass = cn(
    'font-semibold tracking-tight text-white',
    isMiniPreview ? 'text-xs' : compact ? 'text-sm' : 'text-[15px]'
  );

  const hasNameAndPhone =
    Boolean(contactFields?.collectName) && Boolean(contactFields?.collectPhone);

  return (
    <div
      className={cn(
        'bg-[#0a0a0a] flex overflow-x-hidden min-h-screen',
        isDesktopPreview && 'min-h-0 flex-row w-full',
        isMiniPreview && 'min-h-0 flex-col text-[13px] w-full',
        !preview &&
          cn('min-h-dvh flex-col lg:flex-row pb-safe w-full', compact && 'text-[13px]')
      )}
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Columna Izquierda (Consolidada): Formulario de Pago */}
      <div
        className={cn(
          'flex min-w-0 flex-col border-white/10',
          isDesktopPreview && 'w-[50%] shrink-0 border-r p-6',
          isMiniPreview && 'border-b p-4',
          !preview &&
            cn(
              'border-b lg:w-[52%] lg:border-b-0 lg:border-r xl:w-[50%]',
              compact ? 'p-4 sm:p-5 lg:p-6' : 'p-4 sm:p-6 lg:p-12'
            )
        )}
      >
        <div className="flex-1 min-w-0">
          {/* Encabezado del Comercio */}
          <div className={cn('flex items-center gap-2.5', isMiniPreview ? 'mb-4' : 'mb-6')}>
            <div
              className={cn(
                'flex shrink-0 items-center justify-center rounded-full bg-white/10 font-semibold text-white',
                isMiniPreview ? 'h-7 w-7 text-[10px]' : compact ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
              )}
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {merchantName.charAt(0).toUpperCase()}
            </div>
            <span
              className={cn(
                'min-w-0 truncate font-semibold text-gray-200',
                isMiniPreview ? 'text-xs' : compact ? 'text-sm' : 'text-base'
              )}
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {merchantName}
            </span>
          </div>

          {/* Tarjeta de Pago Consolidada (Glassmorphism) */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(40px)',
              borderRadius: '40px',
              boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6)',
            }}
            className={cn(isMiniPreview ? 'p-4 space-y-4' : 'p-6 sm:p-8 space-y-6')}
          >
            {/* Detalle y Total */}
            <div>
              <p className={cn('mb-1 text-gray-400', isMiniPreview ? 'text-[11px]' : compact ? 'text-xs' : 'text-sm')}>
                Pagar a {merchantName}
              </p>
              <div className={cn('flex items-baseline gap-1.5', isMiniPreview ? 'mb-3' : 'mb-5')}>
                <span
                  className={cn(
                    'font-bold tabular-nums',
                    isMiniPreview ? 'text-xl' : compact ? 'text-2xl' : 'text-4xl',
                    currency === 'SOL' ? 'text-[#14f195]' : 'text-white'
                  )}
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {formatCheckoutAmount(totals.total, currency)}
                </span>
                <span
                  className={cn(
                    'font-medium text-gray-400',
                    isMiniPreview ? 'text-xs' : compact ? 'text-sm' : 'text-lg'
                  )}
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {currency}
                </span>
              </div>

              {/* Items y desglose */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                {lineItems.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex items-start justify-between gap-3 min-w-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'truncate font-medium text-white',
                          isMiniPreview ? 'text-xs' : compact ? 'text-sm' : 'text-base'
                        )}
                      >
                        {item.name}
                      </p>
                      {item.description ? (
                        <p className="mt-0.5 truncate text-[11px] text-gray-500">{item.description}</p>
                      ) : null}
                      {item.quantity > 1 ? (
                        <p className="mt-1 text-[11px] text-gray-500">
                          {formatCheckoutAmount(item.unitPrice, currency)} {currency} × {item.quantity}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={cn(
                        'shrink-0 whitespace-nowrap tabular-nums text-gray-300',
                        isMiniPreview ? 'text-xs' : 'text-sm'
                      )}
                    >
                      {formatCheckoutAmount(item.unitPrice * item.quantity, currency)} {currency}
                    </span>
                  </div>
                ))}

                <div
                  className={cn(
                    'space-y-1.5 border-t border-white/10 pt-3',
                    isMiniPreview ? 'text-xs' : 'space-y-2 pt-4 text-sm'
                  )}
                >
                  <div className="flex justify-between gap-3 text-gray-400">
                    <span className="shrink-0">Subtotal</span>
                    <span className="shrink-0 whitespace-nowrap tabular-nums text-gray-300">
                      {formatCheckoutAmount(totals.subtotal, currency)} {currency}
                    </span>
                  </div>
                  {collectTaxes ? (
                    <div className="flex justify-between gap-3 text-gray-400">
                      <span className="shrink-0">Impuestos</span>
                      <span className="shrink-0 whitespace-nowrap tabular-nums text-gray-300">
                        {formatCheckoutAmount(totals.tax, currency)} {currency}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-3 pt-0.5 font-semibold text-white">
                    <span className="shrink-0">Total</span>
                    <span className="shrink-0 whitespace-nowrap tabular-nums">
                      {formatCheckoutAmount(totals.total, currency)} {currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            {showContact ? (
              <div className="border-t border-white/10 pt-5">
                <section className={cn(isMiniPreview ? 'space-y-2.5' : 'space-y-3.5')}>
                  <h2 className={sectionHeadingClass}>Información de contacto</h2>
                  <div className={cn(isMiniPreview ? 'space-y-2' : 'space-y-3')}>
                    {contactFields?.collectEmail ? (
                      <input
                        type="email"
                        placeholder="Correo electrónico"
                        autoComplete="email"
                        value={contactValues?.email ?? ''}
                        onChange={(e) => onContactChange?.('email', e.target.value)}
                        disabled={preview}
                        className={inputClass}
                      />
                    ) : null}
                    <div
                      className={cn(
                        hasNameAndPhone && !isMiniPreview && 'grid gap-3 sm:grid-cols-2'
                      )}
                    >
                      {contactFields?.collectName ? (
                        <input
                          type="text"
                          placeholder="Nombre completo"
                          autoComplete="name"
                          value={contactValues?.name ?? ''}
                          onChange={(e) => onContactChange?.('name', e.target.value)}
                          disabled={preview}
                          className={inputClass}
                        />
                      ) : null}
                      {contactFields?.collectPhone ? (
                        <input
                          type="tel"
                          placeholder="Teléfono"
                          autoComplete="tel"
                          value={contactValues?.phone ?? ''}
                          onChange={(e) => onContactChange?.('phone', e.target.value)}
                          disabled={preview}
                          className={inputClass}
                        />
                      ) : null}
                    </div>
                    {contactFields?.collectCompany ? (
                      <div className="relative">
                        <Building2
                          size={isMiniPreview ? 14 : 16}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                        />
                        <input
                          type="text"
                          placeholder="Empresa"
                          autoComplete="organization"
                          value={contactValues?.company ?? ''}
                          onChange={(e) => onContactChange?.('company', e.target.value)}
                          disabled={preview}
                          className={cn(inputClass, isMiniPreview ? 'pl-8' : 'pl-10')}
                        />
                      </div>
                    ) : null}
                    {contactFields?.collectAddress ? (
                      <textarea
                        placeholder="Dirección"
                        rows={isMiniPreview ? 2 : 2}
                        autoComplete="street-address"
                        value={contactValues?.address ?? ''}
                        onChange={(e) => onContactChange?.('address', e.target.value)}
                        disabled={preview}
                        className={cn(inputClass, 'resize-none')}
                      />
                    ) : null}
                  </div>
                </section>
              </div>
            ) : null}

            {/* Selector de Método de Pago */}
            <div className="border-t border-white/10 pt-5">
              <section className={cn(isMiniPreview ? 'space-y-2.5' : 'space-y-3.5')}>
                <h2 className={sectionHeadingClass}>Método de pago</h2>
                {children}
              </section>
            </div>

            {/* Botón de Pago / Footer */}
            {!preview ? (
              <footer className="border-t border-white/10 pt-4 space-y-1.5 text-center">
                <p className="text-[11px] leading-relaxed text-gray-500">
                  Al pagar, aceptas que{' '}
                  <span className="text-gray-400">{merchantName}</span> procese este pago en
                  Solana.
                </p>
                <p className="text-[10px] text-gray-600">Impulsado por Luxor Pay</p>
              </footer>
            ) : (
              <button
                type="button"
                disabled
                className={cn(
                  'w-full rounded-full bg-white font-semibold text-black opacity-90 transition-all hover:bg-gray-100',
                  isMiniPreview ? 'py-2 text-xs' : compact ? 'py-2.5 text-sm' : 'py-3 text-base'
                )}
                style={{ borderRadius: '9999px' }}
              >
                {payLabel}
              </button>
            )}
          </div>
        </div>

        <div
          className={cn(
            'flex items-center gap-1.5 text-gray-500 mt-4',
            isMiniPreview ? 'text-[10px]' : compact ? 'text-[10px]' : 'text-xs'
          )}
        >
          <ShieldCheck size={isMiniPreview ? 11 : compact ? 12 : 14} className="shrink-0 text-[#14f195]" />
          <span className="truncate">Protegido en Solana {network}</span>
        </div>
      </div>

      {/* Columna Derecha: Gráfico del Token y Estadísticas de Red */}
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col bg-[#050505]',
          isDesktopPreview && 'p-6 justify-center',
          isMiniPreview && 'p-4',
          !preview && (compact ? 'p-4 sm:p-5 pb-6 lg:p-6 justify-center' : 'p-4 sm:p-6 pb-8 lg:p-12 justify-center')
        )}
      >
        <div
          className={cn(
            'w-full min-w-0',
            isMiniPreview ? 'max-w-none space-y-4' : compact ? 'max-w-md space-y-7' : 'max-w-lg space-y-8'
          )}
        >
          {statusSlot}

          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
              Análisis de Mercado
            </span>
            <p className="text-xs text-[var(--dash-muted)] mt-1">
              Precio del activo y actividad de la red de Solana en tiempo real.
            </p>
          </div>

          <TokenPriceChart currency={currency === 'SOL' ? 'SOL' : 'USDC'} />
        </div>
      </div>
    </div>
  );
}

export function CheckoutLoading({ message = 'Cargando checkout…' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 p-6">
      <div className="w-10 h-10 border-2 border-[#14f195] border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}

export function CheckoutError({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="glass-panel p-8 max-w-md text-center">
        <p className="text-red-400 font-medium mb-2">Checkout no disponible</p>
        <p className="text-gray-400 text-sm">{message}</p>
      </div>
    </div>
  );
}

/** @deprecated Use StripeCheckoutLayout */
export function CheckoutShell({
  merchantName,
  productName,
  amount,
  currency,
  children,
  statusSlot,
  compact,
}: {
  merchantName?: string;
  productName: string;
  amount: string;
  currency: string;
  children: React.ReactNode;
  statusSlot?: React.ReactNode;
  compact?: boolean;
}) {
  const parsed = parseFloat(amount);
  return (
    <StripeCheckoutLayout
      merchantName={merchantName ?? 'Luxor Pay'}
      lineItems={[
        {
          name: productName,
          unitPrice: Number.isNaN(parsed) ? 0 : parsed,
          quantity: 1,
        },
      ]}
      currency={currency as Currency}
      contactFields={{ collectEmail: true }}
      statusSlot={statusSlot}
      compact={compact}
      preview
    >
      {children}
    </StripeCheckoutLayout>
  );
}

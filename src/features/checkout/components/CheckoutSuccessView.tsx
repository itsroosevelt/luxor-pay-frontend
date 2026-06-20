'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard } from 'lucide-react';
import type { Currency } from '@luxor/contracts';
import { formatCheckoutAmount } from '@/lib/payment-link-utils';
import { cn } from '@/lib/cn';

const REDIRECT_DELAY_SEC = 5;

export function CheckoutSuccessView({
  merchantName,
  amount,
  currency,
  successMessage,
  redirectUrl,
  preview,
}: {
  merchantName: string;
  amount: number;
  currency: Currency;
  successMessage?: string;
  redirectUrl?: string;
  preview?: boolean;
}) {
  const [countdown, setCountdown] = useState(REDIRECT_DELAY_SEC);
  const trimmedRedirect = redirectUrl?.trim();

  useEffect(() => {
    if (preview || !trimmedRedirect) return;

    if (countdown <= 0) {
      window.location.href = trimmedRedirect;
      return;
    }

    const timer = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown, preview, trimmedRedirect]);

  if (preview) {
    const formattedDate = new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return (
      <div className="flex flex-col items-center gap-6 py-6 text-center text-zinc-700 bg-white font-sans w-full">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-green-500/10 blur-lg" />
          <div className="relative flex items-center justify-center rounded-full bg-green-100 border border-green-200 h-16 w-16 mx-auto">
            <CheckCircle2 className="h-9 w-9 text-green-600" strokeWidth={2} />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-lg font-bold text-zinc-900">¡Pago confirmado!</p>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Gracias por tu compra. Se ha enviado un recibo a tu correo.
          </p>
        </div>

        {/* Receipt Container Card */}
        <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-zinc-50/50 p-5 text-left shadow-sm space-y-4 mx-auto">
          <div className="border-b border-zinc-200 pb-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Recibo de</h3>
            <p className="text-sm font-bold text-zinc-800">{merchantName}</p>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
            <div>
              <span className="block text-zinc-400 font-medium">Monto</span>
              <span className="font-semibold text-zinc-800 tabular-nums">
                {formatCheckoutAmount(amount, currency)} {currency}
              </span>
            </div>
            <div>
              <span className="block text-zinc-400 font-medium">Fecha</span>
              <span className="font-semibold text-zinc-800">{formattedDate}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-zinc-400 font-medium mb-1">Método de pago</span>
              <div className="flex items-center gap-2 text-zinc-700 font-semibold">
                <CreditCard size={14} className="text-zinc-500 shrink-0" />
                <span>Tarjeta terminada en 4242</span>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-3 text-xs">
            <p className="text-[11px] leading-relaxed text-zinc-500 italic">
              &ldquo;{successMessage?.trim() || 'Gracias por tu pago.'}&rdquo;
            </p>
          </div>
        </div>

        <p className="text-[11px] text-zinc-400 font-medium">Vista previa de confirmación</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-[#14f195]/20 blur-xl" />
        <div
          className={cn(
            'relative flex items-center justify-center rounded-full bg-[#14f195]/15 ring-1 ring-[#14f195]/30',
            'h-16 w-16'
          )}
        >
          <CheckCircle2 className="h-9 w-9 text-[#14f195]" strokeWidth={2} />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-lg font-semibold text-white">¡Pago confirmado!</p>
        <p className="text-2xl font-bold tabular-nums text-[#14f195]">
          {formatCheckoutAmount(amount, currency)} {currency}
        </p>
        <p className="text-sm text-gray-400">a {merchantName}</p>
      </div>

      <p className="max-w-sm text-[15px] leading-relaxed text-gray-300">
        {successMessage?.trim() || 'Gracias por tu pago.'}
      </p>

      {preview ? (
        <p className="text-xs text-gray-500">Vista previa de confirmación</p>
      ) : trimmedRedirect ? (
        <p className="text-xs text-gray-500">
          Redirigiendo en {countdown}s…
        </p>
      ) : (
        <p className="text-xs text-gray-500">Pago procesado correctamente</p>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
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
        <p className="text-xs text-gray-500">Pago simulado en modo demo</p>
      )}
    </div>
  );
}

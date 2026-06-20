'use client';

import { Info, Link as LinkIcon } from 'lucide-react';

type PaymentLinkCheckoutInfoVariant = 'list' | 'create' | 'detail';

interface PaymentLinkCheckoutInfoProps {
  variant?: PaymentLinkCheckoutInfoVariant;
  className?: string;
}

const COPY: Record<PaymentLinkCheckoutInfoVariant, { title: string; body: string }> = {
  list: {
    title: '¿Qué incluye un enlace de pago?',
    body: 'Cada enlace abre una página de checkout donde tu cliente puede pagar con wallet, escanear un QR de Solana Pay o, próximamente, con tarjeta. Comparte la URL — no necesitas crear un QR por separado.',
  },
  create: {
    title: 'Lo que verá tu cliente',
    body: 'Al abrir el enlace, verá un formulario de contacto y podrá elegir: conectar su wallet, escanear un QR (Solana Pay) o pagar con tarjeta (próximamente). Todo en una sola página.',
  },
  detail: {
    title: 'Checkout con QR incluido',
    body: 'Tu cliente puede pagar con wallet o escanear el QR de Solana Pay directamente en esta página. No hace falta generar un código QR aparte.',
  },
};

export function PaymentLinkCheckoutInfo({
  variant = 'list',
  className,
}: PaymentLinkCheckoutInfoProps) {
  const { title, body } = COPY[variant];

  return (
    <div
      className={`dash-card p-4 flex items-start gap-3 text-sm border border-[var(--dash-accent)]/20 bg-[var(--dash-accent-soft)]/30 ${className ?? ''}`}
    >
      <div className="w-8 h-8 rounded-md bg-[var(--dash-accent-soft)] flex items-center justify-center text-[var(--dash-accent)] shrink-0">
        {variant === 'list' ? <LinkIcon size={16} /> : <Info size={16} />}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-[var(--dash-text)]">{title}</p>
        <p className="text-[var(--dash-muted)] mt-0.5 text-xs leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

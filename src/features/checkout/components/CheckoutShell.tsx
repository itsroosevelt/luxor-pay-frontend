'use client';

import type { ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/cn';

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
  children: ReactNode;
  statusSlot?: ReactNode;
  /** Smaller layout for dashboard preview panes */
  compact?: boolean;
}) {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'devnet';

  return (
    <div
      className={cn(
        'bg-[#0a0a0a] flex flex-col lg:flex-row',
        compact ? 'min-h-0 h-full' : 'min-h-screen'
      )}
    >
      <div className="lg:w-[42%] xl:w-[38%] border-b lg:border-b-0 lg:border-r border-white/10 p-8 lg:p-12 flex flex-col justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-6">Order summary</p>
          <h1 className="text-xl font-semibold text-white mb-1">
            {merchantName ?? 'Luxor Pay'}
          </h1>
          <p className="text-gray-400 text-sm mb-8">{productName}</p>
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                'text-3xl font-bold tabular-nums',
                currency === 'SOL' ? 'text-[#14f195]' : 'text-[#9945ff]'
              )}
            >
              {amount}
            </span>
            <span className="text-lg font-medium text-gray-300">{currency}</span>
          </div>
        </div>
        <div className="mt-10 flex items-center gap-2 text-xs text-gray-500">
          <ShieldCheck size={14} className="text-[#14f195]" />
          Secured on Solana {network}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md space-y-6">
          {statusSlot}
          {children}
        </div>
      </div>
    </div>
  );
}

export function CheckoutLoading({ message = 'Loading checkout…' }: { message?: string }) {
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
        <p className="text-red-400 font-medium mb-2">Checkout unavailable</p>
        <p className="text-gray-400 text-sm">{message}</p>
      </div>
    </div>
  );
}

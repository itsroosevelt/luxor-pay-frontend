'use client';

import type { PaymentOrder } from '@luxor/contracts';
import { QRCodePayment } from '@/features/checkout/components/QRCodePayment';
import { PaymentButton } from '@/features/checkout/components/PaymentButton';
import { TransactionStatus } from '@/features/checkout/components/TransactionStatus';
import { CheckoutShell } from '@/features/checkout/components/CheckoutShell';
import { cn } from '@/lib/cn';
import { formatCurrencyAmount } from '@/lib/format-currency';

export interface PayByReferenceViewProps {
  order: PaymentOrder;
  method: 'qr' | 'wallet';
  onMethodChange: (method: 'qr' | 'wallet') => void;
}

export function PayByReferenceView({ order, method, onMethodChange }: PayByReferenceViewProps) {
  const displayAmount = formatCurrencyAmount(order.amount, order.currency).replace(
    ` ${order.currency}`,
    ''
  );
  const payUrl = order.solanaPayUrl ?? '';
  const isConfirmed = order.status === 'confirmed';

  return (
    <CheckoutShell
      merchantName="Luxor Pay"
      productName={order.label ?? 'Checkout'}
      amount={displayAmount}
      currency={order.currency}
      statusSlot={<TransactionStatus order={order} />}
    >
      {isConfirmed ? (
        <p className="text-center text-[#60A5FA] font-semibold text-lg">
          Thank you for your payment.
        </p>
      ) : (
        <>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onMethodChange('qr')}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors',
                method === 'qr'
                  ? 'border-white bg-white text-black'
                  : 'border-white/15 text-gray-400 hover:border-white/30'
              )}
            >
              QR (Solana Pay)
            </button>
            <button
              type="button"
              onClick={() => onMethodChange('wallet')}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors',
                method === 'wallet'
                  ? 'border-white bg-white text-black'
                  : 'border-white/15 text-gray-400 hover:border-white/30'
              )}
            >
              Wallet
            </button>
          </div>

          {method === 'qr' && payUrl ? (
            <QRCodePayment url={payUrl} size={240} />
          ) : (
            <div className="space-y-3">
              <PaymentButton variant="white" onPay={() => window.open(payUrl, '_blank')} />
              <p className="text-xs text-center text-gray-500">
                Connect Phantom, Solflare, or another Solana wallet
              </p>
            </div>
          )}
        </>
      )}
    </CheckoutShell>
  );
}

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePaymentStatus } from '@/features/checkout/hooks/usePaymentStatus';
import { QRCodePayment } from '@/features/checkout/components/QRCodePayment';
import { PaymentButton } from '@/features/checkout/components/PaymentButton';
import { TransactionStatus } from '@/features/checkout/components/TransactionStatus';
import {
  CheckoutShell,
  CheckoutLoading,
  CheckoutError,
} from '@/features/checkout/components/CheckoutShell';
import { cn } from '@/lib/cn';

export default function PayByReferencePage() {
  const params = useParams();
  const router = useRouter();
  const reference = params.reference as string;
  const { order, loading, error } = usePaymentStatus(reference);
  const [method, setMethod] = useState<'qr' | 'wallet'>('qr');

  useEffect(() => {
    if (reference.startsWith('lx_')) {
      router.replace(`/pay/link/${reference}`);
    }
  }, [reference, router]);

  if (loading) {
    return <CheckoutLoading message="Loading secure checkout…" />;
  }

  if (error || !order) {
    return <CheckoutError message={error ?? 'Payment not found'} />;
  }

  const displayAmount = order.amount.toFixed(order.currency === 'SOL' ? 4 : 2);
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
        <p className="text-center text-[#14f195] font-semibold text-lg">
          Thank you for your payment.
        </p>
      ) : (
        <>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMethod('qr')}
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
              onClick={() => setMethod('wallet')}
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

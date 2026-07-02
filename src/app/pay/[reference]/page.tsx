'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePaymentStatus } from '@/features/checkout/hooks/usePaymentStatus';
import { QRCodePayment } from '@/features/checkout/components/QRCodePayment';
import { PaymentButton } from '@/features/checkout/components/PaymentButton';
import { TransactionStatus } from '@/features/checkout/components/TransactionStatus';
import { ShieldCheck } from 'lucide-react';
import { Decimal } from 'decimal.js';
import { useTokenPrice } from '@/hooks/useTokenPrice';

export default function PayByReferencePage() {
  const params = useParams();
  const router = useRouter();
  const reference = params.reference as string;
  const { order, loading, error } = usePaymentStatus(reference);
  const [method, setMethod] = useState<'qr' | 'wallet'>('qr');
  const { data: usdRate, isLoading: isPriceLoading } = useTokenPrice(order?.currency);

  useEffect(() => {
    if (reference.startsWith('lx_')) {
      router.replace(`/pay/link/${reference}`);
    }
  }, [reference, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="glass-panel p-8 max-w-md text-center text-red-400">
          {error ?? 'Payment not found'}
        </div>
      </div>
    );
  }

  const getUsdEquivalent = () => {
    if (!order || !order.amount || usdRate === null) return null;
    try {
      return new Decimal(order.amount).mul(usdRate).toNumber();
    } catch {
      return null;
    }
  };

  const usdAmount = getUsdEquivalent();

  const displayAmount = new Decimal(order.amount).toFixed(order.currency === 'SOL' ? 9 : 2);
  const payUrl = order.solanaPayUrl ?? '';
  const isConfirmed = order.status === 'confirmed';

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-panel p-8 shadow-2xl">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-1">
            Luxor <span className="text-primary">Pay</span>
          </h1>
          <p className="text-gray-400 text-sm">{order.label ?? 'Checkout'}</p>
        </header>

        <div className="bg-white/5 rounded-2xl p-5 mb-6 border border-white/10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400">Total</span>
            <span className="text-2xl font-bold">
              {usdAmount !== null ? (
                `$${usdAmount.toFixed(2)}`
              ) : isPriceLoading ? (
                '$...'
              ) : (
                `$${(parseFloat(String(order.amount || '0')) * (usdRate ?? 0)).toFixed(2)}`
              )}
            </span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400 text-xs">Equivalent</span>
            <span className="text-sm text-gray-300">
              {displayAmount} {order.currency}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
            <ShieldCheck size={14} />
            Solana {process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'devnet'}
          </div>
        </div>

        <TransactionStatus order={order} />

        {!isConfirmed && (
          <>
            <div className="flex gap-2 my-6">
              <button
                type="button"
                onClick={() => setMethod('qr')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
                  method === 'qr' ? 'border-primary bg-primary/10' : 'border-white/10'
                }`}
              >
                QR (Solana Pay)
              </button>
              <button
                type="button"
                onClick={() => setMethod('wallet')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
                  method === 'wallet' ? 'border-primary bg-primary/10' : 'border-white/10'
                }`}
              >
                Wallet
              </button>
            </div>

            {method === 'qr' && payUrl ? (
              <QRCodePayment url={payUrl} />
            ) : (
              <PaymentButton onPay={() => window.open(payUrl, '_blank')} />
            )}
          </>
        )}

        {isConfirmed && (
          <p className="text-center text-primary font-semibold mt-6">Thank you for your payment.</p>
        )}
      </div>
    </div>
  );
}

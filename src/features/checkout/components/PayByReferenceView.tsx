'use client';

import type { PaymentOrder } from '@luxor/contracts';
import {
  CheckoutPaymentMethods,
  type CheckoutPaymentMethod,
} from '@/features/checkout/components/CheckoutPaymentMethods';
import { TransactionStatus } from '@/features/checkout/components/TransactionStatus';
import { StripeCheckoutLayout } from '@/features/checkout/components/CheckoutShell';
import { formatCurrencyAmount } from '@/lib/format-currency';

export interface PayByReferenceViewProps {
  order: PaymentOrder;
  method: CheckoutPaymentMethod;
  onMethodChange: (method: CheckoutPaymentMethod) => void;
}

export function PayByReferenceView({ order, method, onMethodChange }: PayByReferenceViewProps) {
  const displayAmount = formatCurrencyAmount(order.amount, order.currency).replace(
    ` ${order.currency}`,
    ''
  );
  const payUrl = order.solanaPayUrl ?? '';
  const isConfirmed = order.status === 'confirmed';

  return (
    <StripeCheckoutLayout
      merchantName="Luxor Pay"
      lineItems={[
        {
          name: order.label ?? 'Checkout',
          unitPrice: order.amount,
          quantity: 1,
        },
      ]}
      currency={order.currency}
      contactFields={{ collectEmail: true }}
      statusSlot={<TransactionStatus order={order} />}
      payLabel="Pagar"
    >
      {isConfirmed ? (
        <p className="text-center text-[#14f195] font-semibold text-lg">
          Gracias por tu pago.
        </p>
      ) : (
        <>
          <CheckoutPaymentMethods
            method={method}
            onMethodChange={onMethodChange}
            payUrl={payUrl}
            onPay={() => window.open(payUrl, '_blank')}
            name="pay-reference-method"
          />

          {method !== 'card' ? (
            <button
              type="button"
              onClick={() => window.open(payUrl, '_blank')}
              className="mt-1 w-full rounded-xl bg-white py-3.5 text-[15px] font-semibold text-black shadow-sm transition-all hover:bg-gray-100 active:scale-[0.99]"
            >
              Pagar {displayAmount} {order.currency}
            </button>
          ) : null}
        </>
      )}
    </StripeCheckoutLayout>
  );
}

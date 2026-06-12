'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createPaymentFromLink } from '@/lib/payments-api';
import { getPaymentLinkById } from '@/lib/merchant-data';
import type { PaymentLink } from '@luxor/contracts';
import {
  CheckoutShell,
  CheckoutLoading,
  CheckoutError,
} from '@/features/checkout/components/CheckoutShell';

/** Payment link entry: creates an on-chain payment session then redirects to /pay/[reference]. */
export default function PayLinkPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<PaymentLink | null>(null);

  useEffect(() => {
    if (!id) return;
    getPaymentLinkById(id)
      .then(setLink)
      .catch(() => {
        // Public checkout may not load link preview; payment creation still proceeds below.
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    createPaymentFromLink(id)
      .then((order) => router.replace(`/pay/${order.reference}`))
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not start checkout'));
  }, [id, router]);

  if (error) {
    return <CheckoutError message={error} />;
  }

  if (link) {
    const displayAmount = link.amount.toFixed(link.currency === 'SOL' ? 4 : 2);
    return (
      <CheckoutShell
        merchantName="Luxor Pay"
        productName={link.name}
        amount={displayAmount}
        currency={link.currency}
      >
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="w-10 h-10 border-2 border-[#14f195] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm text-center">Preparing secure checkout…</p>
        </div>
      </CheckoutShell>
    );
  }

  return <CheckoutLoading message="Preparing secure checkout…" />;
}

'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { isFrontendOnly } from '@/lib/frontend-only';
import { getPaymentLinkById } from '@/lib/merchant-data';
import { getPaymentLinkPublicPath } from '@/lib/payment-link-utils';
import { createPaymentFromLink } from '@/lib/payments-api';
import { CheckoutError, CheckoutLoading } from '@/features/checkout/components/CheckoutShell';

/** Legacy entry point — redirects to canonical /pay/[slug]. */
export default function PayLinkPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const frontendOnly = isFrontendOnly();

  useEffect(() => {
    if (!id) return;

    if (frontendOnly) {
      getPaymentLinkById(id)
        .then((link) => router.replace(getPaymentLinkPublicPath(link)))
        .catch(() => router.replace(`/pay/${id}`));
      return;
    }

    createPaymentFromLink(id)
      .then((order) => router.replace(`/pay/${order.reference}`))
      .catch(() => {
        // Fall back to slug route if backend link lookup fails.
        router.replace(`/pay/${id}`);
      });
  }, [id, router, frontendOnly]);

  if (frontendOnly) {
    return <CheckoutLoading message="Redirigiendo al checkout…" />;
  }

  return <CheckoutLoading message="Preparando checkout seguro…" />;
}

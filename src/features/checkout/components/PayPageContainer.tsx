'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { isFrontendOnly } from '@/lib/frontend-only';
import { getPaymentLinkById, getPaymentLinkBySlug } from '@/lib/merchant-data';
import { loadLocalMerchantProfile } from '@/lib/merchant-local';
import { getPaymentLinkPublicPath } from '@/lib/payment-link-utils';
import { createPaymentFromLink } from '@/lib/payments-api';
import type { MerchantProfile, PaymentLink } from '@luxor/contracts';
import { PaymentLinkCheckoutView } from '@/features/checkout/components/PaymentLinkCheckoutView';
import type { CheckoutPaymentMethod } from '@/features/checkout/components/CheckoutPaymentMethods';
import { PayByReferenceView } from '@/features/checkout/components/PayByReferenceView';
import { usePaymentStatus } from '@/features/checkout/hooks/usePaymentStatus';
import {
  CheckoutError,
  CheckoutLoading,
} from '@/features/checkout/components/CheckoutShell';

function PayByReferenceSection({ reference }: { reference: string }) {
  const { data, isLoading, isError, errorMessage } = usePaymentStatus(reference);
  const [method, setMethod] = useState<CheckoutPaymentMethod>('wallet');

  if (isLoading) {
    return <CheckoutLoading message="Cargando checkout seguro…" />;
  }

  if (isError || !data) {
    return <CheckoutError message={errorMessage ?? 'Pago no encontrado'} />;
  }

  return <PayByReferenceView order={data} method={method} onMethodChange={setMethod} />;
}

/** Resolves /pay/[slug] for payment links and /pay/[reference] for on-chain orders. */
export function PayPageContainer() {
  const params = useParams<{ reference: string }>();
  const router = useRouter();
  const param = params.reference;
  const frontendOnly = isFrontendOnly();

  const [link, setLink] = useState<PaymentLink | null>(null);
  const [merchantName, setMerchantName] = useState('Luxor Pay');
  const [merchantProfile, setMerchantProfile] = useState<MerchantProfile | null>(null);
  const [loadingLink, setLoadingLink] = useState(true);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [backendReference, setBackendReference] = useState<string | null>(null);

  const isLinkId = param?.startsWith('lx_') ?? false;

  useEffect(() => {
    if (!param) return;

    let cancelled = false;

    const resolveLink = async () => {
      try {
        const resolved = isLinkId
          ? await getPaymentLinkById(param)
          : await getPaymentLinkBySlug(param);
        if (cancelled) return;
        setLink(resolved);
        const profile = loadLocalMerchantProfile(resolved.merchantId);
        setMerchantProfile(profile);
        const displayName =
          resolved.merchantBusinessName?.trim() ||
          profile?.businessName?.trim() ||
          'Comercio';
        setMerchantName(displayName);
        if (resolved.slug && param === resolved.id && resolved.slug !== param) {
          router.replace(getPaymentLinkPublicPath(resolved));
        }
      } catch {
        if (!cancelled) setLink(null);
      } finally {
        if (!cancelled) setLoadingLink(false);
      }
    };

    void resolveLink();
    return () => {
      cancelled = true;
    };
  }, [param, isLinkId, router]);

  useEffect(() => {
    if (!param || frontendOnly || loadingLink || link) return;

    createPaymentFromLink(param)
      .then((order) => setBackendReference(order.reference))
      .catch((e) =>
        setCheckoutError(e instanceof Error ? e.message : 'No se pudo iniciar el checkout')
      );
  }, [param, frontendOnly, loadingLink, link]);

  if (!param) {
    return <CheckoutError message="Enlace de pago no válido" />;
  }

  if (frontendOnly && loadingLink) {
    return <CheckoutLoading message="Cargando checkout…" />;
  }

  if (link) {
    if (!link.active) {
      return <CheckoutError message="Este enlace de pago ya no está activo" />;
    }
    return (
      <PaymentLinkCheckoutView
        link={link}
        merchantName={merchantName}
        merchantProfile={merchantProfile}
        publicCheckout
      />
    );
  }

  if (frontendOnly) {
    return <CheckoutError message="Enlace de pago no encontrado" />;
  }

  if (checkoutError) {
    return <CheckoutError message={checkoutError} />;
  }

  if (backendReference) {
    return <PayByReferenceSection reference={backendReference} />;
  }

  if (!loadingLink) {
    return <PayByReferenceSection reference={param} />;
  }

  return <CheckoutLoading message="Preparando checkout seguro…" />;
}

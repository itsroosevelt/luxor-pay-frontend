'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePaymentStatus } from '@/features/checkout/hooks/usePaymentStatus';
import {
  CheckoutLoading,
  CheckoutError,
} from '@/features/checkout/components/CheckoutShell';
import { PayByReferenceView } from '@/features/checkout/components/PayByReferenceView';

export function PayByReferenceContainer() {
  const params = useParams();
  const router = useRouter();
  const reference = params.reference as string;
  const { data, isLoading, isError, errorMessage } = usePaymentStatus(reference);
  const [method, setMethod] = useState<'qr' | 'wallet'>('qr');

  useEffect(() => {
    if (reference.startsWith('lx_')) {
      router.replace(`/pay/link/${reference}`);
    }
  }, [reference, router]);

  if (isLoading) {
    return <CheckoutLoading message="Loading secure checkout…" />;
  }

  if (isError || !data) {
    return <CheckoutError message={errorMessage ?? 'Payment not found'} />;
  }

  return (
    <PayByReferenceView order={data} method={method} onMethodChange={setMethod} />
  );
}

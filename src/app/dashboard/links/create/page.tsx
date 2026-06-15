'use client';

import { Suspense } from 'react';
import { CreatePaymentLinkContent } from './CreatePaymentLinkContent';

export default function CreatePaymentLinkPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-[var(--dash-muted)] py-16 text-center">Cargando editor…</p>
      }
    >
      <CreatePaymentLinkContent />
    </Suspense>
  );
}

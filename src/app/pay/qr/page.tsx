import { Suspense } from 'react';
import PayQrClient from './PayQrClient';

export const dynamic = 'force-dynamic';

export default function PayQrPage() {
  return (
    <Suspense fallback={null}>
      <PayQrClient />
    </Suspense>
  );
}

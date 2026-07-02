import { Suspense } from 'react';
import PayQrClient from './PayQrClient';



export default function PayQrPage() {
  return (
    <Suspense fallback={null}>
      <PayQrClient />
    </Suspense>
  );
}

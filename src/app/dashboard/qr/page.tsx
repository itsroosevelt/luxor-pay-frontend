'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SolanaPayQrRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/links?from=qr');
  }, [router]);

  return (
    <p className="text-sm text-[var(--dash-muted)] py-16 text-center">Redirigiendo a enlaces de pago…</p>
  );
}

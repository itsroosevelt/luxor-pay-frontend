'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createPaymentFromLink } from '@/lib/payments-api';

/** Payment link entry: creates an on-chain payment session then redirects to /pay/[reference]. */
export default function PayLinkPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    createPaymentFromLink(id)
      .then((order) => router.replace(`/pay/${order.reference}`))
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not start checkout'));
  }, [id, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="glass-panel p-8 max-w-md text-center text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Preparing secure checkout…</p>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LiquidityRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/token-launcher/pools');
  }, [router]);

  return null;
}



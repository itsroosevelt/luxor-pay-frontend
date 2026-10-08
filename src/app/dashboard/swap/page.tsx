"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Trading moved to the treasury (a Jupiter swap proposal the team approves); keep old links working. */
export default function SwapRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/treasury?trade=1');
  }, [router]);
  return null;
}

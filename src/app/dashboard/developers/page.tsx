'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DevelopersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/settings?tab=developers');
  }, [router]);

  return (
    <div className="p-10 text-gray-500 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      Redirecting to Settings…
    </div>
  );
}

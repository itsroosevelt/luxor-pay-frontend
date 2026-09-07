'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardContactsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/payment-portal/contacts');
  }, [router]);

  return null;
}


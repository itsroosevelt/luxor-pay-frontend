'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLinksPreviewRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/payment-portal/links/preview/${id}`);
    }
  }, [id, router]);

  return (
    <div className="p-10 text-gray-500 text-sm flex items-center justify-center min-h-[50vh]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-blue-500 animate-spin" />
        <span>Loading Link Preview…</span>
      </div>
    </div>
  );
}

'use client';

import { PageHeader, EmptyState, BackendNotice } from '@/components/dashboard';
import { Percent } from 'lucide-react';

export default function TaxPage() {
  return (
    <>
      <PageHeader
        title="Tax"
        description="Configure tax behavior for SOL and USDC charges (jurisdiction rules via backend)."
      />
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
        <BackendNotice notImplemented />
        <EmptyState
          icon={Percent}
          title="Tax settings"
          description="On-chain amounts are gross settlements; tax reporting integrations connect through your backend at NEXT_PUBLIC_API_URL."
          action={{ label: 'Settings', href: '/dashboard/settings' }}
        />
      </div>
    </>
  );
}

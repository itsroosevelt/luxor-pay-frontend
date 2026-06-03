'use client';

import { PageHeader, EmptyState, BackendNotice } from '@/components/dashboard';
import { Network } from 'lucide-react';

export default function ConnectPage() {
  return (
    <>
      <PageHeader
        title="Connect"
        description="Platform accounts for marketplaces — route split SOL/USDC payouts on Solana."
      />
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
        <BackendNotice notImplemented />
        <EmptyState
          icon={Network}
          title="No connected accounts"
          description="Stripe Connect-style splits for Solana will list connected merchant wallets when your platform API is ready."
          action={{ label: 'Developers', href: '/dashboard/developers' }}
        />
      </div>
    </>
  );
}

'use client';

import { PageHeader, EmptyState, BackendNotice } from '@/components/dashboard';
import { ShieldCheck } from 'lucide-react';

export default function IdentityPage() {
  return (
    <>
      <PageHeader
        title="Identity"
        description="Verify merchants and link payout wallets for compliance-ready Solana settlements."
      />
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
        <BackendNotice notImplemented />
        <EmptyState
          icon={ShieldCheck}
          title="Identity verification"
          description="KYC and wallet ownership checks will surface here when your backend exposes identity endpoints. Connect your merchant wallet in Settings to receive SOL/USDC today."
          action={{ label: 'Settings', href: '/dashboard/settings' }}
        />
      </div>
    </>
  );
}

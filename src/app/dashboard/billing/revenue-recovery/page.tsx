'use client';

import { PageHeader, EmptyState, BillingSectionNav, BackendNotice } from '@/components/dashboard';
import { RefreshCw } from 'lucide-react';

export default function RevenueRecoveryPage() {
  return (
    <>
      <PageHeader
        title="Revenue recovery"
        description="Retry failed wallet debits and expired Solana Pay sessions for subscriptions and invoices."
      />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <BillingSectionNav />
        <BackendNotice notImplemented />
        <EmptyState
          icon={RefreshCw}
          title="Recovery workflows not configured"
          description="Connect your backend to automate retries for past-due USDC/SOL invoices. Smart retries respect on-chain confirmation windows."
          action={{ label: 'View transactions', href: '/dashboard/transactions' }}
        />
      </div>
    </>
  );
}

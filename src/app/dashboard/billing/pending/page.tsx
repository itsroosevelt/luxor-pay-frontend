'use client';

import { Clock } from 'lucide-react';
import {
  BillingSectionNav,
  BackendNotice,
  CatalogFlowCrossLinks,
  EmptyState,
  PageHeader,
} from '@/components/dashboard';

export default function BillingPendingPage() {
  return (
    <>
      <PageHeader
        title="Revenue recovery"
        description="Recover revenue from pending on-chain charges, expired Solana Pay sessions, and unpaid wallet-billed invoices."
      />
      <div className="px-6 md:px-8 pt-0 pb-12 max-w-6xl mx-auto space-y-6">
        <BillingSectionNav />
        <BackendNotice notImplemented />
        <p className="text-xs text-[var(--dash-muted)]">
          All recovered funds settle in USDC or SOL to your Solana merchant wallet — not via bank or card networks.
        </p>
        <EmptyState
          icon={Clock}
          title="Pending payments & recovery"
          description="Track unpaid on-chain invoices, send wallet reminders, and follow up on incomplete Solana Pay checkouts. Connect your backend to sync delinquency data from links and wallet subscriptions."
          action={{ label: 'Solana Pay links', href: '/dashboard/links' }}
        />
        <CatalogFlowCrossLinks
          excludeHref="/dashboard/billing/pending"
          title="Catalog & payments"
        />
      </div>
    </>
  );
}

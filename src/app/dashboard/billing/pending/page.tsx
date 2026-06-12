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
        description="Recover revenue from pending charges, failed payments, and delinquent invoices. Also reachable at /dashboard/billing/revenue-recovery."
      />
      <div className="px-6 md:px-8 pt-0 pb-12 max-w-6xl mx-auto space-y-6">
        <BillingSectionNav />
        <BackendNotice notImplemented />
        <EmptyState
          icon={Clock}
          title="Pending payments & recovery"
          description="Track unpaid invoices, send reminders, and follow up on incomplete checkouts. Connect your backend to sync delinquency data from payment links and subscriptions."
          action={{ label: 'Payment links', href: '/dashboard/links' }}
        />
        <CatalogFlowCrossLinks
          excludeHref="/dashboard/billing/pending"
          title="Catalog & payments"
        />
      </div>
    </>
  );
}

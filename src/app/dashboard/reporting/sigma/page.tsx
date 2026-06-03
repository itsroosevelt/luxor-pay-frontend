'use client';

import {
  PageHeader,
  EmptyState,
  ReportingSectionNav,
  BackendNotice,
} from '@/components/dashboard';
import { Database } from 'lucide-react';

export default function ReportingSigmaPage() {
  return (
    <>
      <PageHeader
        title="Sigma"
        description="SQL-style exploration of Solana payment facts — references, signatures, and settlement wallets."
      />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <ReportingSectionNav />
        <BackendNotice notImplemented />
        <EmptyState
          icon={Database}
          title="Sigma workspace"
          description="Connect a read replica or warehouse export from your backend to query confirmed SOL/USDC payments. No demo rows are shown."
        />
      </div>
    </>
  );
}

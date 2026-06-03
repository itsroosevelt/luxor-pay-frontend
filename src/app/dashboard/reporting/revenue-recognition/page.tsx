'use client';

import {
  PageHeader,
  EmptyState,
  ReportingSectionNav,
  BackendNotice,
} from '@/components/dashboard';
import { LineChart } from 'lucide-react';

export default function RevenueRecognitionPage() {
  return (
    <>
      <PageHeader
        title="Revenue recognition"
        description="Map on-chain settlement timing to accounting periods for SOL and USDC."
      />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <ReportingSectionNav />
        <BackendNotice notImplemented />
        <EmptyState
          icon={LineChart}
          title="No recognition schedules"
          description="Deferred revenue and multi-period plans will appear when your finance API is connected."
          action={{ label: 'Billing overview', href: '/dashboard/billing' }}
        />
      </div>
    </>
  );
}

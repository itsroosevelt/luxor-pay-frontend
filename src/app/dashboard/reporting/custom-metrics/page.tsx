'use client';

import { LineChart } from 'lucide-react';
import { PageHeader, EmptyState, BackendNotice, ReportingSectionNav } from '@/components/dashboard';

export default function CustomMetricsPage() {
  return (
    <>
      <PageHeader
        title="Custom metrics"
        description="Define and track custom KPIs for your payment activity."
      />
      <div className="p-6 md:px-8 md:pb-8 max-w-[1400px] mx-auto space-y-6">
        <ReportingSectionNav />
        <BackendNotice notImplemented />
        <EmptyState
          icon={LineChart}
          title="Custom metrics"
          description="Build dashboards with custom metrics on volume, customers, and settlements. Requires backend analytics integration."
          action={{ label: 'Back to reports', href: '/dashboard/reporting' }}
        />
      </div>
    </>
  );
}

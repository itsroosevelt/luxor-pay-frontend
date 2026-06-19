'use client';

import { Database } from 'lucide-react';
import { PageHeader, EmptyState, BackendNotice, ReportingSectionNav } from '@/components/dashboard';

export default function DataManagementPage() {
  return (
    <>
      <PageHeader
        title="Data management"
        description="Export, schedule, and manage reporting data."
      />
      <div className="p-6 md:px-8 md:pb-8 max-w-[1400px] mx-auto space-y-6">
        <ReportingSectionNav />
        <BackendNotice notImplemented />
        <EmptyState
          icon={Database}
          title="Data management"
          description="Configure data exports, scheduled reports, and retention settings. Available when backend reporting is connected."
          action={{ label: 'Back to reports', href: '/dashboard/reporting' }}
        />
      </div>
    </>
  );
}

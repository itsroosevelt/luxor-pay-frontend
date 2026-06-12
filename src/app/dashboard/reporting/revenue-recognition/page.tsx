'use client';

import { FileText } from 'lucide-react';
import { PageHeader, EmptyState, BackendNotice, ReportingSectionNav } from '@/components/dashboard';

export default function RevenueRecognitionPage() {
  return (
    <>
      <PageHeader
        title="Revenue recognition"
        description="Map confirmed Solana settlements to accounting periods."
      />
      <div className="p-6 md:px-8 md:pb-8 max-w-[1400px] mx-auto space-y-6">
        <ReportingSectionNav />
        <BackendNotice notImplemented />
        <EmptyState
          icon={FileText}
          title="Revenue recognition"
          description="Available when billing and backend reporting are connected."
          action={{ label: 'Back to reports', href: '/dashboard/reporting' }}
        />
      </div>
    </>
  );
}

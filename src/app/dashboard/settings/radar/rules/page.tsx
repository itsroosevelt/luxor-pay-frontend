'use client';

import { PageHeader, BackendNotice, EmptyState, RadarSectionNav } from '@/components/dashboard';
import { Shield } from 'lucide-react';

export default function RadarRulesPage() {
  return (
    <>
      <PageHeader
        title="Radar"
        description="Create and manage fraud rules for Solana wallet and settlement risk."
      />
      <div className="p-6 md:px-8 md:pb-8 max-w-[1400px] mx-auto space-y-6 pb-12">
        <RadarSectionNav />
        <BackendNotice notImplemented />
        <EmptyState
          icon={Shield}
          title="No Radar rules yet"
          description="Define block, review, and allow rules for wallet velocity, cluster risk, and settlement patterns once backend integration is connected."
          action={{ label: 'View overview', href: '/dashboard/settings/radar' }}
        />
      </div>
    </>
  );
}

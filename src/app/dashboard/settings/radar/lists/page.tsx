'use client';

import { PageHeader, BackendNotice, EmptyState, RadarSectionNav } from '@/components/dashboard';
import { List } from 'lucide-react';

export default function RadarListsPage() {
  return (
    <>
      <PageHeader
        title="Radar"
        description="Allow and block lists for Solana wallet addresses and program IDs."
      />
      <div className="p-6 md:px-8 md:pb-8 max-w-[1400px] mx-auto space-y-6 pb-12">
        <RadarSectionNav />
        <BackendNotice notImplemented />
        <EmptyState
          icon={List}
          title="No Radar lists yet"
          description="Maintain trusted wallets, blocked addresses, and program allowlists for Luxor Pay screening."
          action={{ label: 'View overview', href: '/dashboard/settings/radar' }}
        />
      </div>
    </>
  );
}

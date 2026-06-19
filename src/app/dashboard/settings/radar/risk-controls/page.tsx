'use client';

import { PageHeader, BackendNotice, RadarSectionNav } from '@/components/dashboard';
import { RadarSettingsContent } from '@/components/dashboard/radar/RadarSettingsContent';

export default function RadarRiskControlsPage() {
  return (
    <>
      <PageHeader
        title="Radar"
        description="Configure Radar scoring, saved-wallet screening, and merchant risk controls on Solana."
      />
      <div className="p-6 md:px-8 md:pb-8 max-w-[1400px] mx-auto space-y-6 pb-12">
        <RadarSectionNav />
        <BackendNotice notImplemented />
        <RadarSettingsContent />
      </div>
    </>
  );
}

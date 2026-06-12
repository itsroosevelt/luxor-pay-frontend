'use client';

import { EmptyState } from '@/components/dashboard';
import { SettingsPageHeader } from '@/components/dashboard/settings';
import { Settings } from 'lucide-react';

interface SettingsPlaceholderContentProps {
  title: string;
  description: string;
}

export function SettingsPlaceholderContent({ title, description }: SettingsPlaceholderContentProps) {
  return (
    <>
      <SettingsPageHeader title={title} description={description} />
      <div className="p-6 md:px-8 md:pb-8 w-full pb-12">
        <EmptyState
          icon={Settings}
          title="Coming soon"
          description="This section will be available in a future release. In the meantime, use the active areas of the dashboard."
          action={{ label: 'Back to settings', href: '/dashboard/settings' }}
        />
      </div>
    </>
  );
}

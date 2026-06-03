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
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <EmptyState
          icon={Settings}
          title="Próximamente"
          description="Esta sección estará disponible en una próxima versión. Mientras tanto, usa las áreas ya activas del panel."
          action={{ label: 'Volver a configuración', href: '/dashboard/settings' }}
        />
      </div>
    </>
  );
}

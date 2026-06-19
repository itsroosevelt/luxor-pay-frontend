'use client';

import type { LucideIcon } from 'lucide-react';
import { PageHeader, EmptyState, BackendNotice } from '@/components/dashboard';

interface FeatureStubPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: { label: string; href: string };
}

export function FeatureStubPage({ title, description, icon, action }: FeatureStubPageProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="p-6 md:px-8 md:pb-8 w-full space-y-6 pb-12">
        <BackendNotice notImplemented />
        <EmptyState icon={icon} title={title} description={description} action={action} />
      </div>
    </>
  );
}

'use client';

import type { ReactNode } from 'react';
import { PageHeader } from '@/components/dashboard';
import { SettingsBackLink } from './SettingsBackLink';

interface SettingsPageHeaderProps {
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
}

export function SettingsPageHeader({ title, description, actions }: SettingsPageHeaderProps) {
  return (
    <PageHeader
      title={
        <span className="block space-y-1">
          <nav aria-label="Breadcrumb">
            <SettingsBackLink />
          </nav>
          <span className="block">{title}</span>
        </span>
      }
      description={description}
      actions={actions}
    />
  );
}

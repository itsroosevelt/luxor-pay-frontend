'use client';

import { PageHeader, SettingsTile } from '@/components/dashboard';
import { SETTINGS_SECTIONS } from '@/lib/dashboard/settings-sections';

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account, team, security, products, and Luxor Pay preferences."
      />

      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-10 pb-12">
        {SETTINGS_SECTIONS.map((section) => (
          <section key={section.id} aria-labelledby={`settings-section-${section.id}`}>
            <h2
              id={`settings-section-${section.id}`}
              className="text-xs font-semibold uppercase tracking-wider text-[var(--dash-muted)] mb-3"
            >
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.tiles.map((tile) => (
                <SettingsTile
                  key={tile.href}
                  href={tile.href}
                  title={tile.title}
                  description={tile.description}
                  icon={tile.icon}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

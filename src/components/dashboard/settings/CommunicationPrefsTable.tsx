'use client';

import type {
  CommunicationPrefsState,
  NotificationChannel,
  NotificationPrefSection,
} from '@/lib/dashboard/communication-prefs';
import { isChannelMandatory } from '@/lib/dashboard/communication-prefs';
import { NotificationCheckbox } from './NotificationCheckbox';

const CHANNEL_HEADERS: { key: NotificationChannel; label: string }[] = [
  { key: 'email', label: 'Correo electrónico' },
  { key: 'sms', label: 'SMS' },
  { key: 'push', label: 'Envío (push)' },
];

interface CommunicationPrefsTableProps {
  sections: NotificationPrefSection[];
  prefs: CommunicationPrefsState;
  onToggle: (rowId: string, channel: NotificationChannel, enabled: boolean) => void;
}

export function CommunicationPrefsTable({
  sections,
  prefs,
  onToggle,
}: CommunicationPrefsTableProps) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section key={section.id} aria-labelledby={`comm-section-${section.id}`}>
          <h2
            id={`comm-section-${section.id}`}
            className="text-sm font-semibold text-[var(--dash-text)] mb-3"
          >
            {section.title}
          </h2>
          <div className="dash-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--dash-border)] bg-[var(--dash-surface-elevated)]">
                    <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)] w-full min-w-[200px]">
                      &nbsp;
                    </th>
                    {CHANNEL_HEADERS.map((col) => (
                      <th
                        key={col.key}
                        className="px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)] whitespace-nowrap min-w-[120px]"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--dash-border)] last:border-b-0 hover:bg-[var(--dash-surface-elevated)] transition-colors"
                    >
                      <td className="px-5 py-3.5 text-[var(--dash-text)] align-middle">
                        {row.label}
                      </td>
                      {CHANNEL_HEADERS.map((col) => {
                        const mandatory = isChannelMandatory(row.id, col.key);
                        const checked = prefs[row.id]?.[col.key] ?? row.channels[col.key].enabled;
                        return (
                          <td key={col.key} className="px-5 py-3.5 text-center align-middle">
                            <div className="flex justify-center">
                              <NotificationCheckbox
                                checked={checked}
                                mandatory={mandatory}
                                disabled={mandatory}
                                label={`${row.label} — ${col.label}`}
                                onChange={(enabled) => onToggle(row.id, col.key, enabled)}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

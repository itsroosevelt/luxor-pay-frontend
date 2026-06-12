'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import { EmptyState } from '@/components/dashboard';
import {
  CommunicationPrefsTable,
  SettingsPageHeader,
  SettingsTabBar,
} from '@/components/dashboard/settings';
import {
  ACCOUNT_NOTIFICATION_SECTIONS,
  COMMUNICATION_TABS,
  type CommunicationTabId,
  type NotificationChannel,
  getCommunicationPrefsServerSnapshot,
  getCommunicationPrefsSnapshot,
  saveCommunicationPrefs,
} from '@/lib/dashboard/communication-prefs';
import { Bell } from 'lucide-react';

const PREFS_CHANGE_EVENT = 'luxor-communication-prefs-change';

function subscribeToPrefs(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(PREFS_CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(PREFS_CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export default function CommunicationPreferencesPage() {
  const [activeTab, setActiveTab] = useState<CommunicationTabId>('cuenta');
  const prefs = useSyncExternalStore(
    subscribeToPrefs,
    getCommunicationPrefsSnapshot,
    getCommunicationPrefsServerSnapshot
  );
  const businessName = 'your account';

  const handleToggle = useCallback(
    (rowId: string, channel: NotificationChannel, enabled: boolean) => {
      const next = {
        ...prefs,
        [rowId]: { ...prefs[rowId], [channel]: enabled },
      };
      saveCommunicationPrefs(next);
      window.dispatchEvent(new Event(PREFS_CHANGE_EVENT));
    },
    [prefs]
  );

  return (
    <>
      <SettingsPageHeader
        title="Communication preferences"
        description={`Your communication preferences will only apply to ${businessName}.`}
      />

      <div className="px-6 md:px-8 border-b border-[var(--dash-border)]">
        <SettingsTabBar
          tabs={COMMUNICATION_TABS}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as CommunicationTabId)}
        />
      </div>

      <div className="p-6 md:p-8 max-w-4xl mx-auto pb-12">
        {activeTab === 'cuenta' && (
          <div role="tabpanel" id="comm-panel-cuenta" aria-labelledby="comm-tab-cuenta">
            <CommunicationPrefsTable
              sections={ACCOUNT_NOTIFICATION_SECTIONS}
              prefs={prefs}
              onToggle={handleToggle}
            />
          </div>
        )}

        {activeTab !== 'cuenta' && (
          <div
            role="tabpanel"
            id={`comm-panel-${activeTab}`}
            aria-labelledby={`comm-tab-${activeTab}`}
          >
            <EmptyState
              icon={Bell}
              title="Coming soon"
              description="Preferences for this category will be available in a future release."
            />
          </div>
        )}
      </div>
    </>
  );
}

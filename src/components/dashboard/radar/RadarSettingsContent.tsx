'use client';

import { useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  SettingsSection,
  SettingsSectionRow,
} from '@/components/dashboard/settings';
import { dashStatusBadges } from '@/lib/dashboard/dashboard-styles';
import {
  getRadarSettingsServerSnapshot,
  getRadarSettingsSnapshot,
  RADAR_SETTINGS_CHANGE_EVENT,
  setSavedPaymentMethodsRadarEnabled,
} from '@/lib/dashboard/radar-settings';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';

function subscribeToRadarSettings(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(RADAR_SETTINGS_CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(RADAR_SETTINGS_CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function RadarSettingsContent() {
  const settings = useSyncExternalStore(
    subscribeToRadarSettings,
    getRadarSettingsSnapshot,
    getRadarSettingsServerSnapshot
  );

  const dispatchChange = useCallback(() => {
    window.dispatchEvent(new Event(RADAR_SETTINGS_CHANGE_EVENT));
  }, []);

  const handleToggleSavedMethods = () => {
    const next = !settings.savedPaymentMethodsEnabled;
    setSavedPaymentMethodsRadarEnabled(next);
    dispatchChange();
    toast.success(
      next
        ? 'Radar enabled on saved wallets'
        : 'Radar disabled on saved wallets'
    );
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Your plan"
        description="Protect your business with Radar fraud detection tuned for on-chain payments."
        action={
          <Link
            href="/dashboard/settings/planes"
            className="dash-btn-secondary px-4 py-2 text-sm whitespace-nowrap"
          >
            Manage plans
          </Link>
        }
      >
        <SettingsSectionRow
          label="Radar for Fraud Teams"
          description="Advanced rules, team workflows, and review queues for high-volume merchants."
        >
          <div className="space-y-3">
            <p className="text-sm text-[var(--dash-text)]">
              Your account is eligible for a{' '}
              <span className="font-medium">free trial</span> of Radar for Fraud Teams.
            </p>
            <span className={dashStatusBadges.neutral}>Standard Radar included</span>
          </div>
        </SettingsSectionRow>
      </SettingsSection>

      <SettingsSection title="Checkout sessions">
        <SettingsSectionRow
          label="Use Radar on saved wallets"
          description="Apply Radar scoring when customers pay with saved wallets or recurring authorizations, not only one-off checkout."
        >
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleToggleSavedMethods}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                settings.savedPaymentMethodsEnabled
                  ? 'dash-btn-secondary'
                  : 'dash-btn-primary'
              )}
            >
              {settings.savedPaymentMethodsEnabled ? 'Deactivate' : 'Activate'}
            </button>
            {settings.savedPaymentMethodsEnabled && (
              <span className={dashStatusBadges.success}>Active</span>
            )}
          </div>
        </SettingsSectionRow>
      </SettingsSection>

      <SettingsSection
        title="Rule history"
        description="Review when Radar rules blocked, flagged, or allowed high-risk Solana payments."
        action={
          <Link
            href="/dashboard/settings/equipo?tab=historial"
            className="dash-btn-secondary px-4 py-2 text-sm whitespace-nowrap"
          >
            View security history
          </Link>
        }
      >
        <div className="px-5 py-4 text-sm text-[var(--dash-muted)] leading-relaxed">
          Rule evaluations and manual reviews will appear in your team security history once backend
          integration is connected. Until then, use transaction filters to inspect failed and
          expired payments.
        </div>
      </SettingsSection>
    </div>
  );
}

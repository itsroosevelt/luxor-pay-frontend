'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import {
  ApiKeysPanel,
  PreferenceToggleGroup,
  SettingsPageHeader,
  SettingsSection,
  SettingsSectionRow,
} from '@/components/dashboard/settings';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchant-data';
import {
  getDeveloperPrefsServerSnapshot,
  getDeveloperPrefsSnapshot,
  saveSdkLanguage,
  saveWorkbenchTheme,
  SDK_LANGUAGE_OPTIONS,
  WORKBENCH_THEME_OPTIONS,
  type SdkLanguageId,
  type WorkbenchTheme,
} from '@/lib/dashboard/developer-prefs';
import { cn } from '@/lib/cn';
import { Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const DEVELOPER_PREFS_CHANGE_EVENT = 'luxor-developer-prefs-change';

function subscribeToDeveloperPrefs(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(DEVELOPER_PREFS_CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(DEVELOPER_PREFS_CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

function scrollToApiKeys() {
  document.getElementById('api-keys')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function DevelopersPage() {
  const [businessName, setBusinessName] = useState('your business');
  const prefs = useSyncExternalStore(
    subscribeToDeveloperPrefs,
    getDeveloperPrefsSnapshot,
    getDeveloperPrefsServerSnapshot
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const profile = await getMerchantProfile(user.uid);
        if (profile?.businessName?.trim()) {
          setBusinessName(profile.businessName.trim());
        }
      } catch {
        /* keep fallback label */
      }
    });
    return () => unsubscribe();
  }, []);

  const dispatchPrefsChange = useCallback(() => {
    window.dispatchEvent(new Event(DEVELOPER_PREFS_CHANGE_EVENT));
  }, []);

  const handleThemeChange = (theme: WorkbenchTheme) => {
    saveWorkbenchTheme(theme);
    dispatchPrefsChange();
    toast.success('Workbench appearance saved');
  };

  const handleSdkChange = (language: SdkLanguageId) => {
    saveSdkLanguage(language);
    dispatchPrefsChange();
    toast.success('SDK language saved');
  };

  return (
    <>
      <SettingsPageHeader
        title="Developers"
        description="Manage API keys, Workbench preferences, and SDK settings for your Luxor Pay integration."
      />

      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6 pb-12">
        <SettingsSection
          title="API keys"
          description="API keys can be managed from the Developers area."
        >
          <div className="px-5 py-4">
            <button
              type="button"
              onClick={scrollToApiKeys}
              className="dash-btn-secondary inline-flex items-center gap-1.5 px-4 py-2 text-sm"
            >
              Manage API keys
            </button>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Workbench"
          description="Debug, manage, and grow your Solana payment integration with Luxor Pay Workbench."
        >
          <SettingsSectionRow label="Status">
            <p className="text-[var(--dash-text)]">
              Workbench is enabled for{' '}
              <span className="font-medium">{businessName}</span>
            </p>
          </SettingsSectionRow>

          <div className="px-5 md:px-6 py-6 border-b border-[var(--dash-border)] flex flex-wrap gap-4">
            <a
              href="https://docs.luxorpay.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
            >
              Read documentation
              <ExternalLink size={14} aria-hidden />
            </a>
            <button
              type="button"
              onClick={() => toast.message('Legacy Workbench is not available yet')}
              className="text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
            >
              Return to legacy version
            </button>
          </div>

          <SettingsSectionRow
            label="Appearance"
            description="Choose how Workbench looks for you."
          >
            <PreferenceToggleGroup
              ariaLabel="Workbench appearance"
              options={WORKBENCH_THEME_OPTIONS}
              value={prefs.theme}
              onChange={handleThemeChange}
            />
          </SettingsSectionRow>
        </SettingsSection>

        <SettingsSection
          title="SDK language"
          description="Choose the language for Luxor Pay code samples and documentation snippets."
        >
          <div className="px-5 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SDK_LANGUAGE_OPTIONS.map((opt) => {
                const selected = prefs.sdk === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSdkChange(opt.id)}
                    aria-pressed={selected}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                      selected
                        ? 'border-[var(--dash-accent)] bg-[var(--dash-accent-soft)]'
                        : 'border-[var(--dash-border)] hover:border-[var(--dash-muted)]'
                    )}
                  >
                    <span
                      className="w-9 h-9 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 text-white"
                      style={{
                        backgroundColor:
                          opt.id === 'none' ? 'var(--dash-border)' : opt.accent,
                        color: opt.id === 'none' ? 'var(--dash-muted)' : '#fff',
                      }}
                    >
                      {opt.initials}
                    </span>
                    <span className="text-sm font-medium text-[var(--dash-text)] flex-1 min-w-0">
                      {opt.label}
                    </span>
                    {selected && (
                      <Check size={16} className="text-[var(--dash-accent)] shrink-0" aria-hidden />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </SettingsSection>

        <div id="api-keys" className="scroll-mt-6">
          <ApiKeysPanel />
        </div>
      </div>
    </>
  );
}

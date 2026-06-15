'use client';

import { useState } from 'react';
import {
  MerchantWalletSection,
  SettingsPageHeader,
  SettingsRow,
  SettingsSection,
  SettingsTable,
} from '@/components/dashboard/settings';
import { LANGUAGE_OPTIONS } from '@/lib/dashboard/personal-settings-mock';
import type {
  AccountRow,
  PasskeyRow,
  SessionRow,
  TwoFactorMethod,
} from '@/lib/dashboard/personal-settings-mock';
import { dashStatusBadges } from '@/lib/dashboard/dashboard-styles';
import { Globe, KeyRound, Plus } from 'lucide-react';
import { toast } from 'sonner';

function SettingsLinkButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick ?? (() => toast.message('Available soon'))}
      className="text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
    >
      {children}
    </button>
  );
}

function SettingsOutlineButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick ?? (() => toast.message('Available soon'))}
      className="dash-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-sm"
    >
      {children}
    </button>
  );
}

export default function SettingsProfilePage() {
  const [language, setLanguage] = useState('auto');
  const [savingLanguage, setSavingLanguage] = useState(false);

  const handleSaveLanguage = async () => {
    setSavingLanguage(true);
    await new Promise((r) => setTimeout(r, 400));
    toast.success('Language preference saved');
    setSavingLanguage(false);
  };

  return (
    <>
      <SettingsPageHeader
        title={
          <span className="inline-flex flex-wrap items-center gap-2.5">
            Personal details
            <span className={dashStatusBadges.neutral}>Global environment</span>
          </span>
        }
        description="Contact information, password, authentication methods, and active sessions."
      />

      <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto space-y-6 pb-12">
        <SettingsSection
          title="User"
          action={<SettingsOutlineButton>Edit</SettingsOutlineButton>}
        >
          <SettingsRow label="Name">
            <span className="text-[var(--dash-muted)]">Not configured</span>
          </SettingsRow>
          <SettingsRow label="Password">
            <span className="text-[var(--dash-muted)]">Not set</span>
          </SettingsRow>
          <SettingsRow label="Email">
            <span className="text-[var(--dash-muted)]">Not configured</span>
          </SettingsRow>
          <SettingsRow
            label="Backup email"
            action={<SettingsLinkButton>Add</SettingsLinkButton>}
          >
            <span className="text-[var(--dash-muted)]">Not set</span>
          </SettingsRow>
          <SettingsRow
            label="Contact phone"
            action={<SettingsLinkButton>Add</SettingsLinkButton>}
          >
            <span className="text-[var(--dash-muted)]">Not set</span>
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="Google account">
          <div className="px-5 py-4">
            <p className="text-sm text-[var(--dash-muted)] mb-3">Not connected</p>
            <SettingsOutlineButton>Connect Google account</SettingsOutlineButton>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Passkeys"
          description="Passkeys let you sign in securely with fingerprint, face recognition, or device PIN."
          footer={
            <button
              type="button"
              onClick={() => toast.message('Available soon')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
            >
              <Plus size={16} />
              Add a passkey
            </button>
          }
        >
          <SettingsTable
            columns={[
              { key: 'name', header: 'Name', render: (row) => row.name },
              { key: 'added', header: 'Date added', render: (row) => row.addedAt },
              {
                key: 'lastUsed',
                header: 'Last used',
                render: (row) => row.lastUsed,
              },
            ]}
            data={[] as PasskeyRow[]}
            rowKey={(row) => row.id}
            emptyMessage="You have no passkeys registered."
          />
        </SettingsSection>

        <SettingsSection
          title="Two-step authentication"
          description="Protect your account with a second factor in addition to your password."
          footer={
            <button
              type="button"
              onClick={() => toast.message('Available soon')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
            >
              <Plus size={16} />
              Add an authentication method
            </button>
          }
        >
          <SettingsTable
            columns={[
              {
                key: 'method',
                header: 'Method',
                render: (row) => row.label,
              },
              {
                key: 'detail',
                header: 'Detail',
                render: (row) => (
                  <span className="text-[var(--dash-muted)]">{row.detail}</span>
                ),
              },
            ]}
            data={[] as TwoFactorMethod[]}
            rowKey={(row) => row.id}
            emptyMessage="No authentication methods configured."
          />
          <div className="px-5 py-4 border-t border-[var(--dash-border)] flex items-start gap-3">
            <KeyRound size={16} className="text-[var(--dash-muted)] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-[var(--dash-text)]">Backup codes</p>
              <p className="text-sm text-[var(--dash-muted)] mt-0.5">
                No backup codes generated.
              </p>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Language">
          <div className="px-5 py-4 space-y-4">
            <div>
              <label
                htmlFor="language-select"
                className="text-sm font-medium text-[var(--dash-text)] block mb-1.5"
              >
                Dashboard language
              </label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="dash-input w-full max-w-xs px-4 py-2.5 text-sm"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-[var(--dash-muted)] inline-flex items-center gap-1.5">
              <Globe size={14} aria-hidden />
              Detected language: English (US)
            </p>
            <button
              type="button"
              onClick={handleSaveLanguage}
              disabled={savingLanguage}
              className="dash-btn-primary px-5 py-2 text-sm disabled:opacity-50"
            >
              {savingLanguage ? 'Saving…' : 'Save'}
            </button>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Sessions"
          description="Devices where you have recently signed in."
          action={
            <SettingsOutlineButton>Sign out of other sessions</SettingsOutlineButton>
          }
        >
          <SettingsTable
            columns={[
              { key: 'location', header: 'Location', render: (row) => row.location },
              { key: 'device', header: 'Device', render: (row) => row.device },
              {
                key: 'ip',
                header: 'IP address',
                render: (row) => (
                  <span className="font-mono text-xs text-[var(--dash-muted)]">{row.ip}</span>
                ),
              },
              {
                key: 'lastActive',
                header: 'Last activity',
                render: (row) => row.lastActive,
              },
            ]}
            data={[] as SessionRow[]}
            rowKey={(row) => row.id}
            emptyMessage="No active sessions recorded."
          />
        </SettingsSection>

        <SettingsSection title="Accounts">
          <SettingsTable
            columns={[
              { key: 'name', header: 'Name', render: (row) => row.name },
              {
                key: 'accountId',
                header: 'ID',
                render: (row) => (
                  <span className="font-mono text-xs text-[var(--dash-muted)]">
                    {row.accountId}
                  </span>
                ),
              },
            ]}
            data={[] as AccountRow[]}
            rowKey={(row) => row.id}
            emptyMessage="No linked accounts."
          />
        </SettingsSection>

        <MerchantWalletSection />
      </div>
    </>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { EmptyState } from '@/components/dashboard';
import {
  SettingsPageHeader,
  SettingsRow,
  SettingsSection,
  SettingsSectionRow,
  SettingsTabBar,
  SettingsTable,
  type SettingsTableColumn,
} from '@/components/dashboard/settings';
import {
  ACCOUNT_STATUS_ITEMS,
  EMPRESA_MORE_TABS,
  EMPRESA_PRIMARY_TABS,
  PAYOUT_SCHEDULE_LABELS,
  TIMEZONE_OPTIONS,
  buildDefaultLuxorWalletBalances,
  buildEmptyBusinessAccountForm,
  buildEmptyBusinessOwner,
  buildEmptyCompanyData,
  buildEmptyPublicData,
  buildEmptyTaxData,
  displayValue,
  formatOwnerAddress,
  formatSupportAddress,
  isBusinessMoreTab,
  isBusinessPrimaryTab,
  loadAccountRepresentativeId,
  loadAccountStatus,
  loadBankAccountsSettings,
  loadBusinessAccountForm,
  loadBusinessOwners,
  loadCompanyData,
  loadExternalAccountsSettings,
  loadPublicData,
  loadTaxData,
  saveAccountRepresentativeId,
  saveBusinessAccountForm,
  saveBusinessOwners,
  saveCompanyData,
  saveExternalAccountsSettings,
  savePublicData,
  saveTaxData,
  type AccountStatusCapabilities,
  type BankAccountsSettings,
  type BusinessAccountFormData,
  type BusinessOwner,
  type CompanyBusinessData,
  type BusinessTabId,
  type ExternalAccountsSettings,
  type LuxorWalletBalance,
  type PayoutCurrencyRow,
  type PublicBusinessData,
  type TaxBusinessData,
} from '@/lib/dashboard/business-account-settings';
import { dashStatusBadges } from '@/lib/dashboard/dashboard-styles';
import { cn } from '@/lib/cn';
import {
  AlertTriangle,
  Building2,
  Check,
  ChevronDown,
  Copy,
  Info,
  Link2,
  MoreHorizontal,
  Palette,
  Plus,
  Shield,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';

const ALL_EMPRESA_TABS = [...EMPRESA_PRIMARY_TABS, ...EMPRESA_MORE_TABS];

function SettingsOutlineButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick ?? (() => toast.message('Available soon'))}
      disabled={disabled}
      className="dash-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-sm disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function SettingsInfoCallout({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-elevated)] px-4 py-3">
      <Info size={18} className="shrink-0 text-[var(--dash-accent)] mt-0.5" aria-hidden />
      <div className="min-w-0 space-y-2 text-sm text-[var(--dash-muted)] leading-relaxed">
        <div>{children}</div>
        {action}
      </div>
    </div>
  );
}

function SettingsToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors',
        checked
          ? 'border-[var(--dash-accent)] bg-[var(--dash-accent)]'
          : 'border-[var(--dash-border)] bg-[var(--dash-surface-elevated)]'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

function CopyAccountIdButton({ accountId }: { accountId: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!accountId.trim()) return;
    try {
      await navigator.clipboard.writeText(accountId);
      setCopied(true);
      toast.success('ID copied to clipboard');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy ID');
    }
  };

  return (
    <div className="flex items-center gap-2 max-w-md">
      <code className="flex-1 text-sm font-mono text-[var(--dash-muted)] bg-[var(--dash-surface-elevated)] border border-[var(--dash-border)] rounded-md px-3 py-2 truncate min-h-[42px] flex items-center">
        {accountId.trim() ? accountId : 'Generated on save'}
      </code>
      <button
        type="button"
        onClick={() => void copy()}
        disabled={!accountId.trim()}
        className="shrink-0 p-2 rounded-md border border-[var(--dash-border)] text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Copy account ID"
      >
        {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
      </button>
    </div>
  );
}

function AccountDataForm({
  form,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  form: BusinessAccountFormData;
  onChange: (patch: Partial<BusinessAccountFormData>) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-6">
      <form
        className="dash-card p-6 md:p-8 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
      >
        <div className="space-y-1.5">
          <label htmlFor="account-name" className="text-sm font-medium text-[var(--dash-text)]">
            Account name
          </label>
          <input
            id="account-name"
            type="text"
            value={form.accountName}
            onChange={(e) => onChange({ accountName: e.target.value })}
            placeholder="Account name"
            className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-[var(--dash-text)]">Account ID</span>
          <CopyAccountIdButton accountId={form.accountId} />
        </div>

        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-[var(--dash-text)]">Business address</legend>
          <input
            type="text"
            value={form.addressLine1}
            onChange={(e) => onChange({ addressLine1: e.target.value })}
            placeholder="Street address"
            className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            aria-label="Street address"
          />
          <input
            type="text"
            value={form.addressLine2}
            onChange={(e) => onChange({ addressLine2: e.target.value })}
            placeholder="Apartment, suite, unit, etc. (optional)"
            className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            aria-label="Address line 2"
          />
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
            <input
              type="text"
              value={form.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="City"
              className="dash-input flex-1 px-4 py-2.5 text-sm"
              aria-label="City"
            />
            <input
              type="text"
              value={form.state}
              onChange={(e) => onChange({ state: e.target.value })}
              placeholder="State / province / jurisdiction"
              className="dash-input sm:w-40 px-4 py-2.5 text-sm"
              aria-label="State or jurisdiction"
            />
            <input
              type="text"
              value={form.zip}
              onChange={(e) => onChange({ zip: e.target.value })}
              placeholder="ZIP code"
              className="dash-input sm:w-32 px-4 py-2.5 text-sm"
              aria-label="ZIP code"
            />
          </div>
        </fieldset>

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-[var(--dash-text)]">Phone verification</span>
          {form.phoneVerified ? (
            <div className="space-y-2">
              <span className={dashStatusBadges.success}>Verified</span>
              {form.phone && (
                <p className="text-sm text-[var(--dash-muted)]">{form.phone}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <span className={dashStatusBadges.neutral}>Not verified</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => onChange({ phone: e.target.value, phoneVerified: false })}
                placeholder="Phone number"
                className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
                aria-label="Phone number"
              />
              <p className="text-sm text-[var(--dash-muted)]">
                Add a number and verify your phone to protect your account.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="timezone" className="text-sm font-medium text-[var(--dash-text)]">
            Time zone
          </label>
          <select
            id="timezone"
            value={form.timezone}
            onChange={(e) => onChange({ timezone: e.target.value })}
            className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
          >
            <option value="">Select a time zone</option>
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="dash-btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="dash-btn-secondary px-5 py-2.5 text-sm disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>

      <SettingsSection
        title="Close account"
        description="Closing your account is permanent. You will lose access to payment history, balances, and API keys."
      >
        <div className="px-5 py-4 space-y-4">
          <SettingsInfoCallout>
            <p>
              Before closing, transfer any remaining balance and download records you may need for
              tax or compliance purposes.
            </p>
          </SettingsInfoCallout>
          <button
            type="button"
            onClick={() => toast.error('Account closure request received. Our team will contact you.')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <AlertTriangle size={16} aria-hidden />
            Close account
          </button>
        </div>
      </SettingsSection>
    </div>
  );
}

function CompanyDataSection({
  data,
  editing,
  onEdit,
  onCancel,
  onChange,
  onSave,
  saving,
}: {
  data: CompanyBusinessData;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onChange: (patch: Partial<CompanyBusinessData>) => void;
  onSave: () => void;
  saving: boolean;
}) {
  if (editing) {
    return (
      <SettingsSection
        title="Company details"
        action={
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
          >
            Cancel
          </button>
        }
      >
        <form
          className="px-5 py-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <div className="space-y-1.5">
            <label htmlFor="company-name" className="text-sm font-medium text-[var(--dash-text)]">
              Company name
            </label>
            <input
              id="company-name"
              type="text"
              value={data.companyName}
              onChange={(e) => onChange({ companyName: e.target.value })}
              placeholder="Legal company name"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="website" className="text-sm font-medium text-[var(--dash-text)]">
              Website
            </label>
            <input
              id="website"
              type="url"
              value={data.website}
              onChange={(e) => onChange({ website: e.target.value })}
              placeholder="https://"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="public-name" className="text-sm font-medium text-[var(--dash-text)]">
              Public company name
            </label>
            <input
              id="public-name"
              type="text"
              value={data.publicName}
              onChange={(e) => onChange({ publicName: e.target.value })}
              placeholder="Name visible to customers"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-[var(--dash-text)]">Address</legend>
            <input
              type="text"
              value={data.addressLine1}
              onChange={(e) => onChange({ addressLine1: e.target.value })}
              placeholder="Address line 1"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
            <input
              type="text"
              value={data.addressLine2}
              onChange={(e) => onChange({ addressLine2: e.target.value })}
              placeholder="Address line 2 (optional)"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <input
                type="text"
                value={data.city}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="City"
                className="dash-input flex-1 px-4 py-2.5 text-sm"
              />
              <input
                type="text"
                value={data.state}
                onChange={(e) => onChange({ state: e.target.value })}
                placeholder="State / province"
                className="dash-input sm:w-40 px-4 py-2.5 text-sm"
              />
              <input
                type="text"
                value={data.zip}
                onChange={(e) => onChange({ zip: e.target.value })}
                placeholder="Postal code"
                className="dash-input sm:w-32 px-4 py-2.5 text-sm"
              />
            </div>
            <input
              type="text"
              value={data.country}
              onChange={(e) => onChange({ country: e.target.value })}
              placeholder="Country"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </fieldset>
          <button
            type="submit"
            disabled={saving}
            className="dash-btn-primary px-5 py-2 text-sm disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title="Company details"
      action={<SettingsOutlineButton onClick={onEdit}>Edit</SettingsOutlineButton>}
    >
      <div className="px-5 py-3 border-b border-[var(--dash-border)]">
        <p className="text-base font-semibold text-[var(--dash-text)]">
          {displayValue(data.companyName)}
        </p>
      </div>
      <SettingsRow label="Website">{displayValue(data.website)}</SettingsRow>
      <SettingsRow label="Public company name">{displayValue(data.publicName)}</SettingsRow>
      <SettingsRow label="Address">
        {data.addressLine1.trim() ||
        data.city.trim() ||
        data.state.trim() ||
        data.zip.trim() ||
        data.country.trim() ? (
          <span className="block space-y-0.5 text-[var(--dash-text)]">
            {data.addressLine1.trim() && <span className="block">{data.addressLine1}</span>}
            {data.addressLine2.trim() && <span className="block">{data.addressLine2}</span>}
            {(data.city.trim() || data.state.trim() || data.zip.trim()) && (
              <span className="block">
                {[data.city, data.state, data.zip].filter((v) => v.trim()).join(', ')}
              </span>
            )}
            {data.country.trim() && <span className="block">{data.country}</span>}
          </span>
        ) : (
          '—'
        )}
      </SettingsRow>
      <SettingsRow label="Other information">
        {data.otherInfo.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 text-[var(--dash-text)]">
            {data.otherInfo.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : (
          <span className="text-[var(--dash-muted)]">No additional information</span>
        )}
      </SettingsRow>
    </SettingsSection>
  );
}

function PublicDataSection({
  data,
  editing,
  onEdit,
  onCancel,
  onChange,
  onSave,
  saving,
}: {
  data: PublicBusinessData;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onChange: (patch: Partial<PublicBusinessData>) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const supportAddress = formatSupportAddress(data);

  if (editing) {
    return (
      <SettingsSection
        title="Public details"
        description="Customer support information shown on receipts and customer communications."
        action={
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
          >
            Cancel
          </button>
        }
      >
        <form
          className="px-5 py-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <p className="text-sm font-medium text-[var(--dash-text)]">Customer support information</p>
          <div className="space-y-1.5">
            <label htmlFor="public-legal-name" className="text-sm font-medium text-[var(--dash-text)]">
              Legal name
            </label>
            <input
              id="public-legal-name"
              type="text"
              value={data.legalName}
              onChange={(e) => onChange({ legalName: e.target.value })}
              placeholder="Legal business name"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="public-company-name" className="text-sm font-medium text-[var(--dash-text)]">
              Company name
            </label>
            <input
              id="public-company-name"
              type="text"
              value={data.companyName}
              onChange={(e) => onChange({ companyName: e.target.value })}
              placeholder="Name shown to customers"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-[var(--dash-text)]">Support address</legend>
            <input
              type="text"
              value={data.supportAddressLine1}
              onChange={(e) => onChange({ supportAddressLine1: e.target.value })}
              placeholder="Address line 1"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
            <input
              type="text"
              value={data.supportAddressLine2}
              onChange={(e) => onChange({ supportAddressLine2: e.target.value })}
              placeholder="Address line 2 (optional)"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <input
                type="text"
                value={data.supportCity}
                onChange={(e) => onChange({ supportCity: e.target.value })}
                placeholder="City"
                className="dash-input flex-1 px-4 py-2.5 text-sm"
              />
              <input
                type="text"
                value={data.supportState}
                onChange={(e) => onChange({ supportState: e.target.value })}
                placeholder="State / province"
                className="dash-input sm:w-40 px-4 py-2.5 text-sm"
              />
              <input
                type="text"
                value={data.supportZip}
                onChange={(e) => onChange({ supportZip: e.target.value })}
                placeholder="Postal code"
                className="dash-input sm:w-32 px-4 py-2.5 text-sm"
              />
            </div>
            <input
              type="text"
              value={data.supportCountry}
              onChange={(e) => onChange({ supportCountry: e.target.value })}
              placeholder="Country"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </fieldset>
          <div className="space-y-1.5">
            <label htmlFor="support-phone" className="text-sm font-medium text-[var(--dash-text)]">
              Support phone
            </label>
            <input
              id="support-phone"
              type="tel"
              value={data.supportPhone}
              onChange={(e) => onChange({ supportPhone: e.target.value })}
              placeholder="+1 …"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="support-email" className="text-sm font-medium text-[var(--dash-text)]">
              Support email
            </label>
            <input
              id="support-email"
              type="email"
              value={data.supportEmail}
              onChange={(e) => onChange({ supportEmail: e.target.value })}
              placeholder="support@company.com"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="statement-descriptor" className="text-sm font-medium text-[var(--dash-text)]">
              On-chain transaction label
            </label>
            <input
              id="statement-descriptor"
              type="text"
              value={data.bankStatementDescriptor}
              onChange={(e) => onChange({ bankStatementDescriptor: e.target.value })}
              placeholder="LUXOR*PAYMENT"
              maxLength={22}
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
            <p className="text-xs text-[var(--dash-muted)]">
              Short label shown on Solana Pay receipts and customer notifications. Up to 22 characters.
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="dash-btn-primary px-5 py-2 text-sm disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title="Public details"
      description="Customer support information shown on receipts and customer communications."
      action={<SettingsOutlineButton onClick={onEdit}>Edit</SettingsOutlineButton>}
    >
      <div className="px-5 py-3 border-b border-[var(--dash-border)]">
        <p className="text-sm font-medium text-[var(--dash-text)]">Customer support information</p>
      </div>
      <SettingsRow label="Legal name">{displayValue(data.legalName)}</SettingsRow>
      <SettingsRow label="Company name">{displayValue(data.companyName)}</SettingsRow>
      <SettingsRow label="Support address">
        {supportAddress ? (
          <span className="block whitespace-pre-line text-[var(--dash-text)]">{supportAddress}</span>
        ) : (
          '—'
        )}
      </SettingsRow>
      <SettingsRow label="Support phone">{displayValue(data.supportPhone)}</SettingsRow>
      <SettingsRow label="Support email">{displayValue(data.supportEmail)}</SettingsRow>
      <SettingsRow label="On-chain transaction label">
        {displayValue(data.bankStatementDescriptor)}
      </SettingsRow>
    </SettingsSection>
  );
}

function OwnerProfileCard({
  owner,
  editing,
  onEdit,
  onCancel,
  onChange,
  onSave,
  saving,
}: {
  owner: BusinessOwner;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onChange: (patch: Partial<BusinessOwner>) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const address = formatOwnerAddress(owner);
  const rolesLabel = owner.roles.filter((r) => r.trim()).join(' · ') || 'Owner';

  if (editing) {
    return (
      <div className="px-5 py-4 border-b border-[var(--dash-border)] last:border-b-0">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-[var(--dash-text)]">Edit profile</p>
            <button
              type="button"
              onClick={onCancel}
              className="text-sm font-medium text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
            >
              Cancel
            </button>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--dash-text)]">Full name</label>
            <input
              type="text"
              value={owner.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Full legal name"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--dash-text)]">Roles</label>
            <input
              type="text"
              value={owner.roles.join(', ')}
              onChange={(e) =>
                onChange({
                  roles: e.target.value
                    .split(',')
                    .map((r) => r.trim())
                    .filter(Boolean),
                })
              }
              placeholder="Director, Owner"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--dash-text)]">Email</label>
            <input
              type="email"
              value={owner.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="name@company.com"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--dash-text)]">Date of birth</label>
            <input
              type="date"
              value={owner.dateOfBirth}
              onChange={(e) => onChange({ dateOfBirth: e.target.value })}
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-[var(--dash-text)]">Address</legend>
            <input
              type="text"
              value={owner.addressLine1}
              onChange={(e) => onChange({ addressLine1: e.target.value })}
              placeholder="Address line 1"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
            <input
              type="text"
              value={owner.addressLine2}
              onChange={(e) => onChange({ addressLine2: e.target.value })}
              placeholder="Address line 2 (optional)"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <input
                type="text"
                value={owner.city}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="City"
                className="dash-input flex-1 px-4 py-2.5 text-sm"
              />
              <input
                type="text"
                value={owner.state}
                onChange={(e) => onChange({ state: e.target.value })}
                placeholder="State / province"
                className="dash-input sm:w-40 px-4 py-2.5 text-sm"
              />
              <input
                type="text"
                value={owner.zip}
                onChange={(e) => onChange({ zip: e.target.value })}
                placeholder="Postal code"
                className="dash-input sm:w-32 px-4 py-2.5 text-sm"
              />
            </div>
            <input
              type="text"
              value={owner.country}
              onChange={(e) => onChange({ country: e.target.value })}
              placeholder="Country"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </fieldset>
          <button
            type="submit"
            disabled={saving}
            className="dash-btn-primary px-5 py-2 text-sm disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="px-5 py-4 border-b border-[var(--dash-border)] last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="text-base font-semibold text-[var(--dash-text)]">
            {displayValue(owner.name)}
          </p>
          <p className="text-sm text-[var(--dash-muted)]">{rolesLabel}</p>
        </div>
        <SettingsOutlineButton onClick={onEdit}>Edit</SettingsOutlineButton>
      </div>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-[var(--dash-muted)]">Email</dt>
          <dd className="text-[var(--dash-text)] mt-0.5">{displayValue(owner.email)}</dd>
        </div>
        <div>
          <dt className="text-[var(--dash-muted)]">Date of birth</dt>
          <dd className="text-[var(--dash-text)] mt-0.5">
            {owner.dateOfBirth.trim()
              ? new Date(`${owner.dateOfBirth}T00:00:00`).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--dash-muted)]">Address</dt>
          <dd className="text-[var(--dash-text)] mt-0.5 whitespace-pre-line">
            {address || '—'}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function DirectorsAndOwnersSection({
  owners,
  representativeId,
  editingOwnerId,
  savingOwner,
  onChooseRepresentative,
  onAddOwner,
  onEditOwner,
  onCancelEditOwner,
  onChangeOwner,
  onSaveOwner,
}: {
  owners: BusinessOwner[];
  representativeId: string | null;
  editingOwnerId: string | null;
  savingOwner: boolean;
  onChooseRepresentative: () => void;
  onAddOwner: () => void;
  onEditOwner: (ownerId: string) => void;
  onCancelEditOwner: () => void;
  onChangeOwner: (ownerId: string, patch: Partial<BusinessOwner>) => void;
  onSaveOwner: (ownerId: string) => void;
}) {
  const representative = owners.find((owner) => owner.id === representativeId);

  return (
    <SettingsSection
      title="Directors and owners"
      description="People with significant control or ownership of the company."
      footer={
        <button
          type="button"
          onClick={onAddOwner}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
        >
          <Plus size={16} />
          Add an owner
        </button>
      }
    >
      <div className="px-5 py-4 border-b border-[var(--dash-border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--dash-text)]">Account representative</p>
          {representative ? (
            <p className="text-sm text-[var(--dash-muted)] mt-1">
              {representative.name.trim() || 'Unnamed representative'}
            </p>
          ) : (
            <p className="text-sm text-[var(--dash-muted)] mt-1">
              The person authorized to act on behalf of the company with Luxor Pay.
            </p>
          )}
        </div>
        <SettingsOutlineButton onClick={onChooseRepresentative}>Choose</SettingsOutlineButton>
      </div>

      {owners.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-[var(--dash-muted)]">
            No directors or owners registered.
          </p>
        </div>
      ) : (
        owners.map((owner) => (
          <OwnerProfileCard
            key={owner.id}
            owner={owner}
            editing={editingOwnerId === owner.id}
            onEdit={() => onEditOwner(owner.id)}
            onCancel={onCancelEditOwner}
            onChange={(patch) => onChangeOwner(owner.id, patch)}
            onSave={() => onSaveOwner(owner.id)}
            saving={savingOwner}
          />
        ))
      )}
    </SettingsSection>
  );
}

function AccountStatusCard({
  title,
  enabled,
  description,
}: {
  title: string;
  enabled: boolean;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--dash-border)] p-4 bg-[var(--dash-surface)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--dash-text)]">{title}</p>
          <p className="text-sm text-[var(--dash-muted)] mt-1 leading-relaxed">{description}</p>
        </div>
        <span className={enabled ? dashStatusBadges.success : dashStatusBadges.neutral}>
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>
    </div>
  );
}

function AccountStatusTab({ status }: { status: AccountStatusCapabilities }) {
  const verificationBadge =
    status.verificationStatus === 'verified'
      ? dashStatusBadges.success
      : status.verificationStatus === 'pending'
        ? dashStatusBadges.warning
        : dashStatusBadges.neutral;

  const verificationLabel =
    status.verificationStatus === 'verified'
      ? 'Verified'
      : status.verificationStatus === 'pending'
        ? 'Pending review'
        : 'Unverified';

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Account status"
        description="Capabilities and verification for your Luxor Pay merchant account on Solana."
      >
        <SettingsSectionRow label="Verification">
          <span className={verificationBadge}>{verificationLabel}</span>
        </SettingsSectionRow>
        <SettingsSectionRow label="Restrictions">
          {status.restrictions.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {status.restrictions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <span className="text-[var(--dash-muted)]">None</span>
          )}
        </SettingsSectionRow>
      </SettingsSection>

      <SettingsSection title="Capabilities">
        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACCOUNT_STATUS_ITEMS.map((item) => (
            <AccountStatusCard
              key={item.key}
              title={item.title}
              enabled={status[item.key]}
              description={item.description}
            />
          ))}
        </div>
      </SettingsSection>
    </div>
  );
}

function ExternalAccountsTab({
  settings,
  onChange,
  onGoToBankAccounts,
}: {
  settings: ExternalAccountsSettings;
  onChange: (next: ExternalAccountsSettings) => void;
  onGoToBankAccounts: () => void;
}) {
  const handleAddAccount = () => {
    toast.message('Connect a Solana wallet to link external analytics — coming soon');
  };

  const handleRemoveAccount = (id: string) => {
    const next = { ...settings, accounts: settings.accounts.filter((a) => a.id !== id) };
    onChange(next);
    saveExternalAccountsSettings(next);
    toast.message('Linked account removed');
  };

  const toggleDataUsage = (productId: ExternalAccountsSettings['dataUsage'][number]['productId']) => {
    const next = {
      ...settings,
      dataUsage: settings.dataUsage.map((entry) =>
        entry.productId === productId ? { ...entry, enabled: !entry.enabled } : entry
      ),
    };
    onChange(next);
    saveExternalAccountsSettings(next);
  };

  const toggleAllowNewProducts = (checked: boolean) => {
    const next = { ...settings, allowNewProducts: checked };
    onChange(next);
    saveExternalAccountsSettings(next);
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Linked Solana wallets"
        description="Optional read-only wallet connections for treasury analytics and reconciliation."
        footer={
          <button
            type="button"
            onClick={handleAddAccount}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
          >
            <Plus size={16} />
            Connect wallet
          </button>
        }
      >
        {settings.accounts.length === 0 ? (
          <div className="px-5 py-10 text-center space-y-3">
            <Wallet size={28} className="mx-auto text-[var(--dash-muted)]" aria-hidden />
            <p className="text-sm text-[var(--dash-muted)]">
              No linked wallets yet. Connect a Solana wallet for analytics when backend integration is
              available.
            </p>
          </div>
        ) : (
          settings.accounts.map((account) => (
            <div
              key={account.id}
              className="px-5 py-4 border-b border-[var(--dash-border)] last:border-b-0 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--dash-text)]">{account.displayName}</p>
                <p className="text-sm text-[var(--dash-muted)] mt-0.5">
                  {account.provider} · {account.accountHint}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <SettingsOutlineButton
                  onClick={() => toast.message(`Manage ${account.displayName}`)}
                >
                  Manage
                </SettingsOutlineButton>
                <button
                  type="button"
                  onClick={() => handleRemoveAccount(account.id)}
                  className="text-sm text-[var(--dash-muted)] hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </SettingsSection>

      <SettingsInfoCallout
        action={
          <button
            type="button"
            onClick={onGoToBankAccounts}
            className="text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
          >
            Go to Payout wallets & currencies
          </button>
        }
      >
        Looking for payout destinations? Configure your merchant wallet and settlement currencies on the{' '}
        <span className="text-[var(--dash-text)]">Payout wallets & currencies</span> tab.
      </SettingsInfoCallout>

      <SettingsSection
        title="Data usage"
        description="Choose which Luxor Pay products can use data from your linked external accounts."
      >
        {settings.dataUsage.map((entry) => (
          <div
            key={entry.productId}
            className="px-5 py-4 border-b border-[var(--dash-border)] last:border-b-0 flex items-center justify-between gap-4"
          >
            <p className="text-sm font-medium text-[var(--dash-text)]">{entry.label}</p>
            <SettingsOutlineButton onClick={() => toggleDataUsage(entry.productId)}>
              {entry.enabled ? 'Disable' : 'Enable'}
            </SettingsOutlineButton>
          </div>
        ))}
      </SettingsSection>

      <SettingsSection title="New products">
        <SettingsSectionRow
          label="Allow new products"
          description="Let future Luxor Pay products use linked account data when you opt in."
        >
          <SettingsToggle
            checked={settings.allowNewProducts}
            onChange={toggleAllowNewProducts}
            label="Allow new products to use linked account data"
          />
        </SettingsSectionRow>
      </SettingsSection>
    </div>
  );
}

function BankAccountsTab({
  settings,
  balances,
}: {
  settings: BankAccountsSettings;
  balances: LuxorWalletBalance[];
}) {
  const payoutColumns: SettingsTableColumn<PayoutCurrencyRow>[] = [
    {
      key: 'currency',
      header: 'Currency',
      render: (row) => (
        <span className="font-medium">
          {row.currency}
          {row.isDefault && (
            <span className="ml-2 text-xs font-normal text-[var(--dash-muted)]">Default</span>
          )}
        </span>
      ),
    },
    {
      key: 'wallet',
      header: 'Merchant wallet',
      render: (row) => (
        <span>
          {row.bankAccountLabel}
          {row.bankLastFour.trim() && (
            <span className="text-[var(--dash-muted)]"> · …{row.bankLastFour}</span>
          )}
        </span>
      ),
    },
    {
      key: 'fee',
      header: 'Network fee estimate',
      render: (row) => row.settlementFee,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right w-32',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => toast.message(`Edit ${row.currency} payout settings`)}
            className="text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)]"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => toast.message('More actions')}
            className="p-1 rounded text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)]"
            aria-label={`More actions for ${row.currency}`}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      ),
    },
  ];

  const balanceColumns: SettingsTableColumn<LuxorWalletBalance>[] = [
    {
      key: 'currency',
      header: 'Currency',
      render: (row) => <span className="font-medium">{row.currency}</span>,
    },
    {
      key: 'available',
      header: 'Available',
      render: (row) => row.available,
    },
    {
      key: 'pending',
      header: 'Pending',
      render: (row) => row.pending,
    },
  ];

  const handleAddPayoutCurrency = () => {
    toast.message('Connect your merchant wallet in Managed payments before adding settlement currencies');
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Settlement currencies"
        description="Configure which tokens (SOL / USDC) settle to your Solana merchant wallet."
        footer={
          <button
            type="button"
            onClick={handleAddPayoutCurrency}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
          >
            <Plus size={16} />
            Add settlement currency
          </button>
        }
      >
        {settings.payoutCurrencies.length === 0 ? (
          <div className="px-5 py-10 text-center space-y-3">
            <Wallet size={28} className="mx-auto text-[var(--dash-muted)]" aria-hidden />
            <p className="text-sm text-[var(--dash-muted)]">
              No settlement currencies configured. Connect a merchant wallet to receive SOL and USDC
              payouts on Solana.
            </p>
            <Link
              href="/dashboard/settings/managed-payments"
              className="inline-flex text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
            >
              Connect merchant wallet
            </Link>
          </div>
        ) : (
          <SettingsTable
            columns={payoutColumns}
            data={settings.payoutCurrencies}
            rowKey={(row) => row.id}
            showHeadersWhenEmpty
            emptyMessage="No settlement currencies configured."
          />
        )}
      </SettingsSection>

      <SettingsSection
        title="Merchant wallet"
        description="Primary Solana wallet that receives on-chain settlements and payouts."
      >
        <div className="px-5 py-10 text-center space-y-3">
          <Wallet size={28} className="mx-auto text-[var(--dash-muted)]" aria-hidden />
          <p className="text-sm text-[var(--dash-muted)]">
            No merchant wallet connected. Link a wallet to enable payouts and settlement routing.
          </p>
          <Link
            href="/dashboard/settings/managed-payments"
            className="inline-flex dash-btn-primary px-4 py-2 text-sm"
          >
            Connect wallet
          </Link>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Luxor balances"
        description="On-platform merchant wallet balances available for payout or transfer."
      >
        <SettingsTable
          columns={balanceColumns}
          data={balances}
          rowKey={(row) => row.currency}
          showHeadersWhenEmpty
        />
        <div className="px-5 py-3 border-t border-[var(--dash-border)]">
          <button
            type="button"
            onClick={() => toast.message('Open Balances')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
          >
            <Wallet size={14} />
            View full balances
          </button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Payout schedule"
        description="When Luxor Pay transfers available balance to your Solana merchant wallet."
      >
        <SettingsSectionRow label="Schedule">
          <p className="text-[var(--dash-text)]">
            {PAYOUT_SCHEDULE_LABELS[settings.payoutSchedule]}
          </p>
          <button
            type="button"
            onClick={() => toast.message('Edit payout schedule')}
            className="mt-3 text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
          >
            Edit schedule
          </button>
        </SettingsSectionRow>
      </SettingsSection>
    </div>
  );
}

function TaxDataTab({
  form,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  form: TaxBusinessData;
  onChange: (patch: Partial<TaxBusinessData>) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <SettingsSection
      title="Tax details"
      description="Tax information used for on-chain billing and jurisdictional compliance."
    >
      <form
        className="px-5 py-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
      >
        <div className="space-y-1.5">
          <label htmlFor="tax-id" className="text-sm font-medium text-[var(--dash-text)]">
            Tax ID
          </label>
          <input
            id="tax-id"
            type="text"
            value={form.taxId}
            onChange={(e) => onChange({ taxId: e.target.value })}
            placeholder="EIN / VAT / NIF"
            className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="tax-id-type" className="text-sm font-medium text-[var(--dash-text)]">
            ID type
          </label>
          <input
            id="tax-id-type"
            type="text"
            value={form.taxIdType}
            onChange={(e) => onChange({ taxIdType: e.target.value })}
            placeholder="e.g. EIN, VAT, NIF"
            className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="legal-name" className="text-sm font-medium text-[var(--dash-text)]">
            Legal name
          </label>
          <input
            id="legal-name"
            type="text"
            value={form.legalName}
            onChange={(e) => onChange({ legalName: e.target.value })}
            placeholder="Legal name for tax reporting"
            className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
          />
        </div>
        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-[var(--dash-text)]">Tax address</legend>
          <input
            type="text"
            value={form.addressLine1}
            onChange={(e) => onChange({ addressLine1: e.target.value })}
            placeholder="Street address"
            className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
          />
          <input
            type="text"
            value={form.addressLine2}
            onChange={(e) => onChange({ addressLine2: e.target.value })}
            placeholder="Apartment, suite, unit, etc. (optional)"
            className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
          />
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
            <input
              type="text"
              value={form.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="City"
              className="dash-input flex-1 px-4 py-2.5 text-sm"
            />
            <input
              type="text"
              value={form.state}
              onChange={(e) => onChange({ state: e.target.value })}
              placeholder="State / province"
              className="dash-input sm:w-40 px-4 py-2.5 text-sm"
            />
            <input
              type="text"
              value={form.zip}
              onChange={(e) => onChange({ zip: e.target.value })}
              placeholder="ZIP / postal code"
              className="dash-input sm:w-32 px-4 py-2.5 text-sm"
            />
          </div>
          <input
            type="text"
            value={form.country}
            onChange={(e) => onChange({ country: e.target.value })}
            placeholder="Country"
            className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
          />
        </fieldset>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="dash-btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="dash-btn-secondary px-5 py-2.5 text-sm disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </SettingsSection>
  );
}

function MoreTabPlaceholder({ tabId }: { tabId: BusinessTabId }) {
  const tab = ALL_EMPRESA_TABS.find((t) => t.id === tabId);
  const icons: Partial<Record<BusinessTabId, typeof Building2>> = {
    personalizacion: Palette,
    dominios: Link2,
    integraciones: Shield,
  };
  const Icon = icons[tabId] ?? Building2;

  return (
    <EmptyState
      icon={Icon}
      title={`No ${tab?.label?.toLowerCase() ?? 'this section'} configuration`}
      description="Complete your basic account setup to enable advanced options."
    />
  );
}

export default function BusinessSettingsPage() {
  const searchParams = useSearchParams();
  const tabFromQuery = useMemo(() => {
    const tab = searchParams.get('tab');
    if (tab && (isBusinessPrimaryTab(tab) || isBusinessMoreTab(tab))) {
      return tab as BusinessTabId;
    }
    return null;
  }, [searchParams]);
  const [activeTab, setActiveTab] = useState<BusinessTabId>(
    () => tabFromQuery ?? 'datos-cuenta'
  );
  const [tabFromQuerySnapshot, setTabFromQuerySnapshot] = useState(tabFromQuery);
  const [accountForm, setAccountForm] = useState<BusinessAccountFormData>(() =>
    buildEmptyBusinessAccountForm()
  );
  const [companyData, setCompanyData] = useState<CompanyBusinessData>(() => buildEmptyCompanyData());
  const [publicData, setPublicData] = useState<PublicBusinessData>(() => buildEmptyPublicData());
  const [taxForm, setTaxForm] = useState<TaxBusinessData>(() => buildEmptyTaxData());
  const [accountStatus, setAccountStatus] = useState<AccountStatusCapabilities>(() =>
    loadAccountStatus()
  );
  const [externalAccounts, setExternalAccounts] = useState<ExternalAccountsSettings>(() =>
    loadExternalAccountsSettings()
  );
  const [bankAccounts, setBankAccounts] = useState<BankAccountsSettings>(() =>
    loadBankAccountsSettings()
  );
  const [luxorBalances] = useState<LuxorWalletBalance[]>(() => buildDefaultLuxorWalletBalances());
  const [owners, setOwners] = useState<BusinessOwner[]>([]);
  const [representativeId, setRepresentativeId] = useState<string | null>(null);
  const [editingCompany, setEditingCompany] = useState(false);
  const [editingPublic, setEditingPublic] = useState(false);
  const [editingOwnerId, setEditingOwnerId] = useState<string | null>(null);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingPublic, setSavingPublic] = useState(false);
  const [savingOwner, setSavingOwner] = useState(false);
  const [savingTax, setSavingTax] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setAccountForm(loadBusinessAccountForm());
      setCompanyData(loadCompanyData());
      setPublicData(loadPublicData());
      setTaxForm(loadTaxData());
      setAccountStatus(loadAccountStatus());
      setExternalAccounts(loadExternalAccountsSettings());
      setBankAccounts(loadBankAccountsSettings());
      setOwners(loadBusinessOwners());
      setRepresentativeId(loadAccountRepresentativeId());
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (tabFromQuery !== tabFromQuerySnapshot) {
    setTabFromQuerySnapshot(tabFromQuery);
    if (tabFromQuery) setActiveTab(tabFromQuery);
  }

  useEffect(() => {
    if (!moreOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [moreOpen]);

  const handleCancelAccount = () => {
    setAccountForm(loadBusinessAccountForm());
    toast.message('Changes discarded');
  };

  const handleCancelTax = () => {
    setTaxForm(loadTaxData());
    toast.message('Changes discarded');
  };

  const handleSaveAccount = async () => {
    setSavingAccount(true);
    const saved = saveBusinessAccountForm(accountForm);
    setAccountForm(saved);
    await new Promise((r) => setTimeout(r, 350));
    toast.success('Account data saved');
    setSavingAccount(false);
  };

  const handleSaveCompany = async () => {
    setSavingCompany(true);
    saveCompanyData(companyData);
    await new Promise((r) => setTimeout(r, 350));
    toast.success('Company data saved');
    setEditingCompany(false);
    setSavingCompany(false);
  };

  const handleSavePublic = async () => {
    setSavingPublic(true);
    savePublicData(publicData);
    await new Promise((r) => setTimeout(r, 350));
    toast.success('Public data saved');
    setEditingPublic(false);
    setSavingPublic(false);
  };

  const handleSaveTax = async () => {
    setSavingTax(true);
    saveTaxData(taxForm);
    await new Promise((r) => setTimeout(r, 350));
    toast.success('Tax data saved');
    setSavingTax(false);
  };

  const handleAddOwner = () => {
    const nextOwner = {
      ...buildEmptyBusinessOwner(),
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `owner_${Math.random().toString(36).slice(2, 11)}`,
      roles: ['Owner'],
    };
    const nextOwners = [...owners, nextOwner];
    setOwners(nextOwners);
    saveBusinessOwners(nextOwners);
    setEditingOwnerId(nextOwner.id);
  };

  const handleChooseRepresentative = () => {
    if (owners.length === 0) {
      toast.message('Add an owner before choosing a representative');
      return;
    }
    const currentIndex = owners.findIndex((owner) => owner.id === representativeId);
    const nextOwner = owners[(currentIndex + 1) % owners.length];
    setRepresentativeId(nextOwner.id);
    saveAccountRepresentativeId(nextOwner.id);
    toast.success(`${nextOwner.name.trim() || 'Owner'} is now the account representative`);
  };

  const handleSaveOwner = async (_ownerId: string) => {
    setSavingOwner(true);
    saveBusinessOwners(owners);
    await new Promise((r) => setTimeout(r, 350));
    toast.success('Owner profile saved');
    setEditingOwnerId(null);
    setSavingOwner(false);
  };

  const handleCancelEditOwner = () => {
    setOwners(loadBusinessOwners());
    setEditingOwnerId(null);
  };

  const moreActive = isBusinessMoreTab(activeTab);
  const moreLabel = EMPRESA_MORE_TABS.find((t) => t.id === activeTab)?.label ?? 'More';

  if (!hydrated) {
    return (
      <>
        <SettingsPageHeader
          title="Business"
          description="Manage your merchant account data and legal business information."
        />
        <div className="p-6 md:p-8">
          <p className="text-sm text-[var(--dash-muted)]">Loading…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SettingsPageHeader
        title="Business"
        description="Manage your merchant account data and legal business information."
      />

      <div className="px-6 md:px-8 border-b border-[var(--dash-border)]">
        <div className="flex flex-wrap items-end gap-1">
          <SettingsTabBar
            tabs={EMPRESA_PRIMARY_TABS}
            activeTab={moreActive ? '' : activeTab}
            onTabChange={(tabId) => {
              setMoreOpen(false);
              setActiveTab(tabId as BusinessTabId);
            }}
            className="flex-1 border-b-0"
          />
          <div ref={moreRef} className="relative -mb-px pb-px">
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              className={cn(
                'inline-flex items-center gap-1 px-3 py-2.5 text-sm font-medium transition-colors border-b-2',
                moreActive
                  ? 'border-[var(--dash-accent)] text-[var(--dash-text)]'
                  : 'border-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:border-[var(--dash-border)]'
              )}
            >
              {moreActive ? moreLabel : 'More'}
              <ChevronDown size={14} className={cn('transition-transform', moreOpen && 'rotate-180')} />
            </button>
            {moreOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-20 mt-1 min-w-[240px] dash-card py-1 shadow-lg"
              >
                {EMPRESA_MORE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMoreOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm transition-colors',
                      activeTab === tab.id
                        ? 'text-[var(--dash-accent)] bg-[var(--dash-accent-soft)]'
                        : 'text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)]'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 md:px-8 md:pb-8 max-w-[1400px] mx-auto pb-12 space-y-6">
        {(activeTab === 'datos-cuenta' || activeTab === 'datos-empresa') && (
          <p className="text-sm text-[var(--dash-muted)] leading-relaxed">
            Legal identity and tax information may be shared across accounts in your Luxor Pay organization. Changes in this section only affect the active account.
          </p>
        )}

        {activeTab === 'datos-cuenta' && (
          <div role="tabpanel" id="empresa-panel-datos-cuenta" aria-labelledby="comm-tab-datos-cuenta">
            <AccountDataForm
              form={accountForm}
              onChange={(patch) => setAccountForm((prev) => ({ ...prev, ...patch }))}
              onSave={() => void handleSaveAccount()}
              onCancel={handleCancelAccount}
              saving={savingAccount}
            />
          </div>
        )}

        {activeTab === 'estado-cuenta' && (
          <div role="tabpanel" id="empresa-panel-estado-cuenta" aria-labelledby="comm-tab-estado-cuenta">
            <AccountStatusTab status={accountStatus} />
          </div>
        )}

        {activeTab === 'datos-empresa' && (
          <div role="tabpanel" id="empresa-panel-datos-empresa" aria-labelledby="comm-tab-datos-empresa">
            <div className="space-y-6">
              <CompanyDataSection
                data={companyData}
                editing={editingCompany}
                onEdit={() => setEditingCompany(true)}
                onCancel={() => {
                  setCompanyData(loadCompanyData());
                  setEditingCompany(false);
                }}
                onChange={(patch) => setCompanyData((prev) => ({ ...prev, ...patch }))}
                onSave={() => void handleSaveCompany()}
                saving={savingCompany}
              />
              <PublicDataSection
                data={publicData}
                editing={editingPublic}
                onEdit={() => setEditingPublic(true)}
                onCancel={() => {
                  setPublicData(loadPublicData());
                  setEditingPublic(false);
                }}
                onChange={(patch) => setPublicData((prev) => ({ ...prev, ...patch }))}
                onSave={() => void handleSavePublic()}
                saving={savingPublic}
              />
              <DirectorsAndOwnersSection
                owners={owners}
                representativeId={representativeId}
                editingOwnerId={editingOwnerId}
                savingOwner={savingOwner}
                onChooseRepresentative={handleChooseRepresentative}
                onAddOwner={handleAddOwner}
                onEditOwner={setEditingOwnerId}
                onCancelEditOwner={handleCancelEditOwner}
                onChangeOwner={(ownerId, patch) =>
                  setOwners((prev) =>
                    prev.map((owner) => (owner.id === ownerId ? { ...owner, ...patch } : owner))
                  )
                }
                onSaveOwner={(ownerId) => void handleSaveOwner(ownerId)}
              />
            </div>
          </div>
        )}

        {activeTab === 'cuentas-externas' && (
          <div
            role="tabpanel"
            id="empresa-panel-cuentas-externas"
            aria-labelledby="comm-tab-cuentas-externas"
          >
            <ExternalAccountsTab
              settings={externalAccounts}
              onChange={setExternalAccounts}
              onGoToBankAccounts={() => setActiveTab('cuentas-bancarias')}
            />
          </div>
        )}

        {activeTab === 'cuentas-bancarias' && (
          <div
            role="tabpanel"
            id="empresa-panel-cuentas-bancarias"
            aria-labelledby="comm-tab-cuentas-bancarias"
          >
            <BankAccountsTab
              settings={bankAccounts}
              balances={luxorBalances}
            />
          </div>
        )}

        {activeTab === 'datos-fiscales' && (
          <div role="tabpanel" id="empresa-panel-datos-fiscales" aria-labelledby="comm-tab-datos-fiscales">
            <TaxDataTab
              form={taxForm}
              onChange={(patch) => setTaxForm((prev) => ({ ...prev, ...patch }))}
              onSave={() => void handleSaveTax()}
              onCancel={handleCancelTax}
              saving={savingTax}
            />
          </div>
        )}

        {isBusinessMoreTab(activeTab) && (
          <div role="tabpanel" id={`empresa-panel-${activeTab}`} aria-labelledby={`comm-tab-${activeTab}`}>
            <MoreTabPlaceholder tabId={activeTab} />
          </div>
        )}
      </div>
    </>
  );
}

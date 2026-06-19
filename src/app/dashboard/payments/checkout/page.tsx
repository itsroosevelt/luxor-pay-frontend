'use client';

import Link from 'next/link';
import { useCallback, useSyncExternalStore } from 'react';
import {
  BackendNotice,
  PaymentsSectionNav,
} from '@/components/dashboard';
import {
  SettingsPageHeader,
  SettingsSection,
  SettingsSectionRow,
  PreferenceToggleGroup,
} from '@/components/dashboard/settings';
import { cn } from '@/lib/cn';
import {
  getPaymentSettingsServerSnapshot,
  getPaymentSettingsSnapshot,
  patchPaymentSettings,
  PAYMENT_SETTINGS_CHANGE_EVENT,
  type DefaultBillingMode,
  type PriceDisplayMode,
} from '@/lib/dashboard/payment-settings';
import { toast } from 'sonner';

function subscribeToPaymentSettings(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(PAYMENT_SETTINGS_CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(PAYMENT_SETTINGS_CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
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

function SettingsLinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
    >
      {children}
    </Link>
  );
}

export default function PaymentsCheckoutPage() {
  const settings = useSyncExternalStore(
    subscribeToPaymentSettings,
    getPaymentSettingsSnapshot,
    getPaymentSettingsServerSnapshot
  );

  const dispatchChange = useCallback(() => {
    window.dispatchEvent(new Event(PAYMENT_SETTINGS_CHANGE_EVENT));
  }, []);

  const updateSettings = useCallback(
    (patch: Parameters<typeof patchPaymentSettings>[0]) => {
      patchPaymentSettings(patch);
      dispatchChange();
    },
    [dispatchChange]
  );

  return (
    <>
      <SettingsPageHeader
        title="Payments"
        description="Configure Solana Pay checkout, payment links, and on-chain settlement preferences."
      />
      <div className="p-6 md:px-8 md:pb-8 w-full space-y-8 pb-12">
        <PaymentsSectionNav />
        <BackendNotice notImplemented />

        <section aria-labelledby="checkout-custom-options">
          <h2 id="checkout-custom-options" className="text-sm font-semibold text-[var(--dash-text)] mb-3">
            Custom options
          </h2>
          <SettingsSection title="Checkout configuration">
            <SettingsSectionRow
              label="Wallet connect autocomplete"
              description="Suggest connected wallets during checkout instead of manual address entry."
            >
              <SettingsToggle
                checked={settings.walletConnectAutocomplete}
                onChange={(walletConnectAutocomplete) =>
                  updateSettings({ walletConnectAutocomplete })
                }
                label="Wallet connect autocomplete"
              />
            </SettingsSectionRow>
            <SettingsSectionRow
              label="Settlement currency"
              description="Default token for checkout and payment links (SOL or USDC on Solana)."
            >
              <SettingsLinkButton href="/dashboard/settings/managed-payments">
                Manage settlement currency
              </SettingsLinkButton>
            </SettingsSectionRow>
            <SettingsSectionRow
              label="Public information"
              description="Business name and support details shown on hosted checkout and receipts."
            >
              <SettingsLinkButton href="/dashboard/settings/empresa?tab=datos-empresa">
                Edit business settings
              </SettingsLinkButton>
            </SettingsSectionRow>
            <SettingsSectionRow
              label="Appearance"
              description="Customize checkout colors, logo, and layout for Solana Pay hosted pages."
            >
              <button
                type="button"
                onClick={() => toast.message('Checkout appearance — coming soon')}
                className="text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
              >
                Customize appearance
              </button>
            </SettingsSectionRow>
            <SettingsSectionRow
              label="Domain"
              description="Use a custom domain for hosted Solana Pay checkout instead of the default Luxor Pay URL."
            >
              <button
                type="button"
                onClick={() => toast.message('Custom checkout domain — coming soon')}
                className="text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
              >
                Configure domain
              </button>
            </SettingsSectionRow>
            <SettingsSectionRow
              label="Price display mode"
              description="How subscription prices appear on payment links (monthly vs annual equivalent)."
            >
              <PreferenceToggleGroup<PriceDisplayMode>
                ariaLabel="Price display mode"
                options={[
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'annual', label: 'Annual' },
                ]}
                value={settings.priceDisplayMode}
                onChange={(priceDisplayMode) => updateSettings({ priceDisplayMode })}
              />
            </SettingsSectionRow>
            <SettingsSectionRow
              label="Tax display"
              description="Show tax breakdown on checkout. Off by default — Solana amounts are gross on-chain totals."
            >
              <SettingsToggle
                checked={settings.taxDisplay}
                onChange={(taxDisplay) => updateSettings({ taxDisplay })}
                label="Tax display on checkout"
              />
            </SettingsSectionRow>
          </SettingsSection>
        </section>

        <section aria-labelledby="checkout-subscriptions">
          <h2 id="checkout-subscriptions" className="text-sm font-semibold text-[var(--dash-text)] mb-3">
            Subscriptions
          </h2>
          <SettingsSection
            title="On-chain subscriptions"
            description="Recurring billing via Solana wallet authorization and payment links."
          >
            <SettingsSectionRow
              label="Multiple subscriptions"
              description="Allow customers to hold more than one active subscription per wallet."
            >
              <SettingsToggle
                checked={settings.multipleSubscriptions}
                onChange={(multipleSubscriptions) => updateSettings({ multipleSubscriptions })}
                label="Multiple subscriptions"
              />
            </SettingsSectionRow>
            <SettingsSectionRow
              label="Default billing mode"
              description="Flexible mode prorates plan changes on-chain; Classic mode bills at period boundaries."
            >
              <PreferenceToggleGroup<DefaultBillingMode>
                ariaLabel="Default billing mode"
                options={[
                  { id: 'flexible', label: 'Flexible' },
                  { id: 'classic', label: 'Classic' },
                ]}
                value={settings.defaultBillingMode}
                onChange={(defaultBillingMode) => updateSettings({ defaultBillingMode })}
              />
            </SettingsSectionRow>
          </SettingsSection>
        </section>

        <div className="dash-card p-5 text-sm text-[var(--dash-muted)] space-y-2">
          <p>
            <strong className="text-[var(--dash-text)]">Payment links:</strong>{' '}
            <Link href="/dashboard/links" className="text-[var(--dash-accent)] hover:underline">
              Create and manage payment links
            </Link>{' '}
            for one-time and subscription checkout on Solana.
          </p>
          <p>
            Public routes: <code className="font-mono text-xs">/pay/[reference]</code> and{' '}
            <code className="font-mono text-xs">/pay/link/[id]</code>.
          </p>
        </div>
      </div>
    </>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Monitor,
  Plus,
  QrCode,
  Smartphone,
  X,
} from 'lucide-react';
import type { Currency } from '@luxor/contracts';
import { CheckoutShell } from '@/features/checkout/components/CheckoutShell';
import { cn } from '@/lib/cn';

export interface PaymentLinkEditorValues {
  name: string;
  amount: string;
  currency: Currency;
  active: boolean;
  collectEmail: boolean;
  limitPayments: boolean;
  successMessage: string;
  redirectUrl: string;
}

export const defaultPaymentLinkEditorValues: PaymentLinkEditorValues = {
  name: '',
  amount: '',
  currency: 'USDC',
  active: true,
  collectEmail: true,
  limitPayments: false,
  successMessage: 'Thank you for your payment.',
  redirectUrl: '',
};

type EditorTab = 'payment' | 'after';

function formatPreviewAmount(amount: string, currency: Currency): string {
  const parsed = parseFloat(amount);
  if (Number.isNaN(parsed) || parsed <= 0) return '0.00';
  return parsed.toFixed(currency === 'SOL' ? 4 : 2);
}

function CheckoutPreview({
  merchantName,
  productName,
  amount,
  currency,
  previewMode,
  tab,
  successMessage,
}: {
  merchantName: string;
  productName: string;
  amount: string;
  currency: Currency;
  previewMode: 'mobile' | 'desktop';
  tab: EditorTab;
  successMessage: string;
}) {
  const displayAmount = formatPreviewAmount(amount, currency);
  const label = productName.trim() || 'Product name';

  return (
    <div
      className={cn(
        'mx-auto overflow-hidden rounded-xl border border-white/10 shadow-2xl transition-all',
        previewMode === 'mobile' ? 'max-w-[375px]' : 'w-full max-w-4xl'
      )}
    >
      <div className={cn(previewMode === 'mobile' ? 'max-h-[640px] overflow-y-auto' : '')}>
        <CheckoutShell
          compact
          merchantName={merchantName}
          productName={label}
          amount={displayAmount}
          currency={currency}
        >
          {tab === 'after' ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[#14f195]/20 flex items-center justify-center">
                <span className="text-[#14f195] text-xl">✓</span>
              </div>
              <p className="text-[#14f195] font-semibold text-lg">
                {successMessage.trim() || 'Thank you for your payment.'}
              </p>
              <p className="text-xs text-gray-500">Payment confirmed on Solana</p>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-white bg-white text-black"
                >
                  QR (Solana Pay)
                </button>
                <button
                  type="button"
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-white/15 text-gray-400"
                >
                  Wallet
                </button>
              </div>
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl">
                <div className="w-[180px] h-[180px] bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode size={64} className="text-gray-400" />
                </div>
                <p className="mt-4 text-xs text-black font-semibold text-center">
                  Scan with Phantom, Solflare, or any Solana wallet
                </p>
              </div>
            </>
          )}
        </CheckoutShell>
      </div>
    </div>
  );
}

export function PaymentLinkEditor({
  mode,
  layout = 'page',
  initialValues,
  merchantName = 'Luxor Pay',
  saving = false,
  submitDisabled = false,
  onSave,
  onCancel,
}: {
  mode: 'create' | 'edit';
  layout?: 'page' | 'drawer';
  initialValues: PaymentLinkEditorValues;
  merchantName?: string;
  saving?: boolean;
  submitDisabled?: boolean;
  onSave: (values: PaymentLinkEditorValues) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<PaymentLinkEditorValues>(initialValues);
  const [tab, setTab] = useState<EditorTab>('payment');
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('desktop');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const set = <K extends keyof PaymentLinkEditorValues>(key: K, val: PaymentLinkEditorValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSave(values);
  };

  const title = mode === 'create' ? 'Create Solana Pay link' : 'Edit Solana Pay link';
  const submitLabel = mode === 'create' ? 'Create link' : 'Update link';
  const isDrawer = layout === 'drawer';

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex flex-col',
        isDrawer ? 'h-full min-h-0' : 'min-h-[calc(100vh-4rem)]'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-4 px-4 md:px-5 py-4 border-b border-[var(--dash-border)] shrink-0',
          isDrawer ? 'bg-[var(--dash-panel)]' : 'sticky top-0 z-10 dash-header'
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)] shrink-0"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <h1 className="text-lg font-semibold text-[var(--dash-text)] truncate">{title}</h1>
        </div>
        {isDrawer ? (
          <button
            type="button"
            className="text-xs text-[var(--dash-accent)] hover:underline lg:hidden shrink-0"
            onClick={onCancel}
          >
            Close preview
          </button>
        ) : (
          <button
            type="submit"
            disabled={saving || submitDisabled}
            className="dash-btn-primary px-5 py-2 text-sm shrink-0 disabled:opacity-50"
          >
            {saving ? 'Saving…' : submitLabel}
          </button>
        )}
      </div>

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row overflow-hidden">
        <div
          className={cn(
            'lg:w-[40%] xl:w-[38%] border-b lg:border-b-0 lg:border-r border-[var(--dash-border)] overflow-y-auto',
            isDrawer && 'bg-[var(--dash-panel)]'
          )}
        >
          <div className="p-6 space-y-6 max-w-xl">
            <div>
              <label htmlFor="link-type" className="block text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)] mb-2">
                Type
              </label>
              <select
                id="link-type"
                value="one-time"
                disabled
                className="dash-input w-full px-4 py-2.5 text-sm opacity-80 cursor-not-allowed"
              >
                <option value="one-time">One-time payment (SOL / USDC)</option>
              </select>
            </div>

            <div className="flex gap-1 border-b border-[var(--dash-border)]">
              {(['payment', 'after'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                    tab === t
                      ? 'border-white text-[var(--dash-text)]'
                      : 'border-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]'
                  )}
                >
                  {t === 'payment' ? 'Payment page' : 'After payment'}
                </button>
              ))}
            </div>

            {tab === 'payment' && (
              <div className="space-y-6">
                <section className="dash-card p-5 space-y-4">
                  <h2 className="text-sm font-semibold text-[var(--dash-text)]">Product</h2>
                  <div className="space-y-3">
                    <input
                      value={values.name}
                      onChange={(e) => set('name', e.target.value)}
                      placeholder="Product or service name"
                      className="dash-input w-full px-4 py-2.5 text-sm"
                      required
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={values.amount}
                        onChange={(e) => set('amount', e.target.value)}
                        placeholder="Amount"
                        className="dash-input px-4 py-2.5 text-sm"
                        required
                      />
                      <select
                        value={values.currency}
                        onChange={(e) => set('currency', e.target.value as Currency)}
                        className="dash-input px-4 py-2.5 text-sm"
                      >
                        <option value="USDC">USDC</option>
                        <option value="SOL">SOL</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--dash-muted)]">Quantity</span>
                      <span className="tabular-nums font-medium">1</span>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={values.active}
                        onChange={(e) => set('active', e.target.checked)}
                        className="rounded"
                      />
                      Link active
                    </label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-[var(--dash-accent)] hover:underline inline-flex items-center gap-1"
                    onClick={() => {}}
                  >
                    <Plus size={14} />
                    Add another product
                  </button>
                </section>

                <section className="space-y-3">
                  <h2 className="text-sm font-semibold text-[var(--dash-text)]">Options</h2>
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={values.collectEmail}
                      onChange={(e) => set('collectEmail', e.target.checked)}
                      className="mt-0.5 rounded"
                    />
                    <span>
                      <span className="font-medium">Collect customer email</span>
                      <span className="block text-[var(--dash-muted)] text-xs mt-0.5">
                        Ask for an email address during checkout
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 text-sm cursor-pointer opacity-60">
                    <input type="checkbox" disabled className="mt-0.5 rounded" />
                    <span>
                      <span className="font-medium">Collect taxes</span>
                      <span className="block text-[var(--dash-muted)] text-xs mt-0.5">
                        Uses default rates from{' '}
                        <Link href="/dashboard/tax" className="text-[var(--dash-accent)] hover:underline">
                          Solana tax settings
                        </Link>
                        {' '}— jurisdiction rules coming soon
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={values.limitPayments}
                      onChange={(e) => set('limitPayments', e.target.checked)}
                      className="mt-0.5 rounded"
                    />
                    <span>
                      <span className="font-medium">Limit number of payments</span>
                      <span className="block text-[var(--dash-muted)] text-xs mt-0.5">
                        UI only for now — not enforced on checkout
                      </span>
                    </span>
                  </label>
                </section>

                <section>
                  <button
                    type="button"
                    onClick={() => setAdvancedOpen((o) => !o)}
                    className="flex items-center gap-2 text-sm font-medium text-[var(--dash-text)] w-full"
                  >
                    Advanced options
                    {advancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {advancedOpen && (
                    <div className="mt-4 dash-card p-4 space-y-3 text-sm text-[var(--dash-muted)]">
                      <p>Custom metadata and webhook overrides — coming soon.</p>
                    </div>
                  )}
                </section>
              </div>
            )}

            {tab === 'after' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="success-message" className="block text-sm font-medium mb-2">
                    Confirmation message
                  </label>
                  <textarea
                    id="success-message"
                    value={values.successMessage}
                    onChange={(e) => set('successMessage', e.target.value)}
                    rows={3}
                    placeholder="Thank you for your payment."
                    className="dash-input w-full px-4 py-2.5 text-sm resize-none"
                  />
                  <p className="text-xs text-[var(--dash-muted)] mt-1">
                    Shown on the checkout page after a successful on-chain payment
                  </p>
                </div>
                <div>
                  <label htmlFor="redirect-url" className="block text-sm font-medium mb-2">
                    Redirect URL
                  </label>
                  <input
                    id="redirect-url"
                    type="url"
                    value={values.redirectUrl}
                    onChange={(e) => set('redirectUrl', e.target.value)}
                    placeholder="https://yoursite.com/thank-you"
                    className="dash-input w-full px-4 py-2.5 text-sm"
                  />
                  <p className="text-xs text-[var(--dash-muted)] mt-1">
                    Optional URL to send customers after payment completes
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            'flex-1 overflow-y-auto p-6 lg:p-8',
            isDrawer ? 'bg-[var(--dash-panel-elevated)]' : 'bg-[#050505]'
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
                Preview
              </span>
              <p className="text-xs text-[var(--dash-muted)] mt-1 max-w-md">
                Customers opening this link can pay via QR scan or wallet.
              </p>
            </div>
            <div className="flex gap-1 dash-card p-1">
              <button
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  previewMode === 'mobile'
                    ? 'bg-[var(--dash-surface-elevated)] text-[var(--dash-text)]'
                    : 'text-[var(--dash-muted)] hover:text-[var(--dash-text)]'
                )}
                aria-label="Mobile preview"
              >
                <Smartphone size={16} />
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  previewMode === 'desktop'
                    ? 'bg-[var(--dash-surface-elevated)] text-[var(--dash-text)]'
                    : 'text-[var(--dash-muted)] hover:text-[var(--dash-text)]'
                )}
                aria-label="Desktop preview"
              >
                <Monitor size={16} />
              </button>
            </div>
          </div>
          <CheckoutPreview
            merchantName={merchantName}
            productName={values.name}
            amount={values.amount}
            currency={values.currency}
            previewMode={previewMode}
            tab={tab}
            successMessage={values.successMessage}
          />
        </div>
      </div>

      {isDrawer && (
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--dash-border)] shrink-0 bg-[var(--dash-panel)]">
          <button type="button" onClick={onCancel} className="dash-btn-secondary px-5 py-2.5 text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || submitDisabled}
            className="dash-btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
          >
            {saving ? 'Creating…' : submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}

export function paymentLinkToEditorValues(link: {
  name: string;
  amount: number;
  currency: Currency;
  active: boolean;
  collectEmail?: boolean;
  successMessage?: string;
  redirectUrl?: string;
}): PaymentLinkEditorValues {
  return {
    name: link.name,
    amount: String(link.amount),
    currency: link.currency,
    active: link.active,
    collectEmail: link.collectEmail ?? true,
    limitPayments: false,
    successMessage: link.successMessage ?? 'Thank you for your payment.',
    redirectUrl: link.redirectUrl ?? '',
  };
}

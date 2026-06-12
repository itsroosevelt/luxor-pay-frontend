'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, ImagePlus } from 'lucide-react';
import type { Currency, ProductCatalogItem } from '@luxor/contracts';
import { auth } from '@/lib/firebase';
import { createProduct } from '@/lib/merchant-data';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';
import {
  SlideOverPanel,
  SlideOverTwoColumn,
} from './SlideOverPanel';

const PRODUCT_CATEGORIES = [
  { value: 'general', label: 'General - Electronically Supplied Services' },
];

const STUB_TAX_RATE = 0.0745;

type RateType = 'recurring' | 'one-time';
type BillingPeriod =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'annual'
  | 'every_3_months'
  | 'every_6_months'
  | 'custom';
type TaxInclusion = 'no' | 'yes';

const BILLING_PERIODS: { value: BillingPeriod; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
  { value: 'every_3_months', label: 'Every 3 months' },
  { value: 'every_6_months', label: 'Every 6 months' },
  { value: 'custom', label: 'Custom' },
];

const INPUT_CLASS = 'dash-input dash-input-solid w-full px-4 py-2.5 text-sm';

export interface ProductCreateDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated: (product: ProductCatalogItem) => void;
}

function formatMoney(amount: number, currency: Currency): string {
  const decimals = currency === 'SOL' ? 4 : 2;
  return `${currency} ${amount.toFixed(decimals)}`;
}

function computePriceBreakdown(
  amount: number,
  includeTaxInPrice: TaxInclusion
): { subtotal: number; tax: number; total: number; taxIncluded: boolean } {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { subtotal: 0, tax: 0, total: 0, taxIncluded: includeTaxInPrice === 'yes' };
  }
  if (includeTaxInPrice === 'yes') {
    return { subtotal: amount, tax: 0, total: amount, taxIncluded: true };
  }
  const tax = amount * STUB_TAX_RATE;
  return { subtotal: amount, tax, total: amount + tax, taxIncluded: false };
}

function billingTotalLabel(period: BillingPeriod): string {
  switch (period) {
    case 'daily':
      return 'Total per day';
    case 'weekly':
      return 'Total per week';
    case 'monthly':
      return 'Total per month';
    case 'annual':
      return 'Total per year';
    case 'every_3_months':
      return 'Total every 3 months';
    case 'every_6_months':
      return 'Total every 6 months';
    default:
      return 'Total';
  }
}

interface PillToggleOption<T extends string> {
  value: T;
  label: string;
}

function PillToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: PillToggleOption<T>[];
  value: T;
  onChange: (next: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="inline-flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-full border transition-colors',
              selected
                ? 'border-[var(--dash-accent)] text-[var(--dash-text)] bg-[var(--dash-panel-elevated)]'
                : 'border-[var(--dash-border)] text-[var(--dash-muted)] hover:border-[var(--dash-muted)] hover:text-[var(--dash-text)] bg-[var(--dash-panel-elevated)]'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

const defaultForm = () => ({
  name: '',
  description: '',
  category: 'general',
  rateType: 'one-time' as RateType,
  amount: '',
  currency: 'USDC' as Currency,
  includeTaxInPrice: 'no' as TaxInclusion,
  billingPeriod: 'monthly' as BillingPeriod,
});

export function ProductCreateDrawer({ open, onClose, onCreated }: ProductCreateDrawerProps) {
  const [form, setForm] = useState(defaultForm);
  const [creating, setCreating] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [moreCategoryOpen, setMoreCategoryOpen] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [previewQuantity] = useState(1);

  const resetAndClose = useCallback(() => {
    setForm(defaultForm());
    setShowErrors(false);
    setMoreCategoryOpen(false);
    setPreviewVisible(true);
    onClose();
  }, [onClose]);

  const parsedAmount = parseFloat(form.amount);
  const breakdown = useMemo(
    () => computePriceBreakdown(parsedAmount, form.includeTaxInPrice),
    [parsedAmount, form.includeTaxInPrice]
  );

  const nameError = showErrors && !form.name.trim();
  const amountError =
    showErrors && (Number.isNaN(parsedAmount) || parsedAmount <= 0 || form.amount.trim() === '');

  const unitPrice = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 0;
  const lineTotal = unitPrice * previewQuantity;

  const handleSubmit = async () => {
    setShowErrors(true);
    const user = auth.currentUser;
    if (!user) return;
    if (!form.name.trim()) return;
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return;

    setCreating(true);
    try {
      const product = await createProduct(user.uid, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: parsedAmount,
        currency: form.currency,
      });
      onCreated(product);
      setForm(defaultForm());
      setShowErrors(false);
      onClose();
      toast.success('Product created');
    } catch {
      toast.error('Product creation is not available yet.');
    } finally {
      setCreating(false);
    }
  };

  const formFields = (
    <>
      {!previewVisible && (
        <div className="flex justify-end -mt-2 mb-2">
          <button
            type="button"
            onClick={() => setPreviewVisible(true)}
            className="text-xs text-[var(--dash-accent)] hover:underline"
          >
            Show preview
          </button>
        </div>
      )}

      <div>
        <label htmlFor="product-name" className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          id="product-name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Product or service name"
          className={cn(INPUT_CLASS, nameError && 'border-red-400 focus:border-red-400 focus:ring-red-400/20')}
          aria-invalid={nameError || undefined}
          required
        />
        {nameError && (
          <p className="text-xs text-red-400 mt-1.5">Name is required.</p>
        )}
      </div>

      <div>
        <label htmlFor="product-description" className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">
          Description
        </label>
        <textarea
          id="product-description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Optional description for customers"
          rows={3}
          className={cn(INPUT_CLASS, 'resize-none')}
        />
      </div>

      <div>
        <span className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">Image</span>
        <button
          type="button"
          onClick={() => toast.info('Image upload — coming soon')}
          className="dash-btn-secondary w-full py-8 text-sm inline-flex flex-col items-center justify-center gap-2 border-dashed bg-[var(--dash-panel-elevated)]"
        >
          <ImagePlus size={20} className="text-[var(--dash-muted)]" />
          <span className="text-[var(--dash-muted)]">Upload</span>
        </button>
      </div>

      <div>
        <label htmlFor="product-category" className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">
          Product category
        </label>
        <select
          id="product-category"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className={INPUT_CLASS}
        >
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-[var(--dash-muted)] mt-2">
          Use preset code: General - Electronically Supplied Services
        </p>
        <button
          type="button"
          onClick={() => setMoreCategoryOpen((v) => !v)}
          className="mt-2 text-sm text-[var(--dash-accent)] hover:underline inline-flex items-center gap-1"
        >
          More options
          {moreCategoryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {moreCategoryOpen && (
          <p className="text-xs text-[var(--dash-muted)] mt-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-panel-elevated)] p-3">
            Additional product category codes — coming soon.
          </p>
        )}
      </div>

      <div className="space-y-4 pt-2 border-t border-[var(--dash-border)]">
        <span className="block text-sm font-semibold text-[var(--dash-text)]">Rates</span>

        <div>
          <PillToggle
            ariaLabel="Rate type"
            value={form.rateType}
            onChange={(rateType) => setForm((f) => ({ ...f, rateType }))}
            options={[
              { value: 'recurring', label: 'Recurring (wallet-billed)' },
              { value: 'one-time', label: 'One-time' },
            ]}
          />
        </div>

        <div>
          <label htmlFor="product-amount" className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">
            Amount <span className="text-red-400">*</span>
          </label>
          <div
            className={cn(
              'flex rounded-lg border overflow-hidden bg-[var(--dash-panel-elevated)] focus-within:border-[var(--dash-accent)] focus-within:ring-[3px] focus-within:ring-[var(--dash-accent-soft)]',
              amountError ? 'border-red-400' : 'border-[var(--dash-border)]'
            )}
          >
            <select
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value as Currency }))}
              className="dash-input-solid border-0 border-r border-[var(--dash-border)] rounded-none px-3 py-2.5 text-sm text-[var(--dash-muted)] shrink-0 focus:ring-0"
              aria-label="Currency"
            >
              <option value="USDC">USDC</option>
              <option value="SOL">SOL</option>
            </select>
            <input
              id="product-amount"
              type="text"
              inputMode="decimal"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
              className="dash-input-solid flex-1 border-0 rounded-none focus:ring-0 shadow-none min-w-0 px-3 py-2.5 text-sm tabular-nums"
              aria-invalid={amountError || undefined}
            />
          </div>
          {amountError && (
            <p className="text-xs text-red-400 mt-1.5">Enter a valid amount.</p>
          )}
        </div>

        <div>
          <label htmlFor="product-tax-inclusion" className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">
            Include tax in price
          </label>
          <select
            id="product-tax-inclusion"
            value={form.includeTaxInPrice}
            onChange={(e) =>
              setForm((f) => ({ ...f, includeTaxInPrice: e.target.value as TaxInclusion }))
            }
            className={INPUT_CLASS}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
          <p className="text-xs text-[var(--dash-muted)] mt-2">
            Default rates are configured in{' '}
            <Link href="/dashboard/tax" className="text-[var(--dash-accent)] hover:underline">
              Solana tax settings
            </Link>
            . Jurisdiction rules — coming soon.
          </p>
        </div>

        {form.rateType === 'recurring' && (
          <div>
            <label htmlFor="product-billing-period" className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">
              Billing period (wallet-billed)
            </label>
            <select
              id="product-billing-period"
              value={form.billingPeriod}
              onChange={(e) =>
                setForm((f) => ({ ...f, billingPeriod: e.target.value as BillingPeriod }))
              }
              className={INPUT_CLASS}
            >
              {BILLING_PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="button"
          onClick={() => toast.info('More pricing options — coming soon')}
          className="text-sm text-[var(--dash-accent)] hover:underline"
        >
          More pricing options
        </button>
      </div>
    </>
  );

  const previewContent = (
    <div className="space-y-5">
      <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel)] p-5 space-y-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[var(--dash-muted)]">Quantity</span>
            <span className="tabular-nums text-[var(--dash-text)]">{previewQuantity}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-[var(--dash-muted)] shrink-0">Jurisdiction</span>
            <select
              disabled
              className="dash-input-solid text-sm px-2 py-1 rounded-md border border-[var(--dash-border)] max-w-[200px] opacity-70 cursor-not-allowed"
              aria-label="Jurisdiction"
            >
              <option value="">Coming soon</option>
            </select>
          </div>
        </div>

        <div className="border-t border-[var(--dash-border)] pt-4">
          <p className="text-sm text-[var(--dash-text)] tabular-nums">
            {previewQuantity} × {formatMoney(unitPrice, form.currency)} ={' '}
            {formatMoney(lineTotal, form.currency)}
          </p>
          {form.name.trim() && (
            <p className="text-xs text-[var(--dash-muted)] mt-1 truncate">{form.name.trim()}</p>
          )}
        </div>

        <div className="border-t border-[var(--dash-border)] pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--dash-muted)]">Subtotal</span>
            <span className="tabular-nums font-medium">
              {breakdown.subtotal > 0 ? formatMoney(breakdown.subtotal, form.currency) : formatMoney(0, form.currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--dash-muted)]">
              Tax (jurisdiction) {(STUB_TAX_RATE * 100).toFixed(2)}%
            </span>
            <span className="tabular-nums font-medium">
              {breakdown.taxIncluded
                ? 'Included'
                : formatMoney(breakdown.tax, form.currency)}
            </span>
          </div>
          <div className="flex justify-between text-base font-semibold pt-1">
            <span>
              {form.rateType === 'recurring'
                ? billingTotalLabel(form.billingPeriod)
                : 'Total'}
            </span>
            <span className="tabular-nums">
              {breakdown.total > 0 ? formatMoney(breakdown.total, form.currency) : formatMoney(0, form.currency)}
            </span>
          </div>
        </div>

        {form.rateType === 'recurring' && (
          <p className="text-xs text-[var(--dash-muted)] pt-1">
            Wallet-billed at the beginning of each period via on-chain subscription
          </p>
        )}
      </div>
    </div>
  );

  return (
    <SlideOverPanel
      open={open}
      onClose={resetAndClose}
      title="Add a product"
      width="2xl"
      footer={
        <>
          <button type="button" onClick={resetAndClose} className="dash-btn-secondary px-5 py-2.5 text-sm">
            Cancel
          </button>
          <button
            type="button"
            disabled={creating}
            onClick={() => void handleSubmit()}
            className="dash-btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
          >
            {creating ? 'Adding…' : 'Add product'}
          </button>
        </>
      }
    >
      <SlideOverTwoColumn
        form={formFields}
        preview={previewContent}
        previewVisible={previewVisible}
        onClosePreview={() => setPreviewVisible(false)}
      />
    </SlideOverPanel>
  );
}

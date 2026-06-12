'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Pencil, Search, Wallet, X } from 'lucide-react';
import type { Currency, Customer } from '@luxor/contracts';
import { cn } from '@/lib/cn';
import { SolanaWalletConnect } from '@/components/dashboard/SolanaWalletConnect';
import { toast } from 'sonner';

export type PaymentFrequency = 'one-time' | 'recurring';
export type PaymentMethodOption = 'manual' | 'saved-wallet' | 'email-link';

export type PaymentCreateValues = {
  frequency: PaymentFrequency;
  amount: string;
  currency: Currency;
  customerId: string;
  customerName: string;
  description: string;
  statementDescriptor: string;
  paymentMethod: PaymentMethodOption;
  walletAddress: string;
};

const INPUT_CLASS = 'dash-input w-full px-4 py-2.5 text-sm';

export function defaultPaymentCreateValues(merchantName: string): PaymentCreateValues {
  return {
    frequency: 'one-time',
    amount: '',
    currency: 'USDC',
    customerId: '',
    customerName: '',
    description: '',
    statementDescriptor: merchantName,
    paymentMethod: 'manual',
    walletAddress: '',
  };
}

export function PaymentCreateForm({
  merchantName = 'Luxor Pay',
  customers = [],
  saving = false,
  onCreate,
  onCancel,
}: {
  merchantName?: string;
  customers?: Customer[];
  saving?: boolean;
  onCreate: (values: PaymentCreateValues, options: { keepOpen: boolean }) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<PaymentCreateValues>(() =>
    defaultPaymentCreateValues(merchantName)
  );
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [editingDescriptor, setEditingDescriptor] = useState(false);

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return customers.slice(0, 8);
    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.walletAddress?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [customers, customerQuery]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === values.customerId),
    [customers, values.customerId]
  );

  const hasSavedWallet = Boolean(selectedCustomer?.walletAddress);

  const selectCustomer = (customer: Customer) => {
    setValues((prev) => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name,
    }));
    setCustomerQuery(customer.name);
    setCustomerDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent, keepOpen: boolean) => {
    e.preventDefault();
    const parsed = parseFloat(values.amount);
    if (Number.isNaN(parsed) || parsed <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    void onCreate(values, { keepOpen });
  };

  return (
    <form
      onSubmit={(e) => handleSubmit(e, false)}
      className="flex flex-col min-h-[calc(100vh-4rem)] bg-[var(--dash-panel)]"
    >
      <div className="flex items-center justify-between gap-4 px-4 md:px-5 py-4 border-b border-[var(--dash-border)] shrink-0 sticky top-0 z-10 bg-[var(--dash-panel)]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)] shrink-0"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <h1 className="text-lg font-semibold text-[var(--dash-text)] truncate">Create payment</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => toast.info('Thanks — feedback helps us improve Luxor Pay.')}
            className="text-xs text-[var(--dash-accent)] hover:underline hidden sm:inline"
          >
            Any feedback?
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={(e) => handleSubmit(e, true)}
            className="dash-btn-secondary px-3 sm:px-4 py-2 text-sm disabled:opacity-50 hidden sm:inline-flex"
          >
            Create and keep open
          </button>
          <button
            type="submit"
            disabled={saving}
            className="dash-btn-primary px-4 sm:px-5 py-2 text-sm disabled:opacity-50"
          >
            {saving ? 'Creating…' : 'Create payment'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl p-6 md:p-8 space-y-8">
          <div className="inline-flex rounded-lg border border-[var(--dash-border)] p-0.5 bg-[var(--dash-surface-elevated)]">
            {(['one-time', 'recurring'] as const).map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setValues((prev) => ({ ...prev, frequency: freq }))}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  values.frequency === freq
                    ? 'bg-[var(--dash-panel)] text-[var(--dash-text)] ring-1 ring-[var(--dash-accent)] shadow-sm'
                    : 'text-[var(--dash-muted)] hover:text-[var(--dash-text)]'
                )}
              >
                {freq === 'one-time' ? 'One-time' : 'Recurring'}
              </button>
            ))}
          </div>

          <section className="space-y-2">
            <label htmlFor="payment-amount" className="text-sm font-semibold text-[var(--dash-text)]">
              Amount
            </label>
            <div className="flex rounded-lg border border-[var(--dash-border)] overflow-hidden focus-within:ring-2 focus-within:ring-[var(--dash-accent)]">
              <select
                value={values.currency}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, currency: e.target.value as Currency }))
                }
                className="dash-input border-0 border-r border-[var(--dash-border)] rounded-none px-3 py-2.5 text-sm font-medium bg-[var(--dash-surface-elevated)] shrink-0"
                aria-label="Currency"
              >
                <option value="USDC">USDC</option>
                <option value="SOL">SOL</option>
              </select>
              <input
                id="payment-amount"
                type="number"
                step={values.currency === 'SOL' ? '0.0001' : '0.01'}
                min="0"
                value={values.amount}
                onChange={(e) => setValues((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                className="dash-input border-0 rounded-none flex-1 px-4 py-2.5 text-sm tabular-nums"
                required
              />
            </div>
          </section>

          <section className="space-y-2">
            <label htmlFor="payment-customer" className="text-sm font-semibold text-[var(--dash-text)]">
              Customer <span className="font-normal text-[var(--dash-muted)]">(optional)</span>
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)]"
              />
              <input
                id="payment-customer"
                value={customerQuery || values.customerName}
                onChange={(e) => {
                  setCustomerQuery(e.target.value);
                  setCustomerDropdownOpen(true);
                  if (!e.target.value) {
                    setValues((prev) => ({
                      ...prev,
                      customerId: '',
                      customerName: '',
                      paymentMethod: prev.paymentMethod === 'saved-wallet' ? 'manual' : prev.paymentMethod,
                    }));
                  }
                }}
                onFocus={() => setCustomerDropdownOpen(true)}
                placeholder="Search or add a customer..."
                className={cn(INPUT_CLASS, 'pl-9')}
              />
              {customerDropdownOpen && filteredCustomers.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 dash-card py-1 shadow-lg max-h-48 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)]"
                      onClick={() => selectCustomer(customer)}
                    >
                      <span className="font-medium">{customer.name}</span>
                      {customer.email && (
                        <span className="block text-xs text-[var(--dash-muted)]">{customer.email}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="space-y-2">
            <label htmlFor="payment-description" className="text-sm font-semibold text-[var(--dash-text)]">
              Description
            </label>
            <input
              id="payment-description"
              value={values.description}
              onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Payment for services"
              className={INPUT_CLASS}
            />
            <p className="text-xs text-[var(--dash-muted)]">
              Products or services associated with the payment
            </p>
          </section>

          <section className="space-y-2">
            <span className="text-sm font-semibold text-[var(--dash-text)]">On-chain transaction label</span>
            <div className="flex items-center gap-2">
              {editingDescriptor ? (
                <input
                  value={values.statementDescriptor}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, statementDescriptor: e.target.value }))
                  }
                  onBlur={() => setEditingDescriptor(false)}
                  autoFocus
                  className={cn(INPUT_CLASS, 'flex-1')}
                  placeholder="LUXOR*PAYMENT"
                  maxLength={22}
                />
              ) : (
                <>
                  <span className="text-sm text-[var(--dash-text)]">{values.statementDescriptor}</span>
                  <button
                    type="button"
                    onClick={() => setEditingDescriptor(true)}
                    className="p-1.5 rounded-md hover:bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)]"
                    aria-label="Edit on-chain transaction label"
                  >
                    <Pencil size={14} />
                  </button>
                </>
              )}
            </div>
          </section>

          <section className="space-y-4 border-t border-[var(--dash-border)] pt-6">
            <h2 className="text-sm font-semibold text-[var(--dash-text)]">Payment method</h2>
            <div className="space-y-3">
              <label
                className={cn(
                  'flex gap-3 p-4 rounded-lg border cursor-pointer transition-colors',
                  values.paymentMethod === 'manual'
                    ? 'border-[var(--dash-accent)] bg-[var(--dash-accent-soft)]'
                    : 'border-[var(--dash-border)] hover:border-[var(--dash-muted)]'
                )}
              >
                <input
                  type="radio"
                  name="payment-method"
                  checked={values.paymentMethod === 'manual'}
                  onChange={() => setValues((prev) => ({ ...prev, paymentMethod: 'manual' }))}
                  className="mt-0.5 accent-[var(--dash-accent)]"
                />
                <div className="flex-1 space-y-3 min-w-0">
                  <span className="text-sm font-medium text-[var(--dash-text)]">
                    Record wallet payment manually
                  </span>
                  {values.paymentMethod === 'manual' && (
                    <div className="space-y-3 pt-1">
                      <input
                        value={values.walletAddress}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, walletAddress: e.target.value }))
                        }
                        placeholder="Solana wallet address (optional)"
                        className={INPUT_CLASS}
                      />
                      <SolanaWalletConnect
                        onAddressChange={(address) => {
                          if (address) {
                            setValues((prev) => ({ ...prev, walletAddress: address }));
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </label>

              <label
                className={cn(
                  'flex gap-3 p-4 rounded-lg border transition-colors',
                  !values.customerId || !hasSavedWallet
                    ? 'opacity-50 cursor-not-allowed border-[var(--dash-border)]'
                    : values.paymentMethod === 'saved-wallet'
                      ? 'border-[var(--dash-accent)] bg-[var(--dash-accent-soft)] cursor-pointer'
                      : 'border-[var(--dash-border)] hover:border-[var(--dash-muted)] cursor-pointer'
                )}
              >
                <input
                  type="radio"
                  name="payment-method"
                  checked={values.paymentMethod === 'saved-wallet'}
                  disabled={!values.customerId || !hasSavedWallet}
                  onChange={() => setValues((prev) => ({ ...prev, paymentMethod: 'saved-wallet' }))}
                  className="mt-0.5 accent-[var(--dash-accent)]"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-[var(--dash-text)]">
                    Use customer&apos;s saved Solana wallet
                  </span>
                  {!values.customerId ? (
                    <p className="text-xs text-[var(--dash-muted)] mt-1">Select a customer first</p>
                  ) : hasSavedWallet ? (
                    <p className="text-xs font-mono text-[var(--dash-muted)] mt-1 truncate">
                      {selectedCustomer?.walletAddress}
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--dash-muted)] mt-1">
                      This customer has no saved wallet
                    </p>
                  )}
                </div>
              </label>

              <label
                className={cn(
                  'flex gap-3 p-4 rounded-lg border cursor-pointer transition-colors',
                  values.paymentMethod === 'email-link'
                    ? 'border-[var(--dash-accent)] bg-[var(--dash-accent-soft)]'
                    : 'border-[var(--dash-border)] hover:border-[var(--dash-muted)]'
                )}
              >
                <input
                  type="radio"
                  name="payment-method"
                  checked={values.paymentMethod === 'email-link'}
                  onChange={() => setValues((prev) => ({ ...prev, paymentMethod: 'email-link' }))}
                  className="mt-0.5 accent-[var(--dash-accent)]"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-[var(--dash-text)]">
                    Send Solana Pay link via email
                  </span>
                  {values.paymentMethod === 'email-link' && (
                    <p className="text-xs text-[var(--dash-muted)] mt-2">
                      <Link
                        href="/dashboard/links/create"
                        className="text-[var(--dash-accent)] hover:underline inline-flex items-center gap-1"
                      >
                        <Wallet size={12} />
                        Create a payment link instead
                      </Link>
                    </p>
                  )}
                </div>
              </label>
            </div>
          </section>
        </div>
      </div>

      <div className="shrink-0 border-t border-[var(--dash-border)] px-4 py-2.5 bg-[var(--dash-surface-elevated)]">
        <p className="text-xs text-[var(--dash-muted)] text-center">
          Tip: press{' '}
          <kbd className="px-1.5 py-0.5 rounded border border-[var(--dash-border)] bg-[var(--dash-panel)] font-mono text-[10px]">
            ⌘
          </kbd>{' '}
          +{' '}
          <kbd className="px-1.5 py-0.5 rounded border border-[var(--dash-border)] bg-[var(--dash-panel)] font-mono text-[10px]">
            Enter
          </kbd>{' '}
          to create payment
        </p>
      </div>
    </form>
  );
}

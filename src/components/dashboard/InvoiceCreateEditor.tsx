'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Search, X } from 'lucide-react';
import type { Currency, Customer, ProductCatalogItem } from '@luxor/contracts';
import { cn } from '@/lib/cn';

export type InvoiceLineItem = {
  id: string;
  productId?: string;
  name: string;
  amount: number;
  currency: Currency;
  quantity: number;
};

export type InvoicePaymentCollection = 'request' | 'auto-charge';

export type InvoiceCreateValues = {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerWallet: string;
  lineItems: InvoiceLineItem[];
  paymentCollection: InvoicePaymentCollection;
  template: string;
  note: string;
  footer: string;
  customFields: string;
  taxId: string;
};

const INPUT_CLASS = 'dash-input w-full px-4 py-2.5 text-sm';

function formatAmount(amount: number, currency: Currency): string {
  const decimals = currency === 'SOL' ? 4 : 2;
  return `${amount.toFixed(decimals)} ${currency}`;
}

function InvoicePreviewCard({
  merchantName,
  values,
}: {
  merchantName: string;
  values: InvoiceCreateValues;
}) {
  const totals = useMemo(() => {
    const byCurrency = new Map<Currency, number>();
    for (const item of values.lineItems) {
      const line = item.amount * item.quantity;
      byCurrency.set(item.currency, (byCurrency.get(item.currency) ?? 0) + line);
    }
    return byCurrency;
  }, [values.lineItems]);

  const hasItems = values.lineItems.some((i) => i.name.trim() && i.amount > 0);

  return (
    <div className="dash-card overflow-hidden bg-white text-gray-900 shadow-lg max-w-md mx-auto">
      <div className="p-6 border-b border-gray-200">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">On-chain invoice</p>
        <h3 className="text-xl font-bold mt-1">{merchantName}</h3>
        {values.customerName && (
          <p className="text-sm text-gray-600 mt-3">
            Bill to: <span className="font-medium text-gray-900">{values.customerName}</span>
          </p>
        )}
        {values.customerWallet && (
          <p className="text-xs font-mono text-gray-500 mt-1 truncate">{values.customerWallet}</p>
        )}
      </div>

      <div className="p-6 space-y-4">
        {hasItems ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="pb-2 font-medium">Item</th>
                <th className="pb-2 font-medium text-right">Qty</th>
                <th className="pb-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {values.lineItems
                .filter((i) => i.name.trim())
                .map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-2.5">{item.name}</td>
                    <td className="py-2.5 text-right tabular-nums">{item.quantity}</td>
                    <td className="py-2.5 text-right tabular-nums font-medium">
                      {formatAmount(item.amount * item.quantity, item.currency)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">Add line items to preview totals</p>
        )}

        {totals.size > 0 && (
          <div className="pt-2 space-y-1 border-t border-gray-200">
            {[...totals.entries()].map(([currency, total]) => (
              <div key={currency} className="flex justify-between text-sm font-semibold">
                <span>Total ({currency})</span>
                <span className="tabular-nums">{formatAmount(total, currency)}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500 pt-2">
          Settles on Solana via{' '}
          {values.paymentCollection === 'auto-charge'
            ? 'auto-charge from connected wallet'
            : 'Solana Pay request'}
        </p>

        {values.note && (
          <div className="text-xs text-gray-600 border-t border-gray-100 pt-3">
            <p className="font-medium text-gray-700">Note</p>
            <p className="mt-1 whitespace-pre-wrap">{values.note}</p>
          </div>
        )}
        {values.footer && (
          <p className="text-xs text-gray-500 border-t border-gray-100 pt-3">{values.footer}</p>
        )}
      </div>
    </div>
  );
}

function CollapsibleSection({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[var(--dash-border)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between gap-3 w-full py-4 text-sm font-semibold text-[var(--dash-text)]"
        aria-expanded={open}
      >
        <span>{label}</span>
        {open ? (
          <ChevronUp size={16} className="text-[var(--dash-muted)] shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-[var(--dash-muted)] shrink-0" />
        )}
      </button>
      {open && <div className="pb-4 space-y-3">{children}</div>}
    </section>
  );
}

const defaultLineItem = (): InvoiceLineItem => ({
  id: crypto.randomUUID(),
  name: '',
  amount: 0,
  currency: 'USDC',
  quantity: 1,
});

export function defaultInvoiceCreateValues(): InvoiceCreateValues {
  return {
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerWallet: '',
    lineItems: [defaultLineItem()],
    paymentCollection: 'request',
    template: 'default',
    note: '',
    footer: '',
    customFields: '',
    taxId: '',
  };
}

export function InvoiceCreateEditor({
  merchantName = 'Luxor Pay',
  customers = [],
  products = [],
  saving = false,
  onReview,
  onCancel,
}: {
  merchantName?: string;
  customers?: Customer[];
  products?: ProductCatalogItem[];
  saving?: boolean;
  onReview: (values: InvoiceCreateValues) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<InvoiceCreateValues>(defaultInvoiceCreateValues);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [optionsOpen, setOptionsOpen] = useState<Set<string>>(new Set());

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

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return products.slice(0, 6);
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [products, productQuery]);

  const toggleOption = (id: string) => {
    setOptionsOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectCustomer = (customer: Customer) => {
    setValues((prev) => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email ?? '',
      customerWallet: customer.walletAddress ?? '',
    }));
    setCustomerQuery(customer.name);
    setCustomerDropdownOpen(false);
  };

  const addProductLine = (product: ProductCatalogItem) => {
    setValues((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          id: crypto.randomUUID(),
          productId: product.id,
          name: product.name,
          amount: product.price,
          currency: product.currency,
          quantity: 1,
        },
      ],
    }));
    setProductQuery('');
  };

  const updateLineItem = (id: string, patch: Partial<InvoiceLineItem>) => {
    setValues((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onReview(values);
  };

  return (
    <form
      onSubmit={handleSubmit}
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
          <h1 className="text-lg font-semibold text-[var(--dash-text)] truncate">
            Create on-chain invoice
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setPreviewVisible((v) => !v)}
            className="text-xs text-[var(--dash-accent)] hover:underline hidden lg:inline"
          >
            {previewVisible ? 'Hide preview' : 'Show preview'}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="dash-btn-primary px-5 py-2 text-sm disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Review invoice'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row overflow-hidden">
        <div
          className={cn(
            'flex-1 overflow-y-auto border-b lg:border-b-0 border-[var(--dash-border)] bg-[var(--dash-panel)]',
            previewVisible && 'lg:border-r'
          )}
        >
          <div className="p-6 space-y-8 max-w-xl">
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--dash-text)]">Customer</h2>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)]"
                />
                <input
                  value={customerQuery || values.customerName}
                  onChange={(e) => {
                    setCustomerQuery(e.target.value);
                    setCustomerDropdownOpen(true);
                    if (!e.target.value) {
                      setValues((prev) => ({
                        ...prev,
                        customerId: '',
                        customerName: '',
                        customerEmail: '',
                        customerWallet: '',
                      }));
                    }
                  }}
                  onFocus={() => setCustomerDropdownOpen(true)}
                  placeholder="Search customers by name, email, or wallet"
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
                          <span className="block text-xs text-[var(--dash-muted)]">
                            {customer.email}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Link
                href="/dashboard/customers"
                className="text-sm text-[var(--dash-accent)] hover:underline inline-flex items-center gap-1"
              >
                <Plus size={14} />
                Add new customer
              </Link>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--dash-text)]">Items</h2>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)]"
                />
                <input
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  placeholder="Search products from catalog"
                  className={cn(INPUT_CLASS, 'pl-9')}
                />
                {productQuery && filteredProducts.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1 dash-card py-1 shadow-lg max-h-40 overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)] flex justify-between gap-2"
                        onClick={() => addProductLine(product)}
                      >
                        <span>{product.name}</span>
                        <span className="text-[var(--dash-muted)] tabular-nums shrink-0">
                          {formatAmount(product.price, product.currency)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {values.lineItems.map((item, index) => (
                  <div key={item.id} className="dash-card p-4 space-y-3">
                    <input
                      value={item.name}
                      onChange={(e) => updateLineItem(item.id, { name: e.target.value })}
                      placeholder="Line item description"
                      className={INPUT_CLASS}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        min="0"
                        step="0.0001"
                        value={item.amount || ''}
                        onChange={(e) =>
                          updateLineItem(item.id, { amount: parseFloat(e.target.value) || 0 })
                        }
                        placeholder="Amount"
                        className={INPUT_CLASS}
                      />
                      <select
                        value={item.currency}
                        onChange={(e) =>
                          updateLineItem(item.id, { currency: e.target.value as Currency })
                        }
                        className={INPUT_CLASS}
                      >
                        <option value="USDC">USDC</option>
                        <option value="SOL">SOL</option>
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(item.id, { quantity: parseInt(e.target.value, 10) || 1 })
                        }
                        className={INPUT_CLASS}
                        aria-label="Quantity"
                      />
                    </div>
                    {values.lineItems.length > 1 && (
                      <button
                        type="button"
                        className="text-xs text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                        onClick={() =>
                          setValues((prev) => ({
                            ...prev,
                            lineItems: prev.lineItems.filter((i) => i.id !== item.id),
                          }))
                        }
                      >
                        Remove item
                      </button>
                    )}
                    {index === values.lineItems.length - 1 && (
                      <button
                        type="button"
                        className="text-sm text-[var(--dash-accent)] hover:underline inline-flex items-center gap-1"
                        onClick={() =>
                          setValues((prev) => ({
                            ...prev,
                            lineItems: [...prev.lineItems, defaultLineItem()],
                          }))
                        }
                      >
                        <Plus size={14} />
                        Add line item
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--dash-text)]">Payment collection</h2>
              <div className="space-y-2">
                <label className="flex items-start gap-3 text-sm cursor-pointer dash-card p-4">
                  <input
                    type="radio"
                    name="payment-collection"
                    checked={values.paymentCollection === 'request'}
                    onChange={() =>
                      setValues((prev) => ({ ...prev, paymentCollection: 'request' }))
                    }
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-medium">Request payment</span>
                    <span className="block text-[var(--dash-muted)] text-xs mt-0.5">
                      Send a Solana Pay link — customer pays USDC or SOL from any wallet
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-3 text-sm cursor-pointer dash-card p-4">
                  <input
                    type="radio"
                    name="payment-collection"
                    checked={values.paymentCollection === 'auto-charge'}
                    onChange={() =>
                      setValues((prev) => ({ ...prev, paymentCollection: 'auto-charge' }))
                    }
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-medium">Auto-charge wallet</span>
                    <span className="block text-[var(--dash-muted)] text-xs mt-0.5">
                      Charge a connected Solana wallet when the invoice is finalized
                    </span>
                  </span>
                </label>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-[var(--dash-text)] mb-2">
                Additional options
              </h2>
              <CollapsibleSection
                label="Template"
                open={optionsOpen.has('template')}
                onToggle={() => toggleOption('template')}
              >
                <select
                  value={values.template}
                  onChange={(e) => setValues((prev) => ({ ...prev, template: e.target.value }))}
                  className={INPUT_CLASS}
                >
                  <option value="default">Default on-chain invoice</option>
                  <option value="minimal">Minimal</option>
                </select>
              </CollapsibleSection>
              <CollapsibleSection
                label="Note"
                open={optionsOpen.has('note')}
                onToggle={() => toggleOption('note')}
              >
                <textarea
                  value={values.note}
                  onChange={(e) => setValues((prev) => ({ ...prev, note: e.target.value }))}
                  rows={3}
                  placeholder="Memo shown on the invoice"
                  className={cn(INPUT_CLASS, 'resize-none')}
                />
              </CollapsibleSection>
              <CollapsibleSection
                label="Footer"
                open={optionsOpen.has('footer')}
                onToggle={() => toggleOption('footer')}
              >
                <input
                  value={values.footer}
                  onChange={(e) => setValues((prev) => ({ ...prev, footer: e.target.value }))}
                  placeholder="Footer text (e.g. settlement wallet)"
                  className={INPUT_CLASS}
                />
              </CollapsibleSection>
              <CollapsibleSection
                label="Custom fields"
                open={optionsOpen.has('custom')}
                onToggle={() => toggleOption('custom')}
              >
                <p className="text-xs text-[var(--dash-muted)]">
                  Custom metadata fields — coming soon.
                </p>
              </CollapsibleSection>
              <CollapsibleSection
                label="Tax ID"
                open={optionsOpen.has('tax')}
                onToggle={() => toggleOption('tax')}
              >
                <input
                  value={values.taxId}
                  onChange={(e) => setValues((prev) => ({ ...prev, taxId: e.target.value }))}
                  placeholder="Customer tax ID (optional)"
                  className={INPUT_CLASS}
                />
              </CollapsibleSection>
            </section>
          </div>
        </div>

        {previewVisible && (
          <div className="lg:w-[42%] xl:w-[40%] flex flex-col min-h-[280px] lg:min-h-0 bg-[var(--dash-panel-elevated)]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--dash-border)] shrink-0">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
                Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewVisible(false)}
                className="text-xs text-[var(--dash-accent)] hover:underline lg:hidden"
              >
                Close preview
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <InvoicePreviewCard merchantName={merchantName} values={values} />
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

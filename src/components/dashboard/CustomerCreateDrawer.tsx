'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Customer } from '@luxor/contracts';
import { auth } from '@/lib/firebase';
import { createCustomer } from '@/lib/merchant-data';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';
import { SlideOverPanel } from './SlideOverPanel';

const INPUT_CLASS = 'dash-input dash-input-solid w-full px-4 py-2.5 text-sm';

const CUSTOMER_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es-419', label: 'Spanish (Latin America)' },
  { value: 'es', label: 'Spanish (Spain)' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese (Simplified)' },
];

type CollapsibleSectionId = 'billing' | 'tax' | 'shipping' | 'invoice';

const COLLAPSIBLE_SECTIONS: { id: CollapsibleSectionId; label: string }[] = [
  { id: 'billing', label: 'Billing information' },
  { id: 'tax', label: 'Tax information' },
  { id: 'shipping', label: 'Shipping information' },
  { id: 'invoice', label: 'On-chain invoice settings' },
];

export interface CustomerCreateDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated: (customer: Customer) => void;
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
        className="flex items-center justify-between gap-3 w-full py-4 text-sm font-semibold text-[var(--dash-text)] hover:text-[var(--dash-text)]"
        aria-expanded={open}
      >
        <span>{label}</span>
        {open ? (
          <ChevronUp size={16} className="text-[var(--dash-muted)] shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-[var(--dash-muted)] shrink-0" />
        )}
      </button>
      {open && <div className="pb-4 space-y-4">{children}</div>}
    </section>
  );
}

const defaultForm = () => ({
  name: '',
  email: '',
  walletAddress: '',
  language: 'en',
});

export function CustomerCreateDrawer({ open, onClose, onCreated }: CustomerCreateDrawerProps) {
  const [form, setForm] = useState(defaultForm);
  const [creating, setCreating] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [openSections, setOpenSections] = useState<Set<CollapsibleSectionId>>(new Set());

  const resetAndClose = useCallback(() => {
    setForm(defaultForm());
    setShowMoreOptions(false);
    setOpenSections(new Set());
    onClose();
  }, [onClose]);

  const toggleSection = (id: CollapsibleSectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setCreating(true);
    try {
      const customer = await createCustomer(user.uid, {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        walletAddress: form.walletAddress.trim() || undefined,
      });
      onCreated(customer);
      setForm(defaultForm());
      setShowMoreOptions(false);
      setOpenSections(new Set());
      onClose();
      toast.success('Customer added');
    } catch {
      toast.error('Customer creation is not available yet.');
    } finally {
      setCreating(false);
    }
  }, [form.email, form.name, form.walletAddress, onClose, onCreated]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        void handleSubmit();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, handleSubmit]);

  const renderStubSection = (id: CollapsibleSectionId) => {
    switch (id) {
      case 'billing':
        return (
          <p className="text-xs text-[var(--dash-muted)] rounded-lg border border-[var(--dash-border)] bg-[var(--dash-panel-elevated)] p-3">
            Solana wallet address and billing jurisdiction — coming soon.
          </p>
        );
      case 'tax':
        return (
          <p className="text-xs text-[var(--dash-muted)] rounded-lg border border-[var(--dash-border)] bg-[var(--dash-panel-elevated)] p-3">
            Tax IDs and exemption status — coming soon.
          </p>
        );
      case 'shipping':
        return (
          <p className="text-xs text-[var(--dash-muted)] rounded-lg border border-[var(--dash-border)] bg-[var(--dash-panel-elevated)] p-3">
            Shipping address and delivery preferences — coming soon.
          </p>
        );
      case 'invoice':
        return (
          <p className="text-xs text-[var(--dash-muted)] rounded-lg border border-[var(--dash-border)] bg-[var(--dash-panel-elevated)] p-3">
            Custom fields, memo, and footer text — coming soon.
          </p>
        );
    }
  };

  return (
    <SlideOverPanel
      open={open}
      onClose={resetAndClose}
      title="Create customer"
      width="lg"
      footer={
        <>
          <button
            type="button"
            onClick={resetAndClose}
            className="dash-btn-secondary px-5 py-2.5 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={creating}
            onClick={() => void handleSubmit()}
            className="dash-btn-primary px-5 py-2.5 text-sm disabled:opacity-50 inline-flex items-center gap-2"
          >
            <span>{creating ? 'Adding…' : 'Add customer'}</span>
            {!creating && (
              <kbd className="hidden sm:inline text-[10px] font-normal px-1.5 py-0.5 rounded border border-white/20 bg-white/10 text-white/80">
                Ctrl + Enter
              </kbd>
            )}
          </button>
        </>
      }
    >
      <form
        id="create-customer-form"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
        className="flex-1 overflow-y-auto p-6 space-y-6 max-w-xl"
      >
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-[var(--dash-text)]">Account information</h3>

          <div>
            <label htmlFor="customer-name" className="block text-sm font-medium text-[var(--dash-text)] mb-1">
              Name
            </label>
            <p className="text-xs text-[var(--dash-muted)] mb-2">
              Display name for receipts and on-chain invoices.
            </p>
            <input
              id="customer-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Customer name"
              className={INPUT_CLASS}
              required
            />
          </div>

          <div>
            <label htmlFor="customer-email" className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">
              Email
            </label>
            <input
              id="customer-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="customer@example.com"
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label htmlFor="customer-wallet" className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">
              Solana wallet
            </label>
            <input
              id="customer-wallet"
              value={form.walletAddress}
              onChange={(e) => setForm((f) => ({ ...f, walletAddress: e.target.value }))}
              placeholder="Pubkey (optional — links guest payers)"
              className={INPUT_CLASS}
            />
            <p className="text-xs text-[var(--dash-muted)] mt-1.5">
              Guest customers paying via Phantom, Solflare, or any Solana wallet can be linked here.
            </p>
          </div>

          <div>
            <label htmlFor="customer-language" className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">
              Language
            </label>
            <select
              id="customer-language"
              value={form.language}
              onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
              className={INPUT_CLASS}
            >
              {CUSTOMER_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <div>
          <button
            type="button"
            onClick={() => setShowMoreOptions((v) => !v)}
            className={cn(
              'text-sm text-[var(--dash-accent)] hover:underline inline-flex items-center gap-1'
            )}
          >
            More options
            {showMoreOptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showMoreOptions && (
          <div className="space-y-0">
            {COLLAPSIBLE_SECTIONS.map(({ id, label }) => (
              <CollapsibleSection
                key={id}
                label={label}
                open={openSections.has(id)}
                onToggle={() => toggleSection(id)}
              >
                {renderStubSection(id)}
              </CollapsibleSection>
            ))}
          </div>
        )}
      </form>
    </SlideOverPanel>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { createCustomer, listCustomers } from '@/lib/firestore-data';
import {
  countryFlag,
  filterCustomersByTab,
  shortenWallet,
  type CustomerTab,
} from '@/lib/customer-utils';
import type { Currency, Customer } from '@luxor/contracts';
import {
  PageHeader,
  EmptyState,
  DataTable,
  FilterRow,
  FilterChip,
  type DataTableColumn,
} from '@/components/dashboard';
import {
  Users,
  Plus,
  Copy,
  Download,
  BarChart3,
  Columns3,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

const TABS: { id: CustomerTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'top', label: 'Top' },
  { id: 'new', label: 'New' },
  { id: 'recurring', label: 'Recurring' },
  { id: 'recent', label: 'Recent' },
];

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<CustomerTab>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [preferredToken, setPreferredToken] = useState<Currency>('USDC');
  const [countryCode, setCountryCode] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<Customer['type'] | 'all'>('all');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const data = await listCustomers(user.uid);
        setCustomers(data);
      } catch {
        toast.error('Could not load customers.');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const filtered = useMemo(() => {
    let list = filterCustomersByTab(customers, tab);
    if (emailFilter.trim()) {
      const q = emailFilter.trim().toLowerCase();
      list = list.filter((c) => c.email?.toLowerCase().includes(q));
    }
    if (nameFilter.trim()) {
      const q = nameFilter.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (typeFilter !== 'all') {
      list = list.filter((c) => c.type === typeFilter);
    }
    return list;
  }, [customers, tab, emailFilter, nameFilter, typeFilter]);

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((c) => c.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    setCreating(true);
    try {
      const customer = await createCustomer(user.uid, {
        name: name.trim(),
        email: email.trim() || undefined,
        walletAddress: walletAddress.trim() || undefined,
        preferredToken: walletAddress.trim() ? preferredToken : undefined,
        countryCode: countryCode.trim() || undefined,
      });
      setCustomers((prev) => [customer, ...prev]);
      setName('');
      setEmail('');
      setWalletAddress('');
      setCountryCode('');
      setShowForm(false);
      toast.success('Customer added');
    } catch {
      toast.error('Could not save customer.');
    } finally {
      setCreating(false);
    }
  };

  const copyEmails = () => {
    const rows = filtered.filter((c) => selected.has(c.id) || selected.size === 0);
    const emails = rows.map((c) => c.email).filter(Boolean).join('\n');
    if (!emails) {
      toast.error('No emails to copy');
      return;
    }
    navigator.clipboard.writeText(emails);
    toast.success('Emails copied');
  };

  const columns: DataTableColumn<Customer>[] = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={filtered.length > 0 && selected.size === filtered.length}
          onChange={toggleAll}
          aria-label="Select all"
          className="rounded border-[var(--dash-border)]"
        />
      ),
      className: 'w-10',
      render: (c) => (
        <input
          type="checkbox"
          checked={selected.has(c.id)}
          onClick={(e) => e.stopPropagation()}
          onChange={() => toggleOne(c.id)}
          aria-label={`Select ${c.name}`}
          className="rounded border-[var(--dash-border)]"
        />
      ),
    },
    {
      key: 'name',
      header: 'Customer',
      render: (c) => (
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[var(--dash-accent-soft)] flex items-center justify-center text-xs font-semibold text-[var(--dash-accent)] shrink-0">
            {c.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{c.name}</p>
            {c.type === 'guest' && (
              <span className="inline-flex mt-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded border border-[var(--dash-border)] text-[var(--dash-muted)] bg-[var(--dash-surface-elevated)]">
                Guest
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (c) => (
        <span className="text-[var(--dash-muted)]">{c.email ?? '—'}</span>
      ),
    },
    {
      key: 'wallet',
      header: 'Wallet / default token',
      render: (c) =>
        c.walletAddress ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded bg-[var(--dash-surface-elevated)] border border-[var(--dash-border)]">
              {c.preferredToken ?? 'SOL'}
            </span>
            <code className="text-xs font-mono text-[var(--dash-text)]">
              {shortenWallet(c.walletAddress)}
            </code>
          </div>
        ) : (
          <span className="text-xs text-[var(--dash-muted)]" title="Wallet linking requires CRM backend">
            No wallet — pending backend
          </span>
        ),
    },
    {
      key: 'country',
      header: 'Country',
      render: (c) => (
        <span className="text-lg" title={c.countryCode ?? 'No country'}>
          {countryFlag(c.countryCode)}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Customers"
        description="Payers on your Solana checkout. Recurring payment counts require backend sync."
        actions={
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="dash-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2"
          >
            <Plus size={16} />
            Add customer
          </button>
        }
        filters={
          <>
            <div className="flex flex-wrap gap-1 border-b border-[var(--dash-border)] -mx-6 md:-mx-8 px-6 md:px-8 pb-0 mb-2 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)]">
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                    tab === id
                      ? 'border-[var(--dash-accent)] text-[var(--dash-accent)]'
                      : 'border-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <FilterRow>
              <FilterChip
                label="Email"
                value={emailFilter || 'Any'}
                active={Boolean(emailFilter)}
                onClick={() => {
                  const next = window.prompt('Filter by email (partial):', emailFilter);
                  if (next !== null) setEmailFilter(next);
                }}
              />
              <FilterChip
                label="Name"
                value={nameFilter || 'Any'}
                active={Boolean(nameFilter)}
                onClick={() => {
                  const next = window.prompt('Filter by name (partial):', nameFilter);
                  if (next !== null) setNameFilter(next);
                }}
              />
              <FilterChip label="Created" value="Any date" />
              <FilterChip
                label="Type"
                value={typeFilter === 'all' ? 'All' : typeFilter === 'guest' ? 'Guest' : 'Registered'}
                active={typeFilter !== 'all'}
                onClick={() => {
                  const order: Array<Customer['type'] | 'all'> = ['all', 'guest', 'registered'];
                  const idx = order.indexOf(typeFilter);
                  setTypeFilter(order[(idx + 1) % order.length]);
                }}
              />
            </FilterRow>
          </>
        }
      />

      <div className="px-6 md:px-8 py-3 flex flex-wrap items-center gap-2 border-b border-[var(--dash-border)] bg-[var(--dash-surface-elevated)]">
        <button
          type="button"
          onClick={copyEmails}
          className="dash-btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
        >
          <Copy size={12} /> Copy
        </button>
        <button
          type="button"
          onClick={() => toast.info('CSV export — pending backend')}
          className="dash-btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
        >
          <Download size={12} /> Export
        </button>
        <button
          type="button"
          onClick={() => toast.info('Customer analytics — pending backend')}
          className="dash-btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
        >
          <BarChart3 size={12} /> Analyze
        </button>
        <button
          type="button"
          onClick={() => toast.info('Customize columns — coming soon')}
          className="dash-btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
        >
          <Columns3 size={12} /> Edit columns
        </button>
        {!loading && (
          <span className="ml-auto text-xs text-[var(--dash-muted)] tabular-nums">
            {filtered.length} {filtered.length === 1 ? 'customer' : 'customers'}
          </span>
        )}
      </div>

      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowForm(false)}
              aria-label="Close"
            />
            <form
              onSubmit={handleCreate}
              className="relative dash-card p-6 w-full max-w-lg space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-[var(--dash-text)]">Add customer</h2>
                <button type="button" onClick={() => setShowForm(false)} className="p-1">
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-[var(--dash-muted)]">
                Saved locally in your browser. Payment history and verified wallet require CRM backend.
              </p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="dash-input w-full px-4 py-2.5 text-sm"
                required
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className="dash-input w-full px-4 py-2.5 text-sm"
              />
              <input
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Solana wallet (optional)"
                className="dash-input w-full px-4 py-2.5 text-sm font-mono text-xs"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={preferredToken}
                  onChange={(e) => setPreferredToken(e.target.value as Currency)}
                  className="dash-input px-4 py-2.5 text-sm"
                >
                  <option value="USDC">USDC</option>
                  <option value="SOL">SOL</option>
                </select>
                <input
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  placeholder="Country (ISO, e.g. US)"
                  maxLength={2}
                  className="dash-input px-4 py-2.5 text-sm uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="dash-btn-primary w-full py-2.5 text-sm disabled:opacity-50"
              >
                {creating ? 'Saving…' : 'Save customer'}
              </button>
            </form>
          </div>
        )}

        {!loading && filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Add customers manually or wait for payments via links — automatic linking requires backend."
            action={{ label: 'Add customer', onClick: () => setShowForm(true) }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            rowKey={(c) => c.id}
            loading={loading}
            loadingMessage="Loading customers…"
            onRowClick={(c) => router.push(`/dashboard/customers/${c.id}`)}
          />
        )}
      </div>
    </>
  );
}

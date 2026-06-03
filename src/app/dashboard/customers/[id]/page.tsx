'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { getCustomer, updateCustomer } from '@/lib/firestore-data';
import { listPayments } from '@/lib/payments-api';
import type { Currency, Customer, PaymentOrder } from '@luxor/contracts';
import {
  PageHeader,
  CopyField,
  DetailSection,
  DetailSidebar,
  DetailRow,
  DataTable,
  type DataTableColumn,
} from '@/components/dashboard';
import { filterPaymentsForCustomer } from '@/lib/payment-detail-utils';
import {
  formatPaymentAmount,
  paymentStatusLabels,
} from '@/lib/transaction-utils';
import { countryFlag, shortenWallet } from '@/lib/customer-utils';
import { dashStatusBadges } from '@/lib/dashboard-styles';
import { cn } from '@/lib/cn';
import { ArrowLeft, Pencil, Save, X } from 'lucide-react';
import { toast } from 'sonner';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const paymentStatusStyles: Record<PaymentOrder['status'], string> = {
  pending: dashStatusBadges.warning,
  confirmed: dashStatusBadges.success,
  expired: dashStatusBadges.neutral,
  failed: dashStatusBadges.error,
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [payments, setPayments] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editWallet, setEditWallet] = useState('');
  const [editToken, setEditToken] = useState<Currency>('USDC');
  const [editCountry, setEditCountry] = useState('');

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const [c, token] = await Promise.all([
          getCustomer(user.uid, id),
          user.getIdToken(),
        ]);
        setCustomer(c);
        if (c) {
          setEditName(c.name);
          setEditEmail(c.email ?? '');
          setEditWallet(c.walletAddress ?? '');
          setEditToken(c.preferredToken ?? 'USDC');
          setEditCountry(c.countryCode ?? '');
        }
        try {
          const orders = await listPayments(token);
          if (c) setPayments(filterPaymentsForCustomer(orders, c));
        } catch {
          /* payments optional */
        }
      } catch {
        toast.error('Could not load customer');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [id]);

  const statusLabel = useMemo(() => {
    if (!customer) return null;
    if (customer.type === 'guest') return 'Guest';
    return 'Active';
  }, [customer]);

  const paymentColumns: DataTableColumn<PaymentOrder>[] = [
    {
      key: 'amount',
      header: 'Amount',
      render: (o) => (
        <span className="tabular-nums font-medium">
          {formatPaymentAmount(o.amount, o.currency)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (o) => (
        <span className={paymentStatusStyles[o.status]}>{paymentStatusLabels[o.status]}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (o) => (
        <span className="text-[var(--dash-muted)]">{formatDate(o.createdAt)}</span>
      ),
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (o) => (
        <Link
          href={`/dashboard/transactions/${o.reference}`}
          className="font-mono text-xs text-[var(--dash-accent)] hover:underline"
        >
          {o.reference.slice(0, 12)}…
        </Link>
      ),
    },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !customer) return;
    if (!editName.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateCustomer(user.uid, customer.id, {
        name: editName.trim(),
        email: editEmail.trim() || undefined,
        walletAddress: editWallet.trim() || undefined,
        preferredToken: editWallet.trim() ? editToken : undefined,
        countryCode: editCountry.trim() || undefined,
      });
      setCustomer(updated);
      setEditing(false);
      toast.success('Customer updated');
    } catch {
      toast.error('Could not save customer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-[var(--dash-muted)] py-16 text-center">Loading customer…</p>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-[var(--dash-muted)]">Customer not found</p>
        <Link href="/dashboard/customers" className="dash-btn-secondary px-4 py-2 text-sm inline-block">
          Back to customers
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--dash-muted)]">
              Customers
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span>{customer.name}</span>
              {statusLabel && (
                <span
                  className={cn(
                    customer.type === 'guest'
                      ? dashStatusBadges.neutral
                      : dashStatusBadges.success
                  )}
                >
                  {statusLabel}
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--dash-muted)] font-normal">
              {customer.email ?? 'No email'} · Customer since {formatDate(customer.createdAt)}
            </p>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/customers"
              className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              All customers
            </Link>
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="dash-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2"
              >
                <Pencil size={16} />
                Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
            )}
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
        <div className="grid xl:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            {editing ? (
              <DetailSection title="Edit customer">
                <form onSubmit={handleSave} className="space-y-4 max-w-lg">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Name"
                    className="dash-input w-full px-4 py-2.5 text-sm"
                    required
                  />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="Email (optional)"
                    className="dash-input w-full px-4 py-2.5 text-sm"
                  />
                  <input
                    value={editWallet}
                    onChange={(e) => setEditWallet(e.target.value)}
                    placeholder="Solana wallet (optional)"
                    className="dash-input w-full px-4 py-2.5 text-sm font-mono text-xs"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={editToken}
                      onChange={(e) => setEditToken(e.target.value as Currency)}
                      className="dash-input px-4 py-2.5 text-sm"
                    >
                      <option value="USDC">USDC</option>
                      <option value="SOL">SOL</option>
                    </select>
                    <input
                      value={editCountry}
                      onChange={(e) => setEditCountry(e.target.value)}
                      placeholder="Country (ISO)"
                      maxLength={2}
                      className="dash-input px-4 py-2.5 text-sm uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="dash-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </form>
              </DetailSection>
            ) : (
              <DetailSection title="Customer information">
                <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-xs text-[var(--dash-muted)]">Name</dt>
                    <dd className="mt-1 font-medium">{customer.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--dash-muted)]">Email</dt>
                    <dd className="mt-1">{customer.email ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--dash-muted)]">Wallet</dt>
                    <dd className="mt-1 font-mono text-xs">
                      {customer.walletAddress ? shortenWallet(customer.walletAddress) : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--dash-muted)]">Preferred token</dt>
                    <dd className="mt-1">{customer.preferredToken ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--dash-muted)]">Country</dt>
                    <dd className="mt-1 text-lg">{countryFlag(customer.countryCode)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--dash-muted)]">Type</dt>
                    <dd className="mt-1 capitalize">{customer.type}</dd>
                  </div>
                </dl>
              </DetailSection>
            )}

            <DetailSection
              title="Related payments"
              description="Matched by name, email, or wallet when available"
            >
              {payments.length === 0 ? (
                <p className="text-sm text-[var(--dash-muted)] py-4 text-center">
                  No related payments found. Payments are linked when payer details match this
                  customer.
                </p>
              ) : (
                <DataTable
                  columns={paymentColumns}
                  data={payments}
                  rowKey={(o) => o.reference}
                  onRowClick={(o) => router.push(`/dashboard/transactions/${o.reference}`)}
                />
              )}
            </DetailSection>
          </div>

          <DetailSidebar>
            <CopyField label="Customer ID" value={customer.id} />
            <DetailRow label="Payments">{customer.paymentCount ?? payments.length}</DetailRow>
            {customer.lastPaymentAt && (
              <DetailRow label="Last payment">{formatDate(customer.lastPaymentAt)}</DetailRow>
            )}
            <DetailRow label="Created">{formatDate(customer.createdAt)}</DetailRow>
          </DetailSidebar>
        </div>
      </div>
    </>
  );
}

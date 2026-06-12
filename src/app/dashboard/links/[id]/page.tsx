'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { getMerchantProfile, getPaymentLink } from '@/lib/merchant-data';
import { listPayments } from '@/lib/payments-api';
import type { PaymentLink, PaymentOrder } from '@luxor/contracts';
import { dashStatusBadges } from '@/lib/dashboard-styles';
import {
  PageHeader,
  CopyField,
  DetailSection,
  DetailSidebar,
  DetailRow,
  DataTable,
  type DataTableColumn,
} from '@/components/dashboard';
import { cn } from '@/lib/cn';
import {
  ArrowLeft,
  ExternalLink,
  Monitor,
  Pencil,
  Smartphone,
  QrCode,
} from 'lucide-react';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

type TabId = 'summary' | 'payments';

const PAYMENT_METHODS = [
  { id: 'solana-pay', label: 'Solana Pay' },
  { id: 'phantom', label: 'Phantom' },
  { id: 'solflare', label: 'Solflare' },
  { id: 'qr', label: 'QR scan' },
] as const;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAmount(amount: number, currency: string): string {
  return `${amount} ${currency}`;
}

export default function PaymentLinkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [merchantName, setMerchantName] = useState<string>('Luxor Pay');
  const [payments, setPayments] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [tab, setTab] = useState<TabId>('summary');
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');

  const payUrl = useMemo(() => {
    if (!id || typeof window === 'undefined') return `/pay/link/${id ?? ''}`;
    return `${window.location.origin}/pay/link/${id}`;
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const [l, profile] = await Promise.all([
          getPaymentLink(user.uid, id),
          getMerchantProfile(user.uid),
        ]);
        setLink(l);
        if (profile?.businessName) setMerchantName(profile.businessName);
      } catch (err) {
        toast.error(getFirestoreErrorMessage(err, 'Could not load payment link'));
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (tab !== 'payments' || !auth.currentUser) return;
    let cancelled = false;
    auth.currentUser
      .getIdToken()
      .then((token: string) => listPayments(token))
      .then((orders: PaymentOrder[]) => {
        if (!cancelled && id) {
          setPayments(orders.filter((o: PaymentOrder) => o.linkId === id));
        }
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load payments for this link');
      })
      .finally(() => {
        if (!cancelled) setPaymentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, id]);

  const paymentColumns: DataTableColumn<PaymentOrder>[] = [
    {
      key: 'reference',
      header: 'Reference',
      render: (o) => (
        <span className="font-mono text-xs">{o.reference.slice(0, 16)}…</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (o) => (
        <span className="tabular-nums font-medium">
          {o.amount} {o.currency}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (o) => (
        <span
          className={cn(
            o.status === 'confirmed'
              ? dashStatusBadges.success
              : o.status === 'pending'
                ? dashStatusBadges.warning
                : dashStatusBadges.error
          )}
        >
          {o.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (o) => (
        <span className="text-[var(--dash-muted)]">{formatDate(o.createdAt)}</span>
      ),
    },
  ];

  if (loading) {
    return (
      <p className="text-sm text-[var(--dash-muted)] py-16 text-center">Loading payment link…</p>
    );
  }

  if (!link) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-[var(--dash-muted)]">Payment link not found</p>
        <Link href="/dashboard/links" className="dash-btn-secondary px-4 py-2 text-sm inline-block">
          Back to links
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
              Payment link
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span>{link.name}</span>
              <span className="tabular-nums text-lg font-medium">
                {formatAmount(link.amount, link.currency)}
              </span>
            </div>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/links"
              className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              All links
            </Link>
            <Link
              href={`/dashboard/links/${link.id}/edit`}
              className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
            >
              <Pencil size={16} />
              Edit
            </Link>
            <a
              href={payUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2"
            >
              <ExternalLink size={16} />
              Open checkout
            </a>
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6">
        <CopyField value={payUrl} label="Payment URL" />

        <div className="flex flex-wrap items-center gap-4 dash-card p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl">
              <QRCodeSVG value={payUrl} size={120} bgColor="#ffffff" fgColor="#000000" level="M" />
            </div>
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                <QrCode size={16} className="text-[var(--dash-accent)]" />
                QR code
              </p>
              <p className="text-xs text-[var(--dash-muted)] mt-1 max-w-xs">
                Customers scan to open Solana Pay checkout
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-1 border-b border-[var(--dash-border)]">
          {(['summary', 'payments'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                if (t === 'payments') setPaymentsLoading(true);
              }}
              className={cn(
                'px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors',
                tab === t
                  ? 'border-white text-[var(--dash-text)]'
                  : 'border-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid xl:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            {tab === 'summary' && (
              <>
                <DetailSection title="Products">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs uppercase text-[var(--dash-muted)] border-b border-[var(--dash-border)]">
                        <th className="text-left py-2 font-semibold">Name</th>
                        <th className="text-left py-2 font-semibold">Amount</th>
                        <th className="text-left py-2 font-semibold">Currency</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-3 font-medium">{link.name}</td>
                        <td className="py-3 tabular-nums">{link.amount}</td>
                        <td className="py-3">{link.currency}</td>
                      </tr>
                    </tbody>
                  </table>
                </DetailSection>

                <DetailSection
                  title="Payment methods"
                  description="Accepted on Luxor Pay checkout"
                >
                  <div className="flex flex-wrap gap-2">
                    {PAYMENT_METHODS.map((m) => (
                      <span
                        key={m.id}
                        className="dash-badge dash-badge-neutral px-3 py-1.5 text-xs font-medium"
                      >
                        {m.label}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--dash-muted)] mt-4">
                    SOL and USDC on Solana · wallet connect or QR via Solana Pay
                  </p>
                </DetailSection>
              </>
            )}

            {tab === 'payments' && (
              <DetailSection title="Payments" description="On-chain payments for this link">
                {paymentsLoading ? (
                  <p className="text-sm text-[var(--dash-muted)] py-6 text-center">Loading payments…</p>
                ) : payments.length === 0 ? (
                  <p className="text-sm text-[var(--dash-muted)] py-6 text-center">
                    No payments recorded for this link yet.
                  </p>
                ) : (
                  <DataTable
                    columns={paymentColumns}
                    data={payments}
                    rowKey={(o) => o.reference}
                  />
                )}
              </DetailSection>
            )}
          </div>

          <div className="space-y-4">
            <DetailSidebar>
              <DetailRow label="Status">
                <span className={link.active ? dashStatusBadges.success : dashStatusBadges.neutral}>
                  {link.active ? 'Active' : 'Inactive'}
                </span>
              </DetailRow>
              <DetailRow label="Created">{formatDate(link.createdAt)}</DetailRow>
              <CopyField label="Link ID" value={link.id} />
            </DetailSidebar>

            <div className="dash-card overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--dash-border)] flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
                  Preview
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('mobile')}
                    className={cn(
                      'p-1.5 rounded',
                      previewMode === 'mobile'
                        ? 'bg-[var(--dash-surface-elevated)] text-[var(--dash-text)]'
                        : 'text-[var(--dash-muted)]'
                    )}
                    aria-label="Mobile preview"
                  >
                    <Smartphone size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('desktop')}
                    className={cn(
                      'p-1.5 rounded',
                      previewMode === 'desktop'
                        ? 'bg-[var(--dash-surface-elevated)] text-[var(--dash-text)]'
                        : 'text-[var(--dash-muted)]'
                    )}
                    aria-label="Desktop preview"
                  >
                    <Monitor size={16} />
                  </button>
                </div>
              </div>
              <div
                className={cn(
                  'p-4 bg-[#0a0a0a] min-h-[280px]',
                  previewMode === 'mobile' ? 'max-w-[200px] mx-auto' : ''
                )}
              >
                <div className="rounded-lg border border-white/10 overflow-hidden text-xs">
                  <div className="p-3 border-b border-white/10">
                    <p className="text-gray-500 text-[10px] uppercase">Order</p>
                    <p className="text-white font-medium truncate">{merchantName}</p>
                    <p className="text-gray-400 truncate">{link.name}</p>
                    <p className="text-white font-bold mt-2 tabular-nums">
                      {link.amount} {link.currency}
                    </p>
                  </div>
                  <div className="p-3 flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-white rounded p-1">
                      <QRCodeSVG value={payUrl} size={56} bgColor="#fff" fgColor="#000" level="L" />
                    </div>
                    <div className="w-full h-7 rounded-full bg-white text-black text-[10px] font-semibold flex items-center justify-center">
                      Connect wallet
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchant-data';
import { fetchPayment, listPayments } from '@/lib/payments-api';
import type { PaymentOrder } from '@luxor/contracts';
import {
  PageHeader,
  CopyField,
  DetailSection,
  DetailSidebar,
  DetailRow,
  Timeline,
  EmptyState,
  DataTable,
  ReceiptModal,
  type DataTableColumn,
} from '@/components/dashboard';
import {
  buildTransferTimelineEvents,
  formatDetailDate,
  paymentDisplayStatus,
} from '@/lib/payment-detail-utils';
import { formatBalanceAmount, shortenAddress } from '@/lib/balance-utils';
import { formatPaymentAmount, paymentMethodLabel } from '@/lib/transaction-utils';
import { dashStatusBadges } from '@/lib/dashboard-styles';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

const statusBadgeClass = {
  success: dashStatusBadges.success,
  warning: dashStatusBadges.warning,
  error: dashStatusBadges.error,
  neutral: dashStatusBadges.neutral,
} as const;

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function TransferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentOrder | null>(null);
  const [relatedPayments, setRelatedPayments] = useState<PaymentOrder[]>([]);
  const [merchantWallet, setMerchantWallet] = useState('');
  const [merchantName, setMerchantName] = useState('Luxor Pay');
  const [loading, setLoading] = useState(true);
  const [receiptOpen, setReceiptOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const load = async (user: NonNullable<typeof auth.currentUser>) => {
      try {
        const [profile, token] = await Promise.all([
          getMerchantProfile(user.uid),
          user.getIdToken(),
        ]);
        if (!cancelled) {
          setMerchantWallet(profile?.merchantWallet ?? '');
          if (profile?.businessName) setMerchantName(profile.businessName);
        }

        let order: PaymentOrder | null = null;
        try {
          order = await fetchPayment(id);
        } catch {
          /* fall back to list */
        }

        const orders = await listPayments(token);
        if (!order) {
          order = orders.find((o) => o.reference === id) ?? null;
        }

        if (!cancelled) {
          if (order) {
            setPayment(order);
            setRelatedPayments(
              orders.filter(
                (o) =>
                  o.reference !== order!.reference &&
                  o.recipient === order!.recipient &&
                  o.currency === order!.currency
              )
            );
          } else {
            toast.error('Transfer not found');
          }
        }
      } catch {
        if (!cancelled) toast.error('Could not load transfer');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      void load(user);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [id]);

  const destination = merchantWallet || payment?.recipient || '';
  const displayStatus = payment ? paymentDisplayStatus(payment.status) : null;
  const timelineEvents = useMemo(
    () =>
      payment && destination
        ? buildTransferTimelineEvents(payment, destination)
        : payment
          ? buildTransferTimelineEvents(payment, payment.recipient)
          : [],
    [payment, destination]
  );

  const relatedColumns: DataTableColumn<PaymentOrder>[] = [
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
      render: (o) => {
        const s = paymentDisplayStatus(o.status);
        return <span className={statusBadgeClass[s.tone]}>{s.label}</span>;
      },
    },
    {
      key: 'date',
      header: 'Date',
      render: (o) => (
        <span className="text-[var(--dash-muted)]">{formatDateShort(o.createdAt)}</span>
      ),
    },
    {
      key: 'ref',
      header: 'Reference',
      render: (o) => (
        <Link
          href={`/dashboard/transactions/${o.reference}`}
          className="font-mono text-xs text-[var(--dash-accent)] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {shortenAddress(o.reference, 8)}
        </Link>
      ),
    },
  ];

  if (loading) {
    return (
      <p className="text-sm text-[var(--dash-muted)] py-16 text-center">Loading transfer…</p>
    );
  }

  if (!payment) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-[var(--dash-muted)]">Transfer not found</p>
        <Link href="/dashboard/balances" className="dash-btn-secondary px-4 py-2 text-sm inline-block">
          Back to balances
        </Link>
      </div>
    );
  }

  const transferLabel = payment.status === 'confirmed' ? 'Paid' : displayStatus?.label ?? 'Pending';

  return (
    <>
      <PageHeader
        title={
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--dash-muted)]">
              Transfers
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="tabular-nums text-xl font-semibold">
                {formatBalanceAmount(payment.amount, payment.currency)}
              </span>
              <span className={statusBadgeClass[displayStatus!.tone]}>{transferLabel}</span>
            </div>
            <p className="text-sm text-[var(--dash-muted)] font-normal">
              {payment.confirmedAt
                ? `Completed ${formatDetailDate(payment.confirmedAt)}`
                : `Initiated ${formatDetailDate(payment.createdAt)}`}
            </p>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/balances"
              className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              All balances
            </Link>
            <button
              type="button"
              className="dash-btn-primary px-4 py-2 text-sm"
              onClick={() => setReceiptOpen(true)}
            >
              View receipt
            </button>
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
        <div className="grid xl:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <DetailSection title="History">
              <Timeline events={timelineEvents} />
            </DetailSection>

            <DetailSection title="Account details">
              <div className="space-y-2">
                <p className="text-xs text-[var(--dash-muted)] uppercase tracking-wide">
                  Destination wallet
                </p>
                {destination ? (
                  <div className="dash-card px-4 py-3 bg-[var(--dash-surface-elevated)]">
                    <p className="text-sm font-medium">Solana wallet</p>
                    <code className="text-xs font-mono text-[var(--dash-muted)] break-all mt-1 block">
                      {destination}
                    </code>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--dash-muted)]">
                    Connect a merchant wallet in Settings to receive payouts.
                  </p>
                )}
              </div>
            </DetailSection>

            <DetailSection title="Summary">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase text-[var(--dash-muted)] border-b border-[var(--dash-border)]">
                    <th className="text-left py-2 font-semibold">Type</th>
                    <th className="text-right py-2 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--dash-border)]">
                    <td className="py-3">Charges</td>
                    <td className="py-3 text-right tabular-nums">
                      {formatBalanceAmount(payment.amount, payment.currency)}
                    </td>
                  </tr>
                  <tr className="border-b border-[var(--dash-border)]">
                    <td className="py-3 text-[var(--dash-muted)]">Refunds</td>
                    <td className="py-3 text-right text-[var(--dash-muted)]">—</td>
                  </tr>
                  <tr className="border-b border-[var(--dash-border)]">
                    <td className="py-3 text-[var(--dash-muted)]">Adjustments</td>
                    <td className="py-3 text-right text-[var(--dash-muted)]">—</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold">Net transfer</td>
                    <td className="py-3 text-right tabular-nums font-semibold">
                      {formatBalanceAmount(payment.amount, payment.currency)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </DetailSection>

            <DetailSection
              title="Transactions"
              action={
                <button
                  type="button"
                  className="dash-btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
                  onClick={() => toast.info('Export — coming soon')}
                >
                  <Download size={12} />
                  Export
                </button>
              }
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm border-b border-[var(--dash-border)] pb-3">
                  <span>{paymentMethodLabel(payment)}</span>
                  <span className="tabular-nums font-medium">
                    {formatBalanceAmount(payment.amount, payment.currency)}
                  </span>
                </div>
                {relatedPayments.length > 0 ? (
                  <DataTable
                    columns={relatedColumns}
                    data={relatedPayments.slice(0, 5)}
                    rowKey={(o) => o.reference}
                    onRowClick={(o) => router.push(`/dashboard/transactions/${o.reference}`)}
                  />
                ) : (
                  <p className="text-sm text-[var(--dash-muted)]">
                    No other transactions to the same destination wallet.
                  </p>
                )}
              </div>
            </DetailSection>

            <DetailSection title="Logs">
              <EmptyState
                icon={FileText}
                title="No logs"
                description="Transfer logs will appear here when the settlement backend is connected."
              />
            </DetailSection>

            <DetailSection title="Events">
              <Timeline events={timelineEvents} />
            </DetailSection>
          </div>

          <DetailSidebar>
            <button
              type="button"
              className="dash-btn-primary w-full py-2 text-sm"
              onClick={() => setReceiptOpen(true)}
            >
              View receipt
            </button>
            <CopyField label="Transfer ID" value={payment.reference} />
            <DetailRow label="Internal note">
              <span className="text-[var(--dash-muted)]">—</span>
            </DetailRow>
            <DetailRow label="Method">{paymentMethodLabel(payment)}</DetailRow>
            <DetailRow label="Fee">
              <span className="text-[var(--dash-muted)]">—</span>
            </DetailRow>
            <DetailRow label="Amount">
              <span className="tabular-nums font-medium">
                {formatBalanceAmount(payment.amount, payment.currency)}
              </span>
            </DetailRow>
            <DetailRow label="Metadata">
              <span className="text-[var(--dash-muted)]">No metadata</span>
            </DetailRow>
          </DetailSidebar>
        </div>
      </div>

      <ReceiptModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        title="Transfer receipt"
        payment={payment}
        merchantName={merchantName}
        destinationWallet={destination || undefined}
      />
    </>
  );
}

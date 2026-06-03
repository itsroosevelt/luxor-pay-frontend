'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchInvoicesApi } from '@/lib/api/billing';
import { formatCurrencyAmount } from '@/lib/format-currency';
import type { BillingInvoice } from '@luxor/contracts';
import { getExplorerTxUrl } from '@/web3/config/network';
import {
  PageHeader,
  CopyField,
  DetailSection,
  DetailSidebar,
  DetailRow,
  BillingSectionNav,
  BackendNotice,
  EmptyState,
} from '@/components/dashboard';
import { dashStatusBadges } from '@/lib/dashboard-styles';
import { cn } from '@/lib/cn';
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const statusStyles: Record<BillingInvoice['status'], string> = {
  draft: dashStatusBadges.neutral,
  open: dashStatusBadges.warning,
  paid: dashStatusBadges.success,
  void: dashStatusBadges.neutral,
  uncollectible: dashStatusBadges.error,
};

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<BillingInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [notImplemented, setNotImplemented] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    fetchInvoicesApi()
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          const found = result.data.find((i) => i.id === id) ?? null;
          setInvoice(found);
        } else {
          setUnavailable(Boolean(result.unavailable));
          setNotImplemented(Boolean(result.notImplemented));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <p className="text-sm text-[var(--dash-muted)] py-16 text-center">Loading invoice…</p>
    );
  }

  return (
    <>
      <PageHeader
        title={
          invoice ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--dash-muted)]">
                Invoices
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="tabular-nums text-xl font-semibold">
                  {formatCurrencyAmount(invoice.amount, invoice.currency)}
                </span>
                <span className={cn(statusStyles[invoice.status], 'capitalize')}>
                  {invoice.status}
                </span>
              </div>
              <p className="text-sm text-[var(--dash-muted)] font-normal">
                Created {formatDate(invoice.createdAt)}
              </p>
            </div>
          ) : (
            'Invoice'
          )
        }
        actions={
          <Link
            href="/dashboard/billing/invoices"
            className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            All invoices
          </Link>
        }
      />

      <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6">
        <BillingSectionNav />
        <BackendNotice unavailable={unavailable} notImplemented={notImplemented} />

        {!invoice ? (
          <EmptyState
            icon={FileText}
            title="Invoice not found"
            description={
              unavailable || notImplemented
                ? 'Invoice details will load from the billing API when it is connected.'
                : `No invoice with ID ${id} was returned by the billing API.`
            }
            action={{ label: 'Back to invoices', href: '/dashboard/billing/invoices' }}
          />
        ) : (
          <div className="grid xl:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-6">
              <DetailSection title="Summary">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-[var(--dash-border)]">
                      <td className="py-3 text-[var(--dash-muted)]">Amount due</td>
                      <td className="py-3 text-right tabular-nums font-medium">
                        {formatCurrencyAmount(invoice.amount, invoice.currency)}
                      </td>
                    </tr>
                    <tr className="border-b border-[var(--dash-border)]">
                      <td className="py-3 text-[var(--dash-muted)]">Due date</td>
                      <td className="py-3 text-right">
                        {invoice.dueDate ? formatDate(invoice.dueDate) : '—'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium">Status</td>
                      <td className="py-3 text-right capitalize">{invoice.status}</td>
                    </tr>
                  </tbody>
                </table>
              </DetailSection>

              {invoice.onChainSignature && (
                <DetailSection title="On-chain settlement">
                  <CopyField label="Transaction signature" value={invoice.onChainSignature} />
                  <a
                    href={getExplorerTxUrl(invoice.onChainSignature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2 mt-3"
                  >
                    <ExternalLink size={14} />
                    View on Solana Explorer
                  </a>
                </DetailSection>
              )}
            </div>

            <DetailSidebar>
              <CopyField label="Invoice ID" value={invoice.id} />
              <DetailRow label="Customer ID">{invoice.customerId}</DetailRow>
              <DetailRow label="Currency">{invoice.currency}</DetailRow>
              {invoice.paidAt && (
                <DetailRow label="Paid">{formatDate(invoice.paidAt)}</DetailRow>
              )}
            </DetailSidebar>
          </div>
        )}
      </div>
    </>
  );
}

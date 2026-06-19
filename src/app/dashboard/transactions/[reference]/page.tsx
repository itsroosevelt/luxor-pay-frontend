'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { fetchPayment, listPayments } from '@/lib/payments-api';
import { getCheckoutPayment } from '@/lib/checkout-payments-local';
import { isFrontendOnly } from '@/lib/frontend-only';
import type { PaymentOrder } from '@luxor/contracts';
import { getExplorerTxUrl } from '@/web3/config/network';
import {
  PageHeader,
  CopyField,
  DetailSection,
  DetailSidebar,
  DetailRow,
  Timeline,
} from '@/components/dashboard';
import {
  buildPaymentTimelineEvents,
  formatDetailDate,
  paymentDisplayStatus,
} from '@/lib/payment-detail-utils';
import {
  formatPaymentAmount,
  paymentCustomerLabel,
  paymentMethodLabel,
} from '@/lib/transaction-utils';
import { dashStatusBadges } from '@/lib/dashboard-styles';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const statusBadgeClass = {
  success: dashStatusBadges.success,
  warning: dashStatusBadges.warning,
  error: dashStatusBadges.error,
  neutral: dashStatusBadges.neutral,
} as const;

export default function PaymentDetailPage() {
  const { reference } = useParams<{ reference: string }>();
  const [payment, setPayment] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reference) return;
    let cancelled = false;

    const load = async (user: NonNullable<typeof auth.currentUser>) => {
      try {
        if (isFrontendOnly() && reference.startsWith('chk_')) {
          const local = getCheckoutPayment(user.uid, reference);
          if (!cancelled) {
            if (local) setPayment(local);
            else toast.error('Pago no encontrado');
          }
          return;
        }

        const order = await fetchPayment(reference);
        if (!cancelled) setPayment(order);
      } catch {
        try {
          if (isFrontendOnly()) {
            const local = getCheckoutPayment(user.uid, reference);
            if (!cancelled) {
              if (local) setPayment(local);
              else toast.error('Pago no encontrado');
            }
            return;
          }

          const token = await user.getIdToken();
          const orders = await listPayments(token);
          const cached = orders.find((o) => o.reference === reference);
          if (!cancelled) {
            if (cached) setPayment(cached);
            else toast.error('Payment not found');
          }
        } catch {
          if (!cancelled) toast.error('Could not load payment');
        }
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
  }, [reference]);

  const displayStatus = payment ? paymentDisplayStatus(payment.status) : null;
  const timelineEvents = useMemo(
    () => (payment ? buildPaymentTimelineEvents(payment) : []),
    [payment]
  );

  if (loading) {
    return (
      <p className="text-sm text-[var(--dash-muted)] py-16 text-center">Cargando pago…</p>
    );
  }

  if (!payment) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-[var(--dash-muted)]">Pago no encontrado</p>
        <Link href="/dashboard/transactions" className="dash-btn-secondary px-4 py-2 text-sm inline-block">
          Volver a transacciones
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
              Pagos
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="tabular-nums text-xl font-semibold">
                {formatPaymentAmount(payment.amount, payment.currency)}
              </span>
              {displayStatus && (
                <span className={statusBadgeClass[displayStatus.tone]}>{displayStatus.label}</span>
              )}
            </div>
            <p className="text-sm text-[var(--dash-muted)] font-normal">
              {payment.confirmedAt
                ? `Completed ${formatDetailDate(payment.confirmedAt)}`
                : `Created ${formatDetailDate(payment.createdAt)}`}
            </p>
          </div>
        }
        actions={
          <Link
            href="/dashboard/transactions"
            className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Todas las transacciones
          </Link>
        }
      />

      <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
        <div className="grid xl:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <DetailSection title="Resumen">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-[var(--dash-border)]">
                    <td className="py-3 text-[var(--dash-muted)]">Importe bruto</td>
                    <td className="py-3 text-right tabular-nums font-medium">
                      {formatPaymentAmount(payment.amount, payment.currency)}
                    </td>
                  </tr>
                  <tr className="border-b border-[var(--dash-border)]">
                    <td className="py-3 text-[var(--dash-muted)]">Comisión de red (est.)</td>
                    <td className="py-3 text-right text-[var(--dash-muted)]">—</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">Neto</td>
                    <td className="py-3 text-right tabular-nums font-semibold">
                      {formatPaymentAmount(payment.amount, payment.currency)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </DetailSection>

            <DetailSection title="Método de pago">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="dash-badge dash-badge-neutral px-3 py-1 text-xs font-medium">
                    {paymentMethodLabel(payment)}
                  </span>
                  <span className="text-sm text-[var(--dash-muted)]">Solana · {payment.currency}</span>
                </div>
                <DetailRow label="Cliente / pagador">
                  {paymentCustomerLabel(payment)}
                </DetailRow>
                <DetailRow label="Wallet destinataria">
                  <code className="text-xs font-mono break-all">{payment.recipient}</code>
                </DetailRow>
              </div>
            </DetailSection>

            <DetailSection title="On-chain">
              {payment.signature ? (
                <div className="space-y-3">
                  <CopyField label="Firma de transacción" value={payment.signature} />
                  <a
                    href={getExplorerTxUrl(payment.signature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
                  >
                    <ExternalLink size={14} />
                    Ver en Solana Explorer
                  </a>
                </div>
              ) : (
                <p className="text-sm text-[var(--dash-muted)]">
                  Aún no hay firma on-chain. Aparecerá cuando el cliente complete el pago.
                </p>
              )}
            </DetailSection>

            {payment.linkId && (
              <DetailSection title="Enlace de pago">
                <Link
                  href={`/dashboard/links/${payment.linkId}`}
                  className="text-sm text-[var(--dash-accent)] hover:underline"
                >
                  Ver enlace {payment.linkId}
                </Link>
              </DetailSection>
            )}

            <DetailSection title="Eventos">
              <Timeline events={timelineEvents} />
            </DetailSection>
          </div>

          <DetailSidebar>
            <CopyField label="ID de pago" value={payment.reference} />
            {payment.linkId && <CopyField label="ID del enlace" value={payment.linkId} />}
            <DetailRow label="Moneda">{payment.currency}</DetailRow>
            <DetailRow label="Estado">
              {displayStatus && (
                <span className={statusBadgeClass[displayStatus.tone]}>{displayStatus.label}</span>
              )}
            </DetailRow>
            <DetailRow label="Metadatos">
              <span className="text-[var(--dash-muted)]">Sin metadatos</span>
            </DetailRow>
          </DetailSidebar>
        </div>
      </div>
    </>
  );
}

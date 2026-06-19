'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { listCustomers, getMerchantProfile } from '@/lib/merchant-data';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { listPayments } from '@/lib/payments-api';
import { listCheckoutPayments } from '@/lib/checkout-payments-local';
import { isFrontendOnly } from '@/lib/frontend-only';
import { computeBalanceSummary } from '@/lib/balance-utils';
import {
  buildDailyCountSeries,
  buildDailyVolumeSeries,
  confirmedOrders,
  countNewCustomersInPeriod,
  formatCombinedVolume,
  grossVolumeInPeriod,
  hasSeriesData,
  netVolumeInPeriod,
  ordersInRange,
  periodRange,
  startOfDay,
  topCustomersBySpend,
  volumeForDay,
  yesterdayDeltaLabel,
} from '@/lib/dashboard-metrics';
import { formatPaymentAmount } from '@/lib/transaction-utils';
import type { Customer, PaymentOrder } from '@luxor/contracts';
import {
  FilterRow,
  FilterChip,
  SummaryMetricCard,
  MiniBarChart,
  VolumeSparkline,
  DemoModeBanner,
  MerchantSetupChecklist,
} from '@/components/dashboard';
import { Plus, Pencil, Send, QrCode } from 'lucide-react';
import { toast } from 'sonner';

// Import develop functional wallet components and modals
import { WalletBalanceContainer } from '@/components/dashboard/WalletBalanceContainer';
import { TransferModal } from '@/components/dashboard/overview/TransferModal';
import { ReceiveModal } from '@/components/dashboard/overview/ReceiveModal';
import { TransferSuccessModal } from '@/components/dashboard/overview/TransferSuccessModal';
import { Transfer } from '@/lib/transfers-api';

const SUMMARY_DAYS = 7;
const TODAY_CHART_DAYS = 14;

export default function DashboardOverviewPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isTransferSuccessModalOpen, setIsTransferSuccessModalOpen] = useState(false);
  const [transferSuccessData, setTransferSuccessData] = useState<Transfer | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const [payments, customerList, profile] = await Promise.all([
          isFrontendOnly()
            ? Promise.resolve(listCheckoutPayments(user.uid))
            : user.getIdToken().then((token) => listPayments(token)).catch(() => [] as PaymentOrder[]),
          listCustomers(user.uid).catch(() => [] as Customer[]),
          getMerchantProfile(user.uid).catch(() => null),
        ]);
        setOrders(payments);
        setCustomers(customerList);
        setMerchantWallet(profile?.merchantWallet || null);
      } catch (e) {
        console.error(e);
        toast.error(getFirestoreErrorMessage(e, 'No se pudieron cargar los datos del panel'));
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const today = useMemo(() => startOfDay(new Date()), []);
  const yesterday = useMemo(() => {
    const d = startOfDay(new Date());
    d.setDate(d.getDate() - 1);
    return d;
  }, []);

  const todayNetVolume = useMemo(() => volumeForDay(orders, today), [orders, today]);
  const yesterdayNetVolume = useMemo(() => volumeForDay(orders, yesterday), [orders, yesterday]);
  const todayDelta = useMemo(
    () => yesterdayDeltaLabel(todayNetVolume, yesterdayNetVolume),
    [todayNetVolume, yesterdayNetVolume]
  );

  const todayChartSeries = useMemo(
    () => buildDailyVolumeSeries(orders, TODAY_CHART_DAYS),
    [orders]
  );

  const transfersToday = useMemo(
    () =>
      ordersInRange(orders, today, new Date()).filter(
        (o) => o.status === 'confirmed' || o.status === 'pending'
      ).length,
    [orders, today]
  );

  const { start: periodStart, end: periodEnd } = useMemo(
    () => periodRange(SUMMARY_DAYS),
    []
  );

  const periodConfirmed = useMemo(
    () => ordersInRange(orders, periodStart, periodEnd, (o) => o.status === 'confirmed'),
    [orders, periodStart, periodEnd]
  );

  const periodFailed = useMemo(
    () =>
      ordersInRange(orders, periodStart, periodEnd, (o) =>
        ['failed', 'expired'].includes(o.status)
      ),
    [orders, periodStart, periodEnd]
  );

  const paymentCountSeries = useMemo(
    () =>
      buildDailyCountSeries(orders, SUMMARY_DAYS, (o) => o.status === 'confirmed', periodEnd),
    [orders, periodEnd]
  );

  const grossSeries = useMemo(
    () => buildDailyVolumeSeries(orders, SUMMARY_DAYS, periodEnd),
    [orders, periodEnd]
  );

  const periodGross = useMemo(
    () => grossVolumeInPeriod(orders, periodStart, periodEnd),
    [orders, periodStart, periodEnd]
  );

  const periodNet = useMemo(
    () => netVolumeInPeriod(orders, periodStart, periodEnd),
    [orders, periodStart, periodEnd]
  );

  const newCustomers = useMemo(
    () => countNewCustomersInPeriod(customers, periodStart, periodEnd),
    [customers, periodStart, periodEnd]
  );

  const topCustomers = useMemo(
    () => topCustomersBySpend(orders, periodStart, periodEnd, 5),
    [orders, periodStart, periodEnd]
  );

  const allTimeConfirmed = useMemo(() => confirmedOrders(orders).length, [orders]);

  const placeholderAction = () => toast.message('Próximamente');

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-10">
      <MerchantSetupChecklist />
      {isFrontendOnly() ? <DemoModeBanner /> : null}

      {/* Section 1 — Hoy */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl font-semibold text-[var(--dash-text)] tracking-tight">Hoy</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsReceiveModalOpen(true)}
              className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <QrCode size={16} /> Recibir
            </button>
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="dash-btn-primary px-4 py-2 text-sm inline-flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <Send size={16} /> Transferir
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 dash-card p-4 sm:p-5 space-y-4">
            <div>
              <p className="text-sm text-[var(--dash-muted)]">Volumen neto</p>
              <div className="flex items-baseline gap-3 mt-1 flex-wrap">
                <p className="text-3xl font-semibold tabular-nums text-[var(--dash-text)]">
                  {loading ? '…' : `${formatCombinedVolume(todayNetVolume)} unidades`}
                </p>
                {!loading && todayDelta && (
                  <span
                    className={
                      todayNetVolume >= yesterdayNetVolume
                        ? 'text-sm text-emerald-400'
                        : 'text-sm text-[var(--dash-muted)]'
                    }
                  >
                    {todayDelta}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--dash-muted)] mt-1">
                SOL + USDC confirmados (unidades combinadas)
              </p>
            </div>
            <VolumeSparkline
              data={loading ? [] : todayChartSeries}
              height={220}
              emptyLabel="Sin volumen aún — línea plana en cero"
            />
          </div>

          <div className="dash-card p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--dash-text)]">Consejo</p>
              <p className="text-sm text-[var(--dash-muted)] mt-2">
                Los gráficos usan pagos del almacenamiento local de demo o del historial de transacciones. 
                Completa un checkout — los pagos se confirman tras validarse en la red.
              </p>
            </div>
            <Link
              href="/dashboard/links"
              className="dash-btn-secondary px-4 py-2 text-sm inline-block text-center mt-4"
            >
              Crear enlace de pago
            </Link>
          </div>
        </div>

        {/* Live On-chain Balance */}
        {merchantWallet && (
          <div className="pt-2">
            <WalletBalanceContainer merchantWallet={merchantWallet} />
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="dash-card p-4 sm:p-5">
            <p className="text-sm text-[var(--dash-muted)] mb-1">Transferencias hoy</p>
            <p className="text-xl font-semibold tabular-nums">
              {loading ? '…' : transfersToday}
            </p>
            <p className="text-xs text-[var(--dash-muted)] mt-1">Hoy (confirmadas + pendientes)</p>
          </div>
          <div className="dash-card p-4 sm:p-5">
            <p className="text-sm text-[var(--dash-muted)] mb-1">Payment Links</p>
            <p className="text-xl font-semibold tabular-nums">
              Activos
            </p>
            <p className="text-xs text-[var(--dash-muted)] mt-1">Accept payments anywhere</p>
          </div>
          <div className="dash-card p-4 sm:p-5">
            <p className="text-sm text-[var(--dash-muted)] mb-1">API Integrations</p>
            <p className="text-xl font-semibold text-primary">
              Ready
            </p>
            <p className="text-xs text-[var(--dash-muted)] mt-1">Custom backend routes enabled</p>
          </div>
        </div>
      </section>

      {/* Section 2 — Resumen */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="text-xl font-semibold text-[var(--dash-text)]">Tu resumen</h2>
          <div className="flex flex-wrap items-center gap-2">
            <FilterRow>
              <FilterChip label="Rango de fechas" value="Últimos 7 días" />
              <FilterChip label="Intervalo" value="Diario" />
              <FilterChip label="Comparar" value="Periodo anterior" />
            </FilterRow>
            <button
              type="button"
              onClick={placeholderAction}
              className="dash-btn-primary px-3 py-1.5 text-sm inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              Añadir
            </button>
            <button
              type="button"
              onClick={placeholderAction}
              className="dash-btn-secondary px-3 py-1.5 text-sm inline-flex items-center gap-1.5"
            >
              <Pencil size={14} />
              Editar
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SummaryMetricCard
            label="Pagos"
            value={loading ? '…' : periodConfirmed.length}
            sublabel={allTimeConfirmed > 0 ? `${allTimeConfirmed} en total` : undefined}
            empty={!loading && periodConfirmed.length === 0}
          >
            {!loading && periodConfirmed.length > 0 && (
              <MiniBarChart data={paymentCountSeries} />
            )}
          </SummaryMetricCard>

          <SummaryMetricCard
            label="Volumen bruto"
            value={loading ? '…' : `${formatCombinedVolume(periodGross)} unidades`}
            sublabel="Últimos 7 días · confirmados"
            empty={!loading && periodGross === 0}
          >
            {!loading && hasSeriesData(grossSeries) && (
              <VolumeSparkline data={grossSeries} height={72} emptyLabel="Sin datos" />
            )}
          </SummaryMetricCard>

          <SummaryMetricCard
            label="Volumen neto"
            value={loading ? '…' : `${formatCombinedVolume(periodNet)} unidades`}
            sublabel="Últimos 7 días · tras comisiones (MVP: igual que bruto)"
            empty={!loading && periodNet === 0}
          >
            {!loading && hasSeriesData(grossSeries) && (
              <VolumeSparkline data={grossSeries} height={72} emptyLabel="Sin datos" />
            )}
          </SummaryMetricCard>

          <SummaryMetricCard
            label="Pagos fallidos"
            value={loading ? '…' : periodFailed.length}
            sublabel="Fallidos o expirados"
            empty={!loading && periodFailed.length === 0}
          />

          <SummaryMetricCard
            label="Clientes nuevos"
            value={loading ? '…' : newCustomers}
            sublabel="Creados en el periodo"
            empty={!loading && newCustomers === 0}
          />

          <SummaryMetricCard
            label="Mejores clientes por gasto"
            empty={!loading && topCustomers.length === 0}
          >
            {!loading && topCustomers.length > 0 && (
              <ul className="space-y-2 text-sm">
                {topCustomers.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between gap-2 border-b border-[var(--dash-border)] pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-[var(--dash-text)] truncate">{row.label}</span>
                    <span className="text-[var(--dash-muted)] tabular-nums shrink-0">
                      {formatCombinedVolume(row.total)} u. · {row.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SummaryMetricCard>
        </div>
      </section>

      {/* Modals for Solana Payments */}
      <TransferModal 
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={(data) => {
          setTransferSuccessData(data);
          setIsTransferSuccessModalOpen(true);
        }}
      />
      
      <ReceiveModal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        merchantWallet={merchantWallet}
      />

      <TransferSuccessModal
        isOpen={isTransferSuccessModalOpen}
        onClose={() => setIsTransferSuccessModalOpen(false)}
        transferData={transferSuccessData}
      />
    </div>
  );
}

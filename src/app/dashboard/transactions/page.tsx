'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { listPayments } from '@/lib/payments-api';
import { apiErrorMessage } from '@/lib/api-errors';
import { loadCollectionCurrencies, type CollectionToken } from '@/lib/merchant-collection-currencies';
import type { Currency } from '@luxor/contracts';
import {
  PageHeader,
  EmptyState,
  DataTable,
  type DataTableColumn,
} from '@/components/dashboard';
import {
  TRANSACTION_TABS,
  filterTransactionsByTab,
  formatSignedTransactionAmount,
  formatTransactionFee,
  ordersToTransactionRows,
  type TransactionRow,
  type TransactionTab,
} from '@/lib/transaction-utils';
import { cn } from '@/lib/cn';
import { BarChart3, Download, Plus, Receipt } from 'lucide-react';
import { toast } from 'sonner';

const PAGE_SIZE = 25;

const FILTER_CHIPS = [
  { id: 'currency', label: 'Moneda' },
  { id: 'type', label: 'Tipo' },
  { id: 'balanceType', label: 'Tipo de saldo' },
  { id: 'createdAt', label: 'Fecha de creación' },
  { id: 'availableOn', label: 'Disponible el' },
] as const;

function parseTab(value: string | null): TransactionTab {
  if (value === 'payments' || value === 'transfers' || value === 'topups' || value === 'all') {
    return value;
  }
  return 'all';
}

function FilterChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface-elevated)] text-sm text-[var(--dash-text)] hover:bg-[rgba(255,255,255,0.08)] transition-colors"
    >
      {label}
      <Plus size={14} className="text-[var(--dash-muted)]" />
    </button>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-[var(--dash-muted)] py-16 text-center">Cargando transacciones…</p>
      }
    >
      <TransactionsContent />
    </Suspense>
  );
}

function TransactionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [currencyFilter, setCurrencyFilter] = useState<Currency | 'USDT' | null>(null);
  const [collectionCurrencies, setCollectionCurrencies] = useState<CollectionToken[]>(['USDC', 'SOL']);

  const activeTab = parseTab(searchParams.get('tab'));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError(null);
      try {
        const token = await user.getIdToken();
        setCollectionCurrencies(loadCollectionCurrencies(user.uid));
        const orders = await listPayments(token);
        setRows(ordersToTransactionRows(orders));
      } catch (error) {
        const message = apiErrorMessage(
          error,
          'No se pudieron cargar las transacciones. ¿Está el backend en ejecución?'
        );
        setLoadError(message);
        setRows([]);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [activeTab, currencyFilter]);

  const allRows = rows;

  const tabRows = useMemo(
    () => filterTransactionsByTab(allRows, activeTab),
    [allRows, activeTab]
  );

  const filteredRows = useMemo(() => {
    if (!currencyFilter) return tabRows;
    return tabRows.filter((row) => row.currency === currencyFilter);
  }, [tabRows, currencyFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, safePage]);

  const availableCurrencies = useMemo(() => {
    const fromRows = [...new Set(allRows.map((row) => row.currency))];
    const enabled = collectionCurrencies.filter(
      (c): c is Currency | 'USDT' => c === 'USDC' || c === 'SOL' || c === 'USDT'
    );
    return [...new Set([...enabled, ...fromRows])] as (Currency | 'USDT')[];
  }, [allRows, collectionCurrencies]);

  const setTab = (tab: TransactionTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'all') params.delete('tab');
    else params.set('tab', tab);
    const query = params.toString();
    router.replace(query ? `/dashboard/transactions?${query}` : '/dashboard/transactions');
  };

  const handleExport = () => {
    if (filteredRows.length === 0) {
      toast.info('No hay transacciones para exportar');
      return;
    }
    const header = [
      'Importe',
      'Comisiones',
      'Total',
      'Tipo',
      'Tipo de saldo',
      'Descripción',
      'Transacción de saldo',
      'Fecha de creación',
      'Disponible el',
    ];
    const lines = filteredRows.map((row) =>
      [
        formatSignedTransactionAmount(row.amount, row.currency),
        formatTransactionFee(row.fees, row.currency),
        formatSignedTransactionAmount(row.total, row.currency),
        row.typeLabel,
        row.balanceType,
        row.description,
        row.balanceTransactionId,
        row.createdAt,
        row.availableOn,
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `transacciones-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('Exportación descargada');
  };

  const columns: DataTableColumn<TransactionRow>[] = [
    {
      key: 'amount',
      header: 'Importe',
      className: 'whitespace-nowrap',
      render: (row) => (
        <span className="font-medium tabular-nums">
          {formatSignedTransactionAmount(row.amount, row.currency)}
        </span>
      ),
    },
    {
      key: 'fees',
      header: 'Comisiones',
      className: 'whitespace-nowrap text-[var(--dash-muted)]',
      render: (row) => (
        <span className="tabular-nums">{formatTransactionFee(row.fees, row.currency)}</span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      className: 'whitespace-nowrap',
      render: (row) => (
        <span className="font-medium tabular-nums">
          {formatSignedTransactionAmount(row.total, row.currency)}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (row) => <span>{row.typeLabel}</span>,
    },
    {
      key: 'balanceType',
      header: 'Tipo de saldo',
      render: (row) => <span className="text-[var(--dash-muted)]">{row.balanceType}</span>,
    },
    {
      key: 'description',
      header: 'Descripción',
      render: (row) => (
        <span className="font-mono text-xs text-[var(--dash-text)]">{row.description}</span>
      ),
    },
    {
      key: 'balanceTransactionId',
      header: 'Transacción de saldo',
      className: 'whitespace-nowrap',
      render: (row) => (
        <span className="font-mono text-xs text-[var(--dash-muted)]">{row.balanceTransactionId}</span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Transacciones"
        description="Historial de pagos y actividad de tu cuenta en Solana."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
            >
              <Download size={16} />
              Exportar
            </button>
            <button
              type="button"
              onClick={() => toast.info('Analizar — próximamente')}
              className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
            >
              <BarChart3 size={16} />
              Analizar
            </button>
          </div>
        }
      />

      <div className="px-4 sm:px-6 md:px-8 pb-8 max-w-[1400px] mx-auto space-y-4">
        {loadError && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            <p className="font-medium text-red-100">No se pudieron cargar las transacciones</p>
            <p className="mt-1 text-red-200/90">{loadError}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-1 border-b border-[var(--dash-border)]">
          {TRANSACTION_TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === id
                  ? 'border-[var(--dash-accent)] text-[var(--dash-accent)]'
                  : 'border-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FILTER_CHIPS.map(({ id, label }) => (
            <FilterChip
              key={id}
              label={id === 'currency' && currencyFilter ? `${label}: ${currencyFilter}` : label}
              onClick={() => {
                if (id === 'currency') {
                  if (availableCurrencies.length === 0) {
                    toast.info('No hay monedas para filtrar');
                    return;
                  }
                  if (!currencyFilter) {
                    setCurrencyFilter(availableCurrencies[0]);
                    return;
                  }
                  const currentIndex = availableCurrencies.indexOf(currencyFilter);
                  const nextIndex = currentIndex + 1;
                  setCurrencyFilter(
                    nextIndex >= availableCurrencies.length ? null : availableCurrencies[nextIndex]
                  );
                  return;
                }
                toast.info(`Filtro «${label}» — próximamente`);
              }}
            />
          ))}
          {currencyFilter && (
            <button
              type="button"
              onClick={() => setCurrencyFilter(null)}
              className="text-xs text-[var(--dash-accent)] hover:underline px-1"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {!loading && !loadError && filteredRows.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Sin transacciones"
            description={
              activeTab === 'all'
                ? 'Comparte un enlace de pago o cobra con POS para ver tu primera transacción.'
                : 'No hay movimientos en esta categoría todavía.'
            }
            action={
              activeTab === 'all'
                ? { label: 'Crear enlace de pago', href: '/dashboard/links' }
                : { label: 'Ver toda la actividad', href: '/dashboard/transactions' }
            }
          />
        ) : (
          <DataTable
            className="[&_table]:min-w-[1100px]"
            columns={columns}
            data={pageRows}
            rowKey={(row) => row.id}
            loading={loading}
            loadingMessage="Cargando transacciones…"
            footer={
              !loading && filteredRows.length > 0 ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-[var(--dash-border)] bg-[var(--dash-surface-elevated)] text-sm text-[var(--dash-muted)]">
                  <span>
                    {filteredRows.length} {filteredRows.length === 1 ? 'elemento' : 'elementos'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={safePage === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      className="dash-btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      disabled={safePage >= pageCount - 1}
                      onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                      className="dash-btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              ) : undefined
            }
          />
        )}
      </div>
    </>
  );
}

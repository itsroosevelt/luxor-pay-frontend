'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { listProducts } from '@/lib/merchant-data';
import { buildPaymentLinkCreateHref } from '@/lib/dashboard/catalog-flow-links';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import type { ProductCatalogItem } from '@luxor/contracts';
import { cn } from '@/lib/cn';
import {
  PageHeader,
  EmptyState,
  DataTable,
  FilterRow,
  FilterChip,
  CatalogFlowSectionNav,
  CatalogFlowCrossLinks,
  TaxConfigNotice,
  BackendNotice,
  ProductCreateDrawer,
  type DataTableColumn,
} from '@/components/dashboard';
import {
  Package,
  Plus,
  BarChart3,
  MoreHorizontal,
  Download,
  Columns3,
} from 'lucide-react';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

type ProductCatalogTab =
  | 'products'
  | 'features'
  | 'coupons'
  | 'shipping'
  | 'pricing';

type ProductSummaryFilter = 'all' | 'active' | 'archived';

type StatusFilter = 'all' | 'active' | 'archived';

const CATALOG_TABS: { id: ProductCatalogTab; label: string }[] = [
  { id: 'products', label: 'Todos los productos' },
  { id: 'features', label: 'Funciones' },
  { id: 'coupons', label: 'Cupones' },
  { id: 'shipping', label: 'Envíos' },
  { id: 'pricing', label: 'Tablas de precios' },
];

const SUMMARY_CARDS: { id: ProductSummaryFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'active', label: 'Activos' },
  { id: 'archived', label: 'Archivados' },
];

const STATUS_CYCLE: StatusFilter[] = ['all', 'active', 'archived'];

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: 'Todos',
  active: 'Activos',
  archived: 'Archivados',
};

function formatTableDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function computeProductCounts(products: ProductCatalogItem[]) {
  const active = products.filter((p) => p.active).length;
  const archived = products.filter((p) => !p.active).length;
  return {
    all: products.length,
    active,
    archived,
  };
}

function filterProductsBySummary(
  products: ProductCatalogItem[],
  filter: ProductSummaryFilter
): ProductCatalogItem[] {
  if (filter === 'active') return products.filter((p) => p.active);
  if (filter === 'archived') return products.filter((p) => !p.active);
  return products;
}

function RangePaginationFooter({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  if (totalItems === 0) return null;
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, totalItems);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-[var(--dash-border)] text-sm text-[var(--dash-muted)]">
      <span>
        {totalItems} {totalItems === 1 ? 'elemento' : 'elementos'}
        {totalPages > 1 && (
          <span className="text-[var(--dash-muted)]">
            {' '}
            · Mostrando {from}–{to}
          </span>
        )}
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            className="dash-btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            className="dash-btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
            onClick={() => onPageChange(page + 1)}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

function StubTabPanel({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <BackendNotice notImplemented />
      <EmptyState
        icon={Package}
        title={title}
        description="Esta sección estará disponible cuando se conecte el backend del catálogo."
      />
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();
  const { user, authReady } = useFirebaseAuth();
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [loadedForUser, setLoadedForUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProductCatalogTab>('products');
  const [summaryFilter, setSummaryFilter] = useState<ProductSummaryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authReady || !user) return;

    let cancelled = false;
    void listProducts(user.uid)
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch(() => {
        if (!cancelled) toast.error('No se pudo cargar el catálogo.');
      })
      .finally(() => {
        if (!cancelled) setLoadedForUser(user.uid);
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, user]);

  const loading = !authReady || (user ? loadedForUser !== user.uid : false);

  useEffect(() => {
    if (!openMenuId) return;
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [openMenuId]);

  const resetPagination = useCallback(() => {
    setPage(1);
  }, []);

  const applyStatusFilter = useCallback(
    (filter: StatusFilter) => {
      setStatusFilter(filter);
      setSummaryFilter(filter);
      resetPagination();
    },
    [resetPagination]
  );

  const clearFilters = useCallback(() => {
    setSummaryFilter('all');
    setStatusFilter('all');
    resetPagination();
  }, [resetPagination]);

  const counts = useMemo(() => computeProductCounts(products), [products]);

  const filteredProducts = useMemo(() => {
    const rows = filterProductsBySummary(products, summaryFilter);
    return [...rows].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [products, summaryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  const hasActiveFilters = summaryFilter !== 'all' || statusFilter !== 'all';

  const handleProductCreated = useCallback(
    (product: ProductCatalogItem) => {
      setProducts((prev) => [product, ...prev]);
      router.push(`/dashboard/products/${product.id}`);
    },
    [router]
  );

  const columns: DataTableColumn<ProductCatalogItem>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (p) => (
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="w-8 h-8 rounded-md bg-[var(--dash-accent-soft)] flex items-center justify-center text-[var(--dash-accent)] shrink-0">
            <Package size={14} />
          </div>
          <Link
            href={`/dashboard/products/${p.id}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium hover:text-[var(--dash-accent)] hover:underline"
          >
            {p.name}
          </Link>
        </div>
      ),
    },
    {
      key: 'pricing',
      header: 'Precio',
      render: (p) => (
        <span className="font-medium tabular-nums">
          {p.currency} {p.price.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Categoría',
      render: () => <span className="text-[var(--dash-muted)]">General</span>,
    },
    {
      key: 'createdAt',
      header: 'Creado',
      render: (p) => (
        <span className="text-[var(--dash-muted)] tabular-nums">{formatTableDate(p.createdAt)}</span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Actualizado',
      render: () => <span className="text-[var(--dash-muted)]">—</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right w-12',
      render: (p) => (
        <div className="relative flex justify-end" ref={openMenuId === p.id ? menuRef : undefined}>
          <button
            type="button"
            className="p-1.5 rounded-md hover:bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)]"
            aria-label="Acciones"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId((id) => (id === p.id ? null : p.id));
            }}
          >
            <MoreHorizontal size={18} />
          </button>
          {openMenuId === p.id && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1 z-20 min-w-[160px] dash-card py-1 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)]"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(null);
                  router.push(`/dashboard/products/${p.id}`);
                }}
              >
                Ver producto
              </button>
              <button
                type="button"
                role="menuitem"
                className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)]"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(null);
                  router.push(
                    buildPaymentLinkCreateHref({
                      id: p.id,
                      name: p.name,
                      price: p.price,
                      currency: p.currency,
                    })
                  );
                }}
              >
                Crear enlace Solana Pay
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
        onClick={() => toast.info('Análisis de productos — próximamente')}
      >
        <BarChart3 size={16} />
        Analizar
      </button>
      <button
        type="button"
        onClick={() => setShowCreateDrawer(true)}
        className="dash-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2"
      >
        <Plus size={16} />
        Crear producto
      </button>
    </div>
  );

  const handleTabClick = (tab: (typeof CATALOG_TABS)[number]) => {
    setActiveTab(tab.id);
    resetPagination();
  };

  return (
    <>
      <ProductCreateDrawer
        open={showCreateDrawer}
        onClose={() => setShowCreateDrawer(false)}
        onCreated={handleProductCreated}
      />

      <PageHeader title="Catálogo de productos" actions={headerActions} />

      <div className="p-4 sm:p-6 md:px-8 md:pb-8 max-w-[1400px] mx-auto space-y-6 overflow-x-hidden">
        <CatalogFlowSectionNav />

        <div className="flex flex-wrap gap-1 border-b border-[var(--dash-border)]">
          {CATALOG_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab)}
                className={cn(
                  'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                  isActive
                    ? 'border-[var(--dash-accent)] text-[var(--dash-accent)]'
                    : 'border-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'products' && (
          <>
            <TaxConfigNotice />

            <div className="flex gap-2 overflow-x-auto pb-1">
              {SUMMARY_CARDS.map(({ id, label }) => {
                const count = counts[id];
                const active = summaryFilter === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => applyStatusFilter(id)}
                    className={cn(
                      'shrink-0 dash-card px-4 py-3 min-w-[120px] text-left transition-colors',
                      active && 'ring-2 ring-[var(--dash-accent)] border-[var(--dash-accent)]'
                    )}
                  >
                    <p className="text-xs text-[var(--dash-muted)]">{label}</p>
                    <p className="text-xl font-semibold tabular-nums mt-1 text-[var(--dash-text)]">
                      {loading ? '…' : count}
                    </p>
                  </button>
                );
              })}
            </div>

            <FilterRow className="justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <FilterChip
                  label="Fecha de creación"
                  value="Todos"
                  onClick={() => toast.info('Filtro por fecha — próximamente')}
                />
                <FilterChip
                  label="Estado"
                  value={STATUS_LABELS[statusFilter]}
                  active={statusFilter !== 'all'}
                  onClick={() => {
                    const idx = STATUS_CYCLE.indexOf(statusFilter);
                    applyStatusFilter(STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]);
                  }}
                />
                <FilterChip
                  label="Categoría"
                  value="Todos"
                  onClick={() => toast.info('Filtro por categoría — próximamente')}
                />
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm text-[var(--dash-accent)] hover:underline px-1"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="dash-btn-secondary px-3 py-1.5 text-sm inline-flex items-center gap-1.5"
                  onClick={() => toast.info('Exportar precios — próximamente')}
                >
                  <Download size={14} />
                  Exportar precios
                </button>
                <button
                  type="button"
                  className="dash-btn-secondary px-3 py-1.5 text-sm inline-flex items-center gap-1.5"
                  onClick={() => toast.info('Exportar productos — próximamente')}
                >
                  <Download size={14} />
                  Exportar productos
                </button>
                <button
                  type="button"
                  className="dash-btn-secondary px-3 py-1.5 text-sm inline-flex items-center gap-1.5"
                  onClick={() => toast.info('Editar columnas — próximamente')}
                >
                  <Columns3 size={14} />
                  Editar columnas
                </button>
              </div>
            </FilterRow>

            {!loading && filteredProducts.length === 0 ? (
              <EmptyState
                icon={Package}
                title={products.length === 0 ? 'Aún no hay productos' : 'Ningún producto coincide con los filtros'}
                description={
                  products.length === 0
                    ? 'Crea tu primer producto para organizar precios en USDC/SOL y enlaces de Solana Pay.'
                    : 'Prueba a ajustar los filtros o límpialos para ver todos los productos.'
                }
                action={
                  products.length === 0
                    ? { label: 'Crear producto', onClick: () => setShowCreateDrawer(true) }
                    : hasActiveFilters
                      ? { label: 'Limpiar filtros', onClick: clearFilters }
                      : undefined
                }
              />
            ) : (
              <DataTable
                columns={columns}
                data={paginatedProducts}
                rowKey={(p) => p.id}
                loading={loading}
                loadingMessage="Cargando productos…"
                onRowClick={(p) => router.push(`/dashboard/products/${p.id}`)}
                footer={
                  !loading ? (
                    <RangePaginationFooter
                      page={page}
                      totalPages={totalPages}
                      totalItems={filteredProducts.length}
                      onPageChange={setPage}
                    />
                  ) : undefined
                }
              />
            )}
          </>
        )}

        {activeTab === 'features' && <StubTabPanel title="Funciones" />}
        {activeTab === 'coupons' && <StubTabPanel title="Cupones" />}
        {activeTab === 'shipping' && <StubTabPanel title="Tarifas de envío" />}
        {activeTab === 'pricing' && <StubTabPanel title="Tablas de precios" />}

        <CatalogFlowCrossLinks excludeHref="/dashboard/products" />
      </div>
    </>
  );
}

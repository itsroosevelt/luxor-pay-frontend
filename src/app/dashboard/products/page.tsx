'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { listProducts } from '@/lib/merchant-data';
import type { ProductCatalogItem } from '@luxor/contracts';
import { cn } from '@/lib/cn';
import {
  PageHeader,
  EmptyState,
  DataTable,
  FilterRow,
  FilterChip,
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

const CATALOG_TABS: {
  id: ProductCatalogTab | 'tax';
  label: string;
  href?: string;
}[] = [
  { id: 'products', label: 'All products' },
  { id: 'features', label: 'Features' },
  { id: 'coupons', label: 'Coupons' },
  { id: 'shipping', label: 'Shipping rates' },
  { id: 'tax', label: 'Tax rates', href: '/dashboard/tax' },
  { id: 'pricing', label: 'Pricing tables' },
];

const SUMMARY_CARDS: { id: ProductSummaryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'archived', label: 'Archived' },
];

const STATUS_CYCLE: StatusFilter[] = ['all', 'active', 'archived'];

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: 'All',
  active: 'Active',
  archived: 'Archived',
};

function formatTableDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
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
        {totalItems} {totalItems === 1 ? 'item' : 'items'}
        {totalPages > 1 && (
          <span className="text-[var(--dash-muted)]">
            {' '}
            · Showing {from}–{to}
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
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            className="dash-btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
            onClick={() => onPageChange(page + 1)}
          >
            Next
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
        description="This section will be available when the catalog backend is connected."
      />
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProductCatalogTab>('products');
  const [summaryFilter, setSummaryFilter] = useState<ProductSummaryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const data = await listProducts(user.uid);
        setProducts(data);
      } catch {
        toast.error('Could not load catalog.');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

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

  const handleProductCreated = useCallback((product: ProductCatalogItem) => {
    setProducts((prev) => [product, ...prev]);
  }, []);

  const columns: DataTableColumn<ProductCatalogItem>[] = [
    {
      key: 'name',
      header: 'Name',
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
      header: 'Pricing',
      render: (p) => (
        <span className="font-medium tabular-nums">
          {p.currency} {p.price.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Product category',
      render: () => <span className="text-[var(--dash-muted)]">General</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (p) => (
        <span className="text-[var(--dash-muted)] tabular-nums">{formatTableDate(p.createdAt)}</span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
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
            aria-label="Actions"
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
                View product
              </button>
              <button
                type="button"
                role="menuitem"
                className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)]"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(null);
                  router.push('/dashboard/links');
                }}
              >
                Create Solana Pay link
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
        onClick={() => toast.info('Product analytics — coming soon')}
      >
        <BarChart3 size={16} />
        Analyze
      </button>
      <button
        type="button"
        onClick={() => setShowCreateDrawer(true)}
        className="dash-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2"
      >
        <Plus size={16} />
        Create product
      </button>
    </div>
  );

  const handleTabClick = (tab: (typeof CATALOG_TABS)[number]) => {
    if (tab.href) {
      router.push(tab.href);
      return;
    }
    setActiveTab(tab.id as ProductCatalogTab);
    resetPagination();
  };

  return (
    <>
      <ProductCreateDrawer
        open={showCreateDrawer}
        onClose={() => setShowCreateDrawer(false)}
        onCreated={handleProductCreated}
      />

      <PageHeader title="Product catalog" actions={headerActions} />

      <div className="p-6 md:px-8 md:pb-8 max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-wrap gap-1 border-b border-[var(--dash-border)]">
          {CATALOG_TABS.map((tab) => {
            const isActive = tab.id === 'products' ? activeTab === 'products' : false;
            if (tab.href) {
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={cn(
                    'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                    'border-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]'
                  )}
                >
                  {tab.label}
                </Link>
              );
            }
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
                  label="Creation date"
                  value="All"
                  onClick={() => toast.info('Creation date filter — coming soon')}
                />
                <FilterChip
                  label="Status"
                  value={STATUS_LABELS[statusFilter]}
                  active={statusFilter !== 'all'}
                  onClick={() => {
                    const idx = STATUS_CYCLE.indexOf(statusFilter);
                    applyStatusFilter(STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]);
                  }}
                />
                <FilterChip
                  label="Product category"
                  value="All"
                  onClick={() => toast.info('Product category filter — coming soon')}
                />
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm text-[var(--dash-accent)] hover:underline px-1"
                  >
                    Clear filters
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="dash-btn-secondary px-3 py-1.5 text-sm inline-flex items-center gap-1.5"
                  onClick={() => toast.info('Export prices — coming soon')}
                >
                  <Download size={14} />
                  Export prices
                </button>
                <button
                  type="button"
                  className="dash-btn-secondary px-3 py-1.5 text-sm inline-flex items-center gap-1.5"
                  onClick={() => toast.info('Export products — coming soon')}
                >
                  <Download size={14} />
                  Export products
                </button>
                <button
                  type="button"
                  className="dash-btn-secondary px-3 py-1.5 text-sm inline-flex items-center gap-1.5"
                  onClick={() => toast.info('Edit columns — coming soon')}
                >
                  <Columns3 size={14} />
                  Edit columns
                </button>
              </div>
            </FilterRow>

            {!loading && filteredProducts.length === 0 ? (
              <EmptyState
                icon={Package}
                title={products.length === 0 ? 'No products yet' : 'No products match filters'}
                description={
                  products.length === 0
                    ? 'Create your first product to organize USDC/SOL pricing and Solana Pay links.'
                    : 'Try adjusting your filters or clear them to see all products.'
                }
                action={
                  products.length === 0
                    ? { label: 'Create product', onClick: () => setShowCreateDrawer(true) }
                    : hasActiveFilters
                      ? { label: 'Clear filters', onClick: clearFilters }
                      : undefined
                }
              />
            ) : (
              <DataTable
                columns={columns}
                data={paginatedProducts}
                rowKey={(p) => p.id}
                loading={loading}
                loadingMessage="Loading products…"
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

        {activeTab === 'features' && <StubTabPanel title="Features" />}
        {activeTab === 'coupons' && <StubTabPanel title="Coupons" />}
        {activeTab === 'shipping' && <StubTabPanel title="Shipping rates" />}
        {activeTab === 'pricing' && <StubTabPanel title="Pricing tables" />}

        <CatalogFlowCrossLinks excludeHref="/dashboard/products" />
      </div>
    </>
  );
}

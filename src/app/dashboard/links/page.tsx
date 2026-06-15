'use client';

import { Suspense, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { getPaymentLinkPublicPath, getPaymentLinkPublicUrl } from '@/lib/payment-link-utils';
import { fetchPaymentLinksApi } from '@/lib/api/payment-links';
import { isFrontendOnly } from '@/lib/frontend-only';
import { formatCurrencyAmount } from '@/lib/format-currency';
import type { PaymentLink } from '@luxor/contracts';
import { dashStatusBadges } from '@/lib/dashboard-styles';
import { cn } from '@/lib/cn';
import {
  BarChart3,
  Download,
  Link as LinkIcon,
  MoreHorizontal,
  Plus,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  PageHeader,
  EmptyState,
  DataTable,
  FilterRow,
  FilterChip,
  CatalogFlowSectionNav,
  CatalogFlowCrossLinks,
  BackendNotice,
  PaymentLinkCheckoutInfo,
  DemoModeBanner,
  demoCopyLinkToastMessage,
  type DataTableColumn,
} from '@/components/dashboard';
import { useBackendList } from '@/hooks/useBackendList';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { duplicatePaymentLink, updatePaymentLink } from '@/lib/merchant-data';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { downloadPaymentLinksCsv } from '@/lib/dashboard/link-export';

const PAGE_SIZE = 10;

type StatusFilter = 'all' | 'active' | 'inactive';
type DateFilter = 'newest' | 'oldest';
type TaxFilter = 'all' | 'enabled' | 'disabled';

const STATUS_CYCLE: StatusFilter[] = ['all', 'active', 'inactive'];
const DATE_CYCLE: DateFilter[] = ['newest', 'oldest'];
const TAX_CYCLE: TaxFilter[] = ['all', 'enabled', 'disabled'];

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: 'Todos',
  active: 'Activos',
  inactive: 'Inactivos',
};

const DATE_LABELS: Record<DateFilter, string> = {
  newest: 'Más recientes',
  oldest: 'Más antiguos',
};

const TAX_LABELS: Record<TaxFilter, string> = {
  all: 'Todos',
  enabled: 'Activado',
  disabled: 'Desactivado',
};

function RangePaginationFooter({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[var(--dash-border)]">
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
  );
}

function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const ROW_MENU_CLASS =
  'fixed z-50 min-w-[240px] rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel)] py-1 shadow-xl';

const ROW_MENU_ITEM_CLASS =
  'w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)]';

function RenamePaymentLinkModal({
  link,
  saving,
  onClose,
  onSave,
}: {
  link: PaymentLink;
  saving: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const titleId = useId();
  const inputId = useId();
  const [name, setName] = useState(link.name);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Ingresa un nombre válido');
      return;
    }
    onSave(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md dash-modal shadow-xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 border-b border-[var(--dash-border)]">
            <h2 id={titleId} className="text-lg font-semibold text-[var(--dash-text)] pr-8">
              Cambiar nombre
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)]"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label htmlFor={inputId} className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">
                Nombre
              </label>
              <input
                id={inputId}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="dash-input w-full"
                autoFocus
                disabled={saving}
              />
            </div>
          </div>
          <div className="px-6 py-4 border-t border-[var(--dash-border)] flex justify-end gap-2">
            <button
              type="button"
              className="dash-btn-secondary px-4 py-2 text-sm"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="submit" className="dash-btn-primary px-4 py-2 text-sm" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LinkRowActionsMenu({
  link,
  anchorRef,
  menuRef,
  togglingActive,
  onCopyUrl,
  onPreview,
  onRename,
  onEdit,
  onDuplicate,
  onToggleActive,
  onClose,
}: {
  link: PaymentLink;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
  togglingActive: boolean;
  onCopyUrl: () => void;
  onPreview: () => void;
  onRename: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggleActive: () => void;
  onClose: () => void;
}) {
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const updatePosition = () => {
      const rect = anchor.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', onClose, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', onClose, true);
    };
  }, [anchorRef, onClose]);

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      className={ROW_MENU_CLASS}
      style={{ top: position.top, right: position.right }}
    >
      <button
        type="button"
        role="menuitem"
        className={ROW_MENU_ITEM_CLASS}
        onClick={(e) => {
          e.stopPropagation();
          onCopyUrl();
        }}
      >
        Copiar URL
      </button>
      <button
        type="button"
        role="menuitem"
        className={ROW_MENU_ITEM_CLASS}
        onClick={(e) => {
          e.stopPropagation();
          onPreview();
        }}
      >
        Vista previa del enlace de pago
      </button>
      <button
        type="button"
        role="menuitem"
        className={ROW_MENU_ITEM_CLASS}
        onClick={(e) => {
          e.stopPropagation();
          onRename();
        }}
      >
        Cambiar nombre
      </button>
      <button
        type="button"
        role="menuitem"
        className={ROW_MENU_ITEM_CLASS}
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
      >
        Editar
      </button>
      <button
        type="button"
        role="menuitem"
        className={ROW_MENU_ITEM_CLASS}
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
      >
        Duplicado
      </button>
      <div className="my-1 border-t border-[var(--dash-border)]" role="separator" />
      <button
        type="button"
        role="menuitem"
        disabled={togglingActive}
        className={cn(
          ROW_MENU_ITEM_CLASS,
          'disabled:opacity-50',
          link.active && 'text-red-400 hover:text-red-300'
        )}
        onClick={(e) => {
          e.stopPropagation();
          onToggleActive();
        }}
      >
        {togglingActive ? 'Guardando…' : link.active ? 'Desactivar' : 'Activar'}
      </button>
    </div>,
    document.body
  );
}

export default function PaymentLinksPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-[var(--dash-muted)] py-16 text-center">
          Cargando enlaces de pago…
        </p>
      }
    >
      <PaymentLinksContent />
    </Suspense>
  );
}

function PaymentLinksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useFirebaseAuth();
  const { items: links, loading, unavailable, notImplemented, error, reload } =
    useBackendList(fetchPaymentLinksApi);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('newest');
  const [taxFilter, setTaxFilter] = useState<TaxFilter>('all');
  const [page, setPage] = useState(1);
  const createFromQuery = searchParams.get('create') === 'true';
  const fromQr = searchParams.get('from') === 'qr';
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renameLink, setRenameLink] = useState<PaymentLink | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const frontendOnly = isFrontendOnly();
  const canMutate = frontendOnly;

  useEffect(() => {
    if (createFromQuery) {
      router.replace('/dashboard/links/create', { scroll: false });
    }
  }, [createFromQuery, router]);

  useEffect(() => {
    if (!fromQr) return;
    toast.info(
      'Los enlaces de pago ya incluyen QR en su página de checkout. No necesitas una sección aparte.'
    );
    router.replace('/dashboard/links', { scroll: false });
  }, [fromQr, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (!openMenuId) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpenMenuId(null);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [openMenuId]);

  const resetPagination = useCallback(() => {
    setPage(1);
  }, []);

  const cycleFilter = <T extends string>(cycle: T[], current: T, setter: (value: T) => void) => {
    const idx = cycle.indexOf(current);
    setter(cycle[(idx + 1) % cycle.length]);
    resetPagination();
  };

  const payLinkUrl = (link: PaymentLink) => getPaymentLinkPublicUrl(link);

  const copyUrl = (link: PaymentLink, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(payLinkUrl(link));
    toast.success(demoCopyLinkToastMessage());
  };

  const handleRename = async (name: string) => {
    if (!user || !renameLink || !canMutate) return;

    setRenaming(true);
    try {
      await updatePaymentLink(user.uid, renameLink.id, { name });
      toast.success('Nombre actualizado');
      setRenameLink(null);
      reload();
    } catch (err) {
      toast.error(getFirestoreErrorMessage(err, 'No se pudo cambiar el nombre'));
    } finally {
      setRenaming(false);
    }
  };

  const handleToggleActive = async (link: PaymentLink) => {
    if (!user || !canMutate) {
      toast.info('Esta acción solo está disponible en modo demo');
      return;
    }

    setTogglingId(link.id);
    try {
      const updated = await updatePaymentLink(user.uid, link.id, { active: !link.active });
      toast.success(updated.active ? 'Enlace activado' : 'Enlace desactivado');
      reload();
    } catch (err) {
      toast.error(getFirestoreErrorMessage(err, 'No se pudo actualizar el estado del enlace'));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDuplicate = async (link: PaymentLink) => {
    if (!user || !canMutate) {
      toast.info('Esta acción solo está disponible en modo demo');
      return;
    }

    setDuplicatingId(link.id);
    try {
      const copy = await duplicatePaymentLink(user.uid, link.id);
      toast.success('Enlace duplicado');
      reload();
      router.push(`/dashboard/links/${copy.id}`);
    } catch (err) {
      toast.error(getFirestoreErrorMessage(err, 'No se pudo duplicar el enlace'));
    } finally {
      setDuplicatingId(null);
    }
  };

  const filteredLinks = useMemo(() => {
    let rows = links;
    if (statusFilter === 'active') {
      rows = rows.filter((link) => link.active);
    } else if (statusFilter === 'inactive') {
      rows = rows.filter((link) => !link.active);
    }
    if (taxFilter === 'enabled') {
      rows = rows.filter((link) => link.collectTaxes);
    } else if (taxFilter === 'disabled') {
      rows = rows.filter((link) => !link.collectTaxes);
    }
    return [...rows].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return dateFilter === 'newest' ? -diff : diff;
    });
  }, [links, statusFilter, dateFilter, taxFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLinks.length / PAGE_SIZE));

  const paginatedLinks = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredLinks.slice(start, start + PAGE_SIZE);
  }, [filteredLinks, page]);

  const hasActiveFilters =
    statusFilter !== 'all' || dateFilter !== 'newest' || taxFilter !== 'all';

  const columns: DataTableColumn<PaymentLink>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (link) => (
        <div className="flex items-center gap-2.5 min-w-0 sm:min-w-[200px]">
          <Link
            href={`/dashboard/links/${link.id}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium hover:text-[var(--dash-accent)] hover:underline"
          >
            {link.name}
          </Link>
          {link.active ? (
            <span className={cn(dashStatusBadges.success, 'shrink-0')}>Activo</span>
          ) : (
            <span className={cn(dashStatusBadges.neutral, 'shrink-0')}>Inactivo</span>
          )}
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Precio',
      render: (link) => (
        <span className="font-medium tabular-nums">
          {formatCurrencyAmount(link.amount, link.currency)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Fecha de creación',
      render: (link) => (
        <span className="text-[var(--dash-muted)] tabular-nums">{formatCreatedAt(link.createdAt)}</span>
      ),
    },
    {
      key: 'copy',
      header: '',
      className: 'w-28 text-right',
      render: (link) => (
        <button
          type="button"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-sm text-[var(--dash-accent)] hover:underline whitespace-nowrap"
          onClick={(e) => copyUrl(link, e)}
        >
          Copiar URL
        </button>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12 text-right',
      render: (link) => (
        <div className="relative flex justify-end" ref={openMenuId === link.id ? triggerRef : undefined}>
          <button
            type="button"
            className="p-1.5 rounded-md hover:bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)]"
            aria-label="Acciones"
            aria-expanded={openMenuId === link.id}
            aria-haspopup="menu"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId((id) => (id === link.id ? null : link.id));
            }}
          >
            <MoreHorizontal size={18} />
          </button>
          {openMenuId === link.id && (
            <LinkRowActionsMenu
              link={link}
              anchorRef={triggerRef}
              menuRef={menuRef}
              togglingActive={togglingId === link.id}
              onCopyUrl={() => {
                copyUrl(link);
                setOpenMenuId(null);
              }}
              onPreview={() => {
                window.open(getPaymentLinkPublicPath(link), '_blank', 'noopener,noreferrer');
                setOpenMenuId(null);
              }}
              onRename={() => {
                if (!canMutate) {
                  toast.info('Esta acción solo está disponible en modo demo');
                  setOpenMenuId(null);
                  return;
                }
                setRenameLink(link);
                setOpenMenuId(null);
              }}
              onEdit={() => {
                router.push(`/dashboard/links/${link.id}/edit`);
                setOpenMenuId(null);
              }}
              onDuplicate={() => {
                setOpenMenuId(null);
                if (duplicatingId === link.id) return;
                void handleDuplicate(link);
              }}
              onToggleActive={() => {
                setOpenMenuId(null);
                if (togglingId === link.id) return;
                void handleToggleActive(link);
              }}
              onClose={() => setOpenMenuId(null)}
            />
          )}
        </div>
      ),
    },
  ];

  const emptyTitle =
    links.length === 0
      ? 'Aún no hay enlaces de pago'
      : hasActiveFilters
        ? 'Ningún enlace coincide con los filtros'
        : 'No hay enlaces';

  const emptyDescription =
    links.length === 0
      ? 'Crea un enlace para aceptar SOL o USDC en una página de checkout con wallet, QR y tarjeta (próximamente).'
      : 'Prueba a ajustar los filtros para ver todos los enlaces.';

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
        onClick={() => toast.info('Análisis de enlaces — próximamente')}
      >
        <BarChart3 size={16} />
        Analizar
      </button>
      <button
        type="button"
        className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
        onClick={() => {
          if (filteredLinks.length === 0) {
            toast.info('No hay enlaces para exportar');
            return;
          }
          downloadPaymentLinksCsv(filteredLinks);
          toast.success(`Exportados ${filteredLinks.length} enlace${filteredLinks.length === 1 ? '' : 's'}`);
        }}
      >
        <Download size={16} />
        Exportar
      </button>
      <Link
        href="/dashboard/links/create"
        className="dash-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2"
      >
        <Plus size={16} />
        Crear enlace de pago
      </Link>
    </div>
  );

  return (
    <>
      <PageHeader title="Enlaces de pago" actions={headerActions} />

      {renameLink && (
        <RenamePaymentLinkModal
          key={renameLink.id}
          link={renameLink}
          saving={renaming}
          onClose={() => {
            if (!renaming) setRenameLink(null);
          }}
          onSave={(name) => void handleRename(name)}
        />
      )}

      <div className="p-4 sm:p-6 md:px-8 md:pb-8 max-w-[1400px] mx-auto space-y-6 overflow-x-hidden">
        <CatalogFlowSectionNav />
        <PaymentLinkCheckoutInfo variant="list" />
        <BackendNotice unavailable={unavailable && !frontendOnly} notImplemented={notImplemented} />
        {frontendOnly ? <DemoModeBanner /> : null}

        <FilterRow className="flex-wrap">
          <FilterChip
            label="Fecha de creación"
            value={DATE_LABELS[dateFilter]}
            active={dateFilter !== 'newest'}
            onClick={() => cycleFilter(DATE_CYCLE, dateFilter, setDateFilter)}
          />
          <FilterChip
            label="Estado"
            value={STATUS_LABELS[statusFilter]}
            active={statusFilter !== 'all'}
            onClick={() => cycleFilter(STATUS_CYCLE, statusFilter, setStatusFilter)}
          />
          <FilterChip
            label="Cálculo automático de impuestos"
            value={TAX_LABELS[taxFilter]}
            active={taxFilter !== 'all'}
            onClick={() => cycleFilter(TAX_CYCLE, taxFilter, setTaxFilter)}
          />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setDateFilter('newest');
                setTaxFilter('all');
                resetPagination();
              }}
              className="text-sm text-[var(--dash-accent)] hover:underline px-1"
            >
              Limpiar filtros
            </button>
          )}
        </FilterRow>

        {!loading && filteredLinks.length === 0 ? (
          <EmptyState
            icon={LinkIcon}
            title={emptyTitle}
            description={emptyDescription}
            action={
              links.length === 0
                ? { label: 'Crear enlace de pago', href: '/dashboard/links/create' }
                : hasActiveFilters
                  ? {
                      label: 'Limpiar filtros',
                      onClick: () => {
                        setStatusFilter('all');
                        setDateFilter('newest');
                        setTaxFilter('all');
                        resetPagination();
                      },
                    }
                  : undefined
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={paginatedLinks}
            rowKey={(link) => link.id}
            loading={loading}
            loadingMessage="Cargando enlaces de pago…"
            onRowClick={(link) => router.push(`/dashboard/links/${link.id}`)}
            className="[&_tbody_tr]:group"
            footer={
              !loading ? (
                <RangePaginationFooter
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              ) : undefined
            }
          />
        )}
        <CatalogFlowCrossLinks excludeHref="/dashboard/links" />
      </div>
    </>
  );
}

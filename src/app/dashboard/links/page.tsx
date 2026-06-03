'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { listPaymentLinks } from '@/lib/firestore-data';
import type { PaymentLink } from '@luxor/contracts';
import { dashStatusBadges } from '@/lib/dashboard-styles';
import { cn } from '@/lib/cn';
import {
  Copy,
  Link as LinkIcon,
  Plus,
  ExternalLink,
  BarChart3,
  Download,
  MoreHorizontal,
} from 'lucide-react';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  PageHeader,
  EmptyState,
  DataTable,
  FilterRow,
  FilterChip,
  type DataTableColumn,
} from '@/components/dashboard';

const PAGE_SIZE = 10;

type StatusFilter = 'all' | 'active' | 'inactive';

function PaginationFooter({
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
        {from}–{to} of {totalItems}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          className="dash-btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <span className="tabular-nums px-2">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          className="dash-btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function formatLinkPrice(link: PaymentLink): string {
  return `${link.amount} ${link.currency}`;
}

function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PaymentLinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const data = await listPaymentLinks(user.uid);
        setLinks(data);
      } catch (err) {
        toast.error(getFirestoreErrorMessage(err, 'Could not load payment links'));
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

  const payLinkUrl = (id: string) =>
    typeof window !== 'undefined' ? `${window.location.origin}/pay/link/${id}` : `/pay/link/${id}`;

  const copyUrl = (id: string) => {
    navigator.clipboard.writeText(payLinkUrl(id));
    toast.success('Link copied');
  };

  const filteredLinks = useMemo(() => {
    let rows = links;
    if (statusFilter === 'active') {
      rows = rows.filter((l) => l.active);
    } else if (statusFilter === 'inactive') {
      rows = rows.filter((l) => !l.active);
    }
    return [...rows].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [links, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLinks.length / PAGE_SIZE));

  const paginatedLinks = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredLinks.slice(start, start + PAGE_SIZE);
  }, [filteredLinks, page]);

  const statusFilterLabel =
    statusFilter === 'all' ? 'All' : statusFilter === 'active' ? 'Active' : 'Inactive';

  const columns: DataTableColumn<PaymentLink>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (link) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[var(--dash-accent-soft)] flex items-center justify-center text-[var(--dash-accent)]">
            <LinkIcon size={14} />
          </div>
          <span className="font-medium">{link.name}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (link) => (
        <span className={cn(link.active ? dashStatusBadges.success : dashStatusBadges.neutral)}>
          {link.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (link) => (
        <span className="font-medium tabular-nums">{formatLinkPrice(link)}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (link) => (
        <span className="text-[var(--dash-muted)] tabular-nums">{formatCreatedAt(link.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12 text-right',
      render: (link) => (
        <div className="relative flex justify-end" ref={openMenuId === link.id ? menuRef : undefined}>
          <button
            type="button"
            className="p-1.5 rounded-md hover:bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)]"
            aria-label="Actions"
            onClick={() => setOpenMenuId((id) => (id === link.id ? null : link.id))}
          >
            <MoreHorizontal size={18} />
          </button>
          {openMenuId === link.id && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1 z-20 min-w-[180px] dash-card py-1 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)] inline-flex items-center gap-2"
                onClick={() => {
                  copyUrl(link.id);
                  setOpenMenuId(null);
                }}
              >
                <Copy size={14} />
                Copy link
              </button>
              <button
                type="button"
                role="menuitem"
                className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)] inline-flex items-center gap-2"
                onClick={() => {
                  router.push(`/dashboard/links/${link.id}`);
                  setOpenMenuId(null);
                }}
              >
                <ExternalLink size={14} />
                View details
              </button>
              <button
                type="button"
                role="menuitem"
                className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)] inline-flex items-center gap-2"
                onClick={() => {
                  window.open(`/pay/link/${link.id}`, '_blank');
                  setOpenMenuId(null);
                }}
              >
                <ExternalLink size={14} />
                Open checkout
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Payment Links"
        description="Share Solana Pay links for SOL or USDC — customers scan a QR or open /pay/link/[id] to pay on-chain."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/links/new"
              className="dash-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Create payment link
            </Link>
            <Link
              href="/dashboard/analytics"
              className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
            >
              <BarChart3 size={16} />
              Analyze
            </Link>
            <button
              type="button"
              className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
              onClick={() => toast.info('Export links — coming soon')}
            >
              <Download size={16} />
              Export
            </button>
          </div>
        }
      />

      <div className="p-6 md:px-8 md:pb-8 max-w-[1400px] mx-auto space-y-6">
        <FilterRow className="justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip
              label="Created"
              value="All"
              onClick={() => toast.info('Created date filter — coming soon')}
            />
            <FilterChip
              label="Status"
              value={statusFilterLabel}
              active={statusFilter !== 'all'}
              onClick={() => {
                const order: StatusFilter[] = ['all', 'active', 'inactive'];
                const idx = order.indexOf(statusFilter);
                setStatusFilter(order[(idx + 1) % order.length]);
                setPage(1);
              }}
            />
            <FilterChip
              label="Automatic tax calculation"
              value="All"
              onClick={() => toast.info('Tax filter — coming soon')}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="dash-btn-secondary px-3 py-1.5 text-sm inline-flex items-center gap-1.5"
              onClick={() => toast.info('Export — coming soon')}
            >
              <Download size={14} />
              Export
            </button>
          </div>
        </FilterRow>

        {!loading && filteredLinks.length === 0 ? (
          <EmptyState
            icon={LinkIcon}
            title={statusFilter !== 'all' ? 'No links match this filter' : 'No payment links yet'}
            description={
              statusFilter !== 'all'
                ? 'No links match the selected status.'
                : 'Create a link to accept SOL or USDC on a hosted checkout page.'
            }
            action={
              statusFilter === 'all'
                ? { label: 'Create your first link', href: '/dashboard/links/new' }
                : undefined
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={paginatedLinks}
            rowKey={(l) => l.id}
            loading={loading}
            loadingMessage="Loading payment links…"
            footer={
              !loading ? (
                <PaginationFooter
                  page={page}
                  totalPages={totalPages}
                  totalItems={filteredLinks.length}
                  onPageChange={setPage}
                />
              ) : undefined
            }
          />
        )}
      </div>
    </>
  );
}

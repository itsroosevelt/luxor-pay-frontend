'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import {
  getProduct,
  listPaymentLinks,
  updateProduct,
} from '@/lib/merchant-data';
import type { Currency, PaymentLink, ProductCatalogItem } from '@luxor/contracts';
import { dashStatusBadges } from '@/lib/dashboard-styles';
import {
  CopyField,
  DetailSection,
  DetailRow,
  TaxConfigNotice,
} from '@/components/dashboard';
import { cn } from '@/lib/cn';
import {
  ChevronDown,
  ChevronRight,
  Eye,
  Link as LinkIcon,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateId(id: string, head = 8, tail = 4): string {
  if (id.length <= head + tail + 1) return id;
  return `${id.slice(0, head)}…${id.slice(-tail)}`;
}

function formatPrice(amount: number, currency: string): string {
  return `${currency} ${amount.toFixed(2)}`;
}

function DashedEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--dash-border)] bg-[var(--dash-panel)] px-4 py-8 text-center text-sm text-[var(--dash-muted)]">
      {children}
    </div>
  );
}

function SidebarCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="dash-card overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--dash-border)] flex items-center justify-between gap-2">
        <h2 className="font-semibold text-[var(--dash-text)]">{title}</h2>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-md hover:bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
            aria-label={`Edit ${title.toLowerCase()}`}
          >
            <Pencil size={15} />
          </button>
        )}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductCatalogItem | null>(null);
  const [relatedLinks, setRelatedLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCurrency, setEditCurrency] = useState<Currency>('USDC');
  const [editActive, setEditActive] = useState(true);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const [p, links] = await Promise.all([
          getProduct(user.uid, id),
          listPaymentLinks(user.uid),
        ]);
        setProduct(p);
        if (p) {
          setRelatedLinks(
            links.filter(
              (l) =>
                l.name.trim().toLowerCase() === p.name.trim().toLowerCase() &&
                l.amount === p.price &&
                l.currency === p.currency
            )
          );
        }
      } catch {
        toast.error('Could not load product');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [menuOpen]);

  const openEdit = () => {
    if (!product) return;
    setEditName(product.name);
    setEditDescription(product.description ?? '');
    setEditPrice(String(product.price));
    setEditCurrency(product.currency);
    setEditActive(product.active);
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !product) return;
    const parsed = parseFloat(editPrice);
    if (!editName.trim() || Number.isNaN(parsed) || parsed <= 0) {
      toast.error('Valid name and price are required');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProduct(user.uid, product.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        price: parsed,
        currency: editCurrency,
        active: editActive,
      });
      setProduct(updated);
      setEditing(false);
      toast.success('Product updated');
    } catch {
      toast.error('Could not update product');
    } finally {
      setSaving(false);
    }
  };

  const createLinkHref = useMemo(() => {
    if (!product) return '/dashboard/links/new';
    const params = new URLSearchParams({
      name: product.name,
      amount: String(product.price),
      currency: product.currency,
    });
    return `/dashboard/links/new?${params.toString()}`;
  }, [product]);

  const mockLogs = useMemo(() => {
    if (!product) return [];
    const created = new Date(product.createdAt);
    return [
      {
        method: 'POST',
        path: `/v1/products/${product.id}`,
        status: 200,
        label: 'OK',
        at: created,
      },
      {
        method: 'GET',
        path: `/v1/products/${product.id}/prices`,
        status: 200,
        label: 'OK',
        at: new Date(created.getTime() + 45_000),
      },
      {
        method: 'POST',
        path: `/v1/products/${product.id}`,
        status: 200,
        label: 'OK',
        at: new Date(created.getTime() + 120_000),
      },
    ];
  }, [product]);

  const stubToast = (message: string) => () => toast.info(message);

  if (loading) {
    return (
      <p className="text-sm text-[var(--dash-muted)] py-16 text-center">Loading product…</p>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-[var(--dash-muted)]">Product not found</p>
        <Link href="/dashboard/products" className="dash-btn-secondary px-4 py-2 text-sm inline-block">
          Back to products
        </Link>
      </div>
    );
  }

  const statusBadge = product.active ? dashStatusBadges.success : dashStatusBadges.neutral;
  const statusLabel = product.active ? 'Active' : 'Archived';

  return (
    <div className="min-h-full">
      <header className="dash-header border-b border-[var(--dash-border)]">
        <div className="px-6 md:px-8 pt-6 pb-4">
          <nav className="flex items-center gap-1.5 text-sm text-[var(--dash-muted)] mb-4">
            <Link
              href="/dashboard/products"
              className="hover:text-[var(--dash-accent)] transition-colors"
            >
              Products
            </Link>
            <ChevronRight size={14} className="opacity-60" />
            <span className="text-[var(--dash-text)] truncate max-w-[200px]">{product.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-14 h-14 rounded-lg bg-[var(--dash-panel-elevated)] border border-[var(--dash-border)] flex items-center justify-center text-[var(--dash-accent)] shrink-0">
                <Package size={24} />
              </div>
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-semibold text-[var(--dash-text)] tracking-tight truncate">
                    {product.name}
                  </h1>
                  <span className={statusBadge}>{statusLabel}</span>
                </div>
                <p className="text-base tabular-nums text-[var(--dash-muted)]">
                  {formatPrice(product.price, product.currency)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={openEdit}
                className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
              >
                <Pencil size={16} />
                Edit product
              </button>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  className="dash-btn-secondary p-2"
                  aria-label="More actions"
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  <MoreHorizontal size={18} />
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-1 z-20 min-w-[180px] dash-card py-1 shadow-lg"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)]"
                      onClick={() => {
                        setMenuOpen(false);
                        stubToast('Duplicate product — coming soon')();
                      }}
                    >
                      Duplicate product
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)]"
                      onClick={() => {
                        setMenuOpen(false);
                        stubToast('Archive product — coming soon')();
                      }}
                    >
                      {product.active ? 'Archive product' : 'Unarchive product'}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--dash-surface-elevated)] text-red-400"
                      onClick={() => {
                        setMenuOpen(false);
                        stubToast('Delete product — coming soon')();
                      }}
                    >
                      Delete product
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 md:px-8 md:pb-8 max-w-[1400px] mx-auto">
        <div className="grid xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] gap-6">
          <div className="space-y-6 min-w-0">
            {editing && (
              <form onSubmit={handleSave} className="dash-card p-6 space-y-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Pencil size={18} className="text-[var(--dash-accent)]" />
                  Edit product
                </h2>
                <TaxConfigNotice />
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Name"
                    className="dash-input px-4 py-2.5 text-sm"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="Price"
                    className="dash-input px-4 py-2.5 text-sm"
                  />
                </div>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description"
                  rows={2}
                  className="dash-input w-full px-4 py-2.5 text-sm resize-none"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value as Currency)}
                    className="dash-input px-4 py-2.5 text-sm max-w-[140px]"
                  >
                    <option value="USDC">USDC</option>
                    <option value="SOL">SOL</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editActive}
                      onChange={(e) => setEditActive(e.target.checked)}
                      className="rounded"
                    />
                    Active
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="dash-btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="dash-btn-secondary px-5 py-2.5 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <DetailSection
              title="Pricing"
              description="Manage prices for this product"
              action={
                <button
                  type="button"
                  onClick={stubToast('Add price — coming soon')}
                  className="p-1.5 rounded-md hover:bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                  aria-label="Add price"
                >
                  <Plus size={18} />
                </button>
              }
            >
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full text-sm min-w-[520px]">
                  <thead>
                    <tr className="text-xs uppercase text-[var(--dash-muted)] border-b border-[var(--dash-border)]">
                      <th className="text-left py-2 font-semibold">Price</th>
                      <th className="text-left py-2 font-semibold">Description</th>
                      <th className="text-left py-2 font-semibold">Wallet subscriptions</th>
                      <th className="text-left py-2 font-semibold">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--dash-border)] last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium tabular-nums">
                            {formatPrice(product.price, product.currency)}
                          </span>
                          <span className={cn(dashStatusBadges.neutral, 'text-[10px] px-1.5 py-0')}>
                            Default
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-[var(--dash-muted)]">
                        {product.description || product.name}
                      </td>
                      <td className="py-3 tabular-nums text-[var(--dash-muted)]">0</td>
                      <td className="py-3 text-[var(--dash-muted)] tabular-nums">
                        {formatDate(product.createdAt)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </DetailSection>

            <DetailSection
              title="Trial versions"
              action={
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={stubToast('Add trial version — coming soon')}
                    className="p-1.5 rounded-md hover:bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                    aria-label="Add trial version"
                  >
                    <Plus size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={stubToast('Trial preview — coming soon')}
                    className="text-sm text-[var(--dash-accent)] hover:underline inline-flex items-center gap-1 px-1.5 py-1"
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                </div>
              }
            >
              <DashedEmpty>No trial versions</DashedEmpty>
            </DetailSection>

            <DetailSection
              title="Cross-sells"
              description="Suggest a related product for customers to add to their order."
            >
              <input
                type="text"
                readOnly
                placeholder="Find a product…"
                onFocus={stubToast('Cross-sell search — coming soon')}
                className="dash-input w-full px-4 py-2.5 text-sm cursor-pointer"
              />
            </DetailSection>

            <DetailSection title="Features">
              <DashedEmpty>No features</DashedEmpty>
            </DetailSection>

            <DetailSection title="Logs" description="Recent API requests for this product (dev mock)">
              <ul className="space-y-2 font-mono text-xs">
                {mockLogs.map((log, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-baseline gap-x-2 gap-y-1 py-2 border-b border-[var(--dash-border)] last:border-0"
                  >
                    <span className="text-[var(--dash-muted)] tabular-nums shrink-0">
                      {formatDateTime(log.at.toISOString())}
                    </span>
                    <span className="text-[var(--dash-accent)]">{log.method}</span>
                    <span className="text-[var(--dash-text)] truncate">{log.path}</span>
                    <span className={dashStatusBadges.success}>
                      {log.status} {log.label}
                    </span>
                  </li>
                ))}
              </ul>
            </DetailSection>

            <DetailSection title="Events">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm py-1">
                <span className="text-[var(--dash-muted)] tabular-nums">
                  {formatDateTime(product.createdAt)}
                </span>
                <span className="text-[var(--dash-text)]">
                  A product with ID{' '}
                  <code className="text-xs font-mono bg-[var(--dash-panel-elevated)] px-1.5 py-0.5 rounded">
                    {truncateId(product.id)}
                  </code>{' '}
                  was updated
                </span>
              </div>
            </DetailSection>

            <DetailSection title="Payment links" description="Solana Pay checkout links matching this product">
              {relatedLinks.length === 0 ? (
                <p className="text-sm text-[var(--dash-muted)]">
                  No Solana Pay links with matching name and price.{' '}
                  <Link href={createLinkHref} className="text-[var(--dash-accent)] hover:underline">
                    Create one
                  </Link>
                </p>
              ) : (
                <ul className="space-y-2">
                  {relatedLinks.map((link) => (
                    <li key={link.id}>
                      <button
                        type="button"
                        onClick={() => router.push(`/dashboard/links/${link.id}`)}
                        className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--dash-surface-elevated)] transition-colors"
                      >
                        <LinkIcon size={16} className="text-[var(--dash-accent)]" />
                        <span className="font-medium">{link.name}</span>
                        <span className="text-[var(--dash-muted)] tabular-nums ml-auto">
                          {link.amount} {link.currency}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </DetailSection>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <SidebarCard title="Details" onEdit={openEdit}>
              <CopyField label="Product ID" value={product.id} />
              <DetailRow label="Product category">
                General — Electronically supplied services
              </DetailRow>
              <DetailRow label="Marketing features">
                <span className="text-[var(--dash-muted)]">—</span>
              </DetailRow>
              <DetailRow label="Description">
                {product.description || (
                  <span className="text-[var(--dash-muted)]">No description</span>
                )}
              </DetailRow>
              <DetailRow label="Attributes">
                <span className="text-[var(--dash-muted)]">—</span>
              </DetailRow>
              <button
                type="button"
                onClick={() => setShowMoreDetails((v) => !v)}
                className="text-sm text-[var(--dash-accent)] hover:underline inline-flex items-center gap-1"
              >
                View more
                <ChevronDown
                  size={14}
                  className={cn('transition-transform', showMoreDetails && 'rotate-180')}
                />
              </button>
              {showMoreDetails && (
                <div className="pt-2 space-y-3 border-t border-[var(--dash-border)]">
                  <DetailRow label="Currency">{product.currency}</DetailRow>
                  <DetailRow label="Created">{formatDate(product.createdAt)}</DetailRow>
                  <DetailRow label="Status">
                    <span className={statusBadge}>{statusLabel}</span>
                  </DetailRow>
                </div>
              )}
            </SidebarCard>

            <SidebarCard title="Metadata" onEdit={stubToast('Edit metadata — coming soon')}>
              <DashedEmpty>No metadata</DashedEmpty>
            </SidebarCard>

            <Link
              href={createLinkHref}
              className="dash-btn-primary w-full py-2.5 text-sm text-center inline-block"
            >
              Create Solana Pay link
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

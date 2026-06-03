'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import {
  getProduct,
  listPaymentLinks,
  updateProduct,
} from '@/lib/firestore-data';
import type { Currency, PaymentLink, ProductCatalogItem } from '@luxor/contracts';
import { dashStatusBadges } from '@/lib/dashboard-styles';
import {
  PageHeader,
  CopyField,
  DetailSection,
  DetailSidebar,
  DetailRow,
} from '@/components/dashboard';
import { cn } from '@/lib/cn';
import { ArrowLeft, Link as LinkIcon, Pencil, Package, Plus } from 'lucide-react';
import { toast } from 'sonner';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
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
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={
          <div className="flex flex-wrap items-center gap-3">
            <span>{product.name}</span>
            <span className={product.active ? dashStatusBadges.success : dashStatusBadges.neutral}>
              {product.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        }
        description={`${product.price} ${product.currency}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/products"
              className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Catalog
            </Link>
            <button
              type="button"
              onClick={openEdit}
              className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
            >
              <Pencil size={16} />
              Edit product
            </button>
            <Link
              href={createLinkHref}
              className="dash-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Create payment link
            </Link>
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-6">
            {editing && (
              <form onSubmit={handleSave} className="dash-card p-6 space-y-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Pencil size={18} className="text-[var(--dash-accent)]" />
                  Edit product
                </h2>
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

            <DetailSection title="Pricing" description="Default price for this product">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase text-[var(--dash-muted)] border-b border-[var(--dash-border)]">
                    <th className="text-left py-2 font-semibold">Price</th>
                    <th className="text-left py-2 font-semibold">Currency</th>
                    <th className="text-left py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3 tabular-nums font-medium">{product.price}</td>
                    <td className="py-3">{product.currency}</td>
                    <td className="py-3">
                      <span
                        className={cn(
                          product.active ? dashStatusBadges.success : dashStatusBadges.neutral
                        )}
                      >
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </DetailSection>

            <DetailSection title="Features" description="Product capabilities and entitlements">
              <p className="text-sm text-[var(--dash-muted)] py-4 text-center">
                No features configured yet. Add metadata when the backend supports entitlements.
              </p>
            </DetailSection>

            <DetailSection
              title="Cross-selling"
              description="Recommend related products at checkout"
            >
              <div className="flex items-center gap-3 py-2 text-sm text-[var(--dash-muted)]">
                <Package size={18} className="shrink-0 opacity-50" />
                <p>Search and attach cross-sell products — coming soon.</p>
              </div>
            </DetailSection>

            <DetailSection title="Payment links" description="Checkout links matching this product">
              {relatedLinks.length === 0 ? (
                <p className="text-sm text-[var(--dash-muted)]">
                  No payment links with matching name and price.{' '}
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

          <DetailSidebar>
            <CopyField label="Product ID" value={product.id} />
            <DetailRow label="Currency">{product.currency}</DetailRow>
            <DetailRow label="Description">
              {product.description || (
                <span className="text-[var(--dash-muted)]">No description</span>
              )}
            </DetailRow>
            <DetailRow label="Created">{formatDate(product.createdAt)}</DetailRow>
            <Link
              href={createLinkHref}
              className="dash-btn-primary w-full py-2.5 text-sm text-center inline-block"
            >
              Create payment link
            </Link>
          </DetailSidebar>
        </div>
      </div>
    </>
  );
}

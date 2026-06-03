'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { createProduct, listProducts } from '@/lib/firestore-data';
import type { Currency, ProductCatalogItem } from '@luxor/contracts';
import { dashStatusBadges } from '@/lib/dashboard-styles';
import { Eye, Package, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  PageHeader,
  EmptyState,
  DataTable,
  type DataTableColumn,
} from '@/components/dashboard';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<Currency>('USDC');
  const [creating, setCreating] = useState(false);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    const parsed = parseFloat(price);
    if (!name.trim() || Number.isNaN(parsed) || parsed <= 0) {
      toast.error('Valid name and price are required');
      return;
    }
    setCreating(true);
    try {
      const product = await createProduct(user.uid, {
        name: name.trim(),
        description: description.trim() || undefined,
        price: parsed,
        currency,
      });
      setProducts((prev) => [product, ...prev]);
      setName('');
      setDescription('');
      setPrice('');
      setShowForm(false);
      toast.success('Product created');
    } catch {
      toast.error('Could not save product.');
    } finally {
      setCreating(false);
    }
  };

  const columns: DataTableColumn<ProductCatalogItem>[] = [
    {
      key: 'name',
      header: 'Product',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[var(--dash-accent-soft)] flex items-center justify-center text-[var(--dash-accent)]">
            <Package size={14} />
          </div>
          <div>
            <p className="font-medium">{p.name}</p>
            {p.description && (
              <p className="text-xs text-[var(--dash-muted)] truncate max-w-xs">{p.description}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (p) => (
        <span className="font-medium tabular-nums">
          {p.price} {p.currency}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <span
          className={p.active ? dashStatusBadges.success : dashStatusBadges.neutral}
        >
          {p.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'view',
      header: '',
      className: 'text-right w-24',
      render: (p) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/products/${p.id}`);
          }}
          className="dash-btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
        >
          <Eye size={14} />
          View
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Product catalog"
        description="Manage products and open detail pages to create matching payment links."
        actions={
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="dash-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2"
          >
            <Plus size={16} />
            {showForm ? 'Cancel' : 'New product'}
          </button>
        }
      />

      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        {showForm && (
          <form onSubmit={handleCreate} className="dash-card p-6 space-y-4">
            <h2 className="font-semibold text-[var(--dash-text)] flex items-center gap-2">
              <Plus size={18} className="text-[var(--dash-accent)]" /> New product
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product name"
                className="dash-input px-4 py-2.5 text-sm"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price"
                className="dash-input px-4 py-2.5 text-sm"
              />
            </div>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="dash-input w-full px-4 py-2.5 text-sm"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="dash-input px-4 py-2.5 text-sm max-w-xs"
            >
              <option value="USDC">USDC</option>
              <option value="SOL">SOL</option>
            </select>
            <button
              type="submit"
              disabled={creating}
              className="dash-btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
            >
              {creating ? 'Saving…' : 'Save product'}
            </button>
          </form>
        )}

        {!loading && products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Empty catalog"
            description="Create products to organize your offering. Stripe-style pricing page sync will arrive with the backend."
            action={{ label: 'New product', onClick: () => setShowForm(true) }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={products}
            rowKey={(p) => p.id}
            loading={loading}
            loadingMessage="Loading products…"
            onRowClick={(p) => router.push(`/dashboard/products/${p.id}`)}
          />
        )}
      </div>
    </>
  );
}

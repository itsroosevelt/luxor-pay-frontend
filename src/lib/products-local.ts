import type { Currency, ProductCatalogItem } from '@luxor/contracts';

const STORAGE_PREFIX = 'luxor_products:';

export type LocalProductInput = {
  name: string;
  description?: string;
  price: number;
  currency: Currency;
  active?: boolean;
};

function storageKey(merchantId: string): string {
  return `${STORAGE_PREFIX}${merchantId}`;
}

function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return `prd_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}

function loadProducts(merchantId: string): ProductCatalogItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(merchantId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProductCatalogItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveProducts(merchantId: string, products: ProductCatalogItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey(merchantId), JSON.stringify(products));
  } catch {
    // Quota or private browsing — non-fatal for demo mode.
  }
}

export function listLocalProducts(merchantId: string): ProductCatalogItem[] {
  return loadProducts(merchantId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function findLocalProductById(merchantId: string, productId: string): ProductCatalogItem | null {
  return loadProducts(merchantId).find((p) => p.id === productId) ?? null;
}

export function createLocalProduct(
  merchantId: string,
  input: LocalProductInput
): ProductCatalogItem {
  const product: ProductCatalogItem = {
    id: generateId(),
    merchantId,
    name: input.name,
    description: input.description,
    price: input.price,
    currency: input.currency,
    active: input.active ?? true,
    createdAt: new Date().toISOString(),
  };

  const products = loadProducts(merchantId);
  products.unshift(product);
  saveProducts(merchantId, products);
  return product;
}

export function updateLocalProduct(
  merchantId: string,
  productId: string,
  patch: Partial<LocalProductInput>
): ProductCatalogItem {
  const products = loadProducts(merchantId);
  const index = products.findIndex((p) => p.id === productId);
  if (index === -1) throw new Error('Product not found');

  const current = products[index];
  const updated: ProductCatalogItem = {
    ...current,
    name: patch.name ?? current.name,
    description: patch.description ?? current.description,
    price: patch.price ?? current.price,
    currency: patch.currency ?? current.currency,
    active: patch.active ?? current.active,
  };

  products[index] = updated;
  saveProducts(merchantId, products);
  return updated;
}

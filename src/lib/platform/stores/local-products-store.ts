import { generateId } from '@luxor/contracts';
import type { Currency, ProductCatalogItem } from '@luxor/contracts';
import { readJson, writeJson } from '@/lib/local-storage-utils';

const PRODUCTS_PREFIX = 'luxor-products:';
const PRODUCT_REF_PREFIX = 'luxor-product-ref:';

function productsKey(merchantId: string): string {
  return `${PRODUCTS_PREFIX}${merchantId}`;
}

function productRefKey(productId: string): string {
  return `${PRODUCT_REF_PREFIX}${productId}`;
}

function readMerchantProducts(merchantId: string): ProductCatalogItem[] {
  return readJson<ProductCatalogItem[]>(productsKey(merchantId), []);
}

function persistProduct(product: ProductCatalogItem): ProductCatalogItem {
  const products = readMerchantProducts(product.merchantId);
  const idx = products.findIndex((p) => p.id === product.id);
  const next =
    idx >= 0 ? products.map((p, i) => (i === idx ? product : p)) : [product, ...products];
  writeJson(productsKey(product.merchantId), next);
  writeJson(productRefKey(product.id), product);
  return product;
}

export function listLocalProducts(merchantId: string): ProductCatalogItem[] {
  return readMerchantProducts(merchantId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getLocalProduct(
  merchantId: string,
  productId: string
): ProductCatalogItem | null {
  const product = readJson<ProductCatalogItem | null>(productRefKey(productId), null);
  if (!product || product.merchantId !== merchantId) return null;
  return product;
}

export function createLocalProduct(
  merchantId: string,
  input: { name: string; description?: string; price: number; currency: Currency }
): ProductCatalogItem {
  const id = generateId('prod_');
  const createdAt = new Date().toISOString();
  const product: ProductCatalogItem = {
    id,
    merchantId,
    name: input.name.trim(),
    description: input.description?.trim() || undefined,
    price: input.price,
    currency: input.currency,
    active: true,
    createdAt,
  };
  return persistProduct(product);
}

export function updateLocalProduct(
  merchantId: string,
  productId: string,
  data: Partial<Pick<ProductCatalogItem, 'name' | 'description' | 'price' | 'currency' | 'active'>>
): ProductCatalogItem {
  const existing = getLocalProduct(merchantId, productId);
  if (!existing) throw new Error('PRODUCT_NOT_FOUND');

  const patch: Partial<ProductCatalogItem> = {};
  if (data.name !== undefined) patch.name = data.name.trim();
  if (data.description !== undefined) patch.description = data.description.trim() || undefined;
  if (data.price !== undefined) patch.price = data.price;
  if (data.currency !== undefined) patch.currency = data.currency;
  if (data.active !== undefined) patch.active = data.active;

  return persistProduct({ ...existing, ...patch });
}

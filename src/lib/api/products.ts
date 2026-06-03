import { apiGet, apiPost } from '@/lib/api/http';
import type { Currency, ProductCatalogItem } from '@luxor/contracts';

export async function fetchProductsApi() {
  return apiGet<ProductCatalogItem[]>('/api/v1/products');
}

export async function createProductApi(input: {
  name: string;
  description?: string;
  price: number;
  currency: Currency;
}) {
  return apiPost<ProductCatalogItem>('/api/v1/products', input);
}

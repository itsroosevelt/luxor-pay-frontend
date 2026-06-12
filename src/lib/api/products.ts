import { notImplementedApi, type ApiResult } from '@/lib/api/http';
import type { ProductCatalogItem } from '@luxor/contracts';

export async function fetchProductsApi(): Promise<ApiResult<ProductCatalogItem[]>> {
  return notImplementedApi('Products');
}

export async function createProductApi(
  _input: Omit<ProductCatalogItem, 'id' | 'merchantId' | 'createdAt'>
): Promise<ApiResult<ProductCatalogItem>> {
  return notImplementedApi('Products');
}

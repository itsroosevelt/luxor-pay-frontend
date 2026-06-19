import { notImplementedApi, type ApiResult } from '@/lib/api/http';
import { getCurrentMerchantId, isFrontendOnly } from '@/lib/frontend-only';
import {
  createLocalProduct,
  listLocalProducts,
  type LocalProductInput,
} from '@/lib/products-local';
import type { ProductCatalogItem } from '@luxor/contracts';

export async function fetchProductsApi(): Promise<ApiResult<ProductCatalogItem[]>> {
  if (isFrontendOnly()) {
    const merchantId = getCurrentMerchantId();
    if (!merchantId) {
      return { ok: false, error: 'Not authenticated', status: 401 };
    }
    return { ok: true, data: listLocalProducts(merchantId), status: 200 };
  }
  return notImplementedApi('Products');
}

export async function createProductApi(
  input: LocalProductInput
): Promise<ApiResult<ProductCatalogItem>> {
  if (isFrontendOnly()) {
    const merchantId = getCurrentMerchantId();
    if (!merchantId) {
      return { ok: false, error: 'Not authenticated', status: 401 };
    }
    return { ok: true, data: createLocalProduct(merchantId, input), status: 201 };
  }
  return notImplementedApi('Products');
}

export type { LocalProductInput as CreateProductInput };

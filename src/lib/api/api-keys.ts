import type { ApiResult } from '@/lib/api/http';
import { getCurrentMerchantId, isFrontendOnly } from '@/lib/frontend-only';
import {
  createLocalApiKey,
  listLocalApiKeys,
  revokeLocalApiKey,
} from '@/lib/local-developers-store';
import type { ApiKeyRecord } from '@luxor/contracts';
import { apiDelete, apiGet, apiPost } from '@/lib/api/http';

export async function fetchApiKeysApi(): Promise<ApiResult<ApiKeyRecord[]>> {
  if (isFrontendOnly()) {
    const merchantId = getCurrentMerchantId();
    if (!merchantId) {
      return { ok: false, error: 'Not authenticated', status: 401 };
    }
    return { ok: true, data: listLocalApiKeys(merchantId), status: 200 };
  }
  return apiGet<ApiKeyRecord[]>('/api/v1/api-keys');
}

export async function createApiKeyApi(name: string): Promise<
  ApiResult<ApiKeyRecord & { secret?: string }>
> {
  if (isFrontendOnly()) {
    const merchantId = getCurrentMerchantId();
    if (!merchantId) {
      return { ok: false, error: 'Not authenticated', status: 401 };
    }
    const { record, secret } = createLocalApiKey(merchantId, name);
    return { ok: true, data: { ...record, secret }, status: 201 };
  }
  return apiPost<ApiKeyRecord & { secret?: string }>('/api/v1/api-keys', { name });
}

export async function revokeApiKeyApi(id: string): Promise<ApiResult<void>> {
  if (isFrontendOnly()) {
    const merchantId = getCurrentMerchantId();
    if (!merchantId) {
      return { ok: false, error: 'Not authenticated', status: 401 };
    }
    revokeLocalApiKey(merchantId, id);
    return { ok: true, data: undefined, status: 204 };
  }
  return apiDelete(`/api/v1/api-keys/${id}`);
}

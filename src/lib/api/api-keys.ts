import type { ApiResult } from '@/lib/api/http';
import type { ApiKeyRecord } from '@luxor/contracts';
import { apiDelete, apiGet, apiPost } from '@/lib/api/http';

export async function fetchApiKeysApi(): Promise<ApiResult<ApiKeyRecord[]>> {
  return apiGet<ApiKeyRecord[]>('/api-keys');
}

export async function createApiKeyApi(name: string): Promise<
  ApiResult<ApiKeyRecord & { secret?: string }>
> {
  return apiPost<ApiKeyRecord & { secret?: string }>('/api-keys', { name });
}

export async function revokeApiKeyApi(id: string): Promise<ApiResult<void>> {
  return apiDelete(`/api-keys/${id}`);
}

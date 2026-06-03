import type { ApiResult } from '@/lib/api/http';
import { getCurrentMerchantId, isFrontendOnly } from '@/lib/frontend-only';
import {
  createLocalWebhook,
  deleteLocalWebhook,
  listLocalWebhooks,
} from '@/lib/local-developers-store';
import type { WebhookEndpoint } from '@luxor/contracts';
import { apiDelete, apiGet, apiPost } from '@/lib/api/http';

export async function fetchWebhooksApi(): Promise<ApiResult<WebhookEndpoint[]>> {
  if (isFrontendOnly()) {
    const merchantId = getCurrentMerchantId();
    if (!merchantId) {
      return { ok: false, error: 'Not authenticated', status: 401 };
    }
    return { ok: true, data: listLocalWebhooks(merchantId), status: 200 };
  }
  return apiGet<WebhookEndpoint[]>('/api/v1/webhooks');
}

export async function createWebhookApi(input: {
  url: string;
  events: string[];
}): Promise<ApiResult<WebhookEndpoint & { secret?: string }>> {
  if (isFrontendOnly()) {
    const merchantId = getCurrentMerchantId();
    if (!merchantId) {
      return { ok: false, error: 'Not authenticated', status: 401 };
    }
    const endpoint = createLocalWebhook(merchantId, input);
    return { ok: true, data: endpoint, status: 201 };
  }
  return apiPost<WebhookEndpoint & { secret?: string }>('/api/v1/webhooks', input);
}

export async function deleteWebhookApi(id: string): Promise<ApiResult<void>> {
  if (isFrontendOnly()) {
    const merchantId = getCurrentMerchantId();
    if (!merchantId) {
      return { ok: false, error: 'Not authenticated', status: 401 };
    }
    deleteLocalWebhook(merchantId, id);
    return { ok: true, data: undefined, status: 204 };
  }
  return apiDelete(`/api/v1/webhooks/${id}`);
}

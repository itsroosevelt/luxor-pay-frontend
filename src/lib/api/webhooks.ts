import type { ApiResult } from '@/lib/api/http';
import { notImplementedApi } from '@/lib/api/http';
import type { WebhookEndpoint } from '@luxor/contracts';

export async function fetchWebhooksApi(): Promise<ApiResult<WebhookEndpoint[]>> {
  return notImplementedApi('Webhooks');
}

export async function createWebhookApi(_input: {
  url: string;
  events: string[];
}): Promise<ApiResult<WebhookEndpoint & { secret?: string }>> {
  return notImplementedApi('Webhooks');
}

export async function deleteWebhookApi(_id: string): Promise<ApiResult<void>> {
  return notImplementedApi('Webhooks');
}

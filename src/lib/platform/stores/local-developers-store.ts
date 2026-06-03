import { generateId } from '@luxor/contracts';
import type { ApiKeyRecord, WebhookEndpoint } from '@luxor/contracts';
import { readJson, writeJson } from '@/lib/local-storage-utils';

const API_KEYS_PREFIX = 'luxor-api-keys:';
const WEBHOOKS_PREFIX = 'luxor-webhooks:';

function apiKeysKey(merchantId: string): string {
  return `${API_KEYS_PREFIX}${merchantId}`;
}

function webhooksKey(merchantId: string): string {
  return `${WEBHOOKS_PREFIX}${merchantId}`;
}

function randomSecret(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const part = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `sk_demo_${part}`;
}

export function listLocalApiKeys(merchantId: string): ApiKeyRecord[] {
  return readJson<ApiKeyRecord[]>(apiKeysKey(merchantId), []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createLocalApiKey(
  merchantId: string,
  name: string
): { record: ApiKeyRecord; secret: string } {
  const secret = randomSecret();
  const record: ApiKeyRecord = {
    id: generateId('key_'),
    merchantId,
    name: name.trim(),
    keyPrefix: secret.slice(0, 12),
    createdAt: new Date().toISOString(),
  };
  const keys = listLocalApiKeys(merchantId);
  writeJson(apiKeysKey(merchantId), [record, ...keys]);
  return { record, secret };
}

export function revokeLocalApiKey(merchantId: string, id: string): void {
  const keys = listLocalApiKeys(merchantId).filter((k) => k.id !== id);
  writeJson(apiKeysKey(merchantId), keys);
}

export function listLocalWebhooks(merchantId: string): WebhookEndpoint[] {
  return readJson<WebhookEndpoint[]>(webhooksKey(merchantId), []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createLocalWebhook(
  merchantId: string,
  input: { url: string; events: string[] }
): WebhookEndpoint {
  const endpoint: WebhookEndpoint = {
    id: generateId('wh_'),
    merchantId,
    url: input.url.trim(),
    events: input.events,
    active: true,
    createdAt: new Date().toISOString(),
  };
  const hooks = listLocalWebhooks(merchantId);
  writeJson(webhooksKey(merchantId), [endpoint, ...hooks]);
  return endpoint;
}

export function deleteLocalWebhook(merchantId: string, id: string): void {
  const hooks = listLocalWebhooks(merchantId).filter((w) => w.id !== id);
  writeJson(webhooksKey(merchantId), hooks);
}

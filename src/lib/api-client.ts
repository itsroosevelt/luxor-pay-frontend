/** Base URL for luxor-pay-be-solana (NestJS API). Not the legacy luxor-pay-backend. Agent API: future. */
export function getApiBaseUrl(): string {
  // Same-origin proxy (next.config rewrites → localhost:3008). Avoids Failed to fetch when
  // the browser only has port 3000 forwarded, not 3008.
  if (process.env.NEXT_PUBLIC_API_PROXY !== 'false') {
    return '/luxor-api';
  }
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3008';
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl().replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

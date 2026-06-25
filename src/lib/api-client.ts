export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3008';
}

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;

  // Browser requests go through the Next.js proxy to avoid CORS and unreachable cross-origin hosts.
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/backend${normalized}`;
  }

  const base = getApiBaseUrl().replace(/\/$/, '');
  return `${base}${normalized}`;
}

import { Capacitor } from '@capacitor/core';

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3008';
}

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;

  // If we are in a native Capacitor environment, bypass Next.js proxy
  if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
    const base = getApiBaseUrl().replace(/\/$/, '');
    return `${base}${normalized}`;
  }

  // Browser requests go through the Next.js proxy to avoid CORS and unreachable cross-origin hosts.
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/backend${normalized}`;
  }

  const base = getApiBaseUrl().replace(/\/$/, '');
  return `${base}${normalized}`;
}

/** Readable message when the request never reached the server (offline / backend down). */
export function describeNetworkError(err: unknown): string {
  const detail = err instanceof Error ? err.message : String(err);
  return `No hay conexión con el servidor (${detail}). Comprueba tu conexión o que el backend esté en marcha.`;
}

/**
 * Readable message for a failed response. Backend errors already carry a message;
 * proxy/transport failures (HTML 404 from a stale dev server, 502, …) don't.
 */
export async function describeApiError(response: Response, path: string): Promise<string> {
  const body = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
  const message = Array.isArray(body?.message) ? body?.message.join(', ') : body?.message;
  if (message) {
    if (/Invalid authentication token|Missing or invalid Authorization/i.test(message)) {
      return 'Tu sesión expiró. Vuelve a iniciar sesión.';
    }
    return message;
  }
  switch (response.status) {
    case 404:
      return `El servidor no encontró ${path} (404). Si estás en desarrollo, reinicia el frontend (borra la carpeta .next).`;
    case 502:
    case 504:
      return 'El backend no responde. Comprueba que esté en marcha y reintenta.';
    case 503:
      return 'La red de Solana está saturada o no responde. Reintenta en unos segundos.';
    default:
      return `Error ${response.status} al solicitar ${path}`;
  }
}

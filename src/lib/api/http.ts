import { apiUrl } from '@/lib/api-client';
import { authHeaders } from '@/lib/auth-client';

export type ApiResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: string; status: number; unavailable?: boolean; notImplemented?: boolean };

async function parseJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function apiGet<T>(path: string, options?: { auth?: boolean }): Promise<ApiResult<T>> {
  try {
    const headers =
      options?.auth === false
        ? ({ 'Content-Type': 'application/json' } satisfies HeadersInit)
        : await authHeaders();
    const res = await fetch(apiUrl(path), { headers });
    const json = await parseJson(res);
    if (!res.ok) {
      const message =
        (typeof json.message === 'string' && json.message) ||
        (typeof json.error === 'string' && json.error) ||
        res.statusText;
      return {
        ok: false,
        error: message,
        status: res.status,
        notImplemented: res.status === 404 || res.status === 501,
      };
    }
    return { ok: true, data: (json.data ?? json) as T, status: res.status };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Network error',
      status: 0,
      unavailable: true,
    };
  }
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  options?: { auth?: boolean }
): Promise<ApiResult<T>> {
  try {
    const headers =
      options?.auth === false
        ? ({ 'Content-Type': 'application/json' } satisfies HeadersInit)
        : await authHeaders();
    const res = await fetch(apiUrl(path), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const json = await parseJson(res);
    if (!res.ok) {
      const message =
        (typeof json.message === 'string' && json.message) ||
        (typeof json.error === 'string' && json.error) ||
        res.statusText;
      return {
        ok: false,
        error: message,
        status: res.status,
        notImplemented: res.status === 404 || res.status === 501,
      };
    }
    const data = (json.data ?? json) as T;
    if (typeof json.secret === 'string' && data && typeof data === 'object') {
      return { ok: true, data: { ...data, secret: json.secret } as T, status: res.status };
    }
    return { ok: true, data, status: res.status };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Network error',
      status: 0,
      unavailable: true,
    };
  }
}

export async function apiDelete(path: string): Promise<ApiResult<void>> {
  try {
    const res = await fetch(apiUrl(path), {
      method: 'DELETE',
      headers: await authHeaders(),
    });
    if (!res.ok) {
      const json = await parseJson(res);
      const message =
        (typeof json.message === 'string' && json.message) ||
        (typeof json.error === 'string' && json.error) ||
        res.statusText;
      return { ok: false, error: message, status: res.status };
    }
    return { ok: true, data: undefined, status: res.status };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Network error',
      status: 0,
      unavailable: true,
    };
  }
}

export async function requireAuthToken(): Promise<string | null> {
  const { getIdToken } = await import('@/lib/auth-client');
  return getIdToken();
}

export async function notImplementedApi<T>(feature: string): Promise<ApiResult<T>> {
  return {
    ok: false,
    error: `${feature} is not available on the Solana backend yet.`,
    status: 501,
    notImplemented: true,
  };
}

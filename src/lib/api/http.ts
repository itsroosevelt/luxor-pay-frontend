import { isFrontendOnly } from '@/lib/frontend-only';
import { getIdToken } from '@/lib/auth-client';

export type ApiResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: string; status: number; unavailable?: boolean; notImplemented?: boolean };

const FRONTEND_DEMO_MESSAGE =
  'Frontend demo mode — no external backend. Data is stored in your browser (localStorage).';

export async function apiGet<T>(_path: string, _options?: { auth?: boolean }): Promise<ApiResult<T>> {
  if (isFrontendOnly()) {
    return {
      ok: false,
      error: FRONTEND_DEMO_MESSAGE,
      status: 503,
      unavailable: true,
    };
  }
  return {
    ok: false,
    error: 'Backend fetch disabled in this build',
    status: 503,
    unavailable: true,
  };
}

export async function apiPost<T>(
  _path: string,
  _body: unknown,
  _options?: { auth?: boolean }
): Promise<ApiResult<T>> {
  if (isFrontendOnly()) {
    return {
      ok: false,
      error: FRONTEND_DEMO_MESSAGE,
      status: 503,
      unavailable: true,
    };
  }
  return {
    ok: false,
    error: 'Backend fetch disabled in this build',
    status: 503,
    unavailable: true,
  };
}

export async function apiDelete(_path: string): Promise<ApiResult<void>> {
  if (isFrontendOnly()) {
    return {
      ok: false,
      error: FRONTEND_DEMO_MESSAGE,
      status: 503,
      unavailable: true,
    };
  }
  return {
    ok: false,
    error: 'Backend fetch disabled in this build',
    status: 503,
    unavailable: true,
  };
}

export async function requireAuthToken(): Promise<string | null> {
  return getIdToken();
}

/**
 * Mock Mode network interceptor.
 *
 * Monkey-patches `window.fetch` so that — while `IS_MOCK_MODE` is on — every
 * request that targets the backend (through the Next `/api/backend/*` proxy or
 * the raw `NEXT_PUBLIC_API_URL`) is answered from `src/mocks`, and a couple of
 * external price providers are stubbed too. Everything else (Next assets, HMR,
 * fonts, RPC, wallet adapters…) passes straight through to the real `fetch`.
 *
 * This keeps all `src/lib/*-api.ts` service modules and their consuming
 * components completely untouched: the repository/service layer still calls
 * `fetch(apiUrl(...))`, it just never leaves the browser in mock mode.
 *
 * Importing this module installs the patch as a side effect (browser only).
 */

import { getApiBaseUrl } from '@/lib/api-client';
import { IS_MOCK_MODE, MOCK_LATENCY_MS } from '@/lib/mock/mock-config';
import { resolveExternalMock, resolveMock, type MockResult } from '@/mocks/handlers';

const PROXY_PREFIX = '/api/backend';
const INSTALL_FLAG = '__luxorMockFetchInstalled__';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function toUrlString(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return (input as Request).url;
}

function parseJsonBody(init?: RequestInit): Record<string, unknown> | undefined {
  const body = init?.body;
  if (typeof body !== 'string' || body.length === 0) return undefined;
  try {
    const parsed = JSON.parse(body);
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
}

function buildResponse(result: MockResult): Response {
  if (result.rawBody != null) {
    return new Response(result.rawBody, {
      status: result.status,
      headers: { 'Content-Type': result.contentType ?? 'text/plain' },
    });
  }
  return new Response(JSON.stringify(result.body ?? {}), {
    status: result.status,
    headers: { 'Content-Type': result.contentType ?? 'application/json' },
  });
}

/** Returns the backend-relative path ("/merchants/me") for a request, or null. */
function backendPathFor(url: URL): string | null {
  const sameOrigin = typeof window !== 'undefined' && url.origin === window.location.origin;
  if (sameOrigin && url.pathname.startsWith(`${PROXY_PREFIX}/`)) {
    return url.pathname.slice(PROXY_PREFIX.length) || '/';
  }
  const apiBase = getApiBaseUrl().replace(/\/$/, '');
  try {
    const base = new URL(apiBase);
    if (url.origin === base.origin) return url.pathname || '/';
  } catch {
    /* getApiBaseUrl not absolute — ignore */
  }
  return null;
}

export function installMockFetch(): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as Record<string, unknown>;
  if (w[INSTALL_FLAG]) return;
  w[INSTALL_FLAG] = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let url: URL;
    try {
      url = new URL(toUrlString(input), window.location.origin);
    } catch {
      return originalFetch(input as RequestInfo, init);
    }

    const method = (
      init?.method ??
      (typeof input === 'object' && 'method' in input ? (input as Request).method : 'GET')
    ).toUpperCase();

    const backendPath = backendPathFor(url);
    if (backendPath) {
      const result = resolveMock(method, backendPath, url.searchParams, parseJsonBody(init));
      if (result) {
        if (MOCK_LATENCY_MS > 0) await sleep(MOCK_LATENCY_MS);
        // eslint-disable-next-line no-console
        console.debug(`[mock] ${method} ${backendPath} → ${result.status}`);
        return buildResponse(result);
      }
      // Unmapped backend route: answer with a clean 404 instead of hitting the
      // dead proxy so components show their normal empty/error states.
      console.warn(`[mock] no handler for ${method} ${backendPath} — returning 404`);
      return buildResponse({ status: 404, body: { message: `No mock handler for ${method} ${backendPath}` } });
    }

    const external = resolveExternalMock(url);
    if (external) {
      if (MOCK_LATENCY_MS > 0) await sleep(MOCK_LATENCY_MS);
      return buildResponse(external);
    }

    return originalFetch(input as RequestInfo, init);
  };

  // eslint-disable-next-line no-console
  console.info('%c[Luxor Pay] Mock Mode active — backend & auth are simulated', 'color:#10B981;font-weight:bold');
}

if (IS_MOCK_MODE) {
  installMockFetch();
}

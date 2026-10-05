/**
 * URL building for the `/api/backend/[...path]` proxy.
 *
 * The path comes from the browser, so it must never be able to point the
 * server-side fetch anywhere but the backend: `%2F%2Fevil.com` or `%5Cevil.com`
 * would otherwise make `new URL()` switch host (SSRF / open proxy) and the
 * proxy would forward the caller's Authorization header to that host.
 */

/** A path segment that is safe to place under the backend base URL. */
function isSafeSegment(segment: string): boolean {
  if (segment === '' || segment === '.' || segment === '..') return false;
  // Separators or control characters inside a segment could change the URL structure.
  return !/[\/\\?#\u0000-\u001f\u007f]/.test(segment);
}

/**
 * Backend URL for the given (already decoded) path segments, or null when the
 * path is not acceptable. The result is guaranteed to stay on the backend's
 * origin and under its base path.
 */
export function resolveBackendTarget(baseUrl: string, segments: string[]): URL | null {
  if (segments.length === 0 || !segments.every(isSafeSegment)) return null;

  const base = new URL(baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
  const target = new URL(segments.map(encodeURIComponent).join('/'), base);

  if (target.origin !== base.origin || !target.pathname.startsWith(base.pathname)) return null;
  return target;
}

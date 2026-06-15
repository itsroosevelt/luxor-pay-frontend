/** Routes that use a full-viewport editor (no sidebar or dashboard search header). */
export function isDashboardImmersiveRoute(pathname: string): boolean {
  if (pathname === '/dashboard/links/create') return true;
  if (/^\/dashboard\/links\/[^/]+\/edit$/.test(pathname)) return true;
  return false;
}

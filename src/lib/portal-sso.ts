/**
 * Portal switching — Meta Business Suite style.
 *
 * For now the two satellite portals (Launcher & Liquidez en DEXs, Payment
 * Links / POS) live INSIDE this same Next.js app, under the `(portals)`
 * route group (`src/app/(portals)/...`) — which has its own minimal
 * `PortalTopBar` layout instead of the main dashboard's `<Sidebar>`. That's
 * what makes them read as separate "apps" while staying one deployment:
 * same origin, same Firebase session, no token handoff needed.
 *
 * `buildPortalSsoUrl` below still supports a genuinely external deployment
 * (own domain) for when/if a portal graduates out of this repo — see
 * `luxor-pay-portal-kit` for that receiving side — but nothing currently
 * uses that path.
 */

import { auth } from '@/lib/firebase';

export interface PortalTarget {
  key: 'main' | 'launcher' | 'pos';
  label: string;
  description: string;
  /** Route within this app (`/token-launcher`) or a full external origin. */
  baseUrl: string;
}

export const MAIN_PORTAL: PortalTarget = {
  key: 'main',
  label: 'Luxor Pay',
  description: 'Main portal — dashboard, treasury, and transactions',
  baseUrl: '/dashboard',
};

export const SATELLITE_PORTALS: PortalTarget[] = [
  {
    key: 'launcher',
    label: 'Launcher & DEX Liquidity',
    description: 'Create tokens and manage liquidity pools',
    baseUrl: '/token-launcher',
  },
  {
    key: 'pos',
    label: 'Payment Links / POS',
    description: 'Payment links, QR codes, and physical terminals',
    baseUrl: '/payment-portal',
  },
];

/**
 * Builds the one-shot SSO URL for a satellite portal. Falls back to a plain
 * link (no token) if there's no active session — the portal's own `/sso`
 * route is expected to redirect to its login in that case.
 */
export async function buildPortalSsoUrl(portal: PortalTarget, merchantId?: string | null): Promise<string> {
  const base = portal.baseUrl.replace(/\/$/, '');

  if (base.startsWith('/') || (typeof window !== 'undefined' && base.includes(window.location.host))) {
    return base;
  }

  let target: URL;
  try {
    target = new URL(`${base}/sso`);
  } catch {
    return base;
  }

  try {
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : null;
    if (token) target.searchParams.set('token', token);
  } catch {
    // No session yet — the satellite portal handles the unauthenticated case.
  }

  if (merchantId) target.searchParams.set('merchant', merchantId);
  if (typeof window !== 'undefined') target.searchParams.set('return_to', window.location.href);

  return target.toString();
}

/**
 * Opens a portal in a new tab.
 */
export function redirectPreopenedTab(tab: Window | null, url: string) {
  if (tab && !tab.closed) {
    tab.location.href = url;
  } else if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
}

import { bearerAuth } from '@/lib/auth-client';
import { peekWalletAuthHeaders } from '@/lib/wallet-session';

/** Header the backend reads to know which of the organization's treasuries a request is about. */
export const TREASURY_HEADER = 'x-luxor-treasury';
const STORAGE_KEY = 'luxor_active_treasury_id';

/** Id of the treasury the user picked, or null for the default one. Per-browser convenience only. */
export function getActiveTreasuryId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

/** Switches the active treasury. Every cached treasury resource belongs to the old one, so reload. */
export function setActiveTreasuryId(id: string | null): void {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable: the default treasury is used
  }
  if (typeof window !== 'undefined') window.location.reload();
}

/** Bearer token plus the active treasury, for the treasury / vault / member / proposal endpoints. */
export async function treasuryAuth(): Promise<Record<string, string>> {
  // The signed session (when one exists) lets a member open a treasury of another organization.
  const headers: Record<string, string> = { ...(await bearerAuth()), ...peekWalletAuthHeaders() };
  const id = getActiveTreasuryId();
  if (id) headers[TREASURY_HEADER] = id;
  return headers;
}

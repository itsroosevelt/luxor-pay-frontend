import { auth } from '@/lib/firebase';

/** When true, merchant profile reads/writes use localStorage instead of luxor-pay-be-solana. */
export function isFrontendOnly(): boolean {
  return false;
}

export function getCurrentMerchantId(): string | null {
  if (typeof window === 'undefined') return null;
  return auth.currentUser?.uid ?? null;
}

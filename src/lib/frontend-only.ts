import { auth } from '@/lib/firebase';

/** Default: frontend-only (no Node API at NEXT_PUBLIC_API_URL). Set to "false" to enable backend fetch. */
export function isFrontendOnly(): boolean {
  return process.env.NEXT_PUBLIC_FRONTEND_ONLY !== 'false';
}

export function getCurrentMerchantId(): string | null {
  if (typeof window === 'undefined') return null;
  return auth.currentUser?.uid ?? null;
}

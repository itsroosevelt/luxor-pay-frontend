import type { MerchantProfile } from '@luxor/contracts';

const STORAGE_PREFIX = 'luxor_merchant_profile:';

function storageKey(merchantId: string): string {
  return `${STORAGE_PREFIX}${merchantId}`;
}

export function loadLocalMerchantProfile(merchantId: string): MerchantProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(merchantId));
    if (!raw) return null;
    return JSON.parse(raw) as MerchantProfile;
  } catch {
    return null;
  }
}

export function saveLocalMerchantProfile(merchantId: string, profile: MerchantProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey(merchantId), JSON.stringify(profile));
  } catch {
    // Quota or private browsing — non-fatal for dashboard shell.
  }
}

export function buildLocalMerchantProfile(email: string, merchantId: string): MerchantProfile {
  const now = new Date().toISOString();
  const existing = loadLocalMerchantProfile(merchantId);
  if (existing) return existing;
  return {
    email,
    businessName: '',
    merchantWallet: '',
    createdAt: now,
    updatedAt: now,
  };
}

import type { MerchantProfile } from '@luxor/contracts';
import { loadLocalMerchantProfile } from '@/lib/merchant-local';

const MERCHANT_PROFILE_PREFIX = 'luxor_merchant_profile:';

export type AdminMerchantRow = {
  id: string;
  email: string;
  businessName: string;
  createdAt: string;
  hasWallet: boolean;
};

/** Scan localStorage for merchant profiles (frontend-only / demo mode). */
export function scanLocalMerchants(): AdminMerchantRow[] {
  if (typeof window === 'undefined') return [];

  const merchants: AdminMerchantRow[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(MERCHANT_PROFILE_PREFIX)) continue;

    const merchantId = key.slice(MERCHANT_PROFILE_PREFIX.length);
    const profile = loadLocalMerchantProfile(merchantId);
    if (!profile) continue;

    merchants.push(mapProfileToRow(merchantId, profile));
  }

  return merchants.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function mapProfileToRow(merchantId: string, profile: MerchantProfile): AdminMerchantRow {
  return {
    id: merchantId,
    email: profile.email || '—',
    businessName: profile.businessName?.trim() || 'Sin nombre',
    createdAt: profile.createdAt,
    hasWallet: Boolean(profile.merchantWallet?.trim()),
  };
}

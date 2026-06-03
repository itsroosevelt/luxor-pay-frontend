import type { MerchantProfile } from '@luxor/contracts';
import { readJson, writeJson } from '@/lib/local-storage-utils';

const MERCHANT_PREFIX = 'luxor-merchant:';

function merchantKey(merchantId: string): string {
  return `${MERCHANT_PREFIX}${merchantId}`;
}

export function getLocalMerchantProfile(merchantId: string): MerchantProfile | null {
  return readJson<MerchantProfile | null>(merchantKey(merchantId), null);
}

export function ensureLocalMerchantProfile(
  merchantId: string,
  email: string
): MerchantProfile {
  const existing = getLocalMerchantProfile(merchantId);
  if (existing) return existing;

  const now = new Date().toISOString();
  const profile: MerchantProfile = { email, createdAt: now, updatedAt: now };
  writeJson(merchantKey(merchantId), profile);
  return profile;
}

export function updateLocalMerchantProfile(
  merchantId: string,
  data: Partial<Pick<MerchantProfile, 'businessName' | 'merchantWallet'>>
): void {
  const existing = getLocalMerchantProfile(merchantId);
  if (!existing) throw new Error('MERCHANT_NOT_FOUND');

  writeJson(merchantKey(merchantId), {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

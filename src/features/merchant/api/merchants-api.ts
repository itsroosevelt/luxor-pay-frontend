import { apiUrl } from '@/lib/api-client';
import { bearerAuth } from '@/lib/auth-client';
import type { MerchantProfile } from '@luxor/contracts';

export interface CreateMerchantDto {
  email: string;
  businessName?: string;
  merchantWallet?: string;
  solanaToken?: string;
}

export interface PublicMerchantProfile {
  businessName?: string;
  merchantWallet?: string;
}

/** Public merchant lookup by wallet (no auth). Returns null when not found or unavailable. */
export async function getMerchantProfileByWallet(
  wallet: string,
): Promise<PublicMerchantProfile | null> {
  const trimmed = wallet.trim();
  if (!trimmed) return null;

  let res: Response;
  try {
    res = await fetch(
      apiUrl(`/merchants/wallet/${encodeURIComponent(trimmed)}`),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch {
    return null;
  }

  if (res.status === 404) {
    return null;
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return null;
  }

  return (json.data ?? json) as PublicMerchantProfile;
}

export async function getMerchantProfile(): Promise<MerchantProfile | null> {
  const authorization = await bearerAuth();
  let res: Response;
  try {
    res = await fetch(apiUrl('/merchants/me'), {
      headers: { ...authorization, 'Content-Type': 'application/json' },
    });
  } catch {
    return null;
  }

  if (res.status === 404) {
    return null;
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status >= 500) {
      return null;
    }
    return null;
  }

  return (json.data ?? json) as MerchantProfile;
}

export async function createMerchantProfile(data: CreateMerchantDto): Promise<MerchantProfile> {
  const authorization = await bearerAuth();
  let res: Response;
  try {
    res = await fetch(apiUrl('/merchants'), {
      method: 'POST',
      headers: { ...authorization, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error('Unable to reach API');
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message ?? 'Failed to create merchant profile');
  }

  return (json.data ?? json) as MerchantProfile;
}

export async function ensureMerchantProfile(email: string): Promise<MerchantProfile | null> {
  try {
    let profile = await getMerchantProfile();

    if (!profile) {
      profile = await createMerchantProfile({
        email,
        businessName: '',
        merchantWallet: '',
        solanaToken: '',
      });
    }

    return profile;
  } catch {
    return null;
  }
}

export interface UpdateMerchantDto {
  email?: string;
  businessName?: string;
  merchantWallet?: string;
  solanaToken?: string;
}

export async function updateMerchantProfile(data: UpdateMerchantDto): Promise<MerchantProfile> {
  const authorization = await bearerAuth();
  let res: Response;
  try {
    res = await fetch(apiUrl('/merchants/me'), {
      method: 'PATCH',
      headers: { ...authorization, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error('Unable to reach API');
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message ?? 'Failed to update merchant profile');
  }

  return (json.data ?? json) as MerchantProfile;
}

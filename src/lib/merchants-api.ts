import { apiUrl } from '@/lib/api-client';
import { authHeaders } from '@/lib/auth-client';
import type { MerchantProfile } from '@luxor/contracts';

export interface CreateMerchantDto {
  email: string;
  businessName?: string;
  merchantWallet?: string;
  solanaToken?: string;
}

export async function getMerchantProfile(token: string): Promise<MerchantProfile | null> {
  let res: Response;
  try {
    res = await fetch(apiUrl('/merchants/me'), {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
  } catch {
    throw new Error('Unable to reach API');
  }

  if (res.status === 404) {
    return null;
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status >= 500) {
      throw new Error(json.message ?? 'Failed to fetch merchant profile');
    }
    return null;
  }

  return (json.data ?? json) as MerchantProfile;
}

export async function createMerchantProfile(token: string, data: CreateMerchantDto): Promise<MerchantProfile> {
  let res: Response;
  try {
    res = await fetch(apiUrl('/merchants'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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

export async function ensureMerchantProfile(token: string, email: string): Promise<MerchantProfile> {
  let profile = await getMerchantProfile(token);
  
  if (!profile) {
    profile = await createMerchantProfile(token, {
      email,
      businessName: '',
      merchantWallet: '',
      solanaToken: '',
    });
  }
  
  return profile;
}

export interface UpdateMerchantDto {
  email?: string;
  businessName?: string;
  merchantWallet?: string;
  solanaToken?: string;
}

export async function updateMerchantProfile(token: string, data: UpdateMerchantDto): Promise<MerchantProfile> {
  let res: Response;
  try {
    res = await fetch(apiUrl('/merchants/me'), {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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

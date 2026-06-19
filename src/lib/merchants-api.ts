import { apiUrl } from '@/lib/api-client';
import { getIdToken } from '@/lib/auth-client';
import { isFrontendOnly } from '@/lib/frontend-only';
import {
  buildLocalMerchantProfile,
  loadLocalMerchantProfile,
  saveLocalMerchantProfile,
} from '@/lib/merchant-local';
import type { MerchantProfile } from '@luxor/contracts';

export interface CreateMerchantDto {
  email: string;
  businessName?: string;
  merchantWallet?: string;
  solanaToken?: string;
}

export type EnsureMerchantFallbackReason = 'frontend_only' | 'auth_failed' | 'backend_unavailable';

export interface EnsureMerchantOutcome {
  profile: MerchantProfile;
  usedLocalFallback: boolean;
  fallbackReason?: EnsureMerchantFallbackReason;
}

type MerchantFetchStatus = 'ok' | 'not_found' | 'auth' | 'unavailable' | 'error';

interface MerchantFetchResult {
  status: MerchantFetchStatus;
  profile?: MerchantProfile;
  message?: string;
}

async function parseJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function messageFromJson(json: Record<string, unknown>, fallback: string): string {
  return (typeof json.message === 'string' && json.message) || fallback;
}

function localFallback(
  email: string,
  merchantId: string | undefined,
  reason: EnsureMerchantFallbackReason
): EnsureMerchantOutcome {
  const id = merchantId ?? 'anonymous';
  const profile = merchantId
    ? buildLocalMerchantProfile(email, merchantId)
    : { email, businessName: '', merchantWallet: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (merchantId) saveLocalMerchantProfile(id, profile);
  return { profile, usedLocalFallback: true, fallbackReason: reason };
}

async function fetchMerchantWithStatus(token: string): Promise<MerchantFetchResult> {
  try {
    const res = await fetch(apiUrl('/merchants/me'), {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });

    if (res.status === 404) {
      return { status: 'not_found' };
    }

    const json = await parseJson(res);

    if (res.status === 401 || res.status === 403) {
      return {
        status: 'auth',
        message: messageFromJson(json, 'Invalid authentication token'),
      };
    }

    if (!res.ok) {
      if (res.status >= 500) {
        return {
          status: 'unavailable',
          message: messageFromJson(json, 'Failed to fetch merchant profile'),
        };
      }
      return {
        status: 'error',
        message: messageFromJson(json, 'Failed to fetch merchant profile'),
      };
    }

    return {
      status: 'ok',
      profile: (json.data ?? json) as MerchantProfile,
    };
  } catch (e) {
    return {
      status: 'unavailable',
      message: e instanceof Error ? e.message : 'Network error',
    };
  }
}

async function createMerchantWithStatus(
  token: string,
  data: CreateMerchantDto
): Promise<MerchantFetchResult> {
  try {
    const res = await fetch(apiUrl('/merchants'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await parseJson(res);

    if (res.status === 401 || res.status === 403) {
      return {
        status: 'auth',
        message: messageFromJson(json, 'Invalid authentication token'),
      };
    }

    if (!res.ok) {
      if (res.status >= 500) {
        return {
          status: 'unavailable',
          message: messageFromJson(json, 'Failed to create merchant profile'),
        };
      }
      return {
        status: 'error',
        message: messageFromJson(json, 'Failed to create merchant profile'),
      };
    }

    return {
      status: 'ok',
      profile: (json.data ?? json) as MerchantProfile,
    };
  } catch (e) {
    return {
      status: 'unavailable',
      message: e instanceof Error ? e.message : 'Network error',
    };
  }
}

async function resolveToken(token: string, forceRefresh: boolean): Promise<string> {
  if (!forceRefresh) return token;
  const fresh = await getIdToken(true);
  return fresh ?? token;
}

export async function getMerchantProfile(
  token: string,
  options?: { merchantId?: string; email?: string }
): Promise<MerchantProfile | null> {
  if (isFrontendOnly()) {
    const id = options?.merchantId;
    if (!id) return null;
    return loadLocalMerchantProfile(id) ?? buildLocalMerchantProfile(options.email ?? '', id);
  }
  const result = await fetchMerchantWithStatus(token);
  if (result.status === 'ok' && result.profile) {
    return result.profile;
  }
  return null;
}

export async function createMerchantProfile(
  token: string,
  data: CreateMerchantDto
): Promise<MerchantProfile> {
  const result = await createMerchantWithStatus(token, data);
  if (result.status === 'ok' && result.profile) {
    return result.profile;
  }
  throw new Error(result.message ?? 'Failed to create merchant profile');
}

export async function ensureMerchantProfile(
  token: string,
  email: string,
  options?: { merchantId?: string }
): Promise<EnsureMerchantOutcome> {
  const merchantId = options?.merchantId;

  if (isFrontendOnly()) {
    return localFallback(email, merchantId, 'frontend_only');
  }

  let currentToken = token;

  for (let attempt = 0; attempt < 2; attempt++) {
    const fetchResult = await fetchMerchantWithStatus(currentToken);

    if (fetchResult.status === 'ok' && fetchResult.profile) {
      if (merchantId) saveLocalMerchantProfile(merchantId, fetchResult.profile);
      return { profile: fetchResult.profile, usedLocalFallback: false };
    }

    if (fetchResult.status === 'not_found') {
      const createResult = await createMerchantWithStatus(currentToken, {
        email,
        businessName: '',
        merchantWallet: '',
        solanaToken: '',
      });

      if (createResult.status === 'ok' && createResult.profile) {
        if (merchantId) saveLocalMerchantProfile(merchantId, createResult.profile);
        return { profile: createResult.profile, usedLocalFallback: false };
      }

      if (createResult.status === 'auth') {
        if (attempt === 0) {
          currentToken = await resolveToken(currentToken, true);
          continue;
        }
        return localFallback(email, merchantId, 'auth_failed');
      }

      if (createResult.status === 'unavailable') {
        return localFallback(email, merchantId, 'backend_unavailable');
      }

      throw new Error(createResult.message ?? 'Failed to create merchant profile');
    }

    if (fetchResult.status === 'auth') {
      if (attempt === 0) {
        currentToken = await resolveToken(currentToken, true);
        continue;
      }
      return localFallback(email, merchantId, 'auth_failed');
    }

    if (fetchResult.status === 'unavailable') {
      return localFallback(email, merchantId, 'backend_unavailable');
    }

    throw new Error(fetchResult.message ?? 'Failed to fetch merchant profile');
  }

  return localFallback(email, merchantId, 'auth_failed');
}

export interface UpdateMerchantDto {
  email?: string;
  businessName?: string;
  merchantWallet?: string;
  solanaToken?: string;
}

export async function updateMerchantProfile(
  token: string,
  data: UpdateMerchantDto,
  options?: { merchantId?: string }
): Promise<MerchantProfile> {
  if (isFrontendOnly()) {
    const id = options?.merchantId;
    if (!id) throw new Error('Merchant id required for local profile update');
    const existing = loadLocalMerchantProfile(id) ?? buildLocalMerchantProfile(data.email ?? '', id);
    const updated: MerchantProfile = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveLocalMerchantProfile(id, updated);
    return updated;
  }

  const res = await fetch(apiUrl('/merchants/me'), {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = await parseJson(res);
  if (!res.ok) {
    if ((res.status === 401 || res.status === 403 || res.status >= 500) && options?.merchantId) {
      const existing =
        loadLocalMerchantProfile(options.merchantId) ??
        buildLocalMerchantProfile(data.email ?? '', options.merchantId);
      const updated: MerchantProfile = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveLocalMerchantProfile(options.merchantId, updated);
      return updated;
    }
    throw new Error(messageFromJson(json, 'Failed to update merchant profile'));
  }

  const profile = (json.data ?? json) as MerchantProfile;
  if (options?.merchantId) saveLocalMerchantProfile(options.merchantId, profile);
  return profile;
}

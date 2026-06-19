'use client';

import { useCallback, useEffect, useState } from 'react';
import type { MerchantProfile } from '@luxor/contracts';
import { ensureMerchantProfile, getMerchantProfile } from '@/lib/merchant-data';
import { loadLocalMerchantProfile } from '@/lib/merchant-local';
import { MERCHANT_PROFILE_UPDATED_EVENT } from '@/lib/merchant-profile-events';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

export { dispatchMerchantProfileUpdated } from '@/lib/merchant-profile-events';

export interface UseMerchantProfileOptions {
  /** Re-load profile when the tab gains focus or after a profile save event. */
  refreshOnFocus?: boolean;
}

async function resolveMerchantProfile(
  uid: string,
  email: string
): Promise<MerchantProfile | null> {
  try {
    await ensureMerchantProfile(uid, email);
    return await getMerchantProfile(uid);
  } catch (err) {
    console.error(err);
    return loadLocalMerchantProfile(uid);
  }
}

export function useMerchantProfile(options: UseMerchantProfileOptions = {}) {
  const { refreshOnFocus = false } = options;
  const { user, authReady } = useFirebaseAuth();
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [loadedForUser, setLoadedForUser] = useState<string | null>(null);

  const isLoading = !authReady || (user ? loadedForUser !== user.uid : false);

  const refetch = useCallback(async () => {
    if (!user) return;

    setLoadedForUser(null);
    const next = await resolveMerchantProfile(user.uid, user.email ?? '');
    setProfile(next);
    setLoadedForUser(user.uid);
  }, [user]);

  useEffect(() => {
    if (!authReady || !user) return;

    let cancelled = false;
    void resolveMerchantProfile(user.uid, user.email ?? '').then((next) => {
      if (cancelled) return;
      setProfile(next);
      setLoadedForUser(user.uid);
    });

    return () => {
      cancelled = true;
    };
  }, [authReady, user]);

  useEffect(() => {
    if (!refreshOnFocus) return;

    const onRefresh = () => {
      if (document.visibilityState === 'visible') void refetch();
    };

    window.addEventListener('focus', onRefresh);
    document.addEventListener('visibilitychange', onRefresh);
    window.addEventListener(MERCHANT_PROFILE_UPDATED_EVENT, onRefresh);

    return () => {
      window.removeEventListener('focus', onRefresh);
      document.removeEventListener('visibilitychange', onRefresh);
      window.removeEventListener(MERCHANT_PROFILE_UPDATED_EVENT, onRefresh);
    };
  }, [refreshOnFocus, refetch]);

  const merchantWallet = profile?.merchantWallet?.trim() ?? '';

  return {
    profile: user ? profile : null,
    merchantWallet,
    hasWallet: Boolean(merchantWallet),
    isLoading,
    refetch,
    user,
    authReady,
  };
}

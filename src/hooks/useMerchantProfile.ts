import { useEffect, useState, useCallback } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';
import { getMerchantProfile } from '@/lib/merchant-data';
import type { MerchantProfile } from '@luxor/contracts';

export function useMerchantProfile(options?: { refreshOnFocus?: boolean }) {
  const { user, authReady } = useFirebaseAuth();
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getMerchantProfile(user.uid);
      setProfile(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authReady) {
      fetchProfile();
    }
  }, [authReady, fetchProfile]);

  useEffect(() => {
    if (!options?.refreshOnFocus || typeof window === 'undefined') return;
    const handleFocus = () => {
      fetchProfile();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [options?.refreshOnFocus, fetchProfile]);

  const merchantWallet = profile?.merchantWallet?.trim() || '';
  const hasWallet = !!merchantWallet;

  return {
    profile,
    merchantWallet,
    hasWallet,
    isLoading: !authReady || isLoading,
    authReady,
    refetch: fetchProfile,
  };
}

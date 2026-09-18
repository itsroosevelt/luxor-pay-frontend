'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { MerchantProfile } from '@sterling/contracts';
import { MOCK_MERCHANT_PROFILE } from '@/mocks/data';

interface MerchantContextType {
  profile: MerchantProfile | null;
  setProfile: (profile: MerchantProfile | null | ((prev: MerchantProfile | null) => MerchantProfile | null)) => void;
  isKycModalOpen: boolean;
  setIsKycModalOpen: (open: boolean) => void;
}

const MerchantContext = createContext<MerchantContextType>({
  profile: MOCK_MERCHANT_PROFILE,
  setProfile: () => {},
  isKycModalOpen: false,
  setIsKycModalOpen: () => {},
});

export const DEFAULT_MOCK_MERCHANT_PROFILE = MOCK_MERCHANT_PROFILE;

export function MerchantProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<MerchantProfile | null>(MOCK_MERCHANT_PROFILE);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);

  // Sync with sessionStorage as requested
  useEffect(() => {
    const stored = sessionStorage.getItem('sterling_merchant_profile');
    if (stored) {
      try {
        setProfileState(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored profile', e);
      }
    }
  }, []);

  const setProfile = useCallback((newProfile: MerchantProfile | null | ((prev: MerchantProfile | null) => MerchantProfile | null)) => {
    setProfileState((prev: MerchantProfile | null) => {
      const resolved = typeof newProfile === 'function' ? newProfile(prev) : newProfile;
      if (resolved) {
        sessionStorage.setItem('sterling_merchant_profile', JSON.stringify(resolved));
      } else {
        sessionStorage.removeItem('sterling_merchant_profile');
      }
      return resolved;
    });
  }, []);
  
  return (
    <MerchantContext.Provider value={{ profile, setProfile, isKycModalOpen, setIsKycModalOpen }}>
      {children}
    </MerchantContext.Provider>
  );
}

export function useMerchant() {
  return useContext(MerchantContext);
}

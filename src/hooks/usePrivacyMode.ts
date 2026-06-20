'use client';

import { useCallback, useState } from 'react';

const STORAGE_KEY = 'luxor-privacy-mode';

function readStoredPrivacy(defaultHidden: boolean): boolean {
  if (typeof window === 'undefined') return defaultHidden;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'true';
  } catch {
    /* ignore storage errors */
  }

  return defaultHidden;
}

export function usePrivacyMode(defaultHidden = false) {
  const [isHidden, setIsHidden] = useState(() => readStoredPrivacy(defaultHidden));

  const togglePrivacy = useCallback(() => {
    setIsHidden((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* ignore storage errors */
      }
      return next;
    });
  }, []);

  const formatPrivateAmount = useCallback(
    (formatted: string) => (isHidden ? '••••••' : formatted),
    [isHidden]
  );

  return { isHidden, togglePrivacy, formatPrivateAmount };
}

'use client';

import { useMemo } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { isPlatformAdminEmail } from '@/lib/platform-admin';

/** True when the signed-in Firebase user is a platform administrator. */
export function usePlatformAdmin() {
  const { user, authReady } = useFirebaseAuth();

  const isPlatformAdmin = useMemo(
    () => isPlatformAdminEmail(user?.email),
    [user?.email]
  );

  return { isPlatformAdmin, user, authReady };
}

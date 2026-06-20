'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { auth, onAuthStateChanged } from '@/lib/firebase';

/**
 * Single Firebase auth listener for the app shell.
 * `authReady` is true only after the first onAuthStateChanged callback
 * (persistence restore finished). Avoids redirecting to /login while
 * Firebase is still hydrating a saved session.
 */
export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  return { user, authReady };
}

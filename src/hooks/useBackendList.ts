'use client';

import { useEffect, useState } from 'react';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import type { ApiResult } from '@/lib/api/http';

interface UseBackendListState<T> {
  items: T[];
  loading: boolean;
  unavailable: boolean;
  notImplemented: boolean;
  error: string | null;
  reload: () => void;
}

export function useBackendList<T>(
  fetcher: () => Promise<ApiResult<T[]>>
): UseBackendListState<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [notImplemented, setNotImplemented] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      setUnavailable(false);
      setNotImplemented(false);

      const result = await fetcher();
      if (result.ok) {
        setItems(Array.isArray(result.data) ? result.data : []);
      } else {
        setItems([]);
        setUnavailable(Boolean(result.unavailable));
        setNotImplemented(Boolean(result.notImplemented));
        if (!result.unavailable && !result.notImplemented) {
          setError(result.error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
    // Fetcher is stable per page module; re-run only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reload = () => {
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);
    void fetcher().then((result) => {
      if (result.ok) {
        setItems(Array.isArray(result.data) ? result.data : []);
        setUnavailable(false);
        setNotImplemented(false);
        setError(null);
      } else {
        setItems([]);
        setUnavailable(Boolean(result.unavailable));
        setNotImplemented(Boolean(result.notImplemented));
        setError(result.unavailable || result.notImplemented ? null : result.error);
      }
      setLoading(false);
    });
  };

  return { items, loading, unavailable, notImplemented, error, reload };
}

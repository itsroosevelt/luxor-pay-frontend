'use client';

import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
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
  const { user, authReady } = useFirebaseAuth();
  const [items, setItems] = useState<T[]>([]);
  const [loadedForUser, setLoadedForUser] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [notImplemented, setNotImplemented] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loading = !authReady || (user ? loadedForUser !== user.uid : false);

  useEffect(() => {
    if (!authReady || !user) return;

    let cancelled = false;

    void fetcher().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setItems(Array.isArray(result.data) ? result.data : []);
        setUnavailable(false);
        setNotImplemented(false);
        setError(null);
      } else {
        setItems([]);
        setUnavailable(Boolean(result.unavailable));
        setNotImplemented(Boolean(result.notImplemented));
        if (!result.unavailable && !result.notImplemented) {
          setError(result.error);
        } else {
          setError(null);
        }
      }
      setLoadedForUser(user.uid);
    });

    return () => {
      cancelled = true;
    };
    // Fetcher is stable per page module; re-run when auth becomes ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user]);

  const reload = () => {
    if (!user) return;
    setLoadedForUser(null);
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
      setLoadedForUser(user.uid);
    });
  };

  return { items, loading, unavailable, notImplemented, error, reload };
}

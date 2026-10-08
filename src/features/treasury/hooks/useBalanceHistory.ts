import { useCallback, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { getBalanceHistory, type BalanceHistory, type BalanceHistoryRange } from '@/features/treasury/api/treasury-api';
import { TREASURY_CHANGED_EVENT } from '@/features/treasury/lib/multisig-tx';

const REFRESH_MS = 120_000;

/**
 * Total balance of the active treasury over time, rebuilt by the backend from the
 * vaults' on-chain movements. Keeps the last curve on screen when a refresh fails.
 */
export function useBalanceHistory(range: BalanceHistoryRange) {
  const [history, setHistory] = useState<BalanceHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent: boolean) => {
    if (!auth.currentUser) return;
    if (!silent) setIsLoading(true);
    try {
      const res = await getBalanceHistory(range);
      setHistory(res.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load balance history');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [range]);

  useEffect(() => {
    setHistory(null);
    void load(false);
    const unsubAuth = auth.onAuthStateChanged(() => { void load(true); });
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load(true);
    }, REFRESH_MS);
    const onChanged = () => { window.setTimeout(() => void load(true), 3_000); };
    window.addEventListener(TREASURY_CHANGED_EVENT, onChanged);
    return () => {
      unsubAuth();
      window.clearInterval(timer);
      window.removeEventListener(TREASURY_CHANGED_EVENT, onChanged);
    };
  }, [load]);

  return { history, isLoading, error, refetch: () => load(false) };
}

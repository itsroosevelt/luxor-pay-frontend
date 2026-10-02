import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { getVaultActivity, type VaultActivityItem } from '@/features/treasury/api/treasury-api';
import { TREASURY_CHANGED_EVENT } from '@/features/treasury/lib/squads-tx';

const ACTIVITY_REFRESH_MS = 30_000;

/**
 * The vault's real inflows / outflows read from Solana — including direct deposits
 * that never went through a proposal. Keeps the last list on screen when a refresh fails.
 */
export function useVaultActivity(vaultId: string | null | undefined) {
  const [items, setItems] = useState<VaultActivityItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setItems(null);
    if (!vaultId) return;
    let cancelled = false;

    const load = async (silent: boolean) => {
      const user = auth.currentUser;
      if (!user) return;
      if (!silent) setIsLoading(true);
      try {
        const res = await getVaultActivity(vaultId);
        if (!cancelled) setItems(res.data);
      } catch (err) {
        console.warn('Vault activity load failed:', err);
      } finally {
        if (!cancelled && !silent) setIsLoading(false);
      }
    };

    void load(false);
    const unsubAuth = auth.onAuthStateChanged(() => { void load(true); });
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load(true);
    }, ACTIVITY_REFRESH_MS);
    // On-chain changes land a few seconds after the signature confirms.
    const onChanged = () => { window.setTimeout(() => void load(true), 3_000); };
    window.addEventListener(TREASURY_CHANGED_EVENT, onChanged);
    return () => {
      cancelled = true;
      unsubAuth();
      window.clearInterval(timer);
      window.removeEventListener(TREASURY_CHANGED_EVENT, onChanged);
    };
  }, [vaultId]);

  return { items, isLoading };
}

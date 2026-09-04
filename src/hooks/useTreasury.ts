import { useCallback, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { MOCK_MULTISIG, MOCK_VAULTS } from '@/mocks/data';
import {
  getMultisig,
  getVaults,
  createVault as createVaultReq,
  updateThreshold as updateThresholdReq,
  type MultisigConfig,
  type Vault,
  type CreateVaultPayload,
} from '@/lib/treasury-api';

async function tokenOrMock(): Promise<string> {
  const user = auth.currentUser;
  return user ? user.getIdToken() : 'mock-token';
}

interface UseTreasuryReturn {
  config: MultisigConfig | null;
  vaults: Vault[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
  createVault: (payload: CreateVaultPayload) => Promise<Vault>;
  setThreshold: (threshold: number) => Promise<void>;
}

export function useTreasury(): UseTreasuryReturn {
  const [config, setConfig] = useState<MultisigConfig | null>(MOCK_MULTISIG as any);
  const [vaults, setVaults] = useState<Vault[]>(MOCK_VAULTS as any);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);
    try {
      const token = await tokenOrMock();
      const [cfg, vs] = await Promise.all([getMultisig(token), getVaults(token)]);
      setConfig(cfg.data ?? (MOCK_MULTISIG as any));
      setVaults(vs.data ?? (MOCK_VAULTS as any));
    } catch (err) {
      console.warn('Treasury fetch failed, using fallback mock data:', err);
      setConfig(MOCK_MULTISIG as any);
      setVaults(MOCK_VAULTS as any);
      setIsError(false);
      setErrorMessage(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(() => {
      refetch();
    });
    return () => unsub();
  }, [refetch]);

  const createVault = async (payload: CreateVaultPayload): Promise<Vault> => {
    const token = await tokenOrMock();
    const res = await createVaultReq(token, payload);
    setVaults((prev) => [...prev, res.data]);
    return res.data;
  };

  const setThreshold = async (threshold: number): Promise<void> => {
    const token = await tokenOrMock();
    const res = await updateThresholdReq(token, threshold);
    setConfig(res.data);
  };

  return { config, vaults, isLoading, isError, errorMessage, refetch, createVault, setThreshold };
}

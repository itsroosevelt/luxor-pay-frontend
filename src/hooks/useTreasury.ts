import { useCallback, useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { auth } from '@/lib/firebase';
import {
  getMultisig,
  getVaults,
  createVault as createVaultReq,
  updateVault as updateVaultReq,
  deleteVault as deleteVaultReq,
  getCollector,
  sweepCollector as sweepCollectorReq,
  type CollectorInfo,
  updateThreshold as updateThresholdReq,
  deployMultisig as deployMultisigReq,
  linkMultisig as linkMultisigReq,
  type MultisigConfig,
  type Vault,
  type CreateVaultPayload,
} from '@/lib/treasury-api';
import { syncProposal } from '@/lib/proposals-api';
import { TREASURY_CHANGED_EVENT, signAndSendPending, walletAddress } from '@/lib/squads-tx';
import { getWalletAuthHeaders } from '@/lib/wallet-session';

const BALANCE_REFRESH_MS = 30_000;

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
  refetch: (silent?: boolean) => Promise<void>;
  createVault: (payload: CreateVaultPayload) => Promise<Vault>;
  renameVault: (id: string, label: string) => Promise<Vault>;
  /** Updates a vault's name and/or target weight (%). */
  updateVault: (id: string, changes: { label?: string; targetWeight?: number }) => Promise<Vault>;
  removeVault: (id: string) => Promise<void>;
  setThreshold: (threshold: number) => Promise<void>;
  /** Deploys the Squads v4 multisig on-chain, signed by the connected wallet. */
  deployMultisig: () => Promise<MultisigConfig>;
  /** Links an existing Squads v4 multisig by address. */
  linkMultisig: (address: string) => Promise<MultisigConfig>;
  /** Payments sitting in the custodial collection wallet. */
  collector: CollectorInfo | null;
  /** Moves them into the Principal Squads vault; returns the transaction signatures. */
  sweepCollector: () => Promise<string[]>;
}

export function useTreasury(): UseTreasuryReturn {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [config, setConfig] = useState<MultisigConfig | null>(null);
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [collector, setCollector] = useState<CollectorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refetch = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);
    try {
      const token = await tokenOrMock();
      const [cfg, vs] = await Promise.all([getMultisig(token), getVaults(token)]);
      setConfig(cfg.data ?? null);
      setVaults(vs.data ?? []);
      // Non-fatal: the treasury still renders if the collection wallet can't be read.
      getCollector(token).then((c) => setCollector(c.data)).catch(() => setCollector(null));
    } catch (err) {
      console.warn('Treasury fetch failed:', err);
      // Keep the last real data on screen; never substitute demo data (it has fake addresses).
      if (silent) return;
      setIsError(true);
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo cargar la tesorería');
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

  // Balances change on-chain at any time (deposits, executions): keep them live.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') refetch(true);
    }, BALANCE_REFRESH_MS);
    return () => window.clearInterval(id);
  }, [refetch]);

  // Balances change after an on-chain execution elsewhere in the dashboard.
  useEffect(() => {
    const onChange = () => { refetch(true); };
    window.addEventListener(TREASURY_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(TREASURY_CHANGED_EVENT, onChange);
  }, [refetch]);

  /** Wallet-signed session headers; throws if no wallet is connected. */
  const signed = () => getWalletAuthHeaders(wallet);

  const createVault = async (payload: CreateVaultPayload): Promise<Vault> => {
    const token = await tokenOrMock();
    const res = await createVaultReq(token, payload, await signed());
    setVaults((prev) => [...prev, res.data]);
    return res.data;
  };

  const updateVault = async (id: string, changes: { label?: string; targetWeight?: number }): Promise<Vault> => {
    const token = await tokenOrMock();
    const res = await updateVaultReq(token, id, changes, await signed());
    setVaults((prev) =>
      prev.map((v) => (v.id === id ? { ...v, label: res.data.label, targetWeight: res.data.targetWeight } : v)),
    );
    return res.data;
  };

  const renameVault = (id: string, label: string): Promise<Vault> => updateVault(id, { label });

  const removeVault = async (id: string): Promise<void> => {
    const token = await tokenOrMock();
    await deleteVaultReq(token, id, await signed());
    setVaults((prev) => prev.filter((v) => v.id !== id));
  };

  const sweepCollector = async (): Promise<string[]> => {
    const token = await tokenOrMock();
    const res = await sweepCollectorReq(token, await signed());
    await refetch(true);
    return res.data.signatures;
  };

  const setThreshold = async (threshold: number): Promise<void> => {
    const token = await tokenOrMock();
    const res = await updateThresholdReq(token, threshold, walletAddress(wallet), await signed());
    if (res.pendingTransaction && res.proposal) {
      // On-chain: the change is a config proposal; the threshold updates once it executes.
      const signature = await signAndSendPending(res.pendingTransaction, wallet, connection);
      await syncProposal(token, res.proposal.id, { signature, action: res.pendingTransaction.action });
    }
    setConfig(res.data);
  };

  const deployMultisig = async (): Promise<MultisigConfig> => {
    const address = walletAddress(wallet);
    if (!address) throw new Error('Conecta tu wallet (Phantom o Solflare) para desplegar el multisig.');
    const token = await tokenOrMock();
    const headers = await signed();
    const res = await deployMultisigReq(token, address, headers);
    const signature = await signAndSendPending(res.pendingTransaction, wallet, connection);
    const linked = await linkMultisigReq(token, res.multisigAddress, signature, headers);
    setConfig(linked.data);
    await refetch();
    return linked.data;
  };

  const linkMultisig = async (address: string): Promise<MultisigConfig> => {
    const token = await tokenOrMock();
    const linked = await linkMultisigReq(token, address, undefined, await signed());
    setConfig(linked.data);
    await refetch();
    return linked.data;
  };

  return {
    config,
    vaults,
    isLoading,
    isError,
    errorMessage,
    refetch,
    createVault,
    renameVault,
    updateVault,
    removeVault,
    setThreshold,
    deployMultisig,
    linkMultisig,
    collector,
    sweepCollector,
  };
}

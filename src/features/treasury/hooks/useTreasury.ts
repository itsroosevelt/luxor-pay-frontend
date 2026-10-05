import { useCallback, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
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
} from '@/features/treasury/api/treasury-api';
import { syncProposal } from '@/features/treasury/api/proposals-api';
import { TREASURY_CHANGED_EVENT, signAndSendPending, walletAddress } from '@/features/treasury/lib/squads-tx';
import { getWalletAuthHeaders } from '@/lib/wallet-session';
import { createSharedResource } from '@/lib/shared-resource';

const BALANCE_REFRESH_MS = 30_000;


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

interface TreasuryData {
  config: MultisigConfig | null;
  vaults: Vault[];
  collector: CollectorInfo | null;
}

/** One shared copy for every widget on the page (Treasury, Proposals, Settings…). */
const treasuryResource = createSharedResource<TreasuryData>(
  { config: null, vaults: [], collector: null },
  async () => {
    const [cfg, vs] = await Promise.all([getMultisig(), getVaults()]);
    // Non-fatal and not awaited: the treasury renders even if the collection wallet can't be read.
    getCollector()
      .then((c) => treasuryResource.setData((prev) => ({ ...prev, collector: c.data })))
      .catch(() => undefined);
    return { config: cfg.data ?? null, vaults: vs.data ?? [], collector: null };
  },
  // Balances change on-chain at any time (deposits, executions): keep them live.
  { refreshMs: BALANCE_REFRESH_MS },
);

export function useTreasury(): UseTreasuryReturn {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { data, isLoading, isError, errorMessage } = treasuryResource.useState();
  const { config, vaults, collector } = data;

  const refetch = useCallback((silent = false) => treasuryResource.load({ silent }), []);
  const setVaults = (update: (prev: Vault[]) => Vault[]) =>
    treasuryResource.setData((prev) => ({ ...prev, vaults: update(prev.vaults) }));
  const setConfig = (next: MultisigConfig) => treasuryResource.setData((prev) => ({ ...prev, config: next }));

  // Balances change after an on-chain execution elsewhere in the dashboard.
  useEffect(() => {
    const onChange = () => { void treasuryResource.load({ silent: true }); };
    window.addEventListener(TREASURY_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(TREASURY_CHANGED_EVENT, onChange);
  }, []);

  /** Wallet-signed session headers; throws if no wallet is connected. */
  const signed = () => getWalletAuthHeaders(wallet);

  const createVault = async (payload: CreateVaultPayload): Promise<Vault> => {
    const res = await createVaultReq(payload, await signed());
    // Replace instead of append if a background refresh already brought it.
    setVaults((prev) => [...prev.filter((v) => v.id !== res.data.id), res.data]);
    return res.data;
  };

  const updateVault = async (id: string, changes: { label?: string; targetWeight?: number }): Promise<Vault> => {
    const res = await updateVaultReq(id, changes, await signed());
    setVaults((prev) =>
      prev.map((v) => (v.id === id ? { ...v, label: res.data.label, targetWeight: res.data.targetWeight } : v)),
    );
    return res.data;
  };

  const renameVault = (id: string, label: string): Promise<Vault> => updateVault(id, { label });

  const removeVault = async (id: string): Promise<void> => {
    await deleteVaultReq(id, await signed());
    setVaults((prev) => prev.filter((v) => v.id !== id));
  };

  const sweepCollector = async (): Promise<string[]> => {
    const res = await sweepCollectorReq(await signed());
    let signatures = res.data.signatures;
    if (res.data.pendingTransaction) {
      // The collection wallet has no SOL: the connected wallet signs as fee payer only.
      signatures = [await signAndSendPending(res.data.pendingTransaction, wallet, connection)];
    }
    await refetch(true);
    return signatures;
  };

  const setThreshold = async (threshold: number): Promise<void> => {
    const res = await updateThresholdReq(threshold, walletAddress(wallet), await signed());
    if (res.pendingTransaction && res.proposal) {
      // On-chain: the change is a config proposal; the threshold updates once it executes.
      const signature = await signAndSendPending(res.pendingTransaction, wallet, connection);
      await syncProposal(res.proposal.id, { signature, action: res.pendingTransaction.action });
    }
    setConfig(res.data);
  };

  const deployMultisig = async (): Promise<MultisigConfig> => {
    const address = walletAddress(wallet);
    if (!address) throw new Error('Conecta tu wallet (Phantom o Solflare) para desplegar el multisig.');
    const headers = await signed();
    const res = await deployMultisigReq(address, headers);
    const signature = await signAndSendPending(res.pendingTransaction, wallet, connection);
    const linked = await linkMultisigReq(res.multisigAddress, signature, headers);
    setConfig(linked.data);
    await refetch();
    return linked.data;
  };

  const linkMultisig = async (address: string): Promise<MultisigConfig> => {
    const linked = await linkMultisigReq(address, undefined, await signed());
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

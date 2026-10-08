import { useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  getProposals,
  createProposal as createProposalReq,
  approveProposal,
  rejectProposal,
  executeProposal,
  cancelProposal,
  activateProposal,
  createRedistribution,
  getReclaimable,
  reclaimRentRequest,
  syncProposal,
  type Proposal,
  type CreateProposalPayload,
  type ProposalMutationResponse,
} from '@/features/treasury/api/proposals-api';
import { TREASURY_CHANGED_EVENT, notifyTreasuryChanged, signAndSendPending, walletAddress, finalAction } from '@/features/treasury/lib/multisig-tx';
import { getWalletAuthHeaders } from '@/lib/wallet-session';
import { createSharedResource } from '@/lib/shared-resource';


interface UseProposalsReturn {
  data: Proposal[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
  createProposal: (payload: CreateProposalPayload) => Promise<Proposal>;
  approve: (id: string) => Promise<Proposal>;
  reject: (id: string) => Promise<Proposal>;
  execute: (id: string) => Promise<Proposal>;
  cancel: (id: string) => Promise<Proposal>;
  activate: (id: string) => Promise<Proposal>;
  /** Proposes moving the Principal's balance to the sub-vaults by their target weights. */
  redistribute: (mint?: string) => Promise<Proposal>;
  /** Finished proposals whose accounts still hold rent (Luxor contract). */
  countReclaimable: () => Promise<number>;
  /** Closes a batch of them: the wallet signs, the rent goes back to whoever paid it. */
  reclaimRent: () => Promise<{ count: number; remaining: number }>;
}

/**
 * One shared list for every widget (Treasury + Proposals panel). Refreshed in the
 * background so votes / executions made by other members show up without reloading.
 */
const proposalsResource = createSharedResource<Proposal[]>(
  [],
  async () => (await getProposals()).data ?? [],
  { refreshMs: 12_000, refreshOnFocus: true },
);

export function useProposals(): UseProposalsReturn {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { data, isLoading, isError, errorMessage } = proposalsResource.useState();
  const setData = (update: (prev: Proposal[]) => Proposal[]) => proposalsResource.setData(update);
  const refetch = useCallback(() => proposalsResource.load(), []);

  useEffect(() => {
    const onChange = () => { void proposalsResource.load({ silent: true }); };
    window.addEventListener(TREASURY_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(TREASURY_CHANGED_EVENT, onChange);
  }, []);

  /**
   * Adds a just-created proposal at the top — or replaces it if a background refresh
   * (e.g. on returning from the wallet popup) already brought it from the server.
   */
  const upsert = (next: Proposal) => setData((prev) => [next, ...prev.filter((p) => p.id !== next.id)]);

  const replace = (next: Proposal) =>
    setData((prev) => prev.map((p) => (p.id === next.id ? next : p)));

  /**
   * On-chain multisig: the backend answers with a transaction; the
   * member wallet signs and sends it, then the proposal is re-read from chain.
   * Off-chain / mock: `pendingTransaction` is absent and `data` is final.
   */
  const settle = async (res: ProposalMutationResponse): Promise<Proposal> => {
    if (!res.pendingTransaction) {
      notifyTreasuryChanged();
      return res.data;
    }
    const signature = await signAndSendPending(res.pendingTransaction, wallet, connection);
    const synced = await syncProposal(res.data.id, { signature, action: finalAction(res.pendingTransaction) });
    notifyTreasuryChanged();
    if (synced.data.payoutStatus === 'failed') {
      replace(synced.data);
      throw new Error(`Propuesta ejecutada, pero el pago desde la Bóveda Principal falló: ${synced.data.payoutError ?? 'error desconocido'}`);
    }
    return synced.data;
  };

  const createProposal = async (payload: CreateProposalPayload): Promise<Proposal> => {
    const headers = await getWalletAuthHeaders(wallet);
    const res = await createProposalReq({ ...payload, wallet: walletAddress(wallet) }, headers);
    try {
      const created = await settle(res);
      upsert(created);
      return created;
    } catch (err) {
      // Signing was declined or failed: drop the unconfirmed record server-side.
      if (res.pendingTransaction) {
        await cancelProposal(res.data.id, walletAddress(wallet), headers).catch(() => undefined);
      }
      throw err;
    }
  };

  const redistribute = async (mint?: string): Promise<Proposal> => {
    const headers = await getWalletAuthHeaders(wallet);
    const res = await createRedistribution(walletAddress(wallet), headers, mint);
    try {
      const created = await settle(res);
      upsert(created);
      return created;
    } catch (err) {
      if (res.pendingTransaction) {
        await cancelProposal(res.data.id, walletAddress(wallet), headers).catch(() => undefined);
      }
      throw err;
    }
  };

  const runAction =
    (fn: (id: string, wallet?: string, walletHeaders?: Record<string, string>) => Promise<ProposalMutationResponse>) =>
    async (id: string): Promise<Proposal> => {
      const res = await fn(id, walletAddress(wallet), await getWalletAuthHeaders(wallet));
      const next = await settle(res);
      replace(next);
      return next;
    };

  const countReclaimable = async (): Promise<number> => {
    try {
      return (await getReclaimable()).data.count;
    } catch {
      return 0; // a convenience: never get in the way of the page
    }
  };

  const reclaimRent = async (): Promise<{ count: number; remaining: number }> => {
    const headers = await getWalletAuthHeaders(wallet);
    const res = await reclaimRentRequest(headers);
    if (res.pendingTransaction) await signAndSendPending(res.pendingTransaction, wallet, connection);
    notifyTreasuryChanged();
    return res.data;
  };

  return {
    data,
    isLoading,
    isError,
    errorMessage,
    refetch,
    countReclaimable,
    reclaimRent,
    createProposal,
    approve: runAction(approveProposal),
    reject: runAction(rejectProposal),
    execute: runAction(executeProposal),
    cancel: runAction(cancelProposal),
    activate: runAction(activateProposal),
    redistribute,
  };
}

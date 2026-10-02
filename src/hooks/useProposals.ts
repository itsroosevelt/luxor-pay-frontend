import { useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { auth } from '@/lib/firebase';
import {
  getProposals,
  createProposal as createProposalReq,
  approveProposal,
  rejectProposal,
  executeProposal,
  cancelProposal,
  activateProposal,
  createRedistribution,
  syncProposal,
  type Proposal,
  type CreateProposalPayload,
  type ProposalMutationResponse,
} from '@/lib/proposals-api';
import { notifyTreasuryChanged, signAndSendPending, walletAddress } from '@/lib/squads-tx';
import { getWalletAuthHeaders } from '@/lib/wallet-session';
import { createSharedResource } from '@/lib/shared-resource';

async function tokenOrMock(): Promise<string> {
  const user = auth.currentUser;
  return user ? user.getIdToken() : 'mock-token';
}

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
}

/**
 * One shared list for every widget (Treasury + Proposals panel). Refreshed in the
 * background so votes / executions made by other members show up without reloading.
 */
const proposalsResource = createSharedResource<Proposal[]>(
  [],
  async (token) => (await getProposals(token)).data ?? [],
  { refreshMs: 30_000, refreshOnFocus: true },
);

export function useProposals(): UseProposalsReturn {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { data, isLoading, isError, errorMessage } = proposalsResource.useState();
  const setData = (update: (prev: Proposal[]) => Proposal[]) => proposalsResource.setData(update);
  const refetch = useCallback(() => proposalsResource.load(), []);

  /**
   * Adds a just-created proposal at the top — or replaces it if a background refresh
   * (e.g. on returning from the wallet popup) already brought it from the server.
   */
  const upsert = (next: Proposal) => setData((prev) => [next, ...prev.filter((p) => p.id !== next.id)]);

  const replace = (next: Proposal) =>
    setData((prev) => prev.map((p) => (p.id === next.id ? next : p)));

  /**
   * On-chain multisig: the backend answers with a Squads transaction; the
   * member wallet signs and sends it, then the proposal is re-read from chain.
   * Off-chain / mock: `pendingTransaction` is absent and `data` is final.
   */
  const settle = async (token: string, res: ProposalMutationResponse): Promise<Proposal> => {
    if (!res.pendingTransaction) return res.data;
    const signature = await signAndSendPending(res.pendingTransaction, wallet, connection);
    const synced = await syncProposal(token, res.data.id, { signature, action: res.pendingTransaction.action });
    if (res.pendingTransaction.action === 'execute') notifyTreasuryChanged();
    if (synced.data.payoutStatus === 'failed') {
      replace(synced.data);
      throw new Error(`Propuesta ejecutada, pero el pago desde la Bóveda Principal falló: ${synced.data.payoutError ?? 'error desconocido'}`);
    }
    return synced.data;
  };

  const createProposal = async (payload: CreateProposalPayload): Promise<Proposal> => {
    const token = await tokenOrMock();
    const headers = await getWalletAuthHeaders(wallet);
    const res = await createProposalReq(token, { ...payload, wallet: walletAddress(wallet) }, headers);
    try {
      const created = await settle(token, res);
      upsert(created);
      return created;
    } catch (err) {
      // Signing was declined or failed: drop the unconfirmed record server-side.
      if (res.pendingTransaction) {
        await cancelProposal(token, res.data.id, walletAddress(wallet), headers).catch(() => undefined);
      }
      throw err;
    }
  };

  const redistribute = async (mint?: string): Promise<Proposal> => {
    const token = await tokenOrMock();
    const headers = await getWalletAuthHeaders(wallet);
    const res = await createRedistribution(token, walletAddress(wallet), headers, mint);
    try {
      const created = await settle(token, res);
      upsert(created);
      return created;
    } catch (err) {
      if (res.pendingTransaction) {
        await cancelProposal(token, res.data.id, walletAddress(wallet), headers).catch(() => undefined);
      }
      throw err;
    }
  };

  const runAction =
    (fn: (token: string, id: string, wallet?: string, walletHeaders?: Record<string, string>) => Promise<ProposalMutationResponse>) =>
    async (id: string): Promise<Proposal> => {
      const token = await tokenOrMock();
      const res = await fn(token, id, walletAddress(wallet), await getWalletAuthHeaders(wallet));
      const next = await settle(token, res);
      replace(next);
      return next;
    };

  return {
    data,
    isLoading,
    isError,
    errorMessage,
    refetch,
    createProposal,
    approve: runAction(approveProposal),
    reject: runAction(rejectProposal),
    execute: runAction(executeProposal),
    cancel: runAction(cancelProposal),
    activate: runAction(activateProposal),
    redistribute,
  };
}

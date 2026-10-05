import { useState, useEffect, useCallback, useMemo } from 'react';
import { auth } from '@/lib/firebase';
import {
  getMembers,
  createMember,
  updateMemberDetails,
  deleteMember,
  Member,
  CreateMemberPayload,
  MemberRoles,
} from '@/features/treasury/api/members-api';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getWalletAuthHeaders } from '@/lib/wallet-session';
import { IS_MOCK_MODE } from '@/lib/mock/mock-config';
import { syncProposal } from '@/features/treasury/api/proposals-api';
import type { MemberProposalResult } from '@/features/treasury/api/members-api';
import { TREASURY_CHANGED_EVENT, notifyTreasuryChanged, signAndSendPending } from '@/features/treasury/lib/squads-tx';

/**
 * Outcome of a member write. On an on-chain multisig the change is a Squads config
 * proposal (`proposalIndex`) that the team still has to approve and execute.
 */
export interface MemberWriteOutcome {
  proposalIndex?: number;
}

interface UseMembersReturn {
  data: Member[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
  addMember: (payload: CreateMemberPayload) => Promise<MemberWriteOutcome & { member: Member }>;
  updateRoles: (id: string, roles: Partial<MemberRoles>) => Promise<MemberWriteOutcome>;
  updateMember: (id: string, payload: { name?: string; roles?: Partial<MemberRoles> }) => Promise<MemberWriteOutcome>;
  removeMember: (id: string) => Promise<MemberWriteOutcome>;
}

export function useMembers(): UseMembersReturn {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [rawData, setData] = useState<Member[]>([]);
  // "Current user" = the member whose wallet is connected (that wallet is the one that signs).
  const connectedWallet = wallet.publicKey?.toBase58();
  const data = useMemo(
    () => rawData.map((m) => ({ ...m, isCurrentUser: connectedWallet ? m.walletAddress === connectedWallet : !!m.isCurrentUser })),
    [rawData, connectedWallet],
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Only real members from the backend: an invented "owner" would count as a signer
  // the multisig doesn't have.
  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const res = await getMembers();
      setData(Array.isArray(res?.data) ? res.data : []);
    } catch (err: any) {
      console.warn('Members fetch failed:', err);
      setIsError(true);
      setErrorMessage(err?.message || 'No se pudieron cargar los miembros');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      fetchMembers();
    });
    return () => unsubscribe();
  }, [fetchMembers]);

  // An executed member proposal (approved in the proposals panel) changes the list.
  useEffect(() => {
    const onChange = () => { void fetchMembers(); };
    window.addEventListener(TREASURY_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(TREASURY_CHANGED_EVENT, onChange);
  }, [fetchMembers]);

  const requireWallet = () => {
    if (!wallet.publicKey) {
      throw new Error('Conecta tu billetera (Phantom o Solflare) para realizar esta acción.');
    }
  };

  /**
   * On-chain multisig: the backend answered with a Squads config proposal (AddMember /
   * RemoveMember). The connected wallet signs and sends it, then the proposal is synced.
   */
  const settle = async (res: MemberProposalResult): Promise<MemberWriteOutcome> => {
    if (!res.pendingTransaction || !res.proposal) return {};
    const signature = await signAndSendPending(res.pendingTransaction, wallet, connection);
    await syncProposal(res.proposal.id, { signature, action: res.pendingTransaction.action });
    notifyTreasuryChanged(); // the proposals panel shows the new proposal
    return { proposalIndex: res.proposal.index };
  };

  // Writes require a wallet-signed session. Optimistic local updates only in Mock Mode:
  // in production a failed write must surface as an error, never look applied.
  const addMember = async (payload: CreateMemberPayload): Promise<MemberWriteOutcome & { member: Member }> => {
    requireWallet();
    try {
      const headers = await getWalletAuthHeaders(wallet);
      const res = await createMember(payload, headers);
      const outcome = await settle(res);
      await fetchMembers();
      return { member: res.data, ...outcome };
    } catch (err: any) {
      if (!IS_MOCK_MODE || err?.name === 'WalletRequiredError') throw err;
      console.warn('Backend createMember failed, using optimistic state update:', err);
      const mockNewMember: Member = {
        id: `member_${Date.now()}`,
        merchantId: 'merchant-0001',
        name: payload.name,
        walletAddress: payload.walletAddress,
        roles: {
          admin: payload.roles?.admin ?? false,
          signer: payload.roles?.signer ?? true,
          proposer: payload.roles?.proposer ?? true,
          auditor: payload.roles?.auditor ?? false,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setData((prev) => [mockNewMember, ...prev]);
      return { member: mockNewMember };
    }
  };

  const updateMember = async (
    id: string,
    payload: { name?: string; roles?: Partial<MemberRoles> },
  ): Promise<MemberWriteOutcome> => {
    requireWallet();
    try {
      const headers = await getWalletAuthHeaders(wallet);
      const res = await updateMemberDetails(id, payload, headers);
      const outcome = await settle(res);
      await fetchMembers();
      return outcome;
    } catch (err: any) {
      if (!IS_MOCK_MODE || err?.name === 'WalletRequiredError') throw err;
      console.warn('Backend updateMemberDetails failed, applying optimistically:', err);
      setData((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                ...(payload.name ? { name: payload.name } : {}),
                ...(payload.roles ? { roles: { ...m.roles, ...payload.roles } } : {}),
              }
            : m,
        ),
      );
      return {};
    }
  };

  const updateRoles = (id: string, roles: Partial<MemberRoles>): Promise<MemberWriteOutcome> =>
    updateMember(id, { roles });

  const removeMember = async (id: string): Promise<MemberWriteOutcome> => {
    requireWallet();
    try {
      const headers = await getWalletAuthHeaders(wallet);
      const res = await deleteMember(id, headers);
      const outcome = await settle(res);
      await fetchMembers();
      return outcome;
    } catch (err: any) {
      if (!IS_MOCK_MODE || err?.name === 'WalletRequiredError') throw err;
      console.warn('Backend deleteMember failed, applying optimistically:', err);
      setData((prev) => prev.filter((m) => m.id !== id));
      return {};
    }
  };

  return {
    data,
    isLoading,
    isError,
    errorMessage,
    refetch: fetchMembers,
    addMember,
    updateRoles,
    updateMember,
    removeMember,
  };
}

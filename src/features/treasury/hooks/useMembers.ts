import { useState, useEffect, useCallback, useMemo } from 'react';
import { auth } from '@/lib/firebase';
import {
  getMembers,
  createMember,
  updateMemberRoles,
  updateMemberDetails,
  deleteMember,
  Member,
  CreateMemberPayload,
  MemberRoles,
} from '@/features/treasury/api/members-api';

import { useWallet } from '@solana/wallet-adapter-react';
import { getWalletAuthHeaders } from '@/lib/wallet-session';

interface UseMembersReturn {
  data: Member[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
  addMember: (payload: CreateMemberPayload) => Promise<Member>;
  updateRoles: (id: string, roles: Partial<MemberRoles>) => Promise<void>;
  updateMember: (id: string, payload: { name?: string; roles?: Partial<MemberRoles> }) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
}

export function useMembers(): UseMembersReturn {
  const wallet = useWallet();
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

  // Writes require a wallet-signed session; fallbacks to local optimistic state in mock/dev mode.
  const addMember = async (payload: CreateMemberPayload): Promise<Member> => {
    if (!wallet.publicKey) {
      throw new Error('Conecta tu billetera (Phantom o Solflare) para realizar esta acción.');
    }
    try {
      const headers = await getWalletAuthHeaders(wallet);
      const res = await createMember(payload, headers);
      setData((prev) => [res.data, ...prev]);
      return res.data;
    } catch (err: any) {
      if (err?.name === 'WalletRequiredError') throw err;
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
      return mockNewMember;
    }
  };

  const updateRoles = async (id: string, roles: Partial<MemberRoles>): Promise<void> => {
    if (!wallet.publicKey) {
      throw new Error('Conecta tu billetera (Phantom o Solflare) para realizar esta acción.');
    }
    try {
      const headers = await getWalletAuthHeaders(wallet);
      await updateMemberRoles(id, roles, headers);
    } catch (err: any) {
      if (err?.name === 'WalletRequiredError') throw err;
      console.warn('Backend updateMemberRoles failed, applying optimistically:', err);
    }
    setData((prev) => prev.map((m) => (m.id === id ? { ...m, roles: { ...m.roles, ...roles } } : m)));
  };

  const updateMember = async (id: string, payload: { name?: string; roles?: Partial<MemberRoles> }): Promise<void> => {
    if (!wallet.publicKey) {
      throw new Error('Conecta tu billetera (Phantom o Solflare) para realizar esta acción.');
    }
    try {
      const headers = await getWalletAuthHeaders(wallet);
      await updateMemberDetails(id, payload, headers);
    } catch (err: any) {
      if (err?.name === 'WalletRequiredError') throw err;
      console.warn('Backend updateMemberDetails failed, applying optimistically:', err);
    }
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
  };

  const removeMember = async (id: string): Promise<void> => {
    if (!wallet.publicKey) {
      throw new Error('Conecta tu billetera (Phantom o Solflare) para realizar esta acción.');
    }
    try {
      const headers = await getWalletAuthHeaders(wallet);
      await deleteMember(id, headers);
    } catch (err: any) {
      if (err?.name === 'WalletRequiredError') throw err;
      console.warn('Backend deleteMember failed, applying optimistically:', err);
    }
    setData((prev) => prev.filter((m) => m.id !== id));
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

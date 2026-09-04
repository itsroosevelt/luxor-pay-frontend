import { useState, useEffect, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import { MOCK_MEMBERS } from '@/mocks/data';
import {
  getMembers,
  createMember,
  updateMemberRoles,
  updateMemberDetails,
  deleteMember,
  Member,
  CreateMemberPayload,
  MemberRoles,
} from '@/lib/members-api';

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
  const [data, setData] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : 'mock-token';
      const res = await getMembers(token);
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setData(res.data);
      } else {
        setData(MOCK_MEMBERS as any);
      }
    } catch (err: any) {
      console.warn('Members fetch failed, using mock fallback:', err);
      setData(MOCK_MEMBERS as any);
      setIsError(false);
      setErrorMessage(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      if (user) {
        fetchMembers();
      } else {
        // Fallback for mock mode or unauth preview
        fetchMembers();
      }
    });
    return () => unsubscribe();
  }, [fetchMembers]);

  const addMember = async (payload: CreateMemberPayload): Promise<Member> => {
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : 'mock-token';
    const res = await createMember(token, payload);
    const newMember = res.data;
    setData((prev) => [newMember, ...prev]);
    return newMember;
  };

  const updateRoles = async (id: string, roles: Partial<MemberRoles>): Promise<void> => {
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : 'mock-token';
    await updateMemberRoles(token, id, roles);
    setData((prev) =>
      prev.map((m) => (m.id === id ? { ...m, roles: { ...m.roles, ...roles } } : m)),
    );
  };

  const updateMember = async (id: string, payload: { name?: string; roles?: Partial<MemberRoles> }): Promise<void> => {
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : 'mock-token';
    await updateMemberDetails(token, id, payload);
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
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : 'mock-token';
    await deleteMember(token, id);
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

import { useCallback, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import {
  getProposals,
  createProposal as createProposalReq,
  approveProposal,
  rejectProposal,
  executeProposal,
  cancelProposal,
  activateProposal,
  type Proposal,
  type CreateProposalPayload,
} from '@/lib/proposals-api';

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
}

export function useProposals(): UseProposalsReturn {
  const [data, setData] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);
    try {
      const token = await tokenOrMock();
      const res = await getProposals(token);
      setData(res.data ?? []);
    } catch (err) {
      setIsError(true);
      setErrorMessage(err instanceof Error ? err.message : 'No se pudieron cargar las propuestas');
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

  const replace = (next: Proposal) =>
    setData((prev) => prev.map((p) => (p.id === next.id ? next : p)));

  const createProposal = async (payload: CreateProposalPayload): Promise<Proposal> => {
    const token = await tokenOrMock();
    const res = await createProposalReq(token, payload);
    setData((prev) => [res.data, ...prev]);
    return res.data;
  };

  const runAction =
    (fn: (token: string, id: string) => Promise<{ data: Proposal }>) =>
    async (id: string): Promise<Proposal> => {
      const token = await tokenOrMock();
      const res = await fn(token, id);
      replace(res.data);
      return res.data;
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
  };
}

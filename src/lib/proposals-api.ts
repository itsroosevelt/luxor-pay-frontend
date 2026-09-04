/**
 * Multisig proposal client — the create → vote → execute lifecycle over a
 * Squads v4 program account. In Mock Mode these calls are served by
 * `src/mocks/handlers.ts`.
 */

import { apiUrl } from './api-client';

export type ProposalType = 'transfer' | 'swap' | 'config';

export type ProposalStatus =
  | 'draft'
  | 'active'
  | 'approved'
  | 'executed'
  | 'rejected'
  | 'cancelled';

export interface Proposal {
  id: string;
  index: number;
  type: ProposalType;
  title: string;
  vaultId: string;
  vaultLabel: string;
  amount: string;
  mint: string;
  symbol: string;
  destination: string;
  destinationLabel: string;
  memo: string;
  status: ProposalStatus;
  /** Threshold captured at creation time (M in "M-de-N"). */
  threshold: number;
  /** Member ids that approved / rejected. */
  approvals: string[];
  rejections: string[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  executedAt: string | null;
  executedSig: string | null;
}

export interface CreateProposalPayload {
  type: ProposalType;
  title: string;
  vaultId: string;
  amount: string;
  mint: string;
  destination: string;
  destinationLabel?: string;
  memo?: string;
}

export const PROPOSAL_STATUS_META: Record<
  ProposalStatus,
  { label: string; tone: 'active' | 'positive' | 'negative' | 'neutral' }
> = {
  draft: { label: 'Borrador', tone: 'neutral' },
  active: { label: 'En votación', tone: 'active' },
  approved: { label: 'Aprobada', tone: 'positive' },
  executed: { label: 'Ejecutada', tone: 'positive' },
  rejected: { label: 'Rechazada', tone: 'negative' },
  cancelled: { label: 'Cancelada', tone: 'neutral' },
};

async function authed<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Request failed: ${path}`);
  }
  return response.json() as Promise<T>;
}

export function getProposals(token: string, status?: ProposalStatus): Promise<{ data: Proposal[] }> {
  const qs = status ? `?status=${status}` : '';
  return authed(token, `/proposals${qs}`);
}

export function createProposal(token: string, payload: CreateProposalPayload): Promise<{ data: Proposal }> {
  return authed(token, '/proposals', { method: 'POST', body: JSON.stringify(payload) });
}

export function approveProposal(token: string, id: string): Promise<{ data: Proposal }> {
  return authed(token, `/proposals/${id}/approve`, { method: 'POST' });
}

export function rejectProposal(token: string, id: string): Promise<{ data: Proposal }> {
  return authed(token, `/proposals/${id}/reject`, { method: 'POST' });
}

export function executeProposal(token: string, id: string): Promise<{ data: Proposal }> {
  return authed(token, `/proposals/${id}/execute`, { method: 'POST' });
}

export function cancelProposal(token: string, id: string): Promise<{ data: Proposal }> {
  return authed(token, `/proposals/${id}/cancel`, { method: 'POST' });
}

export function activateProposal(token: string, id: string): Promise<{ data: Proposal }> {
  return authed(token, `/proposals/${id}/activate`, { method: 'POST' });
}

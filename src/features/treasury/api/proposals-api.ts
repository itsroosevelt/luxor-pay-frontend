/**
 * Multisig proposal client — the create → vote → execute lifecycle over a
 * Luxor multisig program account. In Mock Mode these calls are served by
 * `src/mocks/handlers.ts`.
 */

import { treasuryAuth } from '@/lib/active-treasury';
import { apiUrl, describeApiError, describeNetworkError } from '@/lib/api-client';
import type { PendingTransaction } from '@/features/treasury/lib/multisig-tx';

export type ProposalType = 'transfer' | 'swap' | 'config' | 'redistribute';

export type PayoutStatus = 'pending' | 'signing' | 'sent' | 'failed';

/** A swap out of the custodial Principal with the minimum output the team approved. */
export interface PayoutSwap {
  inputMint: string;
  inputSymbol: string;
  outputMint: string;
  outputSymbol: string;
  amount: string;
  minOutAmount: string;
  slippageBps: number;
}

/** One leg of a payout from the custodial Principal vault. */
export interface PayoutTransfer {
  destination: string;
  destinationLabel: string;
  vaultId: string | null;
  mint: string;
  symbol: string;
  amount: string;
}

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
  /** true when backed by an on-chain proposal account (state mirrored from the chain). */
  onChain?: boolean;
  /**
   * Outflow from the custodial Principal: the on-chain transaction approves a
   * plan (committed by hash) and the backend pays only after it executes.
   */
  custodial?: boolean;
  payoutStatus?: PayoutStatus | null;
  payoutSigs?: string[];
  payoutError?: string | null;
  transfers?: PayoutTransfer[];
  swaps?: PayoutSwap[];
}

/**
 * Mutations on an on-chain multisig return the transaction that the
 * member wallet must sign; `data` is updated via `syncProposal` afterwards.
 */
export interface ProposalMutationResponse {
  data: Proposal;
  pendingTransaction?: PendingTransaction;
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
  /** Connected wallet that signs the on-chain proposal. */
  wallet?: string;
}

export const PROPOSAL_STATUS_META: Record<
  ProposalStatus,
  { label: string; tone: 'active' | 'positive' | 'negative' | 'neutral' }
> = {
  draft: { label: 'Draft', tone: 'neutral' },
  active: { label: 'Voting', tone: 'active' },
  approved: { label: 'Approved', tone: 'positive' },
  executed: { label: 'Executed', tone: 'positive' },
  rejected: { label: 'Rejected', tone: 'negative' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

async function authed<T>(path: string, init?: RequestInit): Promise<T> {
  const authorization = await treasuryAuth();
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      ...init,
      headers: {
        ...authorization,
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch (err) {
    throw new Error(describeNetworkError(err));
  }
  if (!response.ok) {
    throw new Error(await describeApiError(response, path));
  }
  return response.json() as Promise<T>;
}

export function getProposals(status?: ProposalStatus): Promise<{ data: Proposal[] }> {
  const qs = status ? `?status=${status}` : '';
  return authed(`/proposals${qs}`);
}

export function createProposal(
  payload: CreateProposalPayload,
  walletHeaders?: Record<string, string>,
): Promise<ProposalMutationResponse> {
  return authed('/proposals', { method: 'POST', body: JSON.stringify(payload), headers: walletHeaders });
}

function proposalAction(action: string) {
  return (id: string, wallet?: string, walletHeaders?: Record<string, string>): Promise<ProposalMutationResponse> =>
    authed(`/proposals/${id}/${action}`, { method: 'POST', body: JSON.stringify({ wallet }), headers: walletHeaders });
}

export const approveProposal = proposalAction('approve');
export const rejectProposal = proposalAction('reject');
export const executeProposal = proposalAction('execute');
export const cancelProposal = proposalAction('cancel');
export const activateProposal = proposalAction('activate');

/** One proposal moving the Principal's balance to the sub-vaults by their target weights. */
export function createRedistribution(
  wallet?: string,
  walletHeaders?: Record<string, string>,
  /** One asset per proposal so each transaction fits; omit to include all. */
  mint?: string,
): Promise<ProposalMutationResponse> {
  return authed('/proposals/redistribute', { method: 'POST', body: JSON.stringify({ wallet, mint }), headers: walletHeaders });
}

/** How many finished proposals still lock rent on the Luxor contract (0 on other treasuries). */
export function getReclaimable(): Promise<{ data: { count: number } }> {
  return authed('/proposals/reclaimable');
}

/** The transaction that closes a batch of finished proposals and returns their rent to the wallets that paid it. */
export function reclaimRentRequest(
  walletHeaders?: Record<string, string>,
): Promise<{ data: { count: number; remaining: number }; pendingTransaction?: PendingTransaction }> {
  return authed('/proposals/reclaim-rent', { method: 'POST', body: '{}', headers: walletHeaders });
}

/** Confirms a signed transaction and returns the proposal as mirrored from the chain. */
export function syncProposal(
  id: string,
  body: { signature?: string; action?: string } = {},
): Promise<{ data: Proposal }> {
  return authed(`/proposals/${id}/sync`, { method: 'POST', body: JSON.stringify(body) });
}

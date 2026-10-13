import { treasuryAuth } from '@/lib/active-treasury';
import { apiUrl } from '@/lib/api-client';
import type { PendingTransaction } from '@/features/treasury/lib/multisig-tx';

/**
 * Roles, exactly Squads' three permissions (there is no admin: what a proposal changes is decided by the vote):
 *   proposer — Initiate: creates proposals (transfers, swaps, and member / threshold changes)
 *   signer   — Vote ("Voter"): approves or rejects; counts towards the M-of-N threshold
 *   executor — Execute: executes already approved proposals
 */
export interface MemberRoles {
  proposer: boolean;
  signer: boolean;
  executor: boolean;
}

export type MemberRoleKey = keyof MemberRoles;

export const MEMBER_ROLE_META: Record<MemberRoleKey, { label: string; short: string; description: string }> = {
  proposer: { label: 'Proposer', short: 'Proposer', description: 'Creates proposals: transfers, swaps, member and threshold changes.' },
  signer: { label: 'Voter', short: 'Voter', description: 'Approves or rejects proposals; counts towards the threshold.' },
  executor: { label: 'Executor', short: 'Executor', description: 'Executes proposals once they are approved.' },
};

/** Display order of the roles. */
export const MEMBER_ROLE_KEYS: MemberRoleKey[] = ['proposer', 'signer', 'executor'];

export interface Member {
  id: string;
  merchantId: string;
  name: string;
  walletAddress: string;
  roles: MemberRoles;
  /** True for the signed-in user's own membership. */
  isCurrentUser?: boolean;
  /** null while the multisig is off-chain; otherwise whether the wallet is a member. */
  onChain?: boolean | null;
  /** Membership change waiting for its config proposal to execute. */
  pendingChange?: PendingMemberChange | null;
  createdAt: string;
  updatedAt: string;
}

export interface PendingMemberChange {
  op: 'add' | 'remove' | 'update';
  proposalId: string;
  proposalIndex: number;
  status: string;
}

/**
 * On an on-chain multisig, member writes answer with the config proposal
 * (AddMember / RemoveMember) that the connected wallet must sign.
 */
export interface MemberProposalResult {
  proposal?: { id: string; index: number };
  pendingTransaction?: PendingTransaction;
}

export interface CreateMemberPayload {
  name: string;
  walletAddress: string;
  roles?: Partial<MemberRoles>;
}

export interface MembersResponse {
  data: Member[];
  total?: number;
}

export async function getMembers(): Promise<MembersResponse> {
  const response = await fetch(apiUrl('/members'), {
    method: 'GET',
    headers: {
      ...(await treasuryAuth()),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch members');
  }

  return response.json();
}

export async function createMember(
  payload: CreateMemberPayload,
  walletHeaders?: Record<string, string>,
): Promise<{ data: Member } & MemberProposalResult> {
  const response = await fetch(apiUrl('/members'), {
    method: 'POST',
    headers: {
      ...(await treasuryAuth()),
      'Content-Type': 'application/json',
      ...(walletHeaders ?? {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to add member');
  }

  return response.json();
}

export async function updateMemberRoles(
  id: string,
  roles: Partial<MemberRoles>,
  walletHeaders?: Record<string, string>,
): Promise<{ data: Member } & MemberProposalResult> {
  return updateMemberDetails(id, { roles }, walletHeaders);
}

export async function updateMemberDetails(
  id: string,
  payload: { name?: string; roles?: Partial<MemberRoles> },
  walletHeaders?: Record<string, string>,
): Promise<{ data: Member } & MemberProposalResult> {
  const response = await fetch(apiUrl(`/members/${id}`), {
    method: 'PATCH',
    headers: {
      ...(await treasuryAuth()),
      'Content-Type': 'application/json',
      ...(walletHeaders ?? {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update member details');
  }

  return response.json();
}

export async function deleteMember(
  id: string,
  walletHeaders?: Record<string, string>,
): Promise<{ success: boolean; pending?: boolean } & MemberProposalResult> {
  const response = await fetch(apiUrl(`/members/${id}`), {
    method: 'DELETE',
    headers: {
      ...(await treasuryAuth()),
      ...(walletHeaders ?? {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to remove member');
  }

  return response.json();
}

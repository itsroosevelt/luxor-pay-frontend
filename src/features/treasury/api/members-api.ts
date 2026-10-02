import { bearerAuth } from '@/lib/auth-client';
import { apiUrl } from '@/lib/api-client';

/**
 * SRS role matrix (Squads v4 reference):
 *   admin    — añade/remueve miembros y modifica el umbral de firmas
 *   signer   — vota propuestas; cuenta para el umbral M-de-N
 *   proposer — puede iniciar propuestas de transacción
 *   auditor  — solo lectura (balances, bóvedas, historial), sin claves de firma
 */
export interface MemberRoles {
  admin: boolean;
  signer: boolean;
  proposer: boolean;
  auditor: boolean;
}

export type MemberRoleKey = keyof MemberRoles;

export const MEMBER_ROLE_META: Record<MemberRoleKey, { label: string; short: string; description: string }> = {
  admin: { label: 'Administrator', short: 'Admin', description: 'Manages members and signature threshold.' },
  signer: { label: 'Signer', short: 'Signer', description: 'Votes on proposals; counts towards threshold.' },
  proposer: { label: 'Proposer', short: 'Proposer', description: 'Can propose transactions.' },
  auditor: { label: 'Auditor', short: 'Auditor', description: 'Read-only: balances, vaults, and history.' },
};

export interface Member {
  id: string;
  merchantId: string;
  name: string;
  walletAddress: string;
  roles: MemberRoles;
  /** True for the signed-in user's own membership. */
  isCurrentUser?: boolean;
  /** null while the multisig is off-chain; otherwise whether the wallet is a Squads member. */
  onChain?: boolean | null;
  createdAt: string;
  updatedAt: string;
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
      ...(await bearerAuth()),
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
): Promise<{ data: Member }> {
  const response = await fetch(apiUrl('/members'), {
    method: 'POST',
    headers: {
      ...(await bearerAuth()),
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
): Promise<{ data: Member }> {
  return updateMemberDetails(id, { roles }, walletHeaders);
}

export async function updateMemberDetails(
  id: string,
  payload: { name?: string; roles?: Partial<MemberRoles> },
  walletHeaders?: Record<string, string>,
): Promise<{ data: Member }> {
  const response = await fetch(apiUrl(`/members/${id}`), {
    method: 'PATCH',
    headers: {
      ...(await bearerAuth()),
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
): Promise<{ success: boolean }> {
  const response = await fetch(apiUrl(`/members/${id}`), {
    method: 'DELETE',
    headers: {
      ...(await bearerAuth()),
      ...(walletHeaders ?? {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to remove member');
  }

  return response.json();
}

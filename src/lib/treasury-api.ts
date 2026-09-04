/**
 * Treasury / multisig client — the enterprise wrapper over a Squads v4 program
 * account. In Mock Mode these calls are served by `src/mocks/handlers.ts`.
 */

import { apiUrl } from './api-client';

export interface MultisigConfig {
  address: string;
  /** M in "M-de-N": approvals required to execute a proposal. */
  threshold: number;
  timeLock: number;
  /** On-chain proposal counter; the next proposal takes index + 1. */
  transactionIndex: number;
  createKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaultToken {
  mint: string;
  symbol: string;
  uiAmount: string;
}

export interface Vault {
  id: string;
  /** Vault PDA index derived from the multisig. */
  index: number;
  label: string;
  address: string;
  description: string;
  isDefault: boolean;
  usdValue: number;
  solBalance: string;
  tokens: VaultToken[];
  createdAt: string;
}

export interface CreateVaultPayload {
  label: string;
  description?: string;
}

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

export function getMultisig(token: string): Promise<{ data: MultisigConfig }> {
  return authed(token, '/multisig');
}

export function updateThreshold(token: string, threshold: number): Promise<{ data: MultisigConfig }> {
  return authed(token, '/multisig', { method: 'PATCH', body: JSON.stringify({ threshold }) });
}

export function getVaults(token: string): Promise<{ data: Vault[] }> {
  return authed(token, '/vaults');
}

export function createVault(token: string, payload: CreateVaultPayload): Promise<{ data: Vault }> {
  return authed(token, '/vaults', { method: 'POST', body: JSON.stringify(payload) });
}

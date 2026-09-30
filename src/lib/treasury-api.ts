/**
 * Treasury / multisig client — the enterprise wrapper over a Squads v4 program
 * account. In Mock Mode these calls are served by `src/mocks/handlers.ts`.
 */

import { apiUrl } from './api-client';
import type { Proposal } from './proposals-api';
import type { PendingTransaction } from './squads-tx';

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
  /** true when `address` is a live Squads v4 multisig (config mirrored from the chain). */
  onChain?: boolean;
  programId?: string;
  memberCount?: number;
  lastSyncedAt?: string | null;
}

export interface VaultToken {
  mint: string;
  symbol: string;
  uiAmount: string;
  /** USD value from Jupiter / CoinGecko; null when the token has no market price. */
  usdValue?: number | null;
  name?: string | null;
  decimals?: number;
}

export interface VaultNft {
  mint: string;
  name: string | null;
  symbol: string | null;
  image: string | null;
}

export interface VaultStake {
  address: string;
  sol: string;
  /** Vote account the stake is delegated to. */
  validator: string | null;
  state: 'active' | 'activating' | 'deactivating' | 'inactive';
  usdValue?: number;
}

export interface Vault {
  id: string;
  /** Vault PDA index derived from the multisig. */
  index: number;
  label: string;
  address: string;
  description: string;
  isDefault: boolean;
  /** Principal (index 0): custodial reception vault; outflows need an approved proposal. */
  custodial?: boolean;
  /** Target % of the Principal's balance this sub-vault receives on "Redistribuir". */
  targetWeight?: number;
  usdValue: number;
  weight?: number;
  solBalance: string;
  /** SOL price used for this snapshot (USD). */
  solUsdPrice?: number | null;
  tokens: VaultToken[];
  nfts?: VaultNft[];
  stakes?: VaultStake[];
  createdAt: string;
}

/** Custodial collection wallet: payments waiting to be moved into the Principal Squads vault. */
export interface CollectorInfo {
  address: string | null;
  /** Destination of a sweep: the Principal Squads vault (index 0), fixed by the backend. */
  principalAddress: string | null;
  solBalance: string;
  tokens: { mint: string; symbol: string; uiAmount: string; usdValue: number | null }[];
  usdValue: number;
  canSweep: boolean;
  /** Why the automatic forward can't run yet (e.g. no SOL for network fees). */
  blockedReason?: string | null;
}

export function getCollector(token: string): Promise<{ data: CollectorInfo }> {
  return authed(token, '/vaults/collector');
}

/** Moves collected payments into the Principal Squads vault (wallet-signed session required). */
export function sweepCollector(
  token: string,
  walletHeaders?: Record<string, string>,
): Promise<{ data: { signatures: string[]; destination: string } }> {
  return authed(token, '/vaults/collector/sweep', { method: 'POST', headers: walletHeaders });
}

export interface CreateVaultPayload {
  label: string;
  description?: string;
  targetWeight?: number;
}

async function authed<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...(init?.headers as Record<string, string> ?? {}),
  };
  if (init?.body) {
    headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(apiUrl(path), {
    ...init,
    headers,
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

export function updateVault(
  token: string,
  id: string,
  payload: { label?: string; description?: string; targetWeight?: number },
  walletHeaders?: Record<string, string>,
): Promise<{ data: Vault }> {
  return authed(token, `/vaults/${id}`, { method: 'PATCH', body: JSON.stringify(payload), headers: walletHeaders });
}

/** Removes an empty vault's metadata (the Squads vault PDA itself is permanent). */
export function deleteVault(token: string, id: string, walletHeaders?: Record<string, string>): Promise<{ success: boolean }> {
  return authed(token, `/vaults/${id}`, { method: 'DELETE', headers: walletHeaders });
}

/**
 * Off-chain multisig: updates the threshold directly.
 * On-chain multisig: creates a Squads config proposal (`proposal`) whose
 * transaction the member wallet must sign.
 */
export function updateThreshold(
  token: string,
  threshold: number,
  wallet?: string,
  walletHeaders?: Record<string, string>,
): Promise<{ data: MultisigConfig; pendingTransaction?: PendingTransaction; proposal?: Proposal }> {
  return authed(token, '/multisig', { method: 'PATCH', body: JSON.stringify({ threshold, wallet }), headers: walletHeaders });
}

/** Builds the Squads v4 multisig_create_v2 transaction for the organization's members. */
export function deployMultisig(
  token: string,
  wallet: string,
  walletHeaders?: Record<string, string>,
): Promise<{ data: MultisigConfig; pendingTransaction: PendingTransaction; multisigAddress: string }> {
  return authed(token, '/multisig/deploy', { method: 'POST', body: JSON.stringify({ wallet }), headers: walletHeaders });
}

/** Binds an existing Squads v4 multisig (or confirms a deploy by its signature). */
export function linkMultisig(
  token: string,
  address: string,
  signature?: string,
  walletHeaders?: Record<string, string>,
): Promise<{ data: MultisigConfig }> {
  return authed(token, '/multisig/link', { method: 'POST', body: JSON.stringify({ address, signature }), headers: walletHeaders });
}

export function getVaults(token: string): Promise<{ data: Vault[] }> {
  return authed(token, '/vaults');
}

export function createVault(token: string, payload: CreateVaultPayload, walletHeaders?: Record<string, string>): Promise<{ data: Vault }> {
  return authed(token, '/vaults', { method: 'POST', body: JSON.stringify(payload), headers: walletHeaders });
}

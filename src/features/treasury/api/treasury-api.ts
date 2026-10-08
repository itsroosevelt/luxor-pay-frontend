/**
 * Treasury / multisig client — the wrapper over the Luxor multisig program
 * account. In Mock Mode these calls are served by `src/mocks/handlers.ts`.
 */

import { TREASURY_HEADER, treasuryAuth } from '@/lib/active-treasury';
import { apiUrl, describeApiError, describeNetworkError } from '@/lib/api-client';
import type { Proposal } from '@/features/treasury/api/proposals-api';
import type { PendingTransaction } from '@/features/treasury/lib/multisig-tx';

export interface MultisigConfig {
  /** Treasury id (sent back as the active treasury). */
  id: string;
  name: string;
  /** The oldest treasury, backed by the custodial collection wallet. */
  isDefault: boolean;
  address: string;
  /** M in "M-de-N": approvals required to execute a proposal. */
  threshold: number;
  timeLock: number;
  /** On-chain proposal counter; the next proposal takes index + 1. */
  transactionIndex: number;
  createKey: string;
  createdAt: string;
  updatedAt: string;
  /** true when `address` is a live Luxor multisig (config mirrored from the chain). */
  onChain?: boolean;
  /** Another organization's treasury this wallet is an on-chain member of. */
  shared?: boolean;
  /** Organization that owns a shared treasury (so two treasuries with the same name can be told apart). */
  ownerName?: string | null;
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
  /** true when Solana didn't answer and these are the last known balances. */
  stale?: boolean;
  /** SOL price used for this snapshot (USD). */
  solUsdPrice?: number | null;
  tokens: VaultToken[];
  nfts?: VaultNft[];
  stakes?: VaultStake[];
  createdAt: string;
}

/** Custodial collection wallet: payments waiting to be moved into the Principal vault. */
export interface CollectorInfo {
  address: string | null;
  /** Destination of a sweep: the Principal vault (index 0), fixed by the backend. */
  principalAddress: string | null;
  solBalance: string;
  tokens: { mint: string; symbol: string; uiAmount: string; usdValue: number | null }[];
  usdValue: number;
  canSweep: boolean;
  /** Why the automatic forward can't run yet (e.g. no SOL for network fees). */
  blockedReason?: string | null;
  /** No SOL for fees in the collection wallet: "Mover ahora" lets the member's wallet pay them. */
  needsFeePayer?: boolean;
}

export function getCollector(): Promise<{ data: CollectorInfo }> {
  return authed('/vaults/collector');
}

/** Moves collected payments into the Principal vault (wallet-signed session required). */
export function sweepCollector(
  walletHeaders?: Record<string, string>,
): Promise<{ data: { signatures: string[]; destination: string; pendingTransaction?: PendingTransaction } }> {
  return authed('/vaults/collector/sweep', { method: 'POST', headers: walletHeaders });
}

export interface CreateVaultPayload {
  label: string;
  description?: string;
  targetWeight?: number;
}

async function authed<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(await treasuryAuth()),
    ...(init?.headers as Record<string, string> ?? {}),
  };
  if (init?.body) {
    headers['Content-Type'] = 'application/json';
  }
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      ...init,
      headers,
    });
  } catch (err) {
    throw new Error(describeNetworkError(err));
  }
  if (!response.ok) {
    throw new Error(await describeApiError(response, path));
  }
  return response.json() as Promise<T>;
}

export async function getMultisig(): Promise<{ data: MultisigConfig }> {
  const res = await authed<{ data: MultisigConfig }>('/multisig');
  return { data: res.data };
}

export function updateVault(
  id: string,
  payload: { label?: string; description?: string; targetWeight?: number },
  walletHeaders?: Record<string, string>,
): Promise<{ data: Vault }> {
  return authed(`/vaults/${id}`, { method: 'PATCH', body: JSON.stringify(payload), headers: walletHeaders });
}

/** Removes an empty vault's metadata (the vault PDA itself is permanent). */
export function deleteVault(id: string, walletHeaders?: Record<string, string>): Promise<{ success: boolean }> {
  return authed(`/vaults/${id}`, { method: 'DELETE', headers: walletHeaders });
}

/**
 * Off-chain multisig: updates the threshold directly.
 * On-chain multisig: creates a config proposal (`proposal`) whose
 * transaction the member wallet must sign.
 */
export async function updateThreshold(
  threshold: number,
  wallet?: string,
  walletHeaders?: Record<string, string>,
): Promise<{ data: MultisigConfig; pendingTransaction?: PendingTransaction; proposal?: Proposal }> {
  const res = await authed<{ data: MultisigConfig; pendingTransaction?: PendingTransaction; proposal?: Proposal }>(
    '/multisig',
    { method: 'PATCH', body: JSON.stringify({ threshold, wallet }), headers: walletHeaders },
  );
  return res;
}

/** Builds the multisig_create transaction for the organization's members. */
export async function deployMultisig(
  wallet: string,
  walletHeaders?: Record<string, string>,
): Promise<{ data: MultisigConfig; pendingTransaction: PendingTransaction; multisigAddress: string }> {
  const res = await authed<{ data: MultisigConfig; pendingTransaction: PendingTransaction; multisigAddress: string }>(
    '/multisig/deploy',
    { method: 'POST', body: JSON.stringify({ wallet }), headers: walletHeaders },
  );
  return res;
}

/** Binds an existing Luxor multisig (or confirms a deploy by its signature). */
export async function linkMultisig(
  address: string,
  signature?: string,
  walletHeaders?: Record<string, string>,
): Promise<{ data: MultisigConfig }> {
  const res = await authed<{ data: MultisigConfig }>('/multisig/link', { method: 'POST', body: JSON.stringify({ address, signature }), headers: walletHeaders });
  return { data: res.data };
}

/** Every treasury of the organization. */
export async function listTreasuries(): Promise<{ data: MultisigConfig[] }> {
  const res = await authed<{ data: MultisigConfig[] }>('/multisig/treasuries', { headers: { [TREASURY_HEADER]: '' } });
  return { data: res.data ?? [] };
}

/** Org-level action: sent without an active treasury, so the org's default one authorizes it.
 * Adds an existing Luxor multisig (e.g. a shared one) as a new treasury; the signing wallet must be a member. */
export function linkTreasury(
  address: string,
  name: string | undefined,
  walletHeaders?: Record<string, string>,
): Promise<{ data: MultisigConfig }> {
  return authed('/multisig/treasuries/link', { method: 'POST', body: JSON.stringify({ address, name }), headers: { ...walletHeaders, [TREASURY_HEADER]: '' } });
}

/** Creates an empty treasury; deploy its multisig afterwards. */
export function createTreasury(name: string, walletHeaders?: Record<string, string>): Promise<{ data: MultisigConfig }> {
  return authed('/multisig/treasuries', { method: 'POST', body: JSON.stringify({ name }), headers: { ...walletHeaders, [TREASURY_HEADER]: '' } });
}

export function getVaults(): Promise<{ data: Vault[] }> {
  return authed('/vaults');
}

export function createVault(payload: CreateVaultPayload, walletHeaders?: Record<string, string>): Promise<{ data: Vault }> {
  return authed('/vaults', { method: 'POST', body: JSON.stringify(payload), headers: walletHeaders });
}

export type BalanceHistoryRange = '1W' | '1M' | '1Y';

export interface BalanceHistory {
  range: BalanceHistoryRange;
  /** Total USD balance of the treasury's vaults at each instant, oldest first. */
  points: { t: string; usd: number }[];
  /** The vaults have more activity than could be read: the oldest points are approximate. */
  truncated: boolean;
}

export function getBalanceHistory(range: BalanceHistoryRange): Promise<{ data: BalanceHistory }> {
  return authed(`/vaults/balance-history?range=${range}`);
}

/** One balance change of a vault, read from Solana (deposits, executed proposals, forwarded payments). */
export interface VaultActivityItem {
  signature: string;
  time: string | null;
  direction: 'in' | 'out';
  amount: string;
  symbol: string;
  mint: string;
  counterparty: string | null;
  usdValue: number | null;
}

export function getVaultActivity(vaultId: string): Promise<{ data: VaultActivityItem[] }> {
  return authed<{ data: VaultActivityItem[] }>(`/vaults/${vaultId}/activity`).catch((err) => {
    console.warn('Vault activity fetch silent fallback:', err?.message || err);
    return { data: [] };
  });
}

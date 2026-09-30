/**
 * Wallet signing for Squads v4 multisig operations.
 *
 * The backend builds every Squads instruction (PDAs, vault transactions,
 * votes, execution) and returns it unsigned. The member's wallet (Phantom /
 * Solflare) signs it here and broadcasts it; the program itself enforces that
 * only multisig members with the right permission can vote or execute.
 */

import { Connection, VersionedTransaction } from '@solana/web3.js';
import type { WalletContextState } from '@solana/wallet-adapter-react';

export type SquadsAction =
  | 'create_multisig'
  | 'create_proposal'
  | 'approve'
  | 'reject'
  | 'cancel'
  | 'activate'
  | 'execute';

export interface PendingTransaction {
  action: SquadsAction;
  /** base64 serialized v0 transaction (may already carry the multisig createKey signature). */
  transaction: string;
  blockhash: string;
  lastValidBlockHeight: number;
}

type SigningWallet = Pick<WalletContextState, 'publicKey' | 'signTransaction'>;

export function walletAddress(wallet: SigningWallet): string | undefined {
  return wallet.publicKey?.toBase58();
}

/** Signs `pending` with the connected wallet, sends it and waits for confirmation. Returns the signature. */
export async function signAndSendPending(
  pending: PendingTransaction,
  wallet: SigningWallet,
  connection: Connection,
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Conecta tu wallet (Phantom o Solflare) para firmar esta operación.');
  }

  const tx = VersionedTransaction.deserialize(base64ToBytes(pending.transaction));
  const payer = tx.message.staticAccountKeys[0];
  if (!payer.equals(wallet.publicKey)) {
    throw new Error(`Esta operación debe firmarla la wallet ${payer.toBase58().slice(0, 4)}…${payer.toBase58().slice(-4)}.`);
  }

  // signTransaction (not sendTransaction) keeps signatures the backend already added.
  const signed = await wallet.signTransaction(tx);
  const signature = await connection.sendRawTransaction(signed.serialize(), { maxRetries: 3 });
  const result = await connection.confirmTransaction(
    { signature, blockhash: pending.blockhash, lastValidBlockHeight: pending.lastValidBlockHeight },
    'confirmed',
  );
  if (result.value.err) {
    throw new Error(`La transacción falló on-chain: ${JSON.stringify(result.value.err)}`);
  }
  return signature;
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/** Lets other treasury views (balances, config) refresh after an on-chain change. */
export const TREASURY_CHANGED_EVENT = 'luxor_treasury_changed';

export function notifyTreasuryChanged(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(TREASURY_CHANGED_EVENT));
}

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
  | 'execute'
  | 'sweep';

export interface PendingTransaction {
  action: SquadsAction;
  /** base64 serialized v0 transaction (may already carry the multisig createKey signature). */
  transaction: string;
  blockhash: string;
  lastValidBlockHeight: number;
  /**
   * Execution that didn't fit in the same transaction: signed together with it (one
   * wallet prompt) and sent once the first one confirms.
   */
  followUp?: PendingTransaction;
}

type SigningWallet = Pick<WalletContextState, 'publicKey' | 'signTransaction'> &
  Partial<Pick<WalletContextState, 'signAllTransactions'>>;

/** What the whole pending operation ends with ('execute' when it executes in the same signature). */
export function finalAction(pending: PendingTransaction): SquadsAction {
  return pending.followUp ? finalAction(pending.followUp) : pending.action;
}

export function walletAddress(wallet: SigningWallet): string | undefined {
  return wallet.publicKey?.toBase58();
}

/**
 * Signs `pending` (and its `followUp`, in the same wallet prompt) with the connected
 * wallet, sends them in order and waits for confirmation. Returns the last signature.
 */
export async function signAndSendPending(
  pending: PendingTransaction,
  wallet: SigningWallet,
  connection: Connection,
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Conecta tu wallet (Phantom o Solflare) para firmar esta operación.');
  }

  const chain: PendingTransaction[] = [];
  for (let p: PendingTransaction | undefined = pending; p; p = p.followUp) chain.push(p);
  const txs = chain.map((p) => VersionedTransaction.deserialize(base64ToBytes(p.transaction)));
  for (const tx of txs) {
    const payer = tx.message.staticAccountKeys[0];
    if (!payer.equals(wallet.publicKey)) {
      throw new Error(`Esta operación debe firmarla la wallet ${payer.toBase58().slice(0, 4)}…${payer.toBase58().slice(-4)}.`);
    }
  }

  // signTransaction / signAllTransactions (not sendTransaction) keep signatures the backend already added.
  const signed =
    txs.length > 1 && wallet.signAllTransactions
      ? await wallet.signAllTransactions(txs)
      : [await wallet.signTransaction(txs[0])];

  let signature = '';
  for (let i = 0; i < chain.length; i++) {
    // Wallets without signAllTransactions sign the follow-up after the first one lands.
    const tx = signed[i] ?? (await wallet.signTransaction(txs[i]));
    signature = await sendAndConfirm(tx, chain[i], connection);
  }
  return signature;
}

async function sendAndConfirm(
  signed: VersionedTransaction,
  pending: PendingTransaction,
  connection: Connection,
): Promise<string> {
  let signature: string;
  try {
    signature = await connection.sendRawTransaction(signed.serialize(), { maxRetries: 3 });
  } catch (err) {
    throw new Error(`No se pudo enviar la transacción a Solana (${friendlyRpcError(err)}). No se ha movido nada; inténtalo de nuevo.`);
  }

  let result;
  try {
    result = await connection.confirmTransaction(
      { signature, blockhash: pending.blockhash, lastValidBlockHeight: pending.lastValidBlockHeight },
      'confirmed',
    );
  } catch (err) {
    // Sent, but the confirmation couldn't be observed (busy RPC / slow network). The
    // backend verifies this signature itself (retrying ~60 s) before syncing, so hand it on.
    console.warn('Confirmation not observed yet, backend will verify:', err);
    return signature;
  }
  if (result.value.err) {
    throw new Error(`La transacción falló on-chain: ${JSON.stringify(result.value.err)}`);
  }
  return signature;
}

function friendlyRpcError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/429|Too Many Requests|rate limit/i.test(msg)) return 'la red está saturada';
  if (/fetch|network|Failed to fetch/i.test(msg)) return 'sin conexión con la red';
  return msg;
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

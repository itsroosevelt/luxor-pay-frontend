/**
 * Wallet signing for Luxor multisig operations.
 *
 * The backend builds every multisig instruction (PDAs, vault transactions,
 * votes, execution) and returns it unsigned. The member's wallet (Phantom /
 * Solflare) signs it here and broadcasts it; the program itself enforces that
 * only multisig members with the right permission can vote or execute.
 */

import { Connection, VersionedTransaction } from '@solana/web3.js';
import type { WalletContextState } from '@solana/wallet-adapter-react';

export type MultisigAction =
  | 'create_multisig'
  | 'create_proposal'
  | 'approve'
  | 'reject'
  | 'cancel'
  | 'activate'
  | 'execute'
  | 'close'
  | 'sweep'
  | 'upload'
  | 'abort';

export interface PendingTransaction {
  action: MultisigAction;
  /** base64 serialized v0 transaction (may already carry the multisig createKey signature). */
  transaction: string;
  blockhash: string;
  lastValidBlockHeight: number;
  /**
   * Execution that didn't fit in the same transaction: signed together with it (one
   * wallet prompt) and sent once the first one confirms.
   */
  followUp?: PendingTransaction;
  /**
   * Only on a chunked upload: closes the buffer and returns its rent. It is signed with the rest (one prompt)
   * but sent only if the upload is interrupted.
   */
  abort?: PendingTransaction;
}

type SigningWallet = Pick<WalletContextState, 'publicKey' | 'signTransaction'> &
  Partial<Pick<WalletContextState, 'signAllTransactions'>>;

/** What the whole pending operation ends with ('execute' when it executes in the same signature). */
export function finalAction(pending: PendingTransaction): MultisigAction {
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
    throw new Error('Connect your wallet (Phantom or Solflare) to sign this transaction.');
  }

  const chain: PendingTransaction[] = [];
  for (let p: PendingTransaction | undefined = pending; p; p = p.followUp) chain.push(p);
  const txs = chain.map((p) => VersionedTransaction.deserialize(base64ToBytes(p.transaction)));
  const abortTx = pending.abort ? VersionedTransaction.deserialize(base64ToBytes(pending.abort.transaction)) : null;
  for (const tx of abortTx ? [...txs, abortTx] : txs) {
    const payer = tx.message.staticAccountKeys[0];
    if (!payer.equals(wallet.publicKey)) {
      throw new Error(`This operation must be signed by wallet ${payer.toBase58().slice(0, 4)}…${payer.toBase58().slice(-4)}.`);
    }
  }

  // signTransaction / signAllTransactions (not sendTransaction) keep signatures the backend already added.
  const toSign = abortTx ? [...txs, abortTx] : txs;
  const signed =
    toSign.length > 1 && wallet.signAllTransactions
      ? await wallet.signAllTransactions(toSign)
      : [await wallet.signTransaction(txs[0])];

  let signature = '';
  for (let i = 0; i < chain.length; i++) {
    try {
      // Wallets without signAllTransactions sign the follow-up after the first one lands.
      const tx = signed[i] ?? (await wallet.signTransaction(txs[i]));
      signature = await sendAndConfirm(tx, chain[i], connection);
    } catch (err) {
      // A chunked upload interrupted once its buffer exists (any step but the first, and before the
      // proposal was created): close the buffer so the rent comes back.
      const bufferExists = i >= 1 && chain[i].action !== 'execute';
      if (pending.abort && abortTx && bufferExists && (await abortUpload(signed[chain.length], abortTx, pending.abort, wallet, connection))) {
        throw new Error(`${err instanceof Error ? err.message : String(err)} Partial upload was cancelled and your rent deposit was refunded.`);
      }
      throw err;
    }
  }
  return signature;
}

/** Sends the pre-built "close the buffer" transaction; never throws (it only tidies up after a failure). */
async function abortUpload(
  signed: VersionedTransaction | undefined,
  abortTx: VersionedTransaction,
  abort: PendingTransaction,
  wallet: SigningWallet,
  connection: Connection,
): Promise<boolean> {
  try {
    const tx = signed ?? (await wallet.signTransaction!(abortTx));
    await sendAndConfirm(tx, abort, connection);
    return true;
  } catch (err) {
    console.warn('Could not close the interrupted upload buffer:', err);
    return false;
  }
}

async function sendAndConfirm(
  signed: VersionedTransaction,
  pending: PendingTransaction,
  connection: Connection,
): Promise<string> {
  let signature: string;
  try {
    // The backend took this blockhash at 'confirmed' from a possibly different RPC node: simulating at
    // a stricter level (or on a node that has not seen it yet) answers "Blockhash not found".
    signature = await connection.sendRawTransaction(signed.serialize(), { maxRetries: 3, preflightCommitment: 'processed' });
  } catch (err) {
    throw new Error(`Failed to send transaction to Solana (${friendlyRpcError(err)}). Nothing was changed; please try again.`);
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
    const reason = programErrorMessage(JSON.stringify(result.value.err));
    throw new Error(reason ? `Operation was rejected: ${reason}.` : `Transaction failed on-chain: ${JSON.stringify(result.value.err)}`);
  }
  return signature;
}

/** Errors of the luxor_multisig program, by Anchor code (6000 + position in the program's error list). */
const PROGRAM_ERRORS: Record<number, string> = {
  6000: 'your wallet is not a member of this multisig',
  6001: 'your wallet does not have the required permission for this action',
  6002: 'the member list is invalid (empty, too long, or contains duplicates)',
  6003: 'member permissions are invalid',
  6004: 'the multisig must retain at least one Proposer, one Voter, and one Executor',
  6005: 'threshold must be between 1 and the number of voters',
  6006: 'another proposal was created at the same time; please try again',
  6007: 'the proposal is empty or too large',
  6008: 'the proposal is obsolete: a subsequent configuration change invalidated it',
  6009: 'the proposal is not in the correct state for this action',
  6010: 'your wallet has already voted on this proposal',
  6011: 'the time lock delay for this proposal has not elapsed yet',
  6012: 'this proposal is not of the type being executed',
  6013: 'the proposal requests a signature other than the vault signer',
  6014: 'the proposal attempts to modify the multisig accounts themselves',
  6015: 'missing required accounts to execute the proposal',
  6016: 'that wallet is already a member',
  6017: 'that wallet is not a member',
  6018: 'arithmetic overflow',
  6019: 'the proposal is still open: only executed, rejected, cancelled, or obsolete proposals can be closed',
  6020: 'proposal size is zero or exceeds maximum allowed (4000 bytes)',
  6021: 'proposal upload is not yet complete',
  6022: 'uploaded data does not match the signed proposal; please try again',
  6023: 'proposal chunk does not fit in reserved buffer space',
};

/** Reads `custom program error: 0x1771` or `{"Custom":6001}` and returns the plain-language reason. */
export function programErrorMessage(text: string): string | null {
  const hex = /custom program error: 0x([0-9a-f]+)/i.exec(text);
  const dec = /"Custom"\s*:\s*(\d+)/.exec(text);
  const code = hex ? parseInt(hex[1], 16) : dec ? Number(dec[1]) : NaN;
  return PROGRAM_ERRORS[code] ?? null;
}

function friendlyRpcError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const program = programErrorMessage(msg);
  if (program) return program;
  if (/Blockhash not found/i.test(msg)) return 'the transaction expired before being sent (too much time passed since preparation); please try again and sign promptly';
  if (/429|Too Many Requests|rate limit/i.test(msg)) return 'the network is congested';
  if (/fetch|network|Failed to fetch/i.test(msg)) return 'no connection to the network';
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

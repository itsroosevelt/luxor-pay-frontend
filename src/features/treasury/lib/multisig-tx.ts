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
  | 'sweep';

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
    // The backend took this blockhash at 'confirmed' from a possibly different RPC node: simulating at
    // a stricter level (or on a node that has not seen it yet) answers "Blockhash not found".
    signature = await connection.sendRawTransaction(signed.serialize(), { maxRetries: 3, preflightCommitment: 'processed' });
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
    const reason = programErrorMessage(JSON.stringify(result.value.err));
    throw new Error(reason ? `La operación fue rechazada: ${reason}.` : `La transacción falló on-chain: ${JSON.stringify(result.value.err)}`);
  }
  return signature;
}

/** Errors of the luxor_multisig program, by Anchor code (6000 + position in the program's error list). */
const PROGRAM_ERRORS: Record<number, string> = {
  6000: 'tu wallet no es miembro de este multisig',
  6001: 'tu wallet no tiene el permiso necesario para esta acción',
  6002: 'la lista de miembros no es válida (vacía, demasiado larga o con duplicados)',
  6003: 'los permisos de un miembro no son válidos',
  6004: 'el multisig debe conservar al menos un proponente (Proposer), un votante (Voter) y un ejecutor (Executor)',
  6005: 'el umbral debe estar entre 1 y el número de votantes',
  6006: 'otra propuesta se creó al mismo tiempo; vuelve a intentarlo',
  6007: 'la propuesta está vacía o es demasiado grande',
  6008: 'la propuesta quedó obsoleta: un cambio de configuración posterior la invalidó',
  6009: 'la propuesta no está en el estado correcto para esta acción',
  6010: 'tu wallet ya votó esta propuesta',
  6011: 'todavía no pasó el tiempo de espera (time lock) de esta propuesta',
  6012: 'esta propuesta no es del tipo que se está ejecutando',
  6013: 'la propuesta pide una firma que no es la de la bóveda',
  6014: 'la propuesta intenta tocar cuentas del propio multisig',
  6015: 'faltan cuentas para ejecutar la propuesta',
  6016: 'esa wallet ya es miembro',
  6017: 'esa wallet no es miembro',
  6018: 'desbordamiento aritmético',
  6019: 'la propuesta sigue abierta: solo se pueden cerrar las ejecutadas, rechazadas, canceladas u obsoletas',
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
  if (/Blockhash not found/i.test(msg)) return 'la operación caducó antes de enviarse (pasó demasiado tiempo desde que se preparó); vuelve a intentarlo y firma enseguida';
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

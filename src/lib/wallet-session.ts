/**
 * Wallet-signed sessions.
 *
 * Treasury writes, custodial outflows (send, pay, swap, off-ramp) and changing the
 * merchant wallet must come from a connected member wallet: the backend
 * (authorizeWalletSession) verifies an Ed25519 signature over this session message
 * and checks the wallet's member role. One signature covers up to 55 minutes for
 * that wallet + account; switching wallet asks for a new one.
 */

import type { PublicKey } from '@solana/web3.js';
import { auth } from '@/lib/firebase';

/** Must match WALLET_SESSION_TITLE in the backend guard. */
const SESSION_TITLE = 'Luxor Pay · autorizar firmas de tu cuenta';
/** What one signature allows, shown in the wallet prompt so the user knows what they approve. */
const SESSION_SCOPE = 'Permite: tesorería, enviar, pagar, swaps, off-ramp y cambiar la wallet de cobros durante 55 min';
const SESSION_MS = 55 * 60 * 1000;
const RENEW_MARGIN_MS = 60 * 1000;
// v2: sessions signed with the previous message are re-requested so users see what they now authorize.
const STORAGE_KEY = 'luxor_wallet_session_v2';

export interface WalletSigner {
  publicKey: PublicKey | null;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
}

interface StoredSession {
  wallet: string;
  merchantId: string;
  expiresAt: number;
  message: string;
  signature: string;
}

let cached: StoredSession | null = null;

/** Fired (on window) whenever a new signed session is stored, so views can re-read what the wallet unlocks. */
export const WALLET_SESSION_EVENT = 'luxor_wallet_session';

export class WalletRequiredError extends Error {
  constructor(message = 'Connect your wallet (Phantom or Solflare) to perform this action.') {
    super(message);
    this.name = 'WalletRequiredError';
  }
}

/** Headers proving the connected wallet authorized this session; prompts a signature when needed. */
export async function getWalletAuthHeaders(wallet: WalletSigner): Promise<Record<string, string>> {
  if (!wallet.publicKey) throw new WalletRequiredError();
  if (!wallet.signMessage) {
    throw new WalletRequiredError('Your wallet does not support message signing. Please use Phantom or Solflare.');
  }
  const merchantId = auth.currentUser?.uid;
  if (!merchantId) throw new Error('Please sign in to continue.');

  const address = wallet.publicKey.toBase58();
  const existing = readSession();
  const session =
    existing && existing.wallet === address && existing.merchantId === merchantId && existing.expiresAt - RENEW_MARGIN_MS > Date.now()
      ? existing
      : await signSession(wallet.signMessage, address, merchantId);

  return {
    'x-luxor-wallet': session.wallet,
    'x-luxor-message': session.message,
    'x-luxor-signature': session.signature,
  };
}

/**
 * The headers of the current signed session if there is a valid one, otherwise nothing. It never asks the
 * wallet to sign, so it is safe on plain reads: the backend uses it to show (and open) the multisigs of other
 * organizations that this wallet is a member of.
 */
export function peekWalletAuthHeaders(): Record<string, string> {
  const merchantId = auth.currentUser?.uid;
  const session = readSession();
  if (!merchantId || !session || session.merchantId !== merchantId || session.expiresAt - RENEW_MARGIN_MS <= Date.now()) return {};
  return { 'x-luxor-wallet': session.wallet, 'x-luxor-message': session.message, 'x-luxor-signature': session.signature };
}

async function signSession(
  signMessage: (message: Uint8Array) => Promise<Uint8Array>,
  wallet: string,
  merchantId: string,
): Promise<StoredSession> {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + SESSION_MS;
  const text = [
    SESSION_TITLE,
    SESSION_SCOPE,
    `Wallet: ${wallet}`,
    `Cuenta: ${merchantId}`,
    `Emitida: ${new Date(issuedAt).toISOString()}`,
    `Expira: ${new Date(expiresAt).toISOString()}`,
  ].join('\n');

  const bytes = new TextEncoder().encode(text);
  let signature: Uint8Array;
  try {
    signature = await signMessage(bytes);
  } catch (err: any) {
    const isUserRejection =
      err?.name === 'WalletSignMessageError' ||
      err?.code === 4001 ||
      (typeof err?.message === 'string' && /user rejected|rejected|canceled|cancelled/i.test(err.message));
    if (isUserRejection) {
      throw new Error('Signature cancelled in wallet.');
    }
    throw err;
  }

  const session: StoredSession = {
    wallet,
    merchantId,
    expiresAt,
    message: bytesToBase64(bytes),
    signature: bytesToBase64(signature),
  };
  writeSession(session);
  return session;
}

function readSession(): StoredSession | null {
  if (cached) return cached;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    cached = raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    cached = null;
  }
  return cached;
}

/** Whether a valid signed session for exactly this wallet and the signed-in account already exists. */
export function hasWalletSession(wallet: string): boolean {
  return peekWalletAuthHeaders()['x-luxor-wallet'] === wallet;
}

function writeSession(session: StoredSession): void {
  cached = session;
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(WALLET_SESSION_EVENT));
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Private mode / storage disabled: the in-memory copy still works for this tab.
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

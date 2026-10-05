/**
 * Wallet-signed sessions for treasury writes.
 *
 * Every create / edit / delete / vote on the treasury must come from a connected
 * wallet: the backend (WalletAuthGuard) verifies an Ed25519 signature over this
 * session message and checks the wallet's member role. One signature covers up
 * to 55 minutes for that wallet + account; switching wallet asks for a new one.
 */

import type { PublicKey } from '@solana/web3.js';
import { auth } from '@/lib/firebase';

/** Must match WALLET_SESSION_TITLE in the backend guard. */
const SESSION_TITLE = 'Luxor Pay · autorizar sesión de tesorería';
const SESSION_MS = 55 * 60 * 1000;
const RENEW_MARGIN_MS = 60 * 1000;
const STORAGE_KEY = 'luxor_wallet_session';

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

export class WalletRequiredError extends Error {
  constructor(message = 'Conecta tu wallet (Phantom o Solflare) para realizar esta acción.') {
    super(message);
    this.name = 'WalletRequiredError';
  }
}

/** Headers proving the connected wallet authorized this session; prompts a signature when needed. */
export async function getWalletAuthHeaders(wallet: WalletSigner): Promise<Record<string, string>> {
  if (!wallet.publicKey) throw new WalletRequiredError();
  if (!wallet.signMessage) {
    throw new WalletRequiredError('Tu wallet no permite firmar mensajes. Usa Phantom o Solflare.');
  }
  const merchantId = auth.currentUser?.uid;
  if (!merchantId) throw new Error('Inicia sesión para continuar.');

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

async function signSession(
  signMessage: (message: Uint8Array) => Promise<Uint8Array>,
  wallet: string,
  merchantId: string,
): Promise<StoredSession> {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + SESSION_MS;
  const text = [
    SESSION_TITLE,
    `Wallet: ${wallet}`,
    `Cuenta: ${merchantId}`,
    `Emitida: ${new Date(issuedAt).toISOString()}`,
    `Expira: ${new Date(expiresAt).toISOString()}`,
  ].join('\n');

  const bytes = new TextEncoder().encode(text);
  const signature = await signMessage(bytes);
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

function writeSession(session: StoredSession): void {
  cached = session;
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

import { parseSolanaPayUrl } from '@/lib/solana-pay-url';

export type ScannedPaymentRoute =
  | { type: 'link'; linkId: string }
  | { type: 'reference'; reference: string }
  | { type: 'wallet'; address: string }
  | { type: 'invalid' };

const BASE58_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

/** Extract a Solana wallet address from a scanned QR payload. */
export function extractWalletAddressFromScan(raw: string): string | null {
  const trimmed = raw.trim();
  const parsed = parseSolanaPayUrl(trimmed);
  let address = parsed?.recipient ?? trimmed;

  if (!parsed && address.startsWith('solana:')) {
    address = address.split('?')[0].replace('solana:', '');
  }

  return BASE58_ADDRESS.test(address) ? address : null;
}

/** Map a scanned QR string to a Luxor Pay checkout route (or wallet-only detection). */
export function routeScannedPaymentContent(raw: string): ScannedPaymentRoute {
  const trimmed = raw.trim();

  if (trimmed.includes('/pay/link/')) {
    const parts = trimmed.split('/pay/link/');
    const linkId = parts[parts.length - 1].split('?')[0];
    if (linkId) return { type: 'link', linkId };
  }

  if (trimmed.startsWith('lx_')) {
    return { type: 'link', linkId: trimmed };
  }

  if (trimmed.includes('/pay/')) {
    const parts = trimmed.split('/pay/');
    const reference = parts[parts.length - 1].split('?')[0];
    if (reference && reference !== 'link') {
      return { type: 'reference', reference };
    }
  }

  if (trimmed.startsWith('solana:')) {
    const parsed = parseSolanaPayUrl(trimmed);
    if (parsed) {
      const reference = parsed.references[0];
      if (reference) {
        return { type: 'reference', reference };
      }

      if (BASE58_ADDRESS.test(parsed.recipient)) {
        return { type: 'wallet', address: parsed.recipient };
      }
    }
  }

  if (/^[a-zA-Z0-9_-]{10,100}$/.test(trimmed)) {
    return { type: 'reference', reference: trimmed };
  }

  const wallet = extractWalletAddressFromScan(trimmed);
  if (wallet) {
    return { type: 'wallet', address: wallet };
  }

  return { type: 'invalid' };
}

import { Keypair } from '@solana/web3.js';
import { TOKEN_REGISTRY } from '@/lib/token-registry';

export type SolanaNetwork = 'mainnet-beta' | 'devnet';

const TOKEN_DECIMALS: Record<string, number> = {
  SOL: 9,
  USDC: 6,
  USDT: 6,
  LXR: 6,
  EURC: 6,
  WSOL: 9,
};

export function getSolanaNetwork(): SolanaNetwork {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'devnet';
  return network === 'mainnet-beta' ? 'mainnet-beta' : 'devnet';
}

export function getMintForSymbol(symbol: string): string | null {
  const upper = symbol.trim().toUpperCase();
  if (upper === 'SOL') return null;

  const network = getSolanaNetwork();
  const registry = TOKEN_REGISTRY[network] ?? {};
  const entry = Object.entries(registry).find(([, sym]) => sym.toUpperCase() === upper);
  return entry?.[0] ?? null;
}

export function getTokenDecimals(symbol: string): number {
  return TOKEN_DECIMALS[symbol.trim().toUpperCase()] ?? 6;
}

/** Decimal string suitable for Solana Pay `amount` query param. */
export function formatAmountForSolanaPay(amount: number, currency: string): string {
  const decimals = getTokenDecimals(currency);
  return toUiAndRawAmount(amount, decimals).uiAmount;
}

/** UI decimal + raw base units (subscriptions_qr- parity). */
export function toUiAndRawAmount(value: number, decimals: number) {
  const fixed = value.toFixed(decimals);
  const [integerPart, decimalPart = ''] = fixed.split('.');
  const uiAmount = fixed.replace(/\.?0+$/, '') || '0';
  const rawAmount = `${integerPart}${decimalPart}`.replace(/^0+/, '') || '0';
  return { uiAmount, rawAmount };
}

export function formatBaseUnitsToDecimal(amountRaw: string, decimals: number) {
  const negative = amountRaw.startsWith('-');
  const unsigned = negative ? amountRaw.slice(1) : amountRaw;
  const normalized = unsigned.replace(/^0+/, '') || '0';

  if (decimals === 0) {
    return `${negative ? '-' : ''}${normalized}`;
  }

  const padded = normalized.padStart(decimals + 1, '0');
  const integerPart = padded.slice(0, padded.length - decimals);
  const fractionalPart = padded.slice(-decimals).replace(/0+$/, '');

  return fractionalPart
    ? `${negative ? '-' : ''}${integerPart}.${fractionalPart}`
    : `${negative ? '-' : ''}${integerPart}`;
}

export interface EncodeSolanaPayUrlParams {
  recipient: string;
  amount?: string | number;
  splToken?: string | null;
  reference?: string | string[] | null;
  label?: string;
  message?: string;
  memo?: string;
}

/** Build a Solana Pay transfer-request URL (same format as subscriptions_qr-). */
export function encodeSolanaPayUrl({
  recipient,
  amount,
  splToken,
  reference,
  label,
  message,
  memo,
}: EncodeSolanaPayUrlParams): string {
  const url = new URL(`solana:${recipient}`);

  if (amount !== undefined && amount !== null && amount !== '') {
    url.searchParams.append('amount', String(amount));
  }

  if (splToken) {
    url.searchParams.append('spl-token', splToken);
  }

  const references = reference ? (Array.isArray(reference) ? reference : [reference]) : [];
  references.forEach((item) => url.searchParams.append('reference', item));

  if (label) {
    url.searchParams.append('label', label);
  }

  if (message) {
    url.searchParams.append('message', message);
  }

  if (memo) {
    url.searchParams.append('memo', memo);
  }

  return url.toString();
}

/** Open-amount QR: payer enters amount in their wallet. */
export function buildOpenAmountQrUrl(recipient: string, label = 'Luxor Pay'): string {
  return encodeSolanaPayUrl({ recipient, label });
}

export function buildPaymentQrUrl(params: {
  recipient: string;
  amount?: number;
  currency: string;
  reference?: string;
  label?: string;
  message?: string;
  memo?: string;
}): string {
  const amount =
    params.amount != null
      ? formatAmountForSolanaPay(params.amount, params.currency)
      : undefined;
  const splToken = getMintForSymbol(params.currency);

  return encodeSolanaPayUrl({
    recipient: params.recipient,
    amount,
    splToken,
    reference: params.reference,
    label: params.label ?? 'Luxor Pay',
    message: params.message,
    memo: params.memo,
  });
}

export interface ParsedSolanaPayUrl {
  recipient: string;
  amount?: string;
  splToken?: string;
  references: string[];
  label?: string;
  message?: string;
  memo?: string;
}

export function parseSolanaPayUrl(raw: string): ParsedSolanaPayUrl | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('solana:')) {
    return null;
  }

  try {
    const urlObj = new URL(trimmed.replace('solana:', 'http://localhost/'));
    const recipient = urlObj.pathname.replace(/^\//, '');
    if (!recipient) return null;

    return {
      recipient,
      amount: urlObj.searchParams.get('amount') ?? undefined,
      splToken: urlObj.searchParams.get('spl-token') ?? undefined,
      references: urlObj.searchParams.getAll('reference'),
      label: urlObj.searchParams.get('label') ?? undefined,
      message: urlObj.searchParams.get('message') ?? undefined,
      memo: urlObj.searchParams.get('memo') ?? undefined,
    };
  } catch {
    return null;
  }
}

export function isBackendSupportedCurrency(currency: string): boolean {
  const upper = currency.trim().toUpperCase();
  return upper === 'SOL' || upper === 'USDC';
}

/** Client-side on-chain reference pubkey for Solana Pay charge tracking. */
export function generatePaymentReference(): string {
  return Keypair.generate().publicKey.toBase58();
}

import { getSolanaNetwork, type ParsedSolanaPayUrl } from '@/lib/solana-pay-url';


const GENERIC_CHECKOUT_LABELS = new Set(['sterling pay', 'luxor pay', '']);

/** True when label is empty or a generic placeholder (not a recipient name). */
export function isGenericCheckoutLabel(label?: string | null): boolean {
  if (!label?.trim()) return true;
  return GENERIC_CHECKOUT_LABELS.has(label.trim().toLowerCase());
}

export interface SterlingPayCheckoutParams {
  recipient: string;
  amount?: string;
  currency?: string;
  label?: string;
  chargeRef?: string;
  invoiceRef?: string;
  expiry?: string;
  usdAmount?: string;
  message?: string;
}
export type LuxorPayCheckoutParams = SterlingPayCheckoutParams;

export interface ParsedSterlingPayCheckoutParams extends SterlingPayCheckoutParams {
  chargeRef?: string;
}
export type ParsedLuxorPayCheckoutParams = ParsedSterlingPayCheckoutParams;

/** Relative checkout path for in-app navigation (e.g. router.push). */
export function buildSterlingPayCheckoutPath({
  recipient,
  amount,
  currency = 'SOL',
  label,
  chargeRef,
  invoiceRef,
  expiry,
  usdAmount,
  message,
}: SterlingPayCheckoutParams): string {
  const params = new URLSearchParams();
  params.set('recipient', recipient);

  if (amount) {
    params.set('amount', amount);
    params.set('currency', currency);
  }

  if (label) {
    params.set('label', label);
  }

  if (chargeRef) {
    params.set('chargeRef', chargeRef);
  }

  if (invoiceRef) {
    params.set('invoiceRef', invoiceRef);
  }

  if (expiry) {
    params.set('expiry', expiry);
  }

  if (usdAmount) {
    params.set('usdAmount', usdAmount);
  }

  if (message) {
    params.set('message', message);
  }

  return `/pay/qr?${params.toString()}`;
}
export const buildLuxorPayCheckoutPath = buildSterlingPayCheckoutPath;

/** Absolute URL for QR codes (includes origin). */
export function buildSterlingPayCheckoutUrl(
  origin: string,
  params: SterlingPayCheckoutParams,
): string {
  return `${origin}${buildSterlingPayCheckoutPath(params)}`;
}
export const buildLuxorPayCheckoutUrl = buildSterlingPayCheckoutUrl;

/** Parse Sterling Pay checkout query params from a URL, path, or search string. */
export function parseSterlingPayCheckoutParams(
  input: string | URLSearchParams,
): ParsedSterlingPayCheckoutParams | null {
  let params: URLSearchParams;

  if (input instanceof URLSearchParams) {
    params = input;
  } else {
    const trimmed = input.trim();
    try {
      if (trimmed.includes('?') || trimmed.startsWith('/pay/qr')) {
        const url = trimmed.startsWith('http')
          ? new URL(trimmed)
          : new URL(trimmed, 'https://placeholder.local');
        params = url.searchParams;
      } else {
        params = new URLSearchParams(trimmed.startsWith('?') ? trimmed.slice(1) : trimmed);
      }
    } catch {
      return null;
    }
  }

  const recipient = params.get('recipient') ?? '';
  if (!recipient) return null;

  return {
    recipient,
    amount: params.get('amount') ?? undefined,
    currency: params.get('currency') ?? 'SOL',
    label: params.get('label') ?? undefined,
    chargeRef: params.get('chargeRef') ?? params.get('ref') ?? undefined,
    invoiceRef: params.get('invoiceRef') ?? undefined,
    expiry: params.get('expiry') ?? undefined,
    usdAmount: params.get('usdAmount') ?? undefined,
    message: params.get('message') ?? undefined,
  };
}
export const parseLuxorPayCheckoutParams = parseSterlingPayCheckoutParams;

/** Map a Solana Pay transfer-request QR into a Sterling checkout route. */
export function buildSterlingPayCheckoutPathFromSolanaPay(
  parsed: ParsedSolanaPayUrl,
  getTokenSymbol?: (mint: string, network?: 'mainnet-beta' | 'devnet') => string | null
): string {
  let currency = 'SOL';
  if (parsed.splToken && getTokenSymbol) {
    currency = getTokenSymbol(parsed.splToken, getSolanaNetwork()) ?? 'SOL';
  }

  return buildSterlingPayCheckoutPath({
    recipient: parsed.recipient,
    amount: parsed.amount,
    currency,
    label: parsed.label,
    chargeRef: parsed.references[0],
    message: parsed.message ?? parsed.memo,
  });
}
export const buildLuxorPayCheckoutPathFromSolanaPay = buildSterlingPayCheckoutPathFromSolanaPay;

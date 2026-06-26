import { getSolanaNetwork, type ParsedSolanaPayUrl } from '@/lib/solana-pay-url';
import { getTokenSymbol } from '@/lib/token-registry';

const GENERIC_CHECKOUT_LABELS = new Set(['luxor pay', '']);

/** True when label is empty or a generic placeholder (not a recipient name). */
export function isGenericCheckoutLabel(label?: string | null): boolean {
  if (!label?.trim()) return true;
  return GENERIC_CHECKOUT_LABELS.has(label.trim().toLowerCase());
}

export interface LuxorPayCheckoutParams {
  recipient: string;
  amount?: string;
  currency?: string;
  label?: string;
  chargeRef?: string;
}

export interface ParsedLuxorPayCheckoutParams extends LuxorPayCheckoutParams {
  chargeRef?: string;
}

/** Relative checkout path for in-app navigation (e.g. router.push). */
export function buildLuxorPayCheckoutPath({
  recipient,
  amount,
  currency = 'SOL',
  label,
  chargeRef,
}: LuxorPayCheckoutParams): string {
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

  return `/pay/qr?${params.toString()}`;
}

/** Absolute URL for QR codes (includes origin). */
export function buildLuxorPayCheckoutUrl(
  origin: string,
  params: LuxorPayCheckoutParams,
): string {
  return `${origin}${buildLuxorPayCheckoutPath(params)}`;
}

/** Parse Luxor Pay checkout query params from a URL, path, or search string. */
export function parseLuxorPayCheckoutParams(
  input: string | URLSearchParams,
): ParsedLuxorPayCheckoutParams | null {
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
  };
}

/** Map a Solana Pay transfer-request QR into a Luxor checkout route. */
export function buildLuxorPayCheckoutPathFromSolanaPay(parsed: ParsedSolanaPayUrl): string {
  let currency = 'SOL';
  if (parsed.splToken) {
    currency = getTokenSymbol(parsed.splToken, getSolanaNetwork()) ?? 'SOL';
  }

  return buildLuxorPayCheckoutPath({
    recipient: parsed.recipient,
    amount: parsed.amount,
    currency,
    label: parsed.label,
    chargeRef: parsed.references[0],
  });
}

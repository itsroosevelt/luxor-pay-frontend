import type { Currency } from '@luxor/contracts';

/** Solana tokens the merchant can accept for collection (USDT is optional add-on). */
export type CollectionToken = Currency | 'USDT';

export const PRIMARY_COLLECTION_TOKENS: CollectionToken[] = ['USDC', 'SOL'];
export const OPTIONAL_COLLECTION_TOKENS: CollectionToken[] = ['USDT'];

const STORAGE_PREFIX = 'luxor_collection_currencies:';

function storageKey(merchantId: string): string {
  return `${STORAGE_PREFIX}${merchantId}`;
}

export function defaultCollectionCurrencies(): CollectionToken[] {
  return [...PRIMARY_COLLECTION_TOKENS];
}

export function loadCollectionCurrencies(merchantId: string): CollectionToken[] {
  if (typeof window === 'undefined') return defaultCollectionCurrencies();
  try {
    const raw = localStorage.getItem(storageKey(merchantId));
    if (!raw) return defaultCollectionCurrencies();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return defaultCollectionCurrencies();
    const valid = new Set<CollectionToken>([...PRIMARY_COLLECTION_TOKENS, ...OPTIONAL_COLLECTION_TOKENS]);
    const selected = parsed.filter(
      (t): t is CollectionToken => typeof t === 'string' && valid.has(t as CollectionToken)
    );
    return [...new Set<CollectionToken>([...PRIMARY_COLLECTION_TOKENS, ...selected])];
  } catch {
    return defaultCollectionCurrencies();
  }
}

export function saveCollectionCurrencies(merchantId: string, tokens: CollectionToken[]): void {
  if (typeof window === 'undefined') return;
  const valid = new Set<CollectionToken>([...PRIMARY_COLLECTION_TOKENS, ...OPTIONAL_COLLECTION_TOKENS]);
  const normalized = [
    ...new Set<CollectionToken>([...PRIMARY_COLLECTION_TOKENS, ...tokens.filter((t) => valid.has(t))]),
  ];
  try {
    localStorage.setItem(storageKey(merchantId), JSON.stringify(normalized));
  } catch {
    // Quota or private browsing — non-fatal.
  }
}

export function isApiCurrency(token: CollectionToken): token is Currency {
  return token === 'USDC' || token === 'SOL';
}

/**
 * Browser-side twin of the backend RPC failover: when the configured Solana RPC
 * answers 429 / 5xx or can't be reached, the same JSON-RPC request is replayed on
 * a backup endpoint, and the failing one is skipped for a minute.
 */

const DEFAULT_DEVNET_FALLBACKS = ['https://solana-devnet.api.onfinality.io/public'];
const COOLDOWN_MS = 60_000;
const ALL_BUSY_RETRY_MS = 1_500;

export function rpcEndpoints(primary: string, network: string): string[] {
  const configured = (process.env.NEXT_PUBLIC_SOLANA_RPC_FALLBACK_URLS ?? '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);
  const defaults = network === 'devnet' && configured.length === 0 ? DEFAULT_DEVNET_FALLBACKS : [];
  return [...new Set([primary, ...configured, ...defaults])];
}

export function createFailoverFetch(endpoints: string[]): typeof fetch {
  const benchedUntil = new Map<string, number>();

  const attempt = async (init?: RequestInit): Promise<Response> => {
    const now = Date.now();
    const order = [...endpoints].sort(
      (a, b) => Number((benchedUntil.get(a) ?? 0) > now) - Number((benchedUntil.get(b) ?? 0) > now),
    );
    let lastError: unknown;
    let lastResponse: Response | undefined;
    for (const url of order) {
      try {
        const res = await fetch(url, init);
        if (res.status === 429 || res.status >= 500) {
          benchedUntil.set(url, Date.now() + COOLDOWN_MS);
          lastResponse = res;
          continue;
        }
        benchedUntil.delete(url);
        return res;
      } catch (err) {
        benchedUntil.set(url, Date.now() + COOLDOWN_MS);
        lastError = err;
      }
    }
    if (lastResponse) return lastResponse;
    throw lastError;
  };

  return (async (_input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const res = await attempt(init);
      if (res.status !== 429) return res;
    } catch {
      // every endpoint unreachable — retried once below
    }
    await new Promise((r) => setTimeout(r, ALL_BUSY_RETRY_MS));
    return attempt(init);
  }) as typeof fetch;
}

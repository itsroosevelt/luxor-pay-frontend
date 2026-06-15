export const PLATFORM_CONFIG_STORAGE_KEY = 'luxor_platform_config';

export type SupportedToken = 'SOL' | 'USDC' | 'USDT';

export interface PlatformToken {
  id: string;
  symbol: string;
  name: string;
  description?: string;
  enabled: boolean;
  isDefault: boolean;
  mintAddress?: string;
  demoBalance?: number;
}

export type RecurringBillingConfig = {
  reminderDaysBefore: number;
  overdueGraceDays: number;
  autoSendReminders: boolean;
};

export type PlatformConfig = {
  globalCommissionPercent: number;
  /** @deprecated Derived from `tokens` — kept for backward compatibility */
  supportedTokens: SupportedToken[];
  tokens: PlatformToken[];
  defaultTokenId: string | null;
  treasuryWalletAddress: string;
  recurringBilling: RecurringBillingConfig;
};

const ALL_TOKENS: SupportedToken[] = ['SOL', 'USDC', 'USDT'];

const DEFAULT_PLATFORM_TOKENS: PlatformToken[] = [
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana (SOL)',
    description: 'Pagos nativos en la red Solana',
    enabled: true,
    isDefault: true,
    demoBalance: 125.4,
  },
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin (USDC)',
    description: 'Stablecoin respaldada en USD',
    enabled: true,
    isDefault: false,
    demoBalance: 45_230.12,
  },
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether (USDT)',
    description: 'Stablecoin alternativa en Solana',
    enabled: false,
    isDefault: false,
    demoBalance: 12_800,
  },
];

const DEFAULT_PLATFORM_CONFIG: PlatformConfig = {
  globalCommissionPercent: 2.5,
  supportedTokens: ['SOL', 'USDC'],
  tokens: DEFAULT_PLATFORM_TOKENS,
  defaultTokenId: 'sol',
  treasuryWalletAddress: '',
  recurringBilling: {
    reminderDaysBefore: 3,
    overdueGraceDays: 7,
    autoSendReminders: true,
  },
};

function deriveSupportedTokens(tokens: PlatformToken[]): SupportedToken[] {
  const enabledSymbols = new Set(
    tokens.filter((t) => t.enabled).map((t) => t.symbol.toUpperCase())
  );
  const derived = ALL_TOKENS.filter((t) => enabledSymbols.has(t));
  return derived.length > 0 ? derived : ['SOL'];
}

function applyDefaultToken(
  tokens: PlatformToken[],
  defaultTokenId: string | null
): PlatformToken[] {
  const validDefault =
    defaultTokenId && tokens.some((t) => t.id === defaultTokenId)
      ? defaultTokenId
      : (tokens.find((t) => t.enabled)?.id ?? tokens[0]?.id ?? null);

  return tokens.map((t) => ({ ...t, isDefault: t.id === validDefault }));
}

function normalizePlatformToken(raw: unknown): PlatformToken | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<PlatformToken>;
  const symbol = typeof obj.symbol === 'string' ? obj.symbol.trim().toUpperCase() : '';
  const name = typeof obj.name === 'string' ? obj.name.trim() : '';
  const id = typeof obj.id === 'string' ? obj.id.trim() : '';
  if (!symbol || !name || !id) return null;

  const demoBalance = Number(obj.demoBalance);
  return {
    id,
    symbol,
    name,
    description: typeof obj.description === 'string' ? obj.description.trim() : undefined,
    enabled: typeof obj.enabled === 'boolean' ? obj.enabled : false,
    isDefault: typeof obj.isDefault === 'boolean' ? obj.isDefault : false,
    mintAddress:
      typeof obj.mintAddress === 'string' && obj.mintAddress.trim()
        ? obj.mintAddress.trim()
        : undefined,
    demoBalance: Number.isFinite(demoBalance) && demoBalance >= 0 ? demoBalance : undefined,
  };
}

function migrateFromSupportedTokens(supported: SupportedToken[]): PlatformToken[] {
  const enabledSet = new Set(supported);
  const tokens = DEFAULT_PLATFORM_TOKENS.map((t) => ({
    ...t,
    enabled: enabledSet.has(t.symbol as SupportedToken),
    isDefault: false,
  }));
  const firstEnabled = tokens.find((t) => t.enabled);
  if (firstEnabled) {
    return tokens.map((t) => ({ ...t, isDefault: t.id === firstEnabled.id }));
  }
  return applyDefaultToken(tokens, 'sol');
}

function normalizeTokensArray(raw: unknown, legacySupported?: unknown): PlatformToken[] {
  if (Array.isArray(raw) && raw.length > 0) {
    const parsed = raw
      .map(normalizePlatformToken)
      .filter((t): t is PlatformToken => t !== null);
    if (parsed.length > 0) return parsed;
  }

  if (Array.isArray(legacySupported)) {
    const valid = legacySupported.filter(
      (t): t is SupportedToken => t === 'SOL' || t === 'USDC' || t === 'USDT'
    );
    if (valid.length > 0) return migrateFromSupportedTokens(valid);
  }

  return DEFAULT_PLATFORM_TOKENS.map((t) => ({ ...t }));
}

function normalizeRecurringBilling(raw: unknown): RecurringBillingConfig {
  const defaults = DEFAULT_PLATFORM_CONFIG.recurringBilling;
  if (!raw || typeof raw !== 'object') return defaults;
  const obj = raw as Partial<RecurringBillingConfig>;
  const reminderDaysBefore = Number(obj.reminderDaysBefore);
  const overdueGraceDays = Number(obj.overdueGraceDays);
  return {
    reminderDaysBefore:
      Number.isFinite(reminderDaysBefore) && reminderDaysBefore >= 0
        ? reminderDaysBefore
        : defaults.reminderDaysBefore,
    overdueGraceDays:
      Number.isFinite(overdueGraceDays) && overdueGraceDays >= 0
        ? overdueGraceDays
        : defaults.overdueGraceDays,
    autoSendReminders:
      typeof obj.autoSendReminders === 'boolean'
        ? obj.autoSendReminders
        : defaults.autoSendReminders,
  };
}

function buildConfig(parsed: Partial<PlatformConfig>): PlatformConfig {
  const tokensRaw = normalizeTokensArray(parsed.tokens, parsed.supportedTokens);
  const defaultTokenId =
    typeof parsed.defaultTokenId === 'string' && parsed.defaultTokenId.trim()
      ? parsed.defaultTokenId.trim()
      : (tokensRaw.find((t) => t.isDefault)?.id ?? null);
  const tokens = applyDefaultToken(tokensRaw, defaultTokenId);
  const resolvedDefaultId = tokens.find((t) => t.isDefault)?.id ?? null;

  const percent = Number(parsed.globalCommissionPercent);

  return {
    globalCommissionPercent:
      Number.isFinite(percent) && percent >= 0 && percent <= 100
        ? percent
        : DEFAULT_PLATFORM_CONFIG.globalCommissionPercent,
    supportedTokens: deriveSupportedTokens(tokens),
    tokens,
    defaultTokenId: resolvedDefaultId,
    treasuryWalletAddress:
      typeof parsed.treasuryWalletAddress === 'string'
        ? parsed.treasuryWalletAddress.trim()
        : DEFAULT_PLATFORM_CONFIG.treasuryWalletAddress,
    recurringBilling: normalizeRecurringBilling(parsed.recurringBilling),
  };
}

export function loadPlatformConfig(): PlatformConfig {
  if (typeof window === 'undefined') return DEFAULT_PLATFORM_CONFIG;
  try {
    const raw = localStorage.getItem(PLATFORM_CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_PLATFORM_CONFIG;
    const parsed = JSON.parse(raw) as Partial<PlatformConfig>;
    return buildConfig(parsed);
  } catch {
    return DEFAULT_PLATFORM_CONFIG;
  }
}

export function savePlatformConfig(partial: Partial<PlatformConfig>): PlatformConfig {
  const current = loadPlatformConfig();
  const mergedTokens = partial.tokens ?? current.tokens;
  const mergedDefaultId =
    partial.defaultTokenId !== undefined ? partial.defaultTokenId : current.defaultTokenId;
  const tokens = applyDefaultToken(mergedTokens, mergedDefaultId);
  const defaultTokenId = tokens.find((t) => t.isDefault)?.id ?? null;

  const next: PlatformConfig = {
    globalCommissionPercent:
      partial.globalCommissionPercent ?? current.globalCommissionPercent,
    supportedTokens: deriveSupportedTokens(tokens),
    tokens,
    defaultTokenId,
    treasuryWalletAddress: partial.treasuryWalletAddress ?? current.treasuryWalletAddress,
    recurringBilling: partial.recurringBilling ?? current.recurringBilling,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PLATFORM_CONFIG_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Quota or private browsing — non-fatal for demo mode.
    }
  }

  return next;
}

export function getEnabledTokens(config: PlatformConfig = loadPlatformConfig()): PlatformToken[] {
  return config.tokens.filter((t) => t.enabled);
}

export function getDefaultToken(config: PlatformConfig = loadPlatformConfig()): PlatformToken | null {
  return config.tokens.find((t) => t.id === config.defaultTokenId) ?? null;
}

export function togglePlatformToken(tokenId: string, enabled: boolean): PlatformConfig {
  const current = loadPlatformConfig();
  const tokens = current.tokens.map((t) => (t.id === tokenId ? { ...t, enabled } : t));
  const enabledCount = tokens.filter((t) => t.enabled).length;
  if (enabledCount === 0) {
    return current;
  }
  return savePlatformConfig({ tokens });
}

/** @deprecated Use togglePlatformToken instead */
export function toggleSupportedToken(token: SupportedToken, enabled: boolean): PlatformConfig {
  const current = loadPlatformConfig();
  const match = current.tokens.find((t) => t.symbol === token);
  if (!match) return current;
  return togglePlatformToken(match.id, enabled);
}

export function setDefaultPlatformToken(tokenId: string): PlatformConfig {
  const current = loadPlatformConfig();
  const exists = current.tokens.some((t) => t.id === tokenId);
  if (!exists) return current;

  const tokens = current.tokens.map((t) =>
    t.id === tokenId ? { ...t, enabled: true, isDefault: true } : { ...t, isDefault: false }
  );

  return savePlatformConfig({ tokens, defaultTokenId: tokenId });
}

export type AddPlatformTokenInput = {
  symbol: string;
  name: string;
  description?: string;
  mintAddress?: string;
  demoBalance?: number;
};

function createTokenId(symbol: string, existingIds: Set<string>): string {
  const base = symbol.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let id = base || 'token';
  let suffix = 1;
  while (existingIds.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

export function addPlatformToken(input: AddPlatformTokenInput): PlatformConfig {
  const current = loadPlatformConfig();
  const symbol = input.symbol.trim().toUpperCase();
  const name = input.name.trim();
  if (!symbol || !name) return current;

  const duplicate = current.tokens.some((t) => t.symbol.toUpperCase() === symbol);
  if (duplicate) return current;

  const existingIds = new Set(current.tokens.map((t) => t.id));
  const demoBalance = Number(input.demoBalance);
  const token: PlatformToken = {
    id: createTokenId(symbol, existingIds),
    symbol,
    name,
    description: input.description?.trim() || undefined,
    enabled: true,
    isDefault: false,
    mintAddress: input.mintAddress?.trim() || undefined,
    demoBalance: Number.isFinite(demoBalance) && demoBalance >= 0 ? demoBalance : 0,
  };

  return savePlatformConfig({ tokens: [...current.tokens, token] });
}

export { ALL_TOKENS, DEFAULT_PLATFORM_TOKENS };

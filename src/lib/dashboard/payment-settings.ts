export const PAYMENT_SETTINGS_STORAGE_KEY = 'luxor-payment-settings';

export type PriceDisplayMode = 'monthly' | 'annual';
export type DefaultBillingMode = 'flexible' | 'classic';

export interface PaymentSettings {
  walletConnectAutocomplete: boolean;
  taxDisplay: boolean;
  priceDisplayMode: PriceDisplayMode;
  multipleSubscriptions: boolean;
  defaultBillingMode: DefaultBillingMode;
}

export function buildDefaultPaymentSettings(): PaymentSettings {
  return {
    walletConnectAutocomplete: true,
    taxDisplay: false,
    priceDisplayMode: 'monthly',
    multipleSubscriptions: false,
    defaultBillingMode: 'flexible',
  };
}

function loadFromStorage(): PaymentSettings {
  if (typeof window === 'undefined') return buildDefaultPaymentSettings();
  try {
    const raw = localStorage.getItem(PAYMENT_SETTINGS_STORAGE_KEY);
    if (!raw) return buildDefaultPaymentSettings();
    const parsed = JSON.parse(raw) as Partial<PaymentSettings>;
    return { ...buildDefaultPaymentSettings(), ...parsed };
  } catch {
    return buildDefaultPaymentSettings();
  }
}

export function loadPaymentSettings(): PaymentSettings {
  return loadFromStorage();
}

export function savePaymentSettings(settings: PaymentSettings): void {
  if (typeof window === 'undefined') return;
  const serialized = JSON.stringify(settings);
  localStorage.setItem(PAYMENT_SETTINGS_STORAGE_KEY, serialized);
  cachedSerialized = serialized;
  cachedSettings = settings;
}

export function patchPaymentSettings(patch: Partial<PaymentSettings>): PaymentSettings {
  const next = { ...loadPaymentSettings(), ...patch };
  savePaymentSettings(next);
  return next;
}

export const PAYMENT_SETTINGS_CHANGE_EVENT = 'luxor-payment-settings-change';

const DEFAULT_PAYMENT_SETTINGS_SNAPSHOT = buildDefaultPaymentSettings();

let cachedSettings: PaymentSettings = DEFAULT_PAYMENT_SETTINGS_SNAPSHOT;
let cachedSerialized: string | null | undefined;

/** Stable snapshot for useSyncExternalStore — same reference when settings are unchanged. */
export function getPaymentSettingsSnapshot(): PaymentSettings {
  if (typeof window === 'undefined') return DEFAULT_PAYMENT_SETTINGS_SNAPSHOT;
  try {
    const raw = localStorage.getItem(PAYMENT_SETTINGS_STORAGE_KEY);
    if (raw === cachedSerialized) {
      return cachedSettings;
    }
    cachedSerialized = raw;
    if (raw === null) {
      cachedSettings = DEFAULT_PAYMENT_SETTINGS_SNAPSHOT;
    } else {
      cachedSettings = {
        ...DEFAULT_PAYMENT_SETTINGS_SNAPSHOT,
        ...JSON.parse(raw),
      };
    }
  } catch {
    cachedSerialized = null;
    cachedSettings = DEFAULT_PAYMENT_SETTINGS_SNAPSHOT;
  }
  return cachedSettings;
}

/** Stable server snapshot for useSyncExternalStore hydration. */
export function getPaymentSettingsServerSnapshot(): PaymentSettings {
  return DEFAULT_PAYMENT_SETTINGS_SNAPSHOT;
}

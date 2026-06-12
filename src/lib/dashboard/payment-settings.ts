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
  localStorage.setItem(PAYMENT_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function patchPaymentSettings(patch: Partial<PaymentSettings>): PaymentSettings {
  const next = { ...loadPaymentSettings(), ...patch };
  savePaymentSettings(next);
  return next;
}

export const PAYMENT_SETTINGS_CHANGE_EVENT = 'luxor-payment-settings-change';

let cachedSettings = buildDefaultPaymentSettings();
let cachedSerialized = JSON.stringify(cachedSettings);

export function getPaymentSettingsSnapshot(): PaymentSettings {
  if (typeof window === 'undefined') return cachedSettings;
  try {
    const raw = localStorage.getItem(PAYMENT_SETTINGS_STORAGE_KEY);
    if (raw === null) {
      cachedSettings = buildDefaultPaymentSettings();
      cachedSerialized = JSON.stringify(cachedSettings);
      return cachedSettings;
    }
    if (raw !== cachedSerialized) {
      cachedSerialized = raw;
      cachedSettings = { ...buildDefaultPaymentSettings(), ...JSON.parse(raw) };
    }
  } catch {
    cachedSettings = buildDefaultPaymentSettings();
  }
  return cachedSettings;
}

export function getPaymentSettingsServerSnapshot(): PaymentSettings {
  return cachedSettings;
}

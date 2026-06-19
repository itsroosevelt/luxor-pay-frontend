export const RADAR_SETTINGS_STORAGE_KEY = 'luxor-radar-settings';
export const RADAR_SETTINGS_CHANGE_EVENT = 'luxor-radar-settings-change';

export interface RadarSettings {
  savedPaymentMethodsEnabled: boolean;
}

const DEFAULT_SETTINGS: RadarSettings = {
  savedPaymentMethodsEnabled: false,
};

let cachedRaw: string | null | undefined;
let cachedSnapshot: RadarSettings = DEFAULT_SETTINGS;

function readRaw(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(RADAR_SETTINGS_STORAGE_KEY);
  } catch {
    return null;
  }
}

function parseSettings(raw: string | null): RadarSettings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<RadarSettings>;
    return {
      savedPaymentMethodsEnabled: parsed.savedPaymentMethodsEnabled === true,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function loadRadarSettings(): RadarSettings {
  return parseSettings(readRaw());
}

export function saveRadarSettings(settings: RadarSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RADAR_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  cachedRaw = JSON.stringify(settings);
  cachedSnapshot = settings;
  window.dispatchEvent(new Event(RADAR_SETTINGS_CHANGE_EVENT));
}

export function setSavedPaymentMethodsRadarEnabled(enabled: boolean): void {
  saveRadarSettings({ savedPaymentMethodsEnabled: enabled });
}

export function getRadarSettingsSnapshot(): RadarSettings {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  cachedSnapshot = parseSettings(raw);
  return cachedSnapshot;
}

export function getRadarSettingsServerSnapshot(): RadarSettings {
  return DEFAULT_SETTINGS;
}

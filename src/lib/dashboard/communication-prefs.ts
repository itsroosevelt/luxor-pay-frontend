export type NotificationChannel = 'email' | 'sms' | 'push';

export interface ChannelConfig {
  enabled: boolean;
  mandatory?: boolean;
}

export interface NotificationPrefRow {
  id: string;
  label: string;
  channels: Record<NotificationChannel, ChannelConfig>;
}

export interface NotificationPrefSection {
  id: string;
  title: string;
  rows: NotificationPrefRow[];
}

export type CommunicationPrefsState = Record<
  string,
  Record<NotificationChannel, boolean>
>;

export const COMMUNICATION_PREFS_STORAGE_KEY = 'luxor-communication-prefs';

export const COMMUNICATION_TABS = [
  { id: 'cuenta', label: 'Cuenta' },
  { id: 'transacciones', label: 'Transacciones y saldos' },
  { id: 'api', label: 'API' },
  { id: 'cuentas-conectadas', label: 'Cuentas conectadas' },
  { id: 'actualizaciones', label: 'Actualizaciones de Luxor Pay' },
] as const;

export type CommunicationTabId = (typeof COMMUNICATION_TABS)[number]['id'];

export const ACCOUNT_NOTIFICATION_SECTIONS: NotificationPrefSection[] = [
  {
    id: 'risk-compliance',
    title: 'Riesgo de la cuenta y cumplimiento de la normativa',
    rows: [
      {
        id: 'security-alerts',
        label: 'Actividad sospechosa y alertas de seguridad',
        channels: {
          email: { enabled: true, mandatory: true },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'regulatory-requirements',
        label: 'Requisitos de cumplimiento normativo',
        channels: {
          email: { enabled: true, mandatory: true },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'identity-verification',
        label: 'Verificación de identidad',
        channels: {
          email: { enabled: true, mandatory: true },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'compliance-info-requests',
        label: 'Información solicitada para cumplimiento',
        channels: {
          email: { enabled: true, mandatory: true },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
    ],
  },
  {
    id: 'account-updates',
    title: 'Actualizaciones de la cuenta',
    rows: [
      {
        id: 'company-info',
        label: 'Información de la empresa',
        channels: {
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'service-providers',
        label: 'Proveedores de servicios',
        channels: {
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'integrations',
        label: 'Integraciones',
        channels: {
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'app-install-uninstall',
        label: 'Instalación y desinstalación de aplicaciones',
        channels: {
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'data-migrations',
        label: 'Migraciones de datos',
        channels: {
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'activity-summary',
        label: 'Resumen de actividad de la cuenta',
        channels: {
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'domain-verification',
        label: 'Verificación de dominio',
        channels: {
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
    ],
  },
  {
    id: 'team-management',
    title: 'Gestión de equipos',
    rows: [
      {
        id: 'team-changes',
        label: 'Cambios en el equipo',
        channels: {
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'sso',
        label: 'Inicio de sesión único (SSO)',
        channels: {
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'team-settings',
        label: 'Configuración del equipo',
        channels: {
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'mentions',
        label: 'Menciones',
        channels: {
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
    ],
  },
];

const DEFAULT_COMMUNICATION_PREFS_SNAPSHOT = buildDefaultPrefsState();

let cachedPrefsSnapshot: CommunicationPrefsState | null = null;
let cachedPrefsSerialized: string | null = null;

function serializeCommunicationPrefs(state: CommunicationPrefsState): string {
  return JSON.stringify(state);
}

/** Stable snapshot for useSyncExternalStore — same reference when prefs are unchanged. */
export function getCommunicationPrefsSnapshot(): CommunicationPrefsState {
  const next = loadCommunicationPrefs();
  const serialized = serializeCommunicationPrefs(next);
  if (cachedPrefsSerialized === serialized && cachedPrefsSnapshot !== null) {
    return cachedPrefsSnapshot;
  }
  cachedPrefsSerialized = serialized;
  cachedPrefsSnapshot = next;
  return cachedPrefsSnapshot;
}

/** Stable server snapshot for useSyncExternalStore hydration. */
export function getCommunicationPrefsServerSnapshot(): CommunicationPrefsState {
  return DEFAULT_COMMUNICATION_PREFS_SNAPSHOT;
}

export function buildDefaultPrefsState(
  sections: NotificationPrefSection[] = ACCOUNT_NOTIFICATION_SECTIONS
): CommunicationPrefsState {
  const state: CommunicationPrefsState = {};
  for (const section of sections) {
    for (const row of section.rows) {
      state[row.id] = {
        email: Boolean(row.channels.email.mandatory),
        sms: Boolean(row.channels.sms.mandatory),
        push: Boolean(row.channels.push.mandatory),
      };
    }
  }
  return state;
}

export function loadCommunicationPrefs(): CommunicationPrefsState {
  if (typeof window === 'undefined') {
    return buildDefaultPrefsState();
  }
  try {
    const raw = localStorage.getItem(COMMUNICATION_PREFS_STORAGE_KEY);
    if (!raw) return buildDefaultPrefsState();
    const parsed = JSON.parse(raw) as CommunicationPrefsState;
    const defaults = buildDefaultPrefsState();
    const merged: CommunicationPrefsState = { ...defaults };
    for (const rowId of Object.keys(defaults)) {
      if (parsed[rowId]) {
        merged[rowId] = { ...defaults[rowId], ...parsed[rowId] };
      }
    }
    for (const section of ACCOUNT_NOTIFICATION_SECTIONS) {
      for (const row of section.rows) {
        for (const channel of ['email', 'sms', 'push'] as NotificationChannel[]) {
          if (row.channels[channel].mandatory) {
            merged[row.id][channel] = true;
          }
        }
      }
    }
    return merged;
  } catch {
    return buildDefaultPrefsState();
  }
}

export function saveCommunicationPrefs(state: CommunicationPrefsState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COMMUNICATION_PREFS_STORAGE_KEY, JSON.stringify(state));
  cachedPrefsSerialized = serializeCommunicationPrefs(state);
  cachedPrefsSnapshot = state;
}

export function isChannelMandatory(
  rowId: string,
  channel: NotificationChannel
): boolean {
  for (const section of ACCOUNT_NOTIFICATION_SECTIONS) {
    const row = section.rows.find((r) => r.id === rowId);
    if (row) return Boolean(row.channels[channel].mandatory);
  }
  return false;
}

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
  { id: 'cuenta', label: 'Account' },
  { id: 'transacciones', label: 'Transactions and balances' },
  { id: 'api', label: 'API' },
  { id: 'cuentas-conectadas', label: 'Connected accounts' },
  { id: 'actualizaciones', label: 'Luxor Pay updates' },
] as const;

export type CommunicationTabId = (typeof COMMUNICATION_TABS)[number]['id'];

export const ACCOUNT_NOTIFICATION_SECTIONS: NotificationPrefSection[] = [
  {
    id: 'risk-compliance',
    title: 'Account risk and regulatory compliance',
    rows: [
      {
        id: 'security-alerts',
        label: 'Suspicious activity and security alerts',
        channels: {
          email: { enabled: true, mandatory: true },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'regulatory-requirements',
        label: 'Regulatory compliance requirements',
        channels: {
          email: { enabled: true, mandatory: true },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'identity-verification',
        label: 'Identity verification',
        channels: {
          email: { enabled: true, mandatory: true },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'compliance-info-requests',
        label: 'Information requested for compliance',
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
    title: 'Account updates',
    rows: [
      {
        id: 'company-info',
        label: 'Company information',
        channels: {
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'service-providers',
        label: 'Service providers',
        channels: {
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'integrations',
        label: 'Integrations',
        channels: {
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'app-install-uninstall',
        label: 'App installation and uninstallation',
        channels: {
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'data-migrations',
        label: 'Data migrations',
        channels: {
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'activity-summary',
        label: 'Account activity summary',
        channels: {
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'domain-verification',
        label: 'Domain verification',
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
    title: 'Team management',
    rows: [
      {
        id: 'team-changes',
        label: 'Team changes',
        channels: {
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'sso',
        label: 'Single sign-on (SSO)',
        channels: {
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'team-settings',
        label: 'Team settings',
        channels: {
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: false },
        },
      },
      {
        id: 'mentions',
        label: 'Mentions',
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

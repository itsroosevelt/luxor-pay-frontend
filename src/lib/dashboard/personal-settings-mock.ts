export interface PasskeyRow {
  id: string;
  name: string;
  addedAt: string;
  lastUsed: string;
}

export interface TwoFactorMethod {
  id: string;
  type: 'sms' | 'authenticator' | 'security-key';
  label: string;
  detail: string;
  badge?: 'default' | 'less-secure';
}

export interface SessionRow {
  id: string;
  location: string;
  device: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface AccountRow {
  id: string;
  name: string;
  accountId: string;
}

export const MOCK_PASSKEYS: PasskeyRow[] = [
  {
    id: 'pk-1',
    name: 'MacBook Pro',
    addedAt: '12 mar 2025',
    lastUsed: 'Hace 2 horas',
  },
];

export const MOCK_TWO_FACTOR: TwoFactorMethod[] = [
  {
    id: '2fa-sms',
    type: 'sms',
    label: 'SMS',
    detail: '+34 ••• •• 42 18',
    badge: 'less-secure',
  },
  {
    id: '2fa-app',
    type: 'authenticator',
    label: 'App de autenticación',
    detail: 'Google Authenticator',
    badge: 'default',
  },
  {
    id: '2fa-key',
    type: 'security-key',
    label: 'Clave de seguridad',
    detail: 'YubiKey 5 NFC',
  },
];

export const MOCK_SESSIONS: SessionRow[] = [
  {
    id: 'sess-1',
    location: 'Madrid, España',
    device: 'Chrome en macOS',
    ip: '185.•••.••.42',
    lastActive: 'Ahora',
    isCurrent: true,
  },
  {
    id: 'sess-2',
    location: 'Barcelona, España',
    device: 'Safari en iPhone',
    ip: '92.•••.••.17',
    lastActive: 'Hace 3 días',
    isCurrent: false,
  },
  {
    id: 'sess-3',
    location: 'Valencia, España',
    device: 'Firefox en Windows',
    ip: '81.•••.••.91',
    lastActive: 'Hace 1 semana',
    isCurrent: false,
  },
];

export const MOCK_ACCOUNTS: AccountRow[] = [
  {
    id: 'acct-1',
    name: 'Luxor Pay — Comercio principal',
    accountId: 'acct_1NqK8xLuxorPayDemo',
  },
  {
    id: 'acct-2',
    name: 'Tienda online',
    accountId: 'acct_1NqK8xTiendaOnline',
  },
];

export const LANGUAGE_OPTIONS = [
  { value: 'auto', label: 'Detección automática' },
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'ca', label: 'Català' },
] as const;

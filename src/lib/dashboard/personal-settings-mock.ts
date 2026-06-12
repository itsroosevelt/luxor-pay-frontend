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
    lastUsed: '2 hours ago',
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
    label: 'Authenticator app',
    detail: 'Google Authenticator',
    badge: 'default',
  },
  {
    id: '2fa-key',
    type: 'security-key',
    label: 'Security key',
    detail: 'YubiKey 5 NFC',
  },
];

export const MOCK_SESSIONS: SessionRow[] = [
  {
    id: 'sess-1',
    location: 'Madrid, Spain',
    device: 'Chrome on macOS',
    ip: '185.•••.••.42',
    lastActive: 'Now',
    isCurrent: true,
  },
  {
    id: 'sess-2',
    location: 'Barcelona, Spain',
    device: 'Safari on iPhone',
    ip: '92.•••.••.17',
    lastActive: '3 days ago',
    isCurrent: false,
  },
  {
    id: 'sess-3',
    location: 'Valencia, Spain',
    device: 'Firefox on Windows',
    ip: '81.•••.••.91',
    lastActive: '1 week ago',
    isCurrent: false,
  },
];

export const MOCK_ACCOUNTS: AccountRow[] = [
  {
    id: 'acct-1',
    name: 'Luxor Pay — Main merchant',
    accountId: 'acct_1NqK8xLuxorPayDemo',
  },
  {
    id: 'acct-2',
    name: 'Online store',
    accountId: 'acct_1NqK8xTiendaOnline',
  },
];

export const LANGUAGE_OPTIONS = [
  { value: 'auto', label: 'Automatic detection' },
  { value: 'es', label: 'Spanish' },
  { value: 'en', label: 'English' },
  { value: 'ca', label: 'Catalan' },
] as const;

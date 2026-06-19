export const BUSINESS_ACCOUNT_STORAGE_KEY = 'luxor-business-account-form';
export const BUSINESS_COMPANY_STORAGE_KEY = 'luxor-business-company-data';
export const BUSINESS_PUBLIC_STORAGE_KEY = 'luxor-business-public-data';
export const BUSINESS_OWNERS_STORAGE_KEY = 'luxor-business-owners';
export const BUSINESS_REPRESENTATIVE_STORAGE_KEY = 'luxor-business-account-representative';

export const EMPRESA_PRIMARY_TABS = [
  { id: 'datos-cuenta', label: 'Account details' },
  { id: 'estado-cuenta', label: 'Account status' },
  { id: 'datos-empresa', label: 'Company details' },
  { id: 'cuentas-externas', label: 'Linked external accounts' },
  { id: 'cuentas-bancarias', label: 'Payout wallets & currencies' },
  { id: 'datos-fiscales', label: 'Tax details' },
] as const;

export const EMPRESA_MORE_TABS = [
  { id: 'personalizacion', label: 'Branding customization' },
  { id: 'dominios', label: 'Custom domains' },
  { id: 'integraciones', label: 'Third-party integrations' },
] as const;

export type BusinessPrimaryTabId = (typeof EMPRESA_PRIMARY_TABS)[number]['id'];
export type BusinessMoreTabId = (typeof EMPRESA_MORE_TABS)[number]['id'];
export type BusinessTabId = BusinessPrimaryTabId | BusinessMoreTabId;

export const TIMEZONE_OPTIONS = [
  { value: 'America/Denver', label: 'America/Denver (GMT-7)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (GMT-8)' },
  { value: 'America/Chicago', label: 'America/Chicago (GMT-6)' },
  { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
  { value: 'Europe/Madrid', label: 'Europe/Madrid (GMT+1)' },
  { value: 'UTC', label: 'UTC' },
] as const;

export interface BusinessAccountFormData {
  accountName: string;
  accountId: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  timezone: string;
  phone: string;
  phoneVerified: boolean;
}

export interface CompanyBusinessData {
  companyName: string;
  website: string;
  publicName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  otherInfo: string[];
}

export interface PublicBusinessData {
  legalName: string;
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  supportAddressLine1: string;
  supportAddressLine2: string;
  supportCity: string;
  supportState: string;
  supportZip: string;
  supportCountry: string;
  bankStatementDescriptor: string;
}

export interface BusinessOwner {
  id: string;
  name: string;
  roles: string[];
  email: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface TaxBusinessData {
  taxId: string;
  taxIdType: string;
  legalName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export const TAX_DATA_STORAGE_KEY = 'luxor-business-tax-data';
export const EXTERNAL_ACCOUNTS_STORAGE_KEY = 'luxor-business-external-accounts';
export const BANK_ACCOUNTS_STORAGE_KEY = 'luxor-business-bank-accounts';
export const ACCOUNT_STATUS_STORAGE_KEY = 'luxor-business-account-status';

export type AccountVerificationStatus = 'verified' | 'pending' | 'unverified';

export interface AccountStatusCapabilities {
  solanaPaymentsEnabled: boolean;
  usdcSettlementEnabled: boolean;
  solSettlementEnabled: boolean;
  walletPayoutsEnabled: boolean;
  instantPayoutsEnabled: boolean;
  onChainVerificationComplete: boolean;
  verificationStatus: AccountVerificationStatus;
  restrictions: string[];
}

export interface LinkedExternalAccount {
  id: string;
  provider: string;
  displayName: string;
  accountHint: string;
}

export type ExternalDataUsageProductId =
  | 'payments'
  | 'capital'
  | 'corporate-card'
  | 'issuing';

export interface ExternalDataUsageEntry {
  productId: ExternalDataUsageProductId;
  label: string;
  enabled: boolean;
}

export interface ExternalAccountsSettings {
  accounts: LinkedExternalAccount[];
  allowNewProducts: boolean;
  dataUsage: ExternalDataUsageEntry[];
}

export interface PayoutCurrencyRow {
  id: string;
  currency: string;
  bankAccountLabel: string;
  bankLastFour: string;
  settlementFee: string;
  isDefault: boolean;
}

export interface DebitCardPayout {
  id: string;
  brand: string;
  lastFour: string;
}

export type PayoutSchedule = 'daily' | 'weekly' | 'manual';

export interface BankAccountsSettings {
  payoutCurrencies: PayoutCurrencyRow[];
  debitCards: DebitCardPayout[];
  payoutSchedule: PayoutSchedule;
}

export interface LuxorWalletBalance {
  currency: string;
  available: string;
  pending: string;
}

function generateAccountId(): string {
  const suffix =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 14)
      : Math.random().toString(36).slice(2, 16);
  return `acct_${suffix}`;
}

export function buildEmptyBusinessAccountForm(): BusinessAccountFormData {
  return {
    accountName: '',
    accountId: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
    timezone: 'America/Denver',
    phone: '+1 555-010-0248',
    phoneVerified: true,
  };
}

export function buildEmptyCompanyData(): CompanyBusinessData {
  return {
    companyName: '',
    website: '',
    publicName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    otherInfo: [],
  };
}

export function buildEmptyPublicData(): PublicBusinessData {
  return {
    legalName: '',
    companyName: '',
    supportEmail: '',
    supportPhone: '',
    supportAddressLine1: '',
    supportAddressLine2: '',
    supportCity: '',
    supportState: '',
    supportZip: '',
    supportCountry: '',
    bankStatementDescriptor: '',
  };
}

export function buildEmptyTaxData(): TaxBusinessData {
  return {
    taxId: '',
    taxIdType: '',
    legalName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  };
}

function loadFromStorage<T>(key: string, empty: () => T): T {
  if (typeof window === 'undefined') return empty();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<T>;
    return { ...empty(), ...parsed };
  } catch {
    return empty();
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadBusinessAccountForm(): BusinessAccountFormData {
  return loadFromStorage(BUSINESS_ACCOUNT_STORAGE_KEY, buildEmptyBusinessAccountForm);
}

export function saveBusinessAccountForm(data: BusinessAccountFormData): BusinessAccountFormData {
  const next = {
    ...data,
    accountId: data.accountId.trim() || generateAccountId(),
  };
  saveToStorage(BUSINESS_ACCOUNT_STORAGE_KEY, next);
  return next;
}

export function loadCompanyData(): CompanyBusinessData {
  return loadFromStorage(BUSINESS_COMPANY_STORAGE_KEY, buildEmptyCompanyData);
}

export function saveCompanyData(data: CompanyBusinessData): void {
  saveToStorage(BUSINESS_COMPANY_STORAGE_KEY, data);
}

export function loadPublicData(): PublicBusinessData {
  return loadFromStorage(BUSINESS_PUBLIC_STORAGE_KEY, buildEmptyPublicData);
}

export function savePublicData(data: PublicBusinessData): void {
  saveToStorage(BUSINESS_PUBLIC_STORAGE_KEY, data);
}

function generateOwnerId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `owner_${Math.random().toString(36).slice(2, 11)}`;
}

function normalizeBusinessOwner(raw: Partial<BusinessOwner> & { role?: string }): BusinessOwner {
  const empty = buildEmptyBusinessOwner();
  const roles =
    Array.isArray(raw.roles) && raw.roles.length > 0
      ? raw.roles.filter((r): r is string => typeof r === 'string')
      : raw.role?.trim()
        ? [raw.role.trim()]
        : empty.roles;

  return {
    ...empty,
    ...raw,
    id: raw.id?.trim() || generateOwnerId(),
    roles,
  };
}

export function buildEmptyBusinessOwner(): BusinessOwner {
  return {
    id: '',
    name: '',
    roles: [],
    email: '',
    dateOfBirth: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  };
}

export function loadBusinessOwners(): BusinessOwner[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BUSINESS_OWNERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Partial<BusinessOwner> & { role?: string }>;
    return Array.isArray(parsed) ? parsed.map(normalizeBusinessOwner) : [];
  } catch {
    return [];
  }
}

export function saveBusinessOwners(owners: BusinessOwner[]): void {
  saveToStorage(
    BUSINESS_OWNERS_STORAGE_KEY,
    owners.map((owner) => normalizeBusinessOwner(owner))
  );
}

export function loadAccountRepresentativeId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(BUSINESS_REPRESENTATIVE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ownerId?: string | null };
    return parsed.ownerId?.trim() || null;
  } catch {
    return null;
  }
}

export function saveAccountRepresentativeId(ownerId: string | null): void {
  saveToStorage(BUSINESS_REPRESENTATIVE_STORAGE_KEY, { ownerId });
}

export function formatOwnerAddress(owner: BusinessOwner): string {
  const lines: string[] = [];
  if (owner.addressLine1.trim()) lines.push(owner.addressLine1.trim());
  if (owner.addressLine2.trim()) lines.push(owner.addressLine2.trim());
  const cityLine = [owner.city, owner.state, owner.zip].filter((v) => v.trim()).join(', ');
  if (cityLine) lines.push(cityLine);
  if (owner.country.trim()) lines.push(owner.country.trim());
  return lines.join('\n');
}

export function formatSupportAddress(data: PublicBusinessData): string {
  const lines: string[] = [];
  if (data.supportAddressLine1.trim()) lines.push(data.supportAddressLine1.trim());
  if (data.supportAddressLine2.trim()) lines.push(data.supportAddressLine2.trim());
  const cityLine = [data.supportCity, data.supportState, data.supportZip]
    .filter((v) => v.trim())
    .join(', ');
  if (cityLine) lines.push(cityLine);
  if (data.supportCountry.trim()) lines.push(data.supportCountry.trim());
  return lines.join('\n');
}

export function loadTaxData(): TaxBusinessData {
  return loadFromStorage(TAX_DATA_STORAGE_KEY, buildEmptyTaxData);
}

export function saveTaxData(data: TaxBusinessData): void {
  saveToStorage(TAX_DATA_STORAGE_KEY, data);
}

export function isBusinessMoreTab(tabId: string): tabId is BusinessMoreTabId {
  return (EMPRESA_MORE_TABS as readonly { id: string }[]).some((t) => t.id === tabId);
}

export function isBusinessPrimaryTab(tabId: string): tabId is BusinessPrimaryTabId {
  return (EMPRESA_PRIMARY_TABS as readonly { id: string }[]).some((t) => t.id === tabId);
}

export function displayValue(value: string | undefined | null): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : '—';
}

export function buildDefaultAccountStatus(): AccountStatusCapabilities {
  return {
    solanaPaymentsEnabled: true,
    usdcSettlementEnabled: true,
    solSettlementEnabled: false,
    walletPayoutsEnabled: true,
    instantPayoutsEnabled: false,
    onChainVerificationComplete: false,
    verificationStatus: 'pending',
    restrictions: [],
  };
}

export function loadAccountStatus(): AccountStatusCapabilities {
  return loadFromStorage(ACCOUNT_STATUS_STORAGE_KEY, buildDefaultAccountStatus);
}

export function saveAccountStatus(data: AccountStatusCapabilities): void {
  saveToStorage(ACCOUNT_STATUS_STORAGE_KEY, data);
}

export function buildDefaultExternalAccountsSettings(): ExternalAccountsSettings {
  return {
    accounts: [],
    allowNewProducts: false,
    dataUsage: [
      { productId: 'payments', label: 'Payments', enabled: true },
      { productId: 'capital', label: 'Treasury', enabled: false },
      { productId: 'corporate-card', label: 'Analytics', enabled: false },
      { productId: 'issuing', label: 'Reporting', enabled: false },
    ],
  };
}

export function loadExternalAccountsSettings(): ExternalAccountsSettings {
  const loaded = loadFromStorage(
    EXTERNAL_ACCOUNTS_STORAGE_KEY,
    buildDefaultExternalAccountsSettings
  );
  return {
    ...buildDefaultExternalAccountsSettings(),
    ...loaded,
    accounts: Array.isArray(loaded.accounts) ? loaded.accounts : [],
    dataUsage:
      Array.isArray(loaded.dataUsage) && loaded.dataUsage.length > 0
        ? loaded.dataUsage
        : buildDefaultExternalAccountsSettings().dataUsage,
  };
}

export function saveExternalAccountsSettings(data: ExternalAccountsSettings): void {
  saveToStorage(EXTERNAL_ACCOUNTS_STORAGE_KEY, data);
}

export function buildDefaultBankAccountsSettings(): BankAccountsSettings {
  return {
    payoutCurrencies: [],
    debitCards: [],
    payoutSchedule: 'manual',
  };
}

export function loadBankAccountsSettings(): BankAccountsSettings {
  const loaded = loadFromStorage(BANK_ACCOUNTS_STORAGE_KEY, buildDefaultBankAccountsSettings);
  return {
    ...buildDefaultBankAccountsSettings(),
    ...loaded,
    payoutCurrencies: Array.isArray(loaded.payoutCurrencies)
      ? loaded.payoutCurrencies
      : buildDefaultBankAccountsSettings().payoutCurrencies,
    debitCards: Array.isArray(loaded.debitCards) ? loaded.debitCards : [],
  };
}

export function saveBankAccountsSettings(data: BankAccountsSettings): void {
  saveToStorage(BANK_ACCOUNTS_STORAGE_KEY, data);
}

export function buildDefaultLuxorWalletBalances(): LuxorWalletBalance[] {
  return [
    { currency: 'USDC', available: '0.00', pending: '0.00' },
    { currency: 'SOL', available: '0.00', pending: '0.00' },
  ];
}

export const PAYOUT_SCHEDULE_LABELS: Record<PayoutSchedule, string> = {
  daily: 'Daily — automatic transfers to your merchant wallet',
  weekly: 'Weekly — wallet transfers every Monday',
  manual: 'Manual — initiate payouts from Balances to your Solana wallet',
};

export const ACCOUNT_STATUS_ITEMS: Array<{
  key: keyof Omit<AccountStatusCapabilities, 'verificationStatus' | 'restrictions'>;
  title: string;
  description: string;
}> = [
  {
    key: 'solanaPaymentsEnabled',
    title: 'Solana payments',
    description: 'Accept SOL and USDC through payment links, POS, and checkout.',
  },
  {
    key: 'usdcSettlementEnabled',
    title: 'USDC settlement',
    description: 'Settle SOL and USDC wallet payments on Solana.',
  },
  {
    key: 'solSettlementEnabled',
    title: 'SOL settlement',
    description: 'Receive native SOL settlements to your merchant wallet.',
  },
  {
    key: 'walletPayoutsEnabled',
    title: 'Wallet payouts',
    description: 'Send available balance to your linked Solana merchant wallet.',
  },
  {
    key: 'instantPayoutsEnabled',
    title: 'Instant payouts',
    description: 'Send available balance to your merchant wallet within minutes.',
  },
  {
    key: 'onChainVerificationComplete',
    title: 'On-chain verification',
    description: 'Wallet ownership and merchant identity verified on Solana.',
  },
];

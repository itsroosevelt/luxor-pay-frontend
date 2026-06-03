export const BUSINESS_ACCOUNT_STORAGE_KEY = 'luxor-business-account-form';
export const BUSINESS_COMPANY_STORAGE_KEY = 'luxor-business-company-data';
export const BUSINESS_PUBLIC_STORAGE_KEY = 'luxor-business-public-data';
export const BUSINESS_OWNERS_STORAGE_KEY = 'luxor-business-owners';

export const EMPRESA_PRIMARY_TABS = [
  { id: 'datos-cuenta', label: 'Datos de la cuenta' },
  { id: 'estado-cuenta', label: 'Estado de la cuenta' },
  { id: 'datos-empresa', label: 'Datos de la empresa' },
  { id: 'cuentas-externas', label: 'Cuentas externas vinculadas' },
  { id: 'cuentas-bancarias', label: 'Cuentas bancarias y monedas' },
  { id: 'datos-fiscales', label: 'Datos fiscales' },
] as const;

export const EMPRESA_MORE_TABS = [
  { id: 'personalizacion', label: 'Personalización del branding' },
  { id: 'dominios', label: 'Dominios personalizados' },
  { id: 'integraciones', label: 'Integraciones de terceros' },
] as const;

export type EmpresaPrimaryTabId = (typeof EMPRESA_PRIMARY_TABS)[number]['id'];
export type EmpresaMoreTabId = (typeof EMPRESA_MORE_TABS)[number]['id'];
export type EmpresaTabId = EmpresaPrimaryTabId | EmpresaMoreTabId;

export const US_STATES = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
] as const;

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
  supportEmail: string;
  supportPhone: string;
  supportUrl: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
}

export interface BusinessOwner {
  id: string;
  name: string;
  role: string;
  email: string;
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
    timezone: '',
    phone: '',
    phoneVerified: false,
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
    supportEmail: '',
    supportPhone: '',
    supportUrl: '',
    privacyPolicyUrl: '',
    termsOfServiceUrl: '',
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

export function loadBusinessOwners(): BusinessOwner[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BUSINESS_OWNERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BusinessOwner[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBusinessOwners(owners: BusinessOwner[]): void {
  saveToStorage(BUSINESS_OWNERS_STORAGE_KEY, owners);
}

export function loadTaxData(): TaxBusinessData {
  return loadFromStorage(TAX_DATA_STORAGE_KEY, buildEmptyTaxData);
}

export function saveTaxData(data: TaxBusinessData): void {
  saveToStorage(TAX_DATA_STORAGE_KEY, data);
}

export function isEmpresaMoreTab(tabId: string): tabId is EmpresaMoreTabId {
  return (EMPRESA_MORE_TABS as readonly { id: string }[]).some((t) => t.id === tabId);
}

export function isEmpresaPrimaryTab(tabId: string): tabId is EmpresaPrimaryTabId {
  return (EMPRESA_PRIMARY_TABS as readonly { id: string }[]).some((t) => t.id === tabId);
}

export function displayValue(value: string | undefined | null): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : '—';
}

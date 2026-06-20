import type { Currency, Customer } from '@luxor/contracts';
import type { CheckoutPaymentRecord, CheckoutPayerInfo } from '@/lib/checkout-payments-local';

const STORAGE_PREFIX = 'luxor_customers:';

function storageKey(merchantId: string): string {
  return `${STORAGE_PREFIX}${merchantId}`;
}

function loadManualRecords(merchantId: string): Customer[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(merchantId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Customer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveManualRecords(merchantId: string, records: Customer[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey(merchantId), JSON.stringify(records));
  } catch {
    // Quota or private browsing — non-fatal for demo mode.
  }
}

function payerKey(payer: CheckoutPayerInfo): string | null {
  const email = payer.email?.trim().toLowerCase();
  if (email) return `email:${email}`;
  const name = payer.name?.trim().toLowerCase();
  if (name) return `name:${name}`;
  const company = payer.company?.trim().toLowerCase();
  if (company) return `company:${company}`;
  return null;
}

function customerIdFromKey(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return `cust_${hash.toString(16).padStart(8, '0')}`;
}

function displayNameFromPayer(payer: CheckoutPayerInfo): string {
  return payer.name?.trim() || payer.company?.trim() || payer.email?.trim() || 'Invitado';
}

export function deriveCustomersFromCheckoutPayments(
  merchantId: string,
  records: CheckoutPaymentRecord[]
): Customer[] {
  const byKey = new Map<string, Customer>();

  for (const record of records) {
    if (!record.payer) continue;
    const key = payerKey(record.payer);
    if (!key) continue;

    const existing = byKey.get(key);
    const confirmedAt = record.confirmedAt;
    if (existing) {
      existing.paymentCount = (existing.paymentCount ?? 0) + 1;
      if (
        !existing.lastPaymentAt ||
        new Date(confirmedAt).getTime() > new Date(existing.lastPaymentAt).getTime()
      ) {
        existing.lastPaymentAt = confirmedAt;
      }
      if (!existing.email && record.payer.email?.trim()) {
        existing.email = record.payer.email.trim();
      }
      continue;
    }

    byKey.set(key, {
      id: customerIdFromKey(`${merchantId}:${key}`),
      merchantId,
      name: displayNameFromPayer(record.payer),
      email: record.payer.email?.trim() || undefined,
      type: 'guest',
      createdAt: record.createdAt,
      lastPaymentAt: confirmedAt,
      paymentCount: 1,
      preferredToken: record.currency,
    });
  }

  return [...byKey.values()].sort(
    (a, b) => new Date(b.lastPaymentAt ?? b.createdAt).getTime() - new Date(a.lastPaymentAt ?? a.createdAt).getTime()
  );
}

function mergeCustomers(derived: Customer[], manual: Customer[]): Customer[] {
  const byId = new Map<string, Customer>();
  for (const customer of derived) {
    byId.set(customer.id, customer);
  }
  for (const customer of manual) {
    byId.set(customer.id, customer);
  }
  return [...byId.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function listLocalCustomers(
  merchantId: string,
  paymentRecords: CheckoutPaymentRecord[]
): Customer[] {
  const derived = deriveCustomersFromCheckoutPayments(merchantId, paymentRecords);
  const manual = loadManualRecords(merchantId);
  return mergeCustomers(derived, manual);
}

export function getLocalCustomer(merchantId: string, customerId: string, paymentRecords: CheckoutPaymentRecord[]): Customer | null {
  return listLocalCustomers(merchantId, paymentRecords).find((c) => c.id === customerId) ?? null;
}

export function createLocalCustomer(
  merchantId: string,
  input: {
    name: string;
    email?: string;
    walletAddress?: string;
    preferredToken?: Currency;
    countryCode?: string;
    type?: Customer['type'];
  }
): Customer {
  const now = new Date().toISOString();
  const customer: Customer = {
    id: `cust_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
    merchantId,
    name: input.name.trim(),
    email: input.email?.trim() || undefined,
    walletAddress: input.walletAddress?.trim() || undefined,
    preferredToken: input.preferredToken,
    countryCode: input.countryCode?.trim().toUpperCase() || undefined,
    type: input.type ?? 'registered',
    createdAt: now,
    paymentCount: 0,
  };

  const records = loadManualRecords(merchantId);
  records.unshift(customer);
  saveManualRecords(merchantId, records);
  return customer;
}

export function updateLocalCustomer(
  merchantId: string,
  customerId: string,
  data: Partial<Customer>
): Customer {
  const records = loadManualRecords(merchantId);
  const index = records.findIndex((c) => c.id === customerId);
  if (index >= 0) {
    const updated = { ...records[index], ...data, id: customerId, merchantId };
    records[index] = updated;
    saveManualRecords(merchantId, records);
    return updated;
  }

  throw new Error('Customer not found');
}

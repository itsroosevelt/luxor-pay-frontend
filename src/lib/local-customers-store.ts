import { generateId } from '@luxor/contracts';
import type { Currency, Customer } from '@luxor/contracts';
import { readJson, writeJson } from '@/lib/local-storage-utils';

const CUSTOMERS_PREFIX = 'luxor-customers:';
const CUSTOMER_REF_PREFIX = 'luxor-customer-ref:';

function customersKey(merchantId: string): string {
  return `${CUSTOMERS_PREFIX}${merchantId}`;
}

function customerRefKey(customerId: string): string {
  return `${CUSTOMER_REF_PREFIX}${customerId}`;
}

function readMerchantCustomers(merchantId: string): Customer[] {
  return readJson<Customer[]>(customersKey(merchantId), []);
}

function persistCustomer(customer: Customer): Customer {
  const customers = readMerchantCustomers(customer.merchantId);
  const idx = customers.findIndex((c) => c.id === customer.id);
  const next =
    idx >= 0 ? customers.map((c, i) => (i === idx ? customer : c)) : [customer, ...customers];
  writeJson(customersKey(customer.merchantId), next);
  writeJson(customerRefKey(customer.id), customer);
  return customer;
}

export function listLocalCustomers(merchantId: string): Customer[] {
  return readMerchantCustomers(merchantId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getLocalCustomer(merchantId: string, customerId: string): Customer | null {
  const customer = readJson<Customer | null>(customerRefKey(customerId), null);
  if (!customer || customer.merchantId !== merchantId) return null;
  return customer;
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
  const id = generateId('cust_');
  const createdAt = new Date().toISOString();
  const customer: Customer = {
    id,
    merchantId,
    name: input.name.trim(),
    email: input.email?.trim() || undefined,
    walletAddress: input.walletAddress?.trim() || undefined,
    preferredToken: input.preferredToken,
    countryCode: input.countryCode?.trim().toUpperCase() || undefined,
    type: input.type ?? (input.email ? 'registered' : 'guest'),
    createdAt,
    paymentCount: 0,
  };
  return persistCustomer(customer);
}

export function updateLocalCustomer(
  merchantId: string,
  customerId: string,
  data: Partial<
    Pick<Customer, 'name' | 'email' | 'walletAddress' | 'preferredToken' | 'countryCode'>
  >
): Customer {
  const existing = getLocalCustomer(merchantId, customerId);
  if (!existing) throw new Error('CUSTOMER_NOT_FOUND');

  const patch: Partial<Customer> = {};
  if (data.name !== undefined) patch.name = data.name.trim();
  if (data.email !== undefined) patch.email = data.email.trim() || undefined;
  if (data.walletAddress !== undefined) patch.walletAddress = data.walletAddress.trim() || undefined;
  if (data.preferredToken !== undefined) patch.preferredToken = data.preferredToken;
  if (data.countryCode !== undefined) {
    patch.countryCode = data.countryCode.trim().toUpperCase() || undefined;
  }

  return persistCustomer({ ...existing, ...patch });
}

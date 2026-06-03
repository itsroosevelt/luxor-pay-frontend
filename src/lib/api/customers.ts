import { apiGet, apiPost } from '@/lib/api/http';
import type { Currency, Customer } from '@luxor/contracts';

export async function fetchCustomersApi() {
  return apiGet<Customer[]>('/api/v1/customers');
}

export async function createCustomerApi(input: {
  name: string;
  email?: string;
  walletAddress?: string;
  preferredToken?: Currency;
}) {
  return apiPost<Customer>('/api/v1/customers', input);
}

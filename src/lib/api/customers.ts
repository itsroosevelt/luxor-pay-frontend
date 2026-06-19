import { notImplementedApi, type ApiResult } from '@/lib/api/http';
import type { Customer } from '@luxor/contracts';

export async function fetchCustomersApi(): Promise<ApiResult<Customer[]>> {
  return notImplementedApi('Customers');
}

export async function createCustomerApi(
  _input: Omit<Customer, 'id' | 'merchantId' | 'createdAt'>
): Promise<ApiResult<Customer>> {
  return notImplementedApi('Customers');
}

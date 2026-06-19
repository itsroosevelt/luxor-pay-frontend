import { notImplementedApi, type ApiResult } from '@/lib/api/http';

export async function fetchBalancesApi(): Promise<ApiResult<unknown[]>> {
  return notImplementedApi('Balances');
}

export async function fetchPayoutsApi(): Promise<ApiResult<unknown[]>> {
  return notImplementedApi('Payouts');
}

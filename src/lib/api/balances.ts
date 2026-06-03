import { apiGet } from '@/lib/api/http';
import type { Currency } from '@luxor/contracts';

export interface BalanceSummary {
  currency: Currency;
  available: number;
  pending: number;
}

export interface PayoutRecord {
  id: string;
  amount: number;
  currency: Currency;
  status: 'pending' | 'paid' | 'failed';
  destinationWallet: string;
  createdAt: string;
}

export async function fetchBalanceSummaryApi() {
  return apiGet<BalanceSummary[]>('/api/v1/balances');
}

export async function fetchPayoutsApi() {
  return apiGet<PayoutRecord[]>('/api/v1/payouts');
}

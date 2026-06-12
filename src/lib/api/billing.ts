import { notImplementedApi, type ApiResult } from '@/lib/api/http';
import type { BillingInvoice, BillingSubscription, Currency } from '@luxor/contracts';

export interface BillingOverview {
  mrr: number;
  activeSubscriptions: number;
  currency: Currency;
}

export interface BillingUsageRow {
  id: string;
  metric: string;
  quantity: number;
  period: string;
}

export async function fetchBillingOverviewApi(): Promise<ApiResult<BillingOverview>> {
  return notImplementedApi('Billing');
}

export async function fetchSubscriptionsApi(): Promise<ApiResult<BillingSubscription[]>> {
  return notImplementedApi('Billing subscriptions');
}

export async function fetchInvoicesApi(): Promise<ApiResult<BillingInvoice[]>> {
  return notImplementedApi('Billing invoices');
}

export async function fetchUsageApi(): Promise<ApiResult<BillingUsageRow[]>> {
  return notImplementedApi('Billing usage');
}

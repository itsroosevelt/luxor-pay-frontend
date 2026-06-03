import { apiGet } from '@/lib/api/http';
import type { BillingInvoice, BillingSubscription } from '@luxor/contracts';

export async function fetchBillingOverviewApi() {
  return apiGet<{ mrr: number; currency: string; activeSubscriptions: number }>(
    '/api/v1/billing/overview'
  );
}

export async function fetchSubscriptionsApi() {
  return apiGet<BillingSubscription[]>('/api/v1/billing/subscriptions');
}

export async function fetchInvoicesApi() {
  return apiGet<BillingInvoice[]>('/api/v1/billing/invoices');
}

export async function fetchUsageRecordsApi() {
  return apiGet<{ id: string; metric: string; quantity: number; period: string }[]>(
    '/api/v1/billing/usage'
  );
}

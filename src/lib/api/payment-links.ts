import { apiGet, apiPost } from '@/lib/api/http';
import type { Currency, PaymentLink } from '@luxor/contracts';

export async function fetchPaymentLinksApi() {
  return apiGet<PaymentLink[]>('/api/v1/payment-links');
}

export async function createPaymentLinkApi(input: {
  name: string;
  amount: number;
  currency: Currency;
}) {
  return apiPost<PaymentLink>('/api/v1/payment-links', input);
}

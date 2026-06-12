import { apiGet, apiPost } from '@/lib/api/http';
import type { Currency, PaymentLink } from '@luxor/contracts';

export async function fetchPaymentLinksApi() {
  return apiGet<PaymentLink[]>('/payment-links');
}

export async function createPaymentLinkApi(input: {
  name: string;
  amount: number;
  currency: Currency;
}) {
  return apiPost<PaymentLink>('/payment-links', input);
}

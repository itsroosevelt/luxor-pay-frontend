import { apiGet } from '@/lib/api/http';
import type { PaymentOrder } from '@luxor/contracts';

export async function fetchMerchantPayments() {
  return apiGet<PaymentOrder[]>('/payments');
}

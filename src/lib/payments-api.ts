import { apiUrl } from '@/lib/api-client';
import type { PaymentOrder } from '@luxor/contracts';

export async function createPaymentFromLink(linkId: string): Promise<PaymentOrder> {
  const res = await fetch(apiUrl('/api/payments/create'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ linkId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to create payment');
  return json.data as PaymentOrder;
}

export async function fetchPayment(reference: string): Promise<PaymentOrder> {
  const res = await fetch(apiUrl(`/api/payments/${reference}`));
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Payment not found');
  return json.data as PaymentOrder;
}

export async function verifyPayment(reference: string): Promise<{
  data: PaymentOrder;
  confirmed: boolean;
  signature?: string;
}> {
  const res = await fetch(apiUrl('/api/payments/verify'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Verification failed');
  return json;
}

export async function listPayments(token: string): Promise<PaymentOrder[]> {
  const res = await fetch(apiUrl('/api/payments'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to load payments');
  return json.data as PaymentOrder[];
}

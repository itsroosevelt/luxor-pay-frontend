import { apiUrl } from '@/lib/api-client';
import type { PaymentOrder } from '@luxor/contracts';

export async function createPaymentFromLink(linkId: string): Promise<PaymentOrder> {
  const res = await fetch(apiUrl('/payments/create'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ linkId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to create payment');
  return json.data as PaymentOrder;
}

export async function fetchPayment(reference: string): Promise<PaymentOrder> {
  const res = await fetch(apiUrl(`/payments/${reference}`));
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Payment not found');
  return json.data as PaymentOrder;
}

export async function verifyPayment(reference: string): Promise<{
  data: PaymentOrder;
  confirmed: boolean;
  signature?: string;
}> {
  const res = await fetch(apiUrl('/payments/verify'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Verification failed');
  return json;
}

export async function listPayments(token: string): Promise<PaymentOrder[]> {
  const res = await fetch(apiUrl('/payments'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to load payments');
  return json.data as PaymentOrder[];
}

export async function listPaymentLinks(token: string): Promise<any[]> {
  const res = await fetch(apiUrl('/payment-links'), {
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Failed to load links');
  return json.data as any[];
}

export async function getPaymentLink(id: string): Promise<any> {
  const res = await fetch(apiUrl(`/payment-links/${id}`));
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Failed to load link');
  return json.data as any;
}

export async function createPaymentLink(token: string, data: { name: string, businessName: string, amount: number, currency: string }): Promise<any> {
  const res = await fetch(apiUrl('/payment-links'), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Failed to create link');
  return json.data as any;
}

export async function updatePaymentLink(token: string, id: string, data: { name?: string, businessName?: string, amount?: number, currency?: string }): Promise<any> {
  const res = await fetch(apiUrl(`/payment-links/${id}`), {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Failed to update link');
  return json.data as any;
}

export async function deletePaymentLink(token: string, id: string): Promise<void> {
  const res = await fetch(apiUrl(`/payment-links/${id}`), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message ?? 'Failed to delete link');
  }
}

export async function listPosDevices(token: string): Promise<any[]> {
  const res = await fetch(apiUrl('/pos/devices'), {
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Failed to load POS devices');
  return json.data as any[];
}

export async function createPosDevice(token: string, data: { name: string, posId: string }): Promise<any> {
  const res = await fetch(apiUrl('/pos/devices'), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Failed to register device');
  return json.data as any;
}

export async function sendTransfer(
  token: string,
  payload: {
    toWallet: string;
    amount: string;
    mint?: string;
    reference?: string;
    /** WGS-84 latitude in decimal degrees (-90 to 90). */
    latitude?: number;
    /** WGS-84 longitude in decimal degrees (-180 to 180). */
    longitude?: number;
  }
): Promise<any> {
  const res = await fetch(apiUrl('/transfers/send'), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? json.error ?? 'Failed to send transfer');
  return json;
}

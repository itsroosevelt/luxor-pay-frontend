import { apiUrl } from '@/lib/api-client';
import type { PaymentOrder } from '@luxor/contracts';

function apiErrorMessage(json: unknown, fallback: string): string {
  if (!json || typeof json !== 'object') return fallback;
  const body = json as Record<string, unknown>;
  if (typeof body.message === 'string') {
    const generic =
      body.message === 'Internal server error' ||
      body.message === 'Internal Server Error';
    if (!generic) return body.message;
  }
  if (Array.isArray(body.message)) return body.message.join(', ');
  if (typeof body.error === 'string' && body.error !== 'Internal server error') {
    return body.error;
  }
  if (typeof body.details === 'string') return body.details;
  if (typeof body.message === 'string') return body.message;
  return fallback;
}

function normalizePaymentLinkError(message: string): string {
  if (/merchant wallet/i.test(message)) return 'MERCHANT_WALLET_REQUIRED';
  return message;
}

export async function createPaymentFromLink(
  linkId: string,
  options?: { amount?: number },
): Promise<PaymentOrder> {
  const body: { linkId: string; amount?: number } = { linkId };
  if (options?.amount != null) {
    body.amount = options.amount;
  }
  const res = await fetch(apiUrl('/payments/create'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(apiErrorMessage(json, 'Failed to create payment'));
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

export async function createPaymentLink(
  token: string,
  data: { name: string; businessName: string; amount?: number; currency: string },
): Promise<any> {
  const res = await fetch(apiUrl('/payment-links'), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      normalizePaymentLinkError(apiErrorMessage(json, 'Failed to create link')),
    );
  }
  return json.data as any;
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

export async function sendTransfer(token: string, payload: { toWallet: string, amount: string, mint?: string, reference?: string }): Promise<any> {
  const res = await fetch(apiUrl('/transfers/send'), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? json.error ?? 'Failed to send transfer');
  return json;
}

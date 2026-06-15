import { apiUrl } from '@/lib/api-client';
import type { Currency, PaymentLink, PaymentOrder, PosDevice } from '@luxor/contracts';

async function parseJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function errorMessage(json: Record<string, unknown>, fallback: string): string {
  return (
    (typeof json.message === 'string' && json.message) ||
    (typeof json.error === 'string' && json.error) ||
    fallback
  );
}

export async function createPaymentFromLink(linkId: string): Promise<PaymentOrder> {
  const res = await fetch(apiUrl('/payments/create'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ linkId }),
  });
  const json = await parseJson(res);
  if (!res.ok) throw new Error(errorMessage(json, 'Failed to create payment'));
  return json.data as PaymentOrder;
}

export async function fetchPayment(reference: string): Promise<PaymentOrder> {
  const res = await fetch(apiUrl(`/payments/${reference}`));
  const json = await parseJson(res);
  if (!res.ok) throw new Error(errorMessage(json, 'Payment not found'));
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
  const json = await parseJson(res);
  if (!res.ok) throw new Error(errorMessage(json, 'Verification failed'));
  return json as {
    data: PaymentOrder;
    confirmed: boolean;
    signature?: string;
  };
}

export async function listPayments(token: string): Promise<PaymentOrder[]> {
  const res = await fetch(apiUrl('/payments'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseJson(res);
  if (!res.ok) throw new Error(errorMessage(json, 'Failed to load payments'));
  return json.data as PaymentOrder[];
}

export async function fetchPaymentLinkById(id: string, token?: string): Promise<PaymentLink> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(apiUrl(`/payment-links/${id}`), { headers });
  const json = await parseJson(res);
  if (!res.ok) throw new Error(errorMessage(json, 'Payment link not found'));
  return (json.data ?? json) as PaymentLink;
}

export async function listPaymentLinks(token: string): Promise<PaymentLink[]> {
  const res = await fetch(apiUrl('/payment-links'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseJson(res);
  if (!res.ok) throw new Error(errorMessage(json, 'Failed to load links'));
  return json.data as PaymentLink[];
}

export async function createPaymentLink(
  token: string,
  data: { name: string; amount: number; currency: Currency }
): Promise<PaymentLink> {
  const res = await fetch(apiUrl('/payment-links'), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await parseJson(res);
  if (!res.ok) throw new Error(errorMessage(json, 'Failed to create link'));
  return json.data as PaymentLink;
}

export async function listPosDevices(token: string): Promise<PosDevice[]> {
  const res = await fetch(apiUrl('/pos/devices'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseJson(res);
  if (!res.ok) throw new Error(errorMessage(json, 'Failed to load POS devices'));
  return json.data as PosDevice[];
}

export async function createPosDevice(
  token: string,
  data: { name: string; posId: string }
): Promise<PosDevice> {
  const res = await fetch(apiUrl('/pos/devices'), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await parseJson(res);
  if (!res.ok) throw new Error(errorMessage(json, 'Failed to register device'));
  return json.data as PosDevice;
}

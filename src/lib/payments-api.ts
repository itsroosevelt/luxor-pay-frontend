export * from './shared/payments-api';

export async function listPaymentLinks(token: string): Promise<any[]> {
  const res = await fetch(apiUrl('/payment-links'), {
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Failed to load links');
  return json.data as any[];
}

export async function createPaymentLink(token: string, data: { name: string, amount: number, currency: string }): Promise<any> {
  const res = await fetch(apiUrl('/payment-links'), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Failed to create link');
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

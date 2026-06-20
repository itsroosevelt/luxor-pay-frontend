import type { Currency, PaymentOrder } from '@luxor/contracts';

const STORAGE_PREFIX = 'luxor_checkout_payments:';

export type CheckoutPayerInfo = {
  email?: string;
  name?: string;
  company?: string;
  address?: string;
  phone?: string;
};

export type CheckoutPaymentMethod = 'wallet' | 'qr' | 'mock';

export type CheckoutPaymentRecord = {
  reference: string;
  merchantId: string;
  linkId: string;
  linkName: string;
  amount: number;
  currency: Currency;
  recipient: string;
  status: 'confirmed';
  payer?: CheckoutPayerInfo;
  paymentMethod: CheckoutPaymentMethod;
  createdAt: string;
  confirmedAt: string;
};

function storageKey(merchantId: string): string {
  return `${STORAGE_PREFIX}${merchantId}`;
}

function generateReference(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `chk_${hex}`;
}

function loadRecords(merchantId: string): CheckoutPaymentRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(merchantId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CheckoutPaymentRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecords(merchantId: string, records: CheckoutPaymentRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey(merchantId), JSON.stringify(records));
  } catch {
    // Quota or private browsing — non-fatal for demo mode.
  }
}

export function checkoutPaymentToOrder(record: CheckoutPaymentRecord): PaymentOrder {
  const payerLabel =
    record.payer?.name?.trim() ||
    record.payer?.email?.trim() ||
    record.payer?.company?.trim();

  return {
    reference: record.reference,
    merchantId: record.merchantId,
    amount: record.amount,
    currency: record.currency,
    recipient: record.recipient,
    status: 'confirmed',
    label: payerLabel || undefined,
    message: record.linkName,
    linkId: record.linkId,
    createdAt: record.createdAt,
    updatedAt: record.confirmedAt,
    confirmedAt: record.confirmedAt,
    solanaPayUrl: record.paymentMethod === 'qr' ? 'demo' : undefined,
  };
}

export function listCheckoutPaymentRecords(merchantId: string): CheckoutPaymentRecord[] {
  return loadRecords(merchantId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function listCheckoutPayments(merchantId: string): PaymentOrder[] {
  return listCheckoutPaymentRecords(merchantId).map(checkoutPaymentToOrder);
}

/** All checkout payments across every merchant in this browser. */
export function listAllCheckoutPaymentRecords(): CheckoutPaymentRecord[] {
  if (typeof window === 'undefined') return [];

  const records: CheckoutPaymentRecord[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(STORAGE_PREFIX)) continue;
    const merchantId = key.slice(STORAGE_PREFIX.length);
    records.push(...loadRecords(merchantId));
  }

  return records.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function listAllCheckoutPayments(): PaymentOrder[] {
  return listAllCheckoutPaymentRecords().map(checkoutPaymentToOrder);
}

export function getCheckoutPayment(merchantId: string, reference: string): PaymentOrder | null {
  const record = loadRecords(merchantId).find((r) => r.reference === reference);
  return record ? checkoutPaymentToOrder(record) : null;
}

export type SaveCheckoutPaymentInput = {
  merchantId: string;
  linkId: string;
  linkName: string;
  amount: number;
  currency: Currency;
  recipient: string;
  payer?: CheckoutPayerInfo;
  paymentMethod: CheckoutPaymentMethod;
};

export function saveCheckoutPayment(input: SaveCheckoutPaymentInput): CheckoutPaymentRecord {
  const now = new Date().toISOString();
  const record: CheckoutPaymentRecord = {
    reference: generateReference(),
    merchantId: input.merchantId,
    linkId: input.linkId,
    linkName: input.linkName,
    amount: input.amount,
    currency: input.currency,
    recipient: input.recipient,
    status: 'confirmed',
    payer: input.payer,
    paymentMethod: input.paymentMethod,
    createdAt: now,
    confirmedAt: now,
  };

  const records = loadRecords(input.merchantId);
  records.unshift(record);
  saveRecords(input.merchantId, records);
  return record;
}

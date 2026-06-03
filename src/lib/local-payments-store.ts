import { generateId } from '@luxor/contracts';
import type { Currency, PaymentLink, PaymentOrder, PaymentStatus } from '@luxor/contracts';
import { readJson, writeJson } from '@/lib/local-storage-utils';

const MERCHANT_PREFIX = 'luxor-payments:';
const REF_PREFIX = 'luxor-payment-ref:';

/** Auto-confirm pending payments after this delay (demo checkout). */
export const DEMO_AUTO_CONFIRM_MS = 15_000;

function merchantKey(merchantId: string): string {
  return `${MERCHANT_PREFIX}${merchantId}`;
}

function refKey(reference: string): string {
  return `${REF_PREFIX}${reference}`;
}

function readMerchantOrders(merchantId: string): PaymentOrder[] {
  return readJson<PaymentOrder[]>(merchantKey(merchantId), []);
}

function persistOrder(order: PaymentOrder): PaymentOrder {
  const orders = readMerchantOrders(order.merchantId);
  const idx = orders.findIndex((o) => o.reference === order.reference);
  const next = idx >= 0 ? orders.map((o, i) => (i === idx ? order : o)) : [order, ...orders];
  writeJson(merchantKey(order.merchantId), next);
  writeJson(refKey(order.reference), order);
  return order;
}

export function buildSolanaPayUrl(input: {
  recipient: string;
  amount: number;
  currency: Currency;
  reference: string;
  label?: string;
  message?: string;
}): string {
  const params = new URLSearchParams();
  params.set('amount', String(input.amount));
  if (input.currency === 'USDC') {
    params.set('spl-token', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  }
  if (input.label) params.set('label', input.label);
  if (input.message) params.set('message', input.message);
  params.set('reference', input.reference);
  return `solana:${input.recipient}?${params.toString()}`;
}

export function listLocalPayments(merchantId: string): PaymentOrder[] {
  return readMerchantOrders(merchantId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getLocalPayment(reference: string): PaymentOrder | null {
  return readJson<PaymentOrder | null>(refKey(reference), null);
}

export function createLocalPaymentFromLink(link: PaymentLink): PaymentOrder {
  const now = new Date().toISOString();
  const reference = generateId('ref_');
  const order: PaymentOrder = {
    reference,
    merchantId: link.merchantId,
    amount: link.amount,
    currency: link.currency,
    recipient: link.merchantWallet,
    status: 'pending',
    label: link.name,
    linkId: link.id,
    solanaPayUrl: buildSolanaPayUrl({
      recipient: link.merchantWallet,
      amount: link.amount,
      currency: link.currency,
      reference,
      label: link.name,
    }),
    createdAt: now,
    updatedAt: now,
  };
  return persistOrder(order);
}

function mockSignature(reference: string): string {
  return `demo_${reference.replace(/[^a-zA-Z0-9]/g, '').slice(0, 32)}`;
}

export function maybeAutoConfirm(order: PaymentOrder): PaymentOrder {
  if (order.status !== 'pending') return order;
  const age = Date.now() - new Date(order.createdAt).getTime();
  if (age < DEMO_AUTO_CONFIRM_MS) return order;

  const confirmed: PaymentOrder = {
    ...order,
    status: 'confirmed' as PaymentStatus,
    signature: mockSignature(order.reference),
    confirmedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return persistOrder(confirmed);
}

export function verifyLocalPayment(reference: string): {
  data: PaymentOrder;
  confirmed: boolean;
  signature?: string;
} {
  const existing = getLocalPayment(reference);
  if (!existing) throw new Error('Payment not found');

  const order = maybeAutoConfirm(existing);
  return {
    data: order,
    confirmed: order.status === 'confirmed',
    signature: order.signature,
  };
}

export function confirmLocalPayment(reference: string): PaymentOrder {
  const existing = getLocalPayment(reference);
  if (!existing) throw new Error('Payment not found');
  if (existing.status === 'confirmed') return existing;

  return persistOrder({
    ...existing,
    status: 'confirmed',
    signature: mockSignature(reference),
    confirmedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

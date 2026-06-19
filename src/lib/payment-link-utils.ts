import type { Currency, PaymentLink } from '@luxor/contracts';

const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generatePaymentLinkSlug(length = 22): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => SLUG_CHARS[b % SLUG_CHARS.length]).join('');
}

export function getPaymentLinkPublicPath(link: Pick<PaymentLink, 'slug' | 'id'>): string {
  return `/pay/${link.slug ?? link.id}`;
}

export function getPaymentLinkPublicUrl(
  link: Pick<PaymentLink, 'slug' | 'id'>,
  origin?: string
): string {
  const path = getPaymentLinkPublicPath(link);
  if (origin) return `${origin.replace(/\/$/, '')}${path}`;
  if (typeof window !== 'undefined') return `${window.location.origin}${path}`;
  return path;
}

export type CheckoutLineItem = {
  name: string;
  unitPrice: number;
  quantity: number;
  description?: string;
};

export type CheckoutTotals = {
  subtotal: number;
  tax: number;
  total: number;
};

export function computeCheckoutTotals(
  lineItems: CheckoutLineItem[],
  options: { collectTaxes?: boolean; taxIncluded?: boolean; taxRate?: number }
): CheckoutTotals {
  const subtotal = lineItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const rate = options.collectTaxes ? (options.taxRate ?? 0.1) : 0;

  if (!options.collectTaxes || rate <= 0) {
    return { subtotal, tax: 0, total: subtotal };
  }

  if (options.taxIncluded) {
    const total = subtotal;
    const tax = total - total / (1 + rate);
    return { subtotal: total - tax, tax, total };
  }

  const tax = subtotal * rate;
  return { subtotal, tax, total: subtotal + tax };
}

export function formatCheckoutAmount(amount: number, currency: Currency): string {
  return amount.toFixed(currency === 'SOL' ? 4 : 2);
}

export function paymentLinkToLineItems(link: PaymentLink): CheckoutLineItem[] {
  const unitPrice = Number(link.amount);
  const quantity = link.quantity ?? 1;
  return [
    {
      name: link.name,
      unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
      quantity: quantity > 0 ? quantity : 1,
    },
  ];
}

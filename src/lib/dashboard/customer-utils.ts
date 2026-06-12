import type { Currency, Customer, PaymentOrder } from '@luxor/contracts';
import { filterPaymentsForCustomer } from '@/lib/payment-detail-utils';
import { formatPaymentAmount } from '@/lib/transaction-utils';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type CustomerTab =
  | 'all'
  | 'top'
  | 'new'
  | 'high-refunds'
  | 'high-disputes'
  | 'remaining-balances';

export const STUB_CUSTOMER_TABS: CustomerTab[] = [
  'high-refunds',
  'high-disputes',
  'remaining-balances',
];

export function isStubCustomerTab(tab: CustomerTab): boolean {
  return STUB_CUSTOMER_TABS.includes(tab);
}

export function filterCustomersByTab(customers: Customer[], tab: CustomerTab): Customer[] {
  const now = Date.now();
  switch (tab) {
    case 'top':
      return [...customers].sort((a, b) => (b.paymentCount ?? 0) - (a.paymentCount ?? 0));
    case 'new':
      return customers.filter((c) => now - new Date(c.createdAt).getTime() < THIRTY_DAYS_MS);
    case 'high-refunds':
    case 'high-disputes':
    case 'remaining-balances':
      return customers;
    default:
      return customers;
  }
}

export function customerDescription(customer: Customer): string {
  if (customer.type === 'guest') {
    if (customer.walletAddress) return `Guest · ${shortenWallet(customer.walletAddress)}`;
    return 'Guest payer via Solana wallet';
  }
  if (customer.walletAddress) return shortenWallet(customer.walletAddress);
  if (customer.email?.trim()) return `Customer for ${customer.email.trim()}`;
  return '—';
}

export function computeCustomerTotalSpend(
  customer: Customer,
  payments: PaymentOrder[]
): { amount: number; currency: Currency } {
  const confirmed = filterPaymentsForCustomer(payments, customer).filter(
    (o) => o.status === 'confirmed'
  );
  const preferred = customer.preferredToken ?? 'USDC';
  const amount = confirmed
    .filter((o) => o.currency === preferred)
    .reduce((sum, o) => sum + o.amount, 0);
  return { amount, currency: preferred };
}

export function formatCustomerTotalSpend(customer: Customer, payments: PaymentOrder[]): string {
  const { amount, currency } = computeCustomerTotalSpend(customer, payments);
  if (amount === 0) return `0.00 ${currency}`;
  return formatPaymentAmount(amount, currency);
}

export function matchesCustomerSearch(customer: Customer, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (customer.name.toLowerCase().includes(q)) return true;
  if (customer.email?.toLowerCase().includes(q)) return true;
  if (customer.walletAddress?.toLowerCase().includes(q)) return true;
  if (customer.countryCode?.toLowerCase().includes(q)) return true;
  if (customer.id.toLowerCase().includes(q)) return true;
  return false;
}

export function countryFlag(code?: string): string {
  if (!code || code.length !== 2) return '—';
  const upper = code.toUpperCase();
  const points = [...upper].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...points);
}

export function shortenWallet(address?: string): string {
  if (!address) return '—';
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function formatCustomerCreatedDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

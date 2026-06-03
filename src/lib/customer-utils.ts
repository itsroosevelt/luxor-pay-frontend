import type { Customer } from '@luxor/contracts';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type CustomerTab = 'all' | 'top' | 'new' | 'recurring' | 'recent';

export function filterCustomersByTab(customers: Customer[], tab: CustomerTab): Customer[] {
  const now = Date.now();
  switch (tab) {
    case 'top':
      return customers.filter((c) => (c.paymentCount ?? 0) >= 3);
    case 'new':
      return customers.filter((c) => now - new Date(c.createdAt).getTime() < THIRTY_DAYS_MS);
    case 'recurring':
      return customers.filter((c) => (c.paymentCount ?? 0) >= 2);
    case 'recent':
      return [...customers].sort((a, b) => {
        const aTime = new Date(a.lastPaymentAt ?? a.createdAt).getTime();
        const bTime = new Date(b.lastPaymentAt ?? b.createdAt).getTime();
        return bTime - aTime;
      });
    default:
      return customers;
  }
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

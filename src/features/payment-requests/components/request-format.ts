import { Clock, CheckCircle2, XCircle, Ban } from 'lucide-react';

export function shortenWallet(addr: string) {
  if (!addr) return '—';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function formatAmount(amount: string, mint: string, network: 'mainnet-beta' | 'devnet', getTokenSymbol: (mint: string | null | undefined) => string | null) {
  const symbol = getTokenSymbol(mint) || 'SPL';
  return `${amount} ${symbol}`;
}

export function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.12)', border: 'rgba(251, 191, 36, 0.3)', Icon: Clock },
  PAID:    { label: 'Paid',    color: '#34D399', bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.3)', Icon: CheckCircle2 },
  EXPIRED: { label: 'Expired', color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.1)', border: 'rgba(156, 163, 175, 0.2)', Icon: XCircle },
  CANCELLED:{ label: 'Cancelled',color:'#F87171', bg: 'rgba(248, 113, 113, 0.12)', border: 'rgba(248, 113, 113, 0.3)', Icon: Ban },
} as const;

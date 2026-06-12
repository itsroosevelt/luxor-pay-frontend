import type { LucideIcon } from 'lucide-react';
import {
  ArrowRightLeft,
  FileText,
  Link as LinkIcon,
  QrCode,
  Repeat,
  Smartphone,
} from 'lucide-react';

export type CreatePaymentOption = {
  id: string;
  title: string;
  /** Shorter label for the header quick-create menu */
  headerTitle?: string;
  description: string;
  href: string;
  icon: LucideIcon;
  shortcut: string;
};

export const CREATE_PAYMENT_OPTIONS: CreatePaymentOption[] = [
  {
    id: 'invoice',
    title: 'On-chain invoice',
    description: 'Send a one-time SOL or USDC invoice settled via Solana Pay.',
    href: '/dashboard/billing/invoices/create',
    icon: FileText,
    shortcut: 'ci',
  },
  {
    id: 'payment-link',
    title: 'Solana Pay link',
    description: 'Create a shareable checkout URL for one-time SOL or USDC payments.',
    href: '/dashboard/links/create',
    icon: LinkIcon,
    shortcut: 'cl',
  },
  {
    id: 'solana-pay-qr',
    title: 'Solana Pay QR',
    headerTitle: 'Solana Pay QR',
    description: 'Generate a QR code to display, print, or show on a POS screen.',
    href: '/dashboard/qr',
    icon: QrCode,
    shortcut: 'cq',
  },
  {
    id: 'subscription',
    title: 'Wallet subscription',
    description: 'Set up recurring USDC or SOL billing from a connected Solana wallet.',
    href: '/dashboard/billing/subscriptions/create',
    icon: Repeat,
    shortcut: 'cs',
  },
  {
    id: 'manual-payment',
    title: 'Create payment',
    headerTitle: 'Payment',
    description: 'Record a manual one-time or recurring SOL or USDC payment.',
    href: '/dashboard/payments/create',
    icon: Smartphone,
    shortcut: 'cp',
  },
];

export const HEADER_TRANSFER_OPTION: CreatePaymentOption = {
  id: 'transfer',
  title: 'Transfer',
  description: 'Send funds from your available balance to a Solana wallet.',
  href: '/dashboard/balances/transfers/create',
  icon: ArrowRightLeft,
  shortcut: 'co',
};

/** Header quick-create order; transfer is header-only */
export const HEADER_CREATE_OPTIONS: CreatePaymentOption[] = [
  CREATE_PAYMENT_OPTIONS[0],
  CREATE_PAYMENT_OPTIONS[3],
  CREATE_PAYMENT_OPTIONS[1],
  CREATE_PAYMENT_OPTIONS[2],
  CREATE_PAYMENT_OPTIONS[4],
  HEADER_TRANSFER_OPTION,
];

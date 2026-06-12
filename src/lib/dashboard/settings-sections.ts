import type { LucideIcon } from 'lucide-react';
import {
  User,
  Mail,
  Code,
  Building2,
  Users,
  CreditCard,
  FileCheck,
  FileText,
  Receipt,
  BarChart3,
  Wallet,
  Shield,
} from 'lucide-react';

export interface SettingsTileConfig {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface SettingsSectionConfig {
  id: string;
  title: string;
  tiles: SettingsTileConfig[];
}

export const SETTINGS_SECTIONS: SettingsSectionConfig[] = [
  {
    id: 'personal',
    title: 'Personal settings',
    tiles: [
      {
        href: '/dashboard/settings/profile',
        title: 'Personal details',
        description: 'Name, email, phone number, and authentication.',
        icon: User,
      },
      {
        href: '/dashboard/settings/communication',
        title: 'Communication preferences',
        description: 'Emails, SMS, push notifications, and language.',
        icon: Mail,
      },
      {
        href: '/dashboard/developers',
        title: 'Developers',
        description: 'API keys, webhooks, and developer tools.',
        icon: Code,
      },
    ],
  },
  {
    id: 'account',
    title: 'Account settings',
    tiles: [
      {
        href: '/dashboard/settings/empresa',
        title: 'Business',
        description: 'Account details, company information, and tax data.',
        icon: Building2,
      },
      {
        href: '/dashboard/settings/equipo',
        title: 'Team & security',
        description: 'Team members, roles, permissions, and security.',
        icon: Users,
      },
      {
        href: '/dashboard/settings/planes',
        title: 'Plans & fees',
        description: 'Membership, pricing, billing history, and invoices.',
        icon: CreditCard,
      },
      {
        href: '/dashboard/settings/cumplimiento',
        title: 'Compliance & documents',
        description: 'Verification documents, policies, and regulatory requirements.',
        icon: FileCheck,
      },
    ],
  },
  {
    id: 'product',
    title: 'Product settings',
    tiles: [
      {
        href: '/dashboard/billing',
        title: 'Billing',
        description: 'Invoices, subscriptions, quotes, and pending payments.',
        icon: FileText,
      },
      {
        href: '/dashboard/tax',
        title: 'Tax',
        description: 'Tax rates, registrations, and reporting settings.',
        icon: Receipt,
      },
      {
        href: '/dashboard/reporting/sigma',
        title: 'Sigma',
        description: 'Custom SQL-style reporting for finance and operations.',
        icon: BarChart3,
      },
      {
        href: '/dashboard/settings/radar',
        title: 'Radar',
        description: 'Fraud detection, risk rules, and payment screening on Solana.',
        icon: Shield,
      },
      {
        href: '/dashboard/settings/managed-payments',
        title: 'Managed payments',
        description: 'Solana wallets and merchant payout configuration.',
        icon: Wallet,
      },
      {
        href: '/dashboard/payments/checkout',
        title: 'Payments',
        description: 'Checkout, Solana payment methods, and settlement preferences.',
        icon: CreditCard,
      },
    ],
  },
];

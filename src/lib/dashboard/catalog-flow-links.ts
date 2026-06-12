import {
  Clock,
  Link as LinkIcon,
  Package,
  Percent,
  type LucideIcon,
} from 'lucide-react';

export interface CatalogFlowLink {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Cross-links for the catalog flow: tax → products → payment links → revenue recovery */
export const CATALOG_FLOW_LINKS: CatalogFlowLink[] = [
  {
    href: '/dashboard/tax',
    icon: Percent,
    title: 'Solana tax settings',
    description: 'Default tax behavior for SOL and USDC catalog prices and checkout links.',
  },
  {
    href: '/dashboard/products',
    icon: Package,
    title: 'Product catalog',
    description: 'Products priced in USDC or SOL — source for Solana Pay links.',
  },
  {
    href: '/dashboard/links',
    icon: LinkIcon,
    title: 'Solana Pay links',
    description: 'Shareable checkout URLs with wallet connect or QR payment.',
  },
  {
    href: '/dashboard/billing/pending',
    icon: Clock,
    title: 'Revenue recovery',
    description: 'Follow up on unpaid on-chain invoices and incomplete Solana Pay checkouts.',
  },
];

export const CATALOG_FLOW_NAV_TABS = [
  { href: '/dashboard/tax', label: 'Tax' },
  { href: '/dashboard/products', label: 'Product catalog' },
  { href: '/dashboard/links', label: 'Payment links' },
] as const;

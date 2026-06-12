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
    title: 'Tax settings',
    description: 'Default tax rates applied to catalog prices and checkout links.',
  },
  {
    href: '/dashboard/products',
    icon: Package,
    title: 'Product catalog',
    description: 'Products with name, price, and status — source for payment links.',
  },
  {
    href: '/dashboard/links',
    icon: LinkIcon,
    title: 'Payment links',
    description: 'Shareable checkout URLs created from catalog products.',
  },
  {
    href: '/dashboard/billing/pending',
    icon: Clock,
    title: 'Revenue recovery',
    description: 'Pending charges, reminders, and delinquent payments to recover revenue.',
  },
];

export const CATALOG_FLOW_NAV_TABS = [
  { href: '/dashboard/tax', label: 'Tax' },
  { href: '/dashboard/products', label: 'Product catalog' },
  { href: '/dashboard/links', label: 'Payment links' },
] as const;

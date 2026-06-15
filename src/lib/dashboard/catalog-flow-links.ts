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
    description:
      'Shareable checkout URLs — your customer can pay with wallet, scan QR, or card (coming soon).',
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

/** Canonical create URL; prefill from a catalog product when provided. */
export function buildPaymentLinkCreateHref(product?: {
  id?: string;
  name: string;
  price: number;
  currency: string;
  description?: string;
}): string {
  if (!product) return '/dashboard/links/create';
  const params = new URLSearchParams({
    name: product.name,
    amount: String(product.price),
    currency: product.currency,
  });
  if (product.id) params.set('productId', product.id);
  if (product.description) params.set('description', product.description);
  return `/dashboard/links/create?${params.toString()}`;
}

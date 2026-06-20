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
    title: 'Ajustes de impuestos',
    description: 'Comportamiento fiscal por defecto para precios de catálogo en SOL y USDC y enlaces de checkout.',
  },
  {
    href: '/dashboard/products',
    icon: Package,
    title: 'Catálogo de productos',
    description: 'Productos con precios en USDC o SOL — origen para los enlaces de pago.',
  },
  {
    href: '/dashboard/links',
    icon: LinkIcon,
    title: 'Enlaces de pago de Solana',
    description:
      'Comparte URLs de checkout — tu cliente puede pagar con wallet, QR de Solana Pay o tarjeta (próximamente).',
  },
  {
    href: '/dashboard/billing/pending',
    icon: Clock,
    title: 'Recuperación de ingresos',
    description: 'Seguimiento de facturas on-chain impagas y checkouts incompletos de Solana Pay.',
  },
];

export const CATALOG_FLOW_NAV_TABS = [
  { href: '/dashboard/tax', label: 'Impuestos' },
  { href: '/dashboard/products', label: 'Catálogo de productos' },
  { href: '/dashboard/links', label: 'Enlaces de pago' },
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

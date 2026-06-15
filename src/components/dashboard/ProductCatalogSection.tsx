'use client';

import Link from 'next/link';
import { ArrowRight, Link as LinkIcon, ShoppingCart, Terminal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface EnabledProduct {
  id: string;
  label: string;
  href: string;
}

interface CatalogProduct {
  id: string;
  label: string;
  description: string;
  href: string;
  learnMoreHref: string;
  icon: LucideIcon;
}

const AVAILABLE_PRODUCTS: CatalogProduct[] = [
  {
    id: 'sell',
    label: 'Sell',
    description: 'Accept payments with Terminal, payment links, and Solana Pay checkout.',
    href: '/dashboard/payments/sell',
    learnMoreHref: '/dashboard/payments/sell',
    icon: ShoppingCart,
  },
  {
    id: 'terminal',
    label: 'Terminal',
    description: 'Accept in-person payments with registered POS devices and the charges API.',
    href: '/dashboard/pos',
    learnMoreHref: '/dashboard/pos',
    icon: Terminal,
  },
  {
    id: 'payment-links',
    label: 'Payment links',
    description:
      'Share checkout URLs with wallet, Solana Pay QR, and card (coming soon) — no separate QR needed.',
    href: '/dashboard/links',
    learnMoreHref: '/dashboard/links',
    icon: LinkIcon,
  },
];

function ProductCard({ product }: { product: CatalogProduct }) {
  const Icon = product.icon;

  return (
    <div className="dash-card p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-md bg-[var(--dash-accent-soft)] flex items-center justify-center text-[var(--dash-accent)] shrink-0">
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[var(--dash-text)]">{product.label}</h3>
          <p className="text-xs text-[var(--dash-muted)] mt-1 leading-relaxed">{product.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <Link
          href={product.href}
          className="inline-flex items-center gap-1 font-medium text-[var(--dash-accent)] hover:underline"
        >
          Open
          <ArrowRight size={12} />
        </Link>
        <Link href={product.learnMoreHref} className="text-[var(--dash-muted)] hover:text-[var(--dash-text)]">
          Learn more
        </Link>
      </div>
    </div>
  );
}

interface ProductCatalogSectionProps {
  enabled?: EnabledProduct[];
}

export function ProductCatalogSection({ enabled = [] }: ProductCatalogSectionProps) {
  const enabledIds = new Set(enabled.map((p) => p.id));
  const products = AVAILABLE_PRODUCTS.filter((p) => !enabledIds.has(p.id));

  if (products.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-semibold text-[var(--dash-text)] mb-3">Available products</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

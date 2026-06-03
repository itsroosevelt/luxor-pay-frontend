'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Fingerprint,
  Link as LinkIcon,
  Network,
  Terminal,
} from 'lucide-react';
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
    id: 'terminal',
    label: 'Terminal',
    description:
      'Accept in-person Solana Pay payments with registered POS devices and the charge API.',
    href: '/dashboard/pos',
    learnMoreHref: '/dashboard/developers',
    icon: Terminal,
  },
  {
    id: 'payment-links',
    label: 'Payment Links',
    description: 'Share checkout URLs that accept SOL and USDC — no code required.',
    href: '/dashboard/links',
    learnMoreHref: '/dashboard/links',
    icon: LinkIcon,
  },
  {
    id: 'connect',
    label: 'Connect',
    description: 'Platform accounts for marketplaces — route split SOL/USDC payouts on Solana.',
    href: '/dashboard/connect',
    learnMoreHref: '/dashboard/connect',
    icon: Network,
  },
  {
    id: 'identity',
    label: 'Identity',
    description: 'KYC and wallet ownership verification for high-trust merchant flows.',
    href: '/dashboard/identity',
    learnMoreHref: '/dashboard/identity',
    icon: Fingerprint,
  },
  {
    id: 'sigma',
    label: 'Sigma',
    description: 'SQL-style reporting and analytics over your payment data.',
    href: '/dashboard/reporting/sigma',
    learnMoreHref: '/dashboard/reporting/sigma',
    icon: BarChart3,
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
        <div className="min-w-0">
          <p className="font-semibold text-[var(--dash-text)]">{product.label}</p>
          <p className="text-sm text-[var(--dash-muted)] mt-1 leading-relaxed">{product.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-auto">
        <Link href={product.href} className="dash-btn-primary px-4 py-1.5 text-sm">
          Enable
        </Link>
        <Link href={product.learnMoreHref} className="dash-btn-secondary px-4 py-1.5 text-sm">
          Learn more
        </Link>
      </div>
    </div>
  );
}

function EnabledProductRow({ product }: { product: EnabledProduct }) {
  return (
    <Link
      href={product.href}
      className="flex items-center justify-between gap-3 py-2.5 px-1 -mx-1 rounded-md hover:bg-white/5 transition-colors group"
    >
      <span className="text-sm font-medium text-[var(--dash-text)]">{product.label}</span>
      <ArrowRight
        size={14}
        className="text-[var(--dash-muted)] group-hover:text-[var(--dash-accent)] transition-colors shrink-0"
      />
    </Link>
  );
}

interface ProductCatalogSectionProps {
  enabledProducts: EnabledProduct[];
  loading?: boolean;
}

export function ProductCatalogSection({ enabledProducts, loading }: ProductCatalogSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-[var(--dash-text)]">Available products</h2>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {AVAILABLE_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="dash-card p-5 h-fit">
          <h3 className="text-sm font-semibold text-[var(--dash-text)] mb-3">Your products</h3>
          {loading ? (
            <p className="text-sm text-[var(--dash-muted)]">Loading…</p>
          ) : enabledProducts.length === 0 ? (
            <p className="text-sm text-[var(--dash-muted)] leading-relaxed">
              Enable a product above to start accepting Solana payments.
            </p>
          ) : (
            <div className="divide-y divide-[var(--dash-border)]">
              {enabledProducts.map((product) => (
                <EnabledProductRow key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

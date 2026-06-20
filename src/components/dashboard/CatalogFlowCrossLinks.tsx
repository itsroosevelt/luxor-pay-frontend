'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CATALOG_FLOW_LINKS } from '@/lib/dashboard/catalog-flow-links';

interface CatalogFlowCrossLinksProps {
  /** Hide the card for the current page */
  excludeHref?: string;
  title?: string;
}

export function CatalogFlowCrossLinks({
  excludeHref,
  title = 'Related pages',
}: CatalogFlowCrossLinksProps) {
  const links = excludeHref
    ? CATALOG_FLOW_LINKS.filter((link) => link.href !== excludeHref)
    : CATALOG_FLOW_LINKS;

  if (links.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-semibold text-[var(--dash-text)] mb-3">{title}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map(({ href, icon: Icon, title: linkTitle, description }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 hover:bg-[var(--dash-surface-elevated)] transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]">
                <Icon size={20} />
              </div>
              <ArrowRight
                size={16}
                className="text-[var(--dash-muted)] group-hover:text-[var(--dash-accent)] transition-colors shrink-0 mt-1"
              />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-[var(--dash-text)]">{linkTitle}</h3>
            <p className="mt-1 text-xs text-[var(--dash-muted)] leading-relaxed">{description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { CATALOG_FLOW_NAV_TABS } from '@/lib/dashboard/catalog-flow-links';

function isTabActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CatalogFlowSectionNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 border-b border-[var(--dash-border)]">
      {CATALOG_FLOW_NAV_TABS.map(({ href, label }) => {
        const active = isTabActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
              active
                ? 'border-[var(--dash-accent)] text-[var(--dash-accent)]'
                : 'border-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]'
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

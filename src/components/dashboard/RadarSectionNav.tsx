'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const TABS = [
  { href: '/dashboard/settings/radar', label: 'Overview' },
  { href: '/dashboard/settings/radar/rules', label: 'Rules' },
  { href: '/dashboard/settings/radar/lists', label: 'Lists' },
  { href: '/dashboard/settings/radar/risk-controls', label: 'Risk controls' },
] as const;

function isTabActive(pathname: string, href: string) {
  if (href === '/dashboard/settings/radar') {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function RadarSectionNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 border-b border-[var(--dash-border)]">
      {TABS.map(({ href, label }) => {
        const active = isTabActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
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

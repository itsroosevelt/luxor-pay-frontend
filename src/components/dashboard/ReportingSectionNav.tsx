'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const TABS = [
  { href: '/dashboard/reporting', label: 'Reports' },
  { href: '/dashboard/reporting/custom-metrics', label: 'Custom metrics' },
  { href: '/dashboard/reporting/sigma', label: 'Sigma' },
  { href: '/dashboard/reporting/revenue-recognition', label: 'Revenue recognition' },
  { href: '/dashboard/reporting/data-management', label: 'Data management' },
] as const;

function isTabActive(pathname: string, href: string) {
  if (href === '/dashboard/reporting') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ReportingSectionNav() {
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

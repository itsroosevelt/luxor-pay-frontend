'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const TABS = [
  { href: '/dashboard/billing', label: 'Overview' },
  { href: '/dashboard/billing/invoices', label: 'Invoices' },
  { href: '/dashboard/customers', label: 'Customers' },
  { href: '/dashboard/billing/subscriptions', label: 'Subscriptions' },
  { href: '/dashboard/billing/quotes', label: 'Quotes' },
  { href: '/dashboard/billing/pending', label: 'Revenue recovery' },
] as const;

function isTabActive(pathname: string, href: string) {
  if (href === '/dashboard/billing') return pathname === href;
  if (href === '/dashboard/customers') {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BillingSectionNav() {
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

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const PRIMARY_TABS = [
  { href: '/dashboard/payments/checkout', label: 'Checkout & payment links' },
  { href: '/dashboard/payments/methods', label: 'Payment methods' },
  { href: '/dashboard/payments/domains', label: 'Payment method domains' },
] as const;

const MORE_ITEMS = [
  { id: 'links', label: 'Payment links' },
  { id: 'plans', label: 'Payment plans' },
] as const;

function isTabActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isMoreActive(pathname: string) {
  return MORE_ITEMS.some(
    (item) =>
      pathname === `/dashboard/payments/${item.id}` ||
      pathname.startsWith(`/dashboard/payments/${item.id}/`)
  );
}

export function PaymentsSectionNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreActive = isMoreActive(pathname);
  const moreLabel =
    MORE_ITEMS.find(
      (item) =>
        pathname === `/dashboard/payments/${item.id}` ||
        pathname.startsWith(`/dashboard/payments/${item.id}/`)
    )?.label ?? 'More';

  useEffect(() => {
    if (!moreOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [moreOpen]);

  return (
    <nav className="flex flex-wrap items-end gap-1 border-b border-[var(--dash-border)]">
      {PRIMARY_TABS.map(({ href, label }) => {
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
      <div ref={moreRef} className="relative -mb-px pb-px">
        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          aria-expanded={moreOpen}
          aria-haspopup="menu"
          className={cn(
            'inline-flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors border-b-2',
            moreActive
              ? 'border-[var(--dash-accent)] text-[var(--dash-accent)]'
              : 'border-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]'
          )}
        >
          {moreActive ? moreLabel : 'More'}
          <ChevronDown size={14} className={cn('transition-transform', moreOpen && 'rotate-180')} />
        </button>
        {moreOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full z-20 mt-1 min-w-[200px] dash-card py-1 shadow-lg"
          >
            {MORE_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/payments/${item.id}`}
                role="menuitem"
                onClick={() => setMoreOpen(false)}
                className={cn(
                  'block w-full text-left px-4 py-2 text-sm transition-colors',
                  pathname.startsWith(`/dashboard/payments/${item.id}`)
                    ? 'text-[var(--dash-accent)] bg-[var(--dash-accent-soft)]'
                    : 'text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)]'
                )}
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMoreOpen(false);
                toast.message('Advanced payment settings — coming soon');
              }}
              className="w-full text-left px-4 py-2 text-sm text-[var(--dash-muted)] hover:bg-[var(--dash-surface-elevated)] transition-colors"
            >
              Advanced settings
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

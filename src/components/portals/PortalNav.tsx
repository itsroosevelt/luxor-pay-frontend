'use client';

/**
 * PortalNav — left-hand navigation rail for satellite portals in Luxor Pay.
 * Features workspace selector, section groupings, shortcut badges, and
 * collapsible product groups matching the enterprise Stripe/Luxor design.
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { clsx } from 'clsx';
import {
  LogOut,
  Plus,
  ArrowLeft,
  ChevronDown,
  Clock,
  type Rocket,
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import type { PortalTarget } from '@/lib/portal-sso';

export interface PortalNavLeaf {
  href: string;
  label: string;
  icon?: typeof Rocket;
  external?: boolean;
}

export type PortalNavItem =
  | {
      kind?: 'link';
      href: string;
      label: string;
      icon: typeof Rocket;
      external?: boolean;
      shortcutIcon?: boolean;
    }
  | {
      kind: 'group';
      id: string;
      label: string;
      icon: typeof Rocket;
      children: PortalNavLeaf[];
    };

export interface PortalNavSection {
  title?: string;
  items: PortalNavItem[];
}

export function PortalNav({
  items,
  sections,
  current,
  portalName,
  ctaLabel,
  ctaHref,
  merchantName = 'Udreamms LLC',
}: {
  items?: PortalNavItem[];
  sections?: PortalNavSection[];
  current: PortalTarget['key'];
  portalName: string;
  ctaLabel?: string;
  ctaHref?: string;
  merchantName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    payments: true,
  });

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const effectiveSections: PortalNavSection[] = sections
    ? sections
    : items
    ? [{ items }]
    : [];

  const isLeafActive = (href: string) => {
    const [path] = href.split('?');
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <aside
      className="hidden h-full w-[200px] flex-shrink-0 flex-col md:flex"
      style={{ borderRight: '1px solid var(--lx-border)', background: 'var(--lx-bg-elev)' }}
    >
      {/* 1. Workspace Header Selector (Stripe Style) */}
      <div
        className="flex items-center justify-between gap-2 px-3 pt-3.5 pb-2.5 cursor-pointer hover:bg-white/[0.03] transition-colors"
        style={{ borderBottom: '1px solid var(--lx-border)' }}
        title="Workspace active: Udreamms LLC"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10 text-[10px] font-bold text-white shadow-inner border border-white/10">
            {merchantName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-[12px] font-semibold text-white tracking-tight flex items-center gap-1">
              <span className="truncate">{merchantName}</span>
              <ChevronDown size={12} className="text-gray-400 shrink-0" />
            </span>
          </div>
        </div>
      </div>

      {/* Portal Category Identifier */}
      <div className="flex items-center justify-between px-3 pt-2 pb-0.5">
        <p className="truncate text-[9.5px] font-bold uppercase tracking-widest text-gray-500">
          {portalName}
        </p>
      </div>

      <nav className="mt-1 flex-1 space-y-2 overflow-y-auto px-2 pb-2.5 scrollbar-thin">
        {/* Main Dashboard Return Button */}
        <Link
          href="/dashboard"
          className="mb-1 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-gray-300 transition-all hover:bg-white/[0.08] hover:text-white"
          title="Return to Main Dashboard"
        >
          <ArrowLeft size={13} className="shrink-0 text-gray-400" />
          <span className="truncate">Main Dashboard</span>
        </Link>

        {ctaHref && ctaLabel && (
          <Link
            href={ctaHref}
            className="mb-1.5 flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11.5px] font-semibold transition-transform hover:scale-[1.02]"
            style={{ background: '#FFFFFF', color: '#000000' }}
          >
            <Plus size={14} /> {ctaLabel}
          </Link>
        )}

        {/* Sections list */}
        {effectiveSections.map((sec, idx) => (
          <div key={sec.title || idx} className="space-y-0.5">
            {sec.title && (
              <p className="px-2 pt-1.5 pb-0.5 text-[9.5px] font-bold uppercase tracking-widest text-gray-500">
                {sec.title}
              </p>
            )}
            <div className="space-y-0.5">
              {sec.items.map((item, itemIdx) => {
                if (item.kind === 'group') {
                  const hasActiveChild = item.children.some((c) => isLeafActive(c.href));
                  const isOpen = openGroups[item.id] ?? hasActiveChild;
                  const Icon = item.icon;

                  return (
                    <div key={item.id || itemIdx}>
                      <button
                        type="button"
                        onClick={() => toggleGroup(item.id)}
                        className={clsx(
                          'flex w-full items-center justify-between rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors',
                          hasActiveChild ? 'text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon size={14} className={clsx('shrink-0', hasActiveChild ? 'text-white' : 'text-gray-400')} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <ChevronDown
                          size={12}
                          className={clsx('shrink-0 text-gray-500 transition-transform duration-200', isOpen && 'rotate-180')}
                        />
                      </button>

                      {isOpen && (
                        <div className="mt-0.5 ml-3 flex flex-col gap-0.5 border-l border-white/10 pl-2">
                          {item.children.map((child) => {
                            const active = isLeafActive(child.href);
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={clsx(
                                  'rounded-md px-2 py-0.5 text-[10.5px] font-medium transition-colors truncate',
                                  active
                                    ? 'bg-white/[0.1] text-white font-semibold shadow-xs'
                                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                                )}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Normal Link or Shortcut
                const active = isLeafActive(item.href);
                const Icon = item.icon || Clock;
                const className = clsx(
                  'group flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-all duration-200',
                  active
                    ? 'border-white/20 bg-white/[0.08] font-semibold text-white shadow-sm'
                    : 'border-transparent text-gray-400 hover:bg-white/[0.05] hover:text-white'
                );

                const content = (
                  <>
                    <Icon
                      size={14}
                      className={clsx(
                        'shrink-0 transition-colors',
                        active ? 'text-white' : 'text-gray-400 group-hover:text-white'
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </>
                );

                return item.external ? (
                  <a key={item.href} href={item.href} className={className}>
                    {content}
                  </a>
                ) : (
                  <Link key={item.href} href={item.href} className={className} aria-current={active ? 'page' : undefined}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 py-2" style={{ borderTop: '1px solid var(--lx-border)' }}>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-full px-2.5 py-1 text-[11.5px] font-medium text-gray-400 transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          <LogOut size={14} className="shrink-0" /> Sign out
        </button>
      </div>
    </aside>
  );
}


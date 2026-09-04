'use client';

/**
 * PortalNav — the left-hand menu each satellite portal gets, visually
 * matching the main dashboard's <Sidebar> (same rounded-pill active state,
 * same brand header, same footer treatment) so a portal reads as "the same
 * product family", just with its own set of pages instead of the main
 * dashboard's nav items.
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { clsx } from 'clsx';
import { LogOut, Plus, ArrowLeft, type Rocket } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { PortalSwitcher } from '@/components/dashboard/PortalSwitcher';
import type { PortalTarget } from '@/lib/portal-sso';

const LOGO_SRC =
  'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b';

export interface PortalNavItem {
  href: string;
  label: string;
  /** Any lucide-react icon component. */
  icon: typeof Rocket;
  /** Opens as a plain link (e.g. mailto:) instead of client-side routing. */
  external?: boolean;
}

export function PortalNav({
  items,
  current,
  portalName,
  ctaLabel,
  ctaHref,
}: {
  items: PortalNavItem[];
  current: PortalTarget['key'];
  portalName: string;
  /** Optional standout CTA rendered above the nav list (e.g. "+ Crear Token"). */
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <aside
      className="hidden h-full w-[240px] flex-shrink-0 flex-col md:flex"
      style={{ borderRight: '1px solid var(--lx-border)', background: 'var(--lx-bg-elev)' }}
    >
      {/* Brand header — mirrors Sidebar's brand row */}
      <div className="flex items-center justify-between gap-2 px-3.5 pt-4 pb-3" style={{ borderBottom: '1px solid var(--lx-border)' }}>
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} alt="Luxor Pay" className="h-7 w-7 flex-shrink-0 object-contain" />
          <span className="truncate text-[15px] font-semibold tracking-tight" style={{ color: 'var(--lx-text)' }}>
            Luxor <span className="font-medium" style={{ color: 'var(--lx-text-muted)' }}>Pay</span>
          </span>
        </Link>
      </div>

      <p className="truncate px-3.5 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--lx-text-dim)' }}>
        {portalName}
      </p>

      <nav className="mt-1 flex-1 space-y-1.5 overflow-y-auto px-2.5 pb-2">
        <Link
          href="/dashboard"
          className="mb-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[12.5px] font-medium text-gray-300 transition-all hover:bg-white/[0.08] hover:text-white"
          title="Return to Main Portal Dashboard"
        >
          <ArrowLeft size={15} className="shrink-0" />
          <span className="truncate">Main Dashboard</span>
        </Link>

        {ctaHref && ctaLabel && (
          <Link
            href={ctaHref}
            className="mb-2.5 flex items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-[13.5px] font-semibold transition-transform hover:scale-[1.02]"
            style={{ background: '#FFFFFF', color: '#000000' }}
          >
            <Plus size={16} /> {ctaLabel}
          </Link>
        )}

        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          const className = clsx(
            'group flex items-center gap-2.5 rounded-full border px-3 py-2 text-[13.5px] font-medium transition-all duration-200',
            active
              ? 'border-white/20 bg-white/[0.08] font-semibold text-white shadow-sm'
              : 'border-transparent text-gray-400 hover:bg-white/[0.05] hover:text-white',
          );
          const content = (
            <>
              <Icon size={18} className={clsx('shrink-0 transition-colors', active ? 'text-white' : 'group-hover:text-white')} />
              <span className="truncate">{item.label}</span>
            </>
          );
          return item.external ? (
            <a key={item.href} href={item.href} className={className}>{content}</a>
          ) : (
            <Link key={item.href} href={item.href} className={className} aria-current={active ? 'page' : undefined}>
              {content}
            </Link>
          );
        })}
      </nav>

      <div className="px-2.5 py-3" style={{ borderTop: '1px solid var(--lx-border)' }}>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-full px-3 py-2 text-[13.5px] font-medium text-gray-400 transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          <LogOut size={18} className="shrink-0" /> Sign out
        </button>
      </div>
    </aside>
  );
}

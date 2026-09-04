'use client';

/**
 * PortalShellLayout — composes <PortalNav> (the full left menu, desktop)
 * with a compact <PortalTopBar> + horizontal tab strip fallback for mobile,
 * around a satellite portal's pages. Used from each portal's own
 * `layout.tsx` under `src/app/(portals)/<portal>/`.
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { X, ArrowLeft, Plus, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { PortalTopBar } from './PortalTopBar';
import { PortalNav, type PortalNavItem } from './PortalNav';
import type { PortalTarget } from '@/lib/portal-sso';

const LOGO_SRC =
  'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b';

export function PortalShellLayout({
  current,
  portalName,
  navItems,
  ctaLabel,
  ctaHref,
  children,
}: {
  current: PortalTarget['key'];
  portalName: string;
  navItems: PortalNavItem[];
  ctaLabel?: string;
  ctaHref?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <PortalNav items={navItems} current={current} portalName={portalName} ctaLabel={ctaLabel} ctaHref={ctaHref} />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {/* Mobile-only header — on desktop PortalNav serves as the navigation rail */}
        <div className="md:hidden">
          <PortalTopBar
            portalName={portalName}
            current={current}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />
        </div>

        {/* Mobile slide-in menu drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex justify-end md:hidden">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="relative flex h-full w-[280px] max-w-[85vw] flex-col bg-[#0A0B0E] border-l border-white/10 animate-in slide-in-from-right duration-200 z-50 p-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={LOGO_SRC} alt="Luxor Pay" className="h-6 w-6 object-contain" />
                  <span className="text-sm font-semibold text-white">
                    Luxor <span className="text-gray-400 font-medium">Pay</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full p-1 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {portalName}
              </p>

              {/* Main Portal Link */}
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mb-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[12.5px] font-medium text-gray-300 transition-all hover:bg-white/[0.08] hover:text-white"
              >
                <ArrowLeft size={15} className="shrink-0" />
                <span>Main Dashboard</span>
              </Link>

              {/* Call to Action button if present */}
              {ctaHref && ctaLabel && (
                <Link
                  href={ctaHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mb-3 flex items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-[13.5px] font-semibold transition-transform hover:scale-[1.02]"
                  style={{ background: '#FFFFFF', color: '#000000' }}
                >
                  <Plus size={16} /> {ctaLabel}
                </Link>
              )}

              {/* Portal Navigation Items */}
              <nav className="flex-1 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
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
                    <a key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={className}>
                      {content}
                    </a>
                  ) : (
                    <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={className} aria-current={active ? 'page' : undefined}>
                      {content}
                    </Link>
                  );
                })}
              </nav>

              {/* Footer Sign Out */}
              <div className="pt-3 mt-auto border-t border-white/10">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2.5 rounded-full px-3 py-2 text-[13.5px] font-medium text-gray-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                  <LogOut size={18} className="shrink-0" /> Sign out
                </button>
              </div>
            </aside>
          </div>
        )}

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth, signOut } from '@/lib/firebase';
import { useEffect, useRef, useState } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { usePlatformAdmin } from '@/hooks/usePlatformAdmin';
import { Search, HelpCircle, Menu, X, LayoutGrid, Settings, Shield } from 'lucide-react';
import { PlatformAdminBanner } from '@/components/dashboard/PlatformAdminBanner';
import { NotificationsDropdown } from '@/components/dashboard/NotificationsDropdown';
import { QuickCreateMenu } from '@/components/dashboard/QuickCreateMenu';
import { WalletStatusHeader } from '@/components/dashboard/WalletStatusHeader';
import { ensureMerchantProfile } from '@/lib/merchant-data';
import { getErrorMessage } from '@/lib/firestore-errors';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { isDashboardImmersiveRoute } from '@/lib/dashboard/immersive-routes';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';

const APP_LAUNCHER_LINKS = [
  { href: '/dashboard', label: 'Home' },
  { href: '/dashboard/balances', label: 'Balances' },
  { href: '/dashboard/links', label: 'Payment links' },
  { href: '/dashboard/billing', label: 'Billing' },
  { href: '/dashboard/developers', label: 'Developers' },
  { href: '/dashboard/settings', label: 'Settings' },
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, authReady } = useFirebaseAuth();
  const { isPlatformAdmin } = usePlatformAdmin();
  const [businessName, setBusinessName] = useState<string>();
  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [appLauncherOpen, setAppLauncherOpen] = useState(false);
  const appLauncherRef = useRef<HTMLDivElement>(null);

  const settingsActive =
    pathname === '/dashboard/settings' || pathname.startsWith('/dashboard/settings/');
  const immersive = isDashboardImmersiveRoute(pathname);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.replace('/login');
    }
  }, [authReady, user, router]);

  useEffect(() => {
    if (!authReady || !user) return;

    let cancelled = false;
    const uid = user.uid;

    void (async () => {
      try {
        const profile = await ensureMerchantProfile(uid, user.email ?? '');
        if (!cancelled) {
          setBusinessName(profile?.businessName);
          setMerchantWallet(profile?.merchantWallet || null);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          toast.error(getErrorMessage(e, 'Could not load merchant profile'));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, user]);

  useEffect(() => {
    if (!appLauncherOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (appLauncherRef.current && !appLauncherRef.current.contains(e.target as Node)) {
        setAppLauncherOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [appLauncherOpen]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;
    if (q.includes('cliente') || q.includes('customer')) router.push('/dashboard/customers');
    else if (q.includes('saldo') || q.includes('balance')) router.push('/dashboard/balances');
    else if (q.includes('product') || q.includes('catálogo') || q.includes('catalogo'))
      router.push('/dashboard/products');
    else if (q.includes('link') || q.includes('payment') || q.includes('enlace'))
      router.push('/dashboard/links');
    else if (q.includes('transaction') || q.includes('order') || q.includes('transacc'))
      router.push('/dashboard/transactions');
    else if (q.includes('qr') || q.includes('código') || q.includes('codigo'))
      router.push('/dashboard/links?from=qr');
    else if (q.includes('pos') || q.includes('terminal')) router.push('/dashboard/pos');
    else if (q.includes('api') || q.includes('key') || q.includes('developer'))
      router.push('/dashboard/developers');
    else if (q.includes('wallet') || q.includes('setting') || q.includes('config'))
      router.push('/dashboard/settings');
    else router.push('/dashboard');
  };

  if (!authReady) {
    return (
      <div className="min-h-screen dashboard-shell flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--dash-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dashboard-shell dashboard-shell-layout flex">
      {!immersive && (
        <SidebarNav
          businessName={businessName}
          email={user.email ?? undefined}
          isPlatformAdmin={isPlatformAdmin}
          onSignOut={handleSignOut}
          className="dashboard-sidebar hidden md:flex shrink-0"
        />
      )}

      {!immersive && mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            type="button"
            className="absolute inset-0 z-0 bg-black/60"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
          />
          <div className="dashboard-mobile-drawer absolute left-0 top-0 z-10 h-dvh max-h-dvh w-[var(--dash-sidebar-width)] shadow-xl flex flex-col overflow-hidden">
            <div className="shrink-0 flex items-center justify-between p-4 border-b border-[var(--dash-border)] bg-[var(--dash-bg)]">
              <span className="font-semibold text-[var(--dash-text)]">Luxor Pay</span>
              <button type="button" onClick={() => setMobileNavOpen(false)} className="p-1">
                <X size={20} />
              </button>
            </div>
            <SidebarNav
              businessName={businessName}
              email={user.email ?? undefined}
              isPlatformAdmin={isPlatformAdmin}
              onSignOut={handleSignOut}
              onNavigate={() => setMobileNavOpen(false)}
              className="dashboard-sidebar dashboard-sidebar-mobile flex-1 min-h-0 border-r-0 !bg-[var(--dash-bg)]"
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {!immersive && (
          <header className="sticky top-0 z-40 dash-header">
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-3 min-w-0">
              <button
                type="button"
                className="md:hidden p-2.5 -ml-1 rounded-md hover:bg-[var(--dash-surface-elevated)] shrink-0"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>

              <form onSubmit={handleSearch} className="flex-1 min-w-0 max-w-xl">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)]"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search links, transactions, settings…"
                    className="dash-input w-full pl-9 pr-4 py-2 text-sm"
                  />
                </div>
              </form>

              <div className="flex items-center gap-1 shrink-0 overflow-x-auto max-w-[55%] sm:max-w-none">
                {merchantWallet && (
                  <div className="mr-1.5 hidden md:block">
                    <WalletStatusHeader merchantWallet={merchantWallet} />
                  </div>
                )}
                <div className="relative" ref={appLauncherRef}>
                  <button
                    type="button"
                    onClick={() => setAppLauncherOpen((open) => !open)}
                    className="dash-header-icon-btn"
                    aria-label="Apps"
                    aria-expanded={appLauncherOpen}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  {appLauncherOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 py-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg-elevated)] shadow-xl z-50">
                      <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--dash-muted)]">
                        Products
                      </p>
                      {APP_LAUNCHER_LINKS.map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setAppLauncherOpen(false)}
                          className="block px-3 py-2 text-sm text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)]"
                        >
                          {label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="dash-header-icon-btn"
                  aria-label="Help"
                  onClick={() => toast.info('Help center — coming soon')}
                >
                  <HelpCircle size={18} />
                </button>
                <NotificationsDropdown />
                {isPlatformAdmin && (
                  <Link
                    href="/admin"
                    className="dash-header-icon-btn"
                    aria-label="Administración de plataforma"
                    title="Administración de plataforma"
                  >
                    <Shield size={18} />
                  </Link>
                )}
                <Link
                  href="/dashboard/settings"
                  className={cn(
                    'dash-header-icon-btn',
                    settingsActive && 'dash-header-icon-btn-active'
                  )}
                  aria-label="Settings"
                  aria-current={settingsActive ? 'page' : undefined}
                >
                  <Settings size={18} />
                </Link>
                <QuickCreateMenu />
              </div>
            </div>
          </header>
        )}

        <main
          className={cn(
            'flex-1 min-h-0',
            immersive ? 'overflow-hidden' : 'overflow-y-auto'
          )}
        >
          {!immersive && isPlatformAdmin && <PlatformAdminBanner />}
          {children}
        </main>
      </div>
    </div>
  );
}

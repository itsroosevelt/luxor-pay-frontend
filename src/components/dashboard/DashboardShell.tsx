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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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

  if (!authReady) {
    return (
      <div className="min-h-screen dashboard-shell flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--dash-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const renderBottomActions = (isCollapsed: boolean) => (
    <>
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
          <div className={cn(
            "absolute w-52 py-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg-elevated)] shadow-xl z-50",
            isCollapsed ? "left-full ml-2 bottom-0" : "left-0 bottom-full mb-2"
          )}>
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
    </>
  );

  return (
    <div className="dashboard-shell dashboard-shell-layout flex flex-col">
      <div className="flex-1 flex min-h-0 relative">
        {!immersive && (
          <SidebarNav
            businessName={businessName}
            email={user.email ?? undefined}
            isPlatformAdmin={isPlatformAdmin}
            onSignOut={handleSignOut}
            bottomActions={renderBottomActions}
            isCollapsed={isSidebarCollapsed}
            onCollapseChange={setIsSidebarCollapsed}
            className="dashboard-sidebar hidden md:flex shrink-0 h-[calc(100vh-2cm)] mt-[1cm] mb-[1cm] ml-4 rounded-[20px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] absolute left-0 top-0 z-50"
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
                bottomActions={renderBottomActions}
                className="dashboard-sidebar dashboard-sidebar-mobile flex-1 min-h-0 border-r-0 !bg-[var(--dash-bg)]"
              />
            </div>
          </div>
        )}

        {!immersive && (
          <div className="absolute top-5 right-5 sm:right-8 z-50">
            <WalletStatusHeader merchantWallet={merchantWallet || 'FqM87UkhE3xQ6YF6z96N9C1b5g2ZkC5z96N9C1b5g2Zk'} />
          </div>
        )}

        <main
          className={cn(
            'flex-1 min-w-0 transition-all duration-300',
            !immersive && (isSidebarCollapsed ? 'md:pl-[104px]' : 'md:pl-[352px]'),
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

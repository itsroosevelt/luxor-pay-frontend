'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';
import { auth, onAuthStateChanged, signOut } from '@/lib/firebase';
import { useEffect, useRef, useState } from 'react';
import { Search, Bell, HelpCircle, Plus, Menu, X, LayoutGrid, Settings } from 'lucide-react';
import { ensureMerchantProfile } from '@/lib/merchants-api';
import { getErrorMessage } from '@/lib/firestore-errors';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';

const APP_LAUNCHER_LINKS = [
  { href: '/dashboard', label: 'Inicio' },
  { href: '/dashboard/balances', label: 'Saldos' },
  { href: '/dashboard/links', label: 'Enlaces de pago' },
  { href: '/dashboard/billing', label: 'Billing' },
  { href: '/dashboard/developers', label: 'Desarrolladores' },
  { href: '/dashboard/settings', label: 'Configuración' },
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [businessName, setBusinessName] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [appLauncherOpen, setAppLauncherOpen] = useState(false);
  const appLauncherRef = useRef<HTMLDivElement>(null);

  const settingsActive =
    pathname === '/dashboard/settings' || pathname.startsWith('/dashboard/settings/');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace('/login');
        return;
      }
      setUser(currentUser);
      try {
        const token = await currentUser.getIdToken();
        await ensureMerchantProfile(token, currentUser.email ?? '');
      } catch (e) {
        console.error(e);
        toast.error(getErrorMessage(e, 'Could not load merchant profile'));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

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
    else if (q.includes('pos') || q.includes('terminal')) router.push('/dashboard/pos');
    else if (q.includes('api') || q.includes('key') || q.includes('developer'))
      router.push('/dashboard/developers');
    else if (q.includes('wallet') || q.includes('setting') || q.includes('config'))
      router.push('/dashboard/settings');
    else router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen dashboard-shell flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--dash-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dashboard-shell dashboard-shell-layout flex">
      <SidebarNav
        businessName={businessName}
        email={user.email ?? undefined}
        onSignOut={handleSignOut}
        className="dashboard-sidebar hidden md:flex shrink-0"
      />

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute left-0 top-0 h-dvh max-h-dvh w-[var(--dash-sidebar-width)] bg-[var(--dash-surface)] shadow-xl flex flex-col overflow-hidden">
            <div className="shrink-0 flex items-center justify-between p-4 border-b border-[var(--dash-border)]">
              <span className="font-semibold text-[var(--dash-text)]">Luxor Pay</span>
              <button type="button" onClick={() => setMobileNavOpen(false)} className="p-1">
                <X size={20} />
              </button>
            </div>
            <SidebarNav
              businessName={businessName}
              email={user.email ?? undefined}
              onSignOut={handleSignOut}
              className="dashboard-sidebar flex-1 min-h-0 border-r-0"
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <header className="sticky top-0 z-40 dash-header">
          <div className="flex items-center gap-3 px-4 md:px-6 py-3">
            <button
              type="button"
              className="md:hidden p-2 -ml-1 rounded-md hover:bg-[var(--dash-surface-elevated)]"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <form onSubmit={handleSearch} className="flex-1 max-w-xl">
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

            <div className="flex items-center gap-0.5 shrink-0">
              <div className="relative" ref={appLauncherRef}>
                <button
                  type="button"
                  onClick={() => setAppLauncherOpen((open) => !open)}
                  className="dash-header-icon-btn"
                  aria-label="Aplicaciones"
                  aria-expanded={appLauncherOpen}
                >
                  <LayoutGrid size={18} />
                </button>
                {appLauncherOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 py-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg-elevated)] shadow-xl z-50">
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--dash-muted)]">
                      Productos
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
                aria-label="Ayuda"
                onClick={() => toast.info('Centro de ayuda — próximamente')}
              >
                <HelpCircle size={18} />
              </button>
              <button
                type="button"
                className="dash-header-icon-btn"
                aria-label="Notificaciones"
                onClick={() => toast.info('Notificaciones — próximamente')}
              >
                <Bell size={18} />
              </button>
              <Link
                href="/dashboard/settings"
                className={cn(
                  'dash-header-icon-btn',
                  settingsActive && 'dash-header-icon-btn-active'
                )}
                aria-label="Configuración"
                aria-current={settingsActive ? 'page' : undefined}
              >
                <Settings size={18} />
              </Link>
              <Link
                href="/dashboard/links/new"
                className="dash-header-create-btn ml-1"
                aria-label="Crear"
              >
                <Plus size={18} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

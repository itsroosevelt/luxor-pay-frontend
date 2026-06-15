'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { auth, signOut } from '@/lib/firebase';
import { usePlatformAdmin } from '@/hooks/usePlatformAdmin';
import { AdminDemoBanner } from '@/components/admin/AdminDemoBanner';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, authReady, isPlatformAdmin } = usePlatformAdmin();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const accessDeniedHandledRef = useRef(false);

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      const redirect = encodeURIComponent(pathname || '/admin');
      router.replace(`/login?redirect=${redirect}`);
      return;
    }

    if (!isPlatformAdmin && !accessDeniedHandledRef.current) {
      accessDeniedHandledRef.current = true;
      toast.error('No tienes acceso de administrador');
      router.replace('/dashboard');
    }
  }, [authReady, user, isPlatformAdmin, router, pathname]);

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

  if (!user || !isPlatformAdmin) return null;

  return (
    <div className="dashboard-shell dashboard-shell-layout flex">
      <AdminSidebar
        email={user.email ?? undefined}
        onSignOut={handleSignOut}
        className="dashboard-sidebar hidden md:flex shrink-0"
      />

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menú de administración">
          <button
            type="button"
            className="absolute inset-0 z-0 bg-black/60"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Cerrar menú"
          />
          <div className="dashboard-mobile-drawer absolute left-0 top-0 z-10 h-dvh max-h-dvh w-[var(--dash-sidebar-width)] shadow-xl flex flex-col overflow-hidden">
            <div className="shrink-0 flex items-center justify-between p-4 border-b border-[var(--dash-border)] bg-[var(--dash-bg)]">
              <span className="font-semibold text-[var(--dash-text)]">Luxor Admin</span>
              <button type="button" onClick={() => setMobileNavOpen(false)} className="p-1">
                <X size={20} />
              </button>
            </div>
            <AdminSidebar
              email={user.email ?? undefined}
              onSignOut={handleSignOut}
              onNavigate={() => setMobileNavOpen(false)}
              className="dashboard-sidebar dashboard-sidebar-mobile flex-1 min-h-0 border-r-0 !bg-[var(--dash-bg)]"
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <header className="sticky top-0 z-40 dash-header md:hidden">
          <div className="flex items-center gap-2 px-3 py-3">
            <button
              type="button"
              className="p-2.5 rounded-md hover:bg-[var(--dash-surface-elevated)] shrink-0"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-semibold text-[var(--dash-text)]">Luxor Admin</span>
          </div>
        </header>

        <main className={cn('flex-1 min-h-0 overflow-y-auto')}>
          <AdminDemoBanner />
          {children}
        </main>
      </div>
    </div>
  );
}

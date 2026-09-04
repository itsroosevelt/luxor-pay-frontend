'use client';

/**
 * Layout for every satellite portal (`(portals)/token-launcher`,
 * `(portals)/payment-portal`, ...). Deliberately does NOT render the main
 * dashboard's <Sidebar> — each page renders its own <PortalTopBar> instead,
 * which is what makes a portal read as a separate "app" (Meta Business
 * Suite style) while staying the same deployment and Firebase session.
 *
 * Still gates on auth the same way `dashboard/layout.tsx` does: a portal is
 * only ever reached from the main dashboard's PortalSwitcher, never has its
 * own login screen.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function PortalsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace('/login');
        return;
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading || !user) {
    return (
      <div className="lx-app flex min-h-screen items-center justify-center" style={{ background: 'var(--lx-bg)' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="lx-app min-h-screen" style={{ background: 'var(--lx-bg)', color: 'var(--lx-text)' }}>
      {children}
    </div>
  );
}

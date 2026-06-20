'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Link as LinkIcon,
  Receipt,
  Terminal,
  Code2,
  Settings,
  LogOut,
  Users,
  ArrowLeftRight,
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { ensureMerchantProfile } from '@/lib/merchants-api';
import { clsx } from 'clsx';

const nav = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/links', label: 'Enlaces de pago', icon: LinkIcon },
  { href: '/dashboard/transactions', label: 'Transacciones', icon: Receipt },
  { href: '/dashboard/pos', label: 'Terminal POS', icon: Terminal },
  { href: '/dashboard/contacts', label: 'Contactos', icon: Users },
  { href: '/dashboard/trade', label: 'Intercambio', icon: ArrowLeftRight },
  { href: '/dashboard/developers', label: 'Desarrolladores', icon: Code2 },
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 flex">
      <aside className="w-64 border-r border-white/5 bg-white/[0.02] hidden md:flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight">
            Luxor <span className="text-primary">Pay</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5">
          <p className="text-xs text-gray-500 truncate px-4 mb-3">{user.email}</p>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

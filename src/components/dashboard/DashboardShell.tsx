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
  Menu,
  X,
  ArrowLeftRight,
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { ensureMerchantProfile } from '@/lib/merchants-api';
import { clsx } from 'clsx';

const nav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/requests', label: 'Payment Requests', icon: ArrowLeftRight },
  { href: '/dashboard/links', label: 'Payment Links', icon: LinkIcon },
  { href: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
  { href: '/dashboard/pos', label: 'POS Devices', icon: Terminal },
  { href: '/dashboard/contacts', label: 'Contacts', icon: Users },
  { href: '/dashboard/developers', label: 'Developers', icon: Code2 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#60A5FA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onClick}
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
    </>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] selection:bg-[#2563EB]/30 flex font-['Montserrat',sans-serif]">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-white/[0.02] hidden md:flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Link href="/dashboard" className="text-xl font-semibold tracking-tight font-['Outfit',sans-serif] flex items-center gap-2">
            <img src="/logo.jpg" alt="Logo" className="h-10 w-10 object-contain" />
            <span>Luxor <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#60A5FA] to-[#2563EB]">Pay</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-white/5">
          <p className="text-xs text-gray-500 truncate px-4 mb-3">{user.email}</p>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl text-sm font-medium transition-colors font-['Outfit',sans-serif]"
          >
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex-shrink-0 flex items-center justify-between p-4 border-b border-white/5 bg-[#0A0A0A]">
          <Link href="/dashboard" className="text-xl font-semibold tracking-tight font-['Outfit',sans-serif] flex items-center gap-2">
            <img src="/logo.jpg" alt="Logo" className="h-10 w-10 object-contain" />
            <span>Luxor <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#60A5FA] to-[#2563EB]">Pay</span></span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="relative flex flex-col w-72 max-w-[80%] bg-[#0A0A0A] border-r border-white/5 h-full animate-in slide-in-from-left-full duration-200">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <Link href="/dashboard" className="text-xl font-semibold tracking-tight font-['Outfit',sans-serif] flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <img src="/logo.jpg" alt="Logo" className="h-10 w-10 object-contain" />
                  <span>Luxor <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#60A5FA] to-[#2563EB]">Pay</span></span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <NavLinks onClick={() => setIsMobileMenuOpen(false)} />
              </nav>
              <div className="p-4 border-t border-white/5">
                <p className="text-xs text-gray-500 truncate px-4 mb-3">{user.email}</p>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl text-sm font-medium transition-colors font-['Outfit',sans-serif]"
                >
                  <LogOut size={18} /> Sign out
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

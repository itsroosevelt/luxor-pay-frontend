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
  Repeat,
  UserCircle,
  Lock,
  Check,
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { ensureMerchantProfile } from '@/lib/merchants-api';
import { useMerchant } from '@/context/MerchantContext';
import { KycModal } from './KycModal';
import { KycVerificationBanner } from './KycVerificationBanner';
import { KycResultModal } from './KycResultModal';
import { OnrampProgressBanner } from './OnrampProgressBanner';
import { OnrampResultModal } from './OnrampResultModal';
import { clsx } from 'clsx';
import { TopWalletBar } from './TopWalletBar';
import { FundWalletButton } from './FundWalletButton';

const nav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/swap', label: 'Swap', icon: Repeat },
  { href: '/dashboard/requests', label: 'Payment Requests', icon: ArrowLeftRight },
  { href: '/dashboard/links', label: 'Payment Links', icon: LinkIcon },
  { href: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
  { href: '/dashboard/pos', label: 'POS Devices', icon: Terminal },
  { href: '/dashboard/contacts', label: 'Contacts', icon: Users },
  { href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
  { href: '/dashboard/developers', label: 'Developers', icon: Code2 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const { profile, setProfile, isKycModalOpen, setIsKycModalOpen } = useMerchant();

  const displayName =
    profile?.businessName?.trim() || (user as any)?.displayName || user?.email?.split('@')[0] || 'Account';
  const avatarUrl = (user as any)?.photoURL;
  const avatarInitial = (displayName || user?.email || 'A').charAt(0).toUpperCase();
  const kycVerified =
    profile?.kyc === true || (profile?.kycStatus || '').toLowerCase() === 'verified';

  const renderAvatar = (size: number) =>
    avatarUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={displayName}
        referrerPolicy="no-referrer"
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    ) : (
      <div
        className="rounded-full bg-gradient-to-br from-[#60A5FA] to-[#2563EB] text-white flex items-center justify-center font-semibold"
        style={{ width: size, height: size, fontFamily: 'Outfit, sans-serif', fontSize: size * 0.4 }}
      >
        {avatarInitial}
      </div>
    );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace('/login');
        return;
      }
      setUser(currentUser);
      try {
        const token = await currentUser.getIdToken();
        const p = await ensureMerchantProfile(token, currentUser.email ?? '');
        setProfile(p);

        if (p && !p.kyc && !sessionStorage.getItem('luxor_kyc_dismissed')) {
          setIsKycModalOpen(true);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router, setProfile]);

  const handleCloseKyc = () => {
    setIsKycModalOpen(false);
    sessionStorage.setItem('luxor_kyc_dismissed', 'true');
  };

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('luxor_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('luxor_sidebar_collapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    sessionStorage.removeItem('luxor_kyc_dismissed');
    sessionStorage.removeItem('luxor_merchant_profile');
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

  const NavLinks = ({ onClick, collapsed }: { onClick?: () => void; collapsed?: boolean }) => (
    <>
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onClick}
            title={collapsed ? label : undefined}
            className={clsx(
              'w-full flex items-center text-sm font-medium transition-all duration-200 rounded-xl',
              collapsed ? 'justify-center p-3 text-center' : 'gap-3 px-4 py-3',
              active
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] selection:bg-[#2563EB]/30 flex font-['Montserrat',sans-serif]">
      {/* Desktop Sidebar (Retractable) */}
      <aside
        className={clsx(
          'border-r border-white/5 bg-white/[0.02] hidden md:flex flex-col transition-all duration-300 ease-in-out relative shrink-0',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div
          onClick={toggleSidebar}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') toggleSidebar();
          }}
          title={isCollapsed ? 'Expand menu' : 'Collapse menu'}
          className={clsx(
            'p-4 border-b border-white/5 flex items-center cursor-pointer select-none transition-colors hover:bg-white/[0.03]',
            isCollapsed ? 'justify-center py-5' : 'justify-start gap-3 px-5'
          )}
        >
          <img
            src="https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b"
            alt="Logo"
            className="h-10 w-10 object-contain shrink-0"
          />
          {!isCollapsed && (
            <span className="text-xl font-semibold tracking-tight font-['Outfit',sans-serif] whitespace-nowrap">
              Luxor <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#60A5FA] to-[#2563EB]">Pay</span>
            </span>
          )}
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavLinks collapsed={isCollapsed} />
        </nav>
        <div className="p-3 border-t border-white/5">
          {!isCollapsed && <p className="text-xs text-gray-500 truncate px-4 mb-3">{user.email}</p>}
          <button
            type="button"
            onClick={handleSignOut}
            title={isCollapsed ? 'Sign out' : undefined}
            style={{ fontFamily: 'Outfit, sans-serif' }}
            className={clsx(
              "w-full flex items-center text-red-400 hover:bg-red-400/10 rounded-xl text-sm font-medium transition-colors",
              isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
            )}
          >
            <LogOut size={18} className="shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex-shrink-0 flex items-center justify-between p-4 border-b border-white/5 bg-[#0A0A0A]">
          <Link href="/dashboard" className="text-xl font-semibold tracking-tight font-['Outfit',sans-serif] flex items-center gap-2">
            <img src="https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b" alt="Logo" className="h-10 w-10 object-contain" />
            <span>Luxor <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#60A5FA] to-[#2563EB]">Pay</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((v) => !v)}
              className="rounded-full ring-1 ring-white/15 hover:ring-[#60A5FA]/70 transition-all flex-shrink-0"
              title="Account"
              aria-label="Open account menu"
            >
              {renderAvatar(32)}
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              <Menu size={24} />
            </button>
          </div>
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
                  <img src="https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b" alt="Logo" className="h-10 w-10 object-contain" />
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
        <div className="relative flex-1 overflow-auto">
          {/* Top Header Controls (Desktop only) */}
          <div className="hidden md:flex items-center gap-3 absolute top-6 right-10 z-30">
            <TopWalletBar merchantWallet={profile?.merchantWallet} />
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((v) => !v)}
              className="rounded-full ring-1 ring-white/15 hover:ring-[#60A5FA]/70 transition-all shadow-lg flex-shrink-0"
              title="Account"
              aria-label="Open account menu"
            >
              {renderAvatar(36)}
            </button>
          </div>
          {children}
        </div>
      </main>

      <KycModal isOpen={isKycModalOpen} onClose={handleCloseKyc} />
      <KycVerificationBanner />
      <KycResultModal />
      <OnrampProgressBanner />
      <OnrampResultModal />

      {/* Account dropdown menu (Google-style) — shared for desktop + mobile */}
      {isAccountMenuOpen && user && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsAccountMenuOpen(false)} />
          <div
            style={{
              background: 'rgba(15,15,15,0.98)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(40px)',
              borderRadius: '28px',
              boxShadow: '0 32px 64px -16px rgba(0,0,0,0.8)',
            }}
            className="fixed top-16 right-4 md:top-20 md:right-8 z-50 w-[340px] max-w-[calc(100vw-2rem)] p-5 text-[#EDEDED] font-body animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <p className="text-center text-xs text-gray-400 font-mono truncate mb-4">{user.email}</p>

            <div className="flex flex-col items-center text-center">
              <div className="rounded-full ring-2 ring-white/10">{renderAvatar(72)}</div>
              <h3 className="mt-3 text-lg font-light text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Hi, {displayName}!
              </h3>
              {profile?.businessName && (
                <p className="text-xs text-gray-500 mt-0.5">{profile.businessName}</p>
              )}

              <div className="mt-2">
                {kycVerified ? (
                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Check size={11} /> Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setIsAccountMenuOpen(false); setIsKycModalOpen(true); }}
                    className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                  >
                    Verify identity
                  </button>
                )}
              </div>
            </div>

            {kycVerified && (
              <div className="mt-4 w-full">
                <FundWalletButton
                  merchantWallet={profile?.merchantWallet}
                  onTrigger={() => setIsAccountMenuOpen(false)}
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleSignOut}
              className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors text-sm"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

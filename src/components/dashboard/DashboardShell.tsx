'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { Suspense, useEffect, useState } from 'react';
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
  ChevronDown,
  ChevronUp,
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
  { href: '/dashboard/contacts', label: 'Contacts', icon: Users },
  { href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
];

const settingsSubNav = [
  { href: '/dashboard/settings?tab=general', label: 'General', icon: Settings, tab: 'general' },
  { href: '/dashboard/settings?tab=pos', label: 'POS Devices', icon: Terminal, tab: 'pos' },
  { href: '/dashboard/settings?tab=developers', label: 'Developers', icon: Code2, tab: 'developers' },
];

type NavLinksShellProps = {
  pathname: string;
  router: ReturnType<typeof useRouter>;
  isSettingsOpen: boolean;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClick?: () => void;
  collapsed?: boolean;
};

interface NavLinksProps extends NavLinksShellProps {
  searchParams: ReturnType<typeof useSearchParams>;
}

function NavLinks({
  pathname,
  searchParams,
  router,
  isSettingsOpen,
  setIsSettingsOpen,
  onClick,
  collapsed,
}: NavLinksProps) {
  const isSettingsActive = pathname.startsWith('/dashboard/settings');
  const rawTab = searchParams.get('tab');
  const currentTab = rawTab || 'general';

  return (
    <div className="flex flex-col justify-between h-full space-y-1">
      <div className="space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClick}
              title={collapsed ? label : undefined}
              className={clsx(
                'w-full flex items-center text-sm font-medium transition-all duration-200 rounded-2xl',
                collapsed ? 'justify-center p-3 text-center' : 'gap-3 px-4 py-3',
                active
                  ? 'bg-white/10 text-white shadow-sm font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Settings Option at Bottom - Submenu Expands Upwards */}
      <div className="w-full pt-2 mt-auto border-t border-white/5">
        {/* Submenu Items (Rendered ABOVE Settings button so it opens UPWARDS) */}
        {isSettingsOpen && !collapsed && (
          <div className="mb-2 ml-4 pl-3 border-l border-white/10 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {settingsSubNav.map(({ href, label, icon: SubIcon, tab }) => {
              const isTabActive = isSettingsActive && currentTab === tab;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClick}
                  className={clsx(
                    'w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium rounded-full transition-all duration-200',
                    isTabActive
                      ? 'bg-[#2563EB]/20 text-[#60A5FA] font-semibold border border-[#2563EB]/40 shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <SubIcon size={14} className="shrink-0" />
                  <span className="truncate">{label}</span>
                </Link>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            if (collapsed) {
              router.push('/dashboard/settings');
              if (onClick) onClick();
            } else {
              setIsSettingsOpen((prev) => !prev);
            }
          }}
          title={collapsed ? 'Settings' : undefined}
          className={clsx(
            'w-full flex items-center text-sm font-medium transition-all duration-200 rounded-2xl select-none cursor-pointer',
            collapsed ? 'justify-center p-3 text-center' : 'justify-between px-4 py-3',
            isSettingsActive
              ? 'bg-white/10 text-white shadow-sm font-semibold'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Settings size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">Settings</span>}
          </div>
          {!collapsed && (
            <ChevronUp
              size={16}
              className={clsx(
                'shrink-0 text-gray-400 transition-transform duration-200',
                isSettingsOpen && 'rotate-180 text-white'
              )}
            />
          )}
        </button>
      </div>
    </div>
  );
}

function NavLinksWithSearchParams(props: NavLinksShellProps) {
  const searchParams = useSearchParams();
  return <NavLinks {...props} searchParams={searchParams} />;
}

const staticSearchParams = new URLSearchParams() as unknown as ReturnType<typeof useSearchParams>;

function NavLinksSuspense(props: NavLinksShellProps) {
  return (
    <Suspense fallback={<NavLinks {...props} searchParams={staticSearchParams} />}>
      <NavLinksWithSearchParams {...props} />
    </Suspense>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(() => pathname.startsWith('/dashboard/settings'));
  const { profile, setProfile, isKycModalOpen, setIsKycModalOpen } = useMerchant();

  const extendedUser = user as (User & { displayName?: string; photoURL?: string }) | null;
  const displayName =
    profile?.businessName?.trim() || extendedUser?.displayName || user?.email?.split('@')[0] || 'Account';
  const avatarUrl = extendedUser?.photoURL;
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

  return (
    <div className="h-screen w-screen bg-[#0A0A0A] text-[#EDEDED] selection:bg-[#2563EB]/30 flex overflow-hidden font-['Montserrat',sans-serif]">
      {/* Desktop Sidebar (Retractable) */}
      <aside
        className={clsx(
          'border border-white/[0.06] bg-[#111111] hidden md:flex flex-col transition-all duration-300 ease-in-out shrink-0 m-3 rounded-3xl z-40 h-[calc(100vh-24px)]',
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
          <NavLinksSuspense
            pathname={pathname}
            router={router}
            isSettingsOpen={isSettingsOpen}
            setIsSettingsOpen={setIsSettingsOpen}
            collapsed={isCollapsed}
          />
        </nav>
        <div className="p-3 border-t border-white/5">

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
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden">
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
                <NavLinksSuspense
                  pathname={pathname}
                  router={router}
                  isSettingsOpen={isSettingsOpen}
                  setIsSettingsOpen={setIsSettingsOpen}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              </nav>
              <div className="p-4 border-t border-white/5">
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
        <div className="relative flex-1 min-w-0 overflow-x-hidden">
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

              <div className="mt-2.5">
                {kycVerified ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-['Outfit',sans-serif]">
                    <Check size={12} className="stroke-[3]" /> VERIFIED
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setIsAccountMenuOpen(false); setIsKycModalOpen(true); }}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/40 hover:bg-amber-500/30 transition-all font-['Outfit',sans-serif] shadow-[0_0_16px_rgba(245,158,11,0.2)]"
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

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Menu, X, Check, LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { ensureMerchantProfile } from '@/lib/merchants-api';
import { useMerchant } from '@/context/MerchantContext';
import { KycModal } from './KycModal';
import { KycVerificationBanner } from './KycVerificationBanner';
import { KycResultModal } from './KycResultModal';
import { OnrampProgressBanner } from './OnrampProgressBanner';
import { OnrampResultModal } from './OnrampResultModal';
import { TopWalletBar } from './TopWalletBar';
import { FundWalletButton } from './FundWalletButton';
import { Sidebar, SidebarContent } from './Sidebar';

const LOGO_SRC =
  'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
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
        className="rounded-full flex items-center justify-center font-semibold"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.4,
          background: 'var(--lx-surface-hover)',
          color: 'var(--lx-text)',
          border: '1px solid var(--lx-border-strong)',
        }}
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

  const handleSignOut = async () => {
    sessionStorage.removeItem('luxor_kyc_dismissed');
    sessionStorage.removeItem('luxor_merchant_profile');
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="lx-app min-h-screen flex items-center justify-center" style={{ background: 'var(--lx-bg)' }}>
        <div className="w-8 h-8 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      className="lx-app h-screen w-screen text-[color:var(--lx-text)] selection:bg-white/15 flex overflow-hidden"
      style={{ background: 'var(--lx-bg)' }}
    >
      {/* Desktop rail */}
      <Sidebar profile={profile} onSignOut={handleSignOut} />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden">
        {/* Mobile header */}
        <header
          className="md:hidden flex-shrink-0 flex items-center justify-between p-4"
          style={{ borderBottom: '1px solid var(--lx-border)', background: 'var(--lx-bg-elev)' }}
        >
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC} alt="Luxor Pay" className="h-8 w-8 object-contain" />
            <span>Luxor <span className="text-gray-400 font-medium">Pay</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((v) => !v)}
              className="rounded-full ring-1 ring-white/15 hover:ring-white/40 transition-all flex-shrink-0"
              title="Account"
              aria-label="Open account menu"
            >
              {renderAvatar(32)}
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </header>

        {/* Mobile drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="relative flex h-full w-[280px] max-w-[85vw] flex-col bg-[#0A0B0E] border-r border-white/10 animate-in slide-in-from-left duration-200">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute right-3 top-4 z-10 rounded-full p-1.5 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
              <SidebarContent
                profile={profile}
                onSignOut={handleSignOut}
                onNavigate={() => setIsMobileMenuOpen(false)}
              />
            </aside>
          </div>
        )}

        {/* Page content */}
        <div className="relative flex-1 min-w-0 overflow-x-hidden">
          {/* Desktop top-right controls */}
          <div className="hidden md:flex items-center gap-3 absolute top-6 right-10 z-30">
            <TopWalletBar merchantWallet={profile?.merchantWallet} />
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((v) => !v)}
              className="rounded-full ring-1 ring-white/15 hover:ring-white/40 transition-all shadow-lg flex-shrink-0"
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

      {/* Account dropdown menu — shared for desktop + mobile */}
      {isAccountMenuOpen && user && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsAccountMenuOpen(false)} />
          <div
            style={{
              background: 'var(--lx-surface)',
              border: '1px solid var(--lx-border-strong)',
              borderRadius: 'var(--lx-radius-lg)',
              boxShadow: 'var(--lx-shadow-lg)',
            }}
            className="fixed top-16 right-4 md:top-20 md:right-8 z-50 w-[340px] max-w-[calc(100vw-2rem)] p-6 text-[color:var(--lx-text)] animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <p className="text-center text-xs text-gray-400 font-mono truncate mb-4">{user.email}</p>

            <div className="flex flex-col items-center text-center">
              <div className="rounded-full ring-2 ring-white/10">{renderAvatar(72)}</div>
              <h3 className="mt-3 text-lg font-light text-white">Hi, {displayName}!</h3>
              {profile?.businessName && (
                <p className="text-xs text-gray-500 mt-0.5">{profile.businessName}</p>
              )}

              <div className="mt-2.5">
                {kycVerified ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] px-3.5 py-1 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/50">
                    <Check size={12} className="stroke-[3]" /> VERIFIED
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setIsAccountMenuOpen(false); setIsKycModalOpen(true); }}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/40 hover:bg-amber-500/30 transition-all"
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

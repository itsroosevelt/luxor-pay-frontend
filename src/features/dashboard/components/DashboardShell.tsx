'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Menu, X, Check, LogOut, User as UserIcon, ArrowDownToLine } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { ensureMerchantProfile } from '@/features/merchant/api/merchants-api';
import { useMerchant } from '@/features/merchant/context/MerchantContext';
import { KycModal } from '@/features/onramp/components/KycModal';
import { KycVerificationBanner } from '@/features/onramp/components/KycVerificationBanner';
import { KycResultModal } from '@/features/onramp/components/KycResultModal';
import { OnrampProgressBanner } from '@/features/onramp/components/OnrampProgressBanner';
import { OnrampResultModal } from '@/features/onramp/components/OnrampResultModal';
import { TopWalletBar } from '@/features/dashboard/components/TopWalletBar';
import { FundWalletButton } from '@/features/wallet/components/FundWalletButton';
import {
  Sidebar,
  SidebarContent,
  hydrateSectionsIcons,
  type NavSection,
} from '@/features/dashboard/components/Sidebar';
import { SupportCenterDrawer } from '@/features/dashboard/components/SupportCenterDrawer';
import { QrOperationsModal } from '@/features/dashboard/components/overview/QrOperationsModal';
import { TransferModal } from '@/features/transfers/components/TransferModal';
import { TransferSuccessModal } from '@/features/transfers/components/TransferSuccessModal';
import { PaymentRequestModal } from '@/features/payment-requests/components/PaymentRequestModal';
import { OfframpModal } from '@/features/onramp/components/OfframpModal';
import { Transfer } from '@/features/transfers/api/transfers-api';

const LOGO_SRC =
  'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b';

export function DashboardShell({
  children,
  customSections,
}: {
  children: React.ReactNode;
  customSections?: NavSection[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isSupportDrawerOpen, setIsSupportDrawerOpen] = useState(false);
  const { profile, setProfile, isKycModalOpen, setIsKycModalOpen } = useMerchant();

  const [persistedPortalSections, setPersistedPortalSections] = useState<NavSection[] | undefined>(undefined);

  useEffect(() => {
    if (customSections && customSections.length > 0) {
      try {
        sessionStorage.setItem('sterling_active_portal_sections', JSON.stringify(customSections));
        setPersistedPortalSections(customSections);
      } catch (e) {
        console.error('Failed to save portal sections:', e);
      }
    } else if (pathname === '/dashboard/settings' || pathname === '/dashboard/profile') {
      try {
        const saved = sessionStorage.getItem('sterling_active_portal_sections');
        if (saved) {
          const parsed = JSON.parse(saved);
          setPersistedPortalSections(hydrateSectionsIcons(parsed));
        }
      } catch (e) {
        console.error('Failed to load portal sections:', e);
      }
    } else if (pathname === '/dashboard') {
      try {
        sessionStorage.removeItem('sterling_active_portal_sections');
        setPersistedPortalSections(undefined);
      } catch (e) {
        console.error('Failed to clear portal sections:', e);
      }
    }
  }, [customSections, pathname]);

  const activeCustomSections = customSections || persistedPortalSections;

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isTransferSuccessModalOpen, setIsTransferSuccessModalOpen] = useState(false);
  const [transferSuccessData, setTransferSuccessData] = useState<Transfer | null>(null);
  const [isPaymentRequestModalOpen, setIsPaymentRequestModalOpen] = useState(false);

  const [isOfframpOpen, setIsOfframpOpen] = useState(false);

  const extendedUser = user as (User & { displayName?: string; photoURL?: string }) | null;
  const displayName =
    profile?.businessName?.trim() || extendedUser?.displayName || user?.email?.split('@')[0] || 'Account';
  const avatarUrl = extendedUser?.photoURL;
  const avatarInitial = (displayName || user?.email || 'A').charAt(0).toUpperCase();
  const kycVerified =
    profile?.kyc ?? true;

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
        const p = await ensureMerchantProfile(currentUser.email ?? '');
        setProfile(p);

        if (p && !p.kyc && !sessionStorage.getItem('sterling_kyc_dismissed')) {
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
    sessionStorage.setItem('sterling_kyc_dismissed', 'true');
  };

  const handleSignOut = async () => {
    sessionStorage.removeItem('sterling_kyc_dismissed');
    sessionStorage.removeItem('sterling_merchant_profile');
    sessionStorage.removeItem('sterling_active_portal_sections');
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
      <Sidebar
        profile={profile}
        onSignOut={handleSignOut}
        onOpenSupportCenter={() => setIsSupportDrawerOpen(true)}
        customSections={activeCustomSections}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden relative">
        {/* Mobile header */}
        <header
          className="md:hidden flex-shrink-0 flex items-center justify-between p-4"
          style={{ borderBottom: '1px solid var(--lx-border)', background: 'var(--lx-bg-elev)' }}
        >
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC} alt="Sterling" className="h-8 w-8 object-contain" />
            <span>Sterling</span>
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

        {/* Mobile drawer — slides in from the right */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex justify-end md:hidden">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="relative flex h-full w-[240px] max-w-[85vw] flex-col bg-[#0A0B0E] border-l border-white/10 animate-in slide-in-from-right duration-200">
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
                onOpenSupportCenter={() => setIsSupportDrawerOpen(true)}
                customSections={activeCustomSections}
              />
            </aside>
          </div>
        )}

        {/* Page content */}
        <div className="relative flex-1 min-w-0 overflow-x-hidden">
          {/* Desktop top-right controls */}
          <div className="hidden xl:flex items-center gap-2.5 absolute top-3.5 right-6 z-30">
            <TopWalletBar
              merchantWallet={profile?.merchantWallet}
              onQrClick={() => setIsQrModalOpen(true)}
              onSendClick={() => setIsTransferModalOpen(true)}
            />
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((v) => !v)}
              className="rounded-full ring-1 ring-white/15 hover:ring-white/40 transition-all shadow-lg flex-shrink-0"
              title="Account"
              aria-label="Open account menu"
            >
              {renderAvatar(32)}
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

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={(data) => {
          setTransferSuccessData(data);
          setIsTransferSuccessModalOpen(true);
        }}
      />

      <PaymentRequestModal
        isOpen={isPaymentRequestModalOpen}
        onClose={() => setIsPaymentRequestModalOpen(false)}
        requesterWallet={profile?.merchantWallet ?? null}
      />
      <TransferSuccessModal
        isOpen={isTransferSuccessModalOpen}
        onClose={() => setIsTransferSuccessModalOpen(false)}
        transferData={transferSuccessData}
      />

      <QrOperationsModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        merchantWallet={profile?.merchantWallet ?? null}
        recipientLabel={profile?.businessName ?? null}
        initialMode="select"
        onCreatePaymentRequest={() => setIsPaymentRequestModalOpen(true)}
      />

      <SupportCenterDrawer
        isOpen={isSupportDrawerOpen}
        onClose={() => setIsSupportDrawerOpen(false)}
      />

      <OfframpModal
        isOpen={isOfframpOpen}
        onClose={() => setIsOfframpOpen(false)}
        solBalance={null}
      />

      {/* Account dropdown menu / Floating Profile Panel — shared for desktop + mobile */}
      {isAccountMenuOpen && user && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsAccountMenuOpen(false)} />
          <div
            style={{
              background: '#0D0E14',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '24px',
              boxShadow: '0 24px 60px -16px rgba(0, 0, 0, 0.95), 0 0 40px rgba(0, 0, 0, 0.8)',
            }}
            className="fixed top-16 right-4 md:top-20 md:right-8 z-50 w-[380px] max-w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto p-6 text-[color:var(--lx-text)] animate-in fade-in slide-in-from-top-2 duration-200 space-y-4 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <p className="text-center text-xs text-gray-400 font-mono truncate mb-2">{user.email}</p>

            {/* Avatar & Verification Status */}
            <div className="flex flex-col items-center text-center">
              <div className="relative rounded-full ring-2 ring-white/10">
                {renderAvatar(72)}
                {kycVerified && (
                  <span
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-black border-2 border-[#121316] flex items-center justify-center shadow-md"
                    title="Verified Merchant"
                  >
                    <Check size={11} className="stroke-[3]" />
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-lg font-light text-white">Hello, {displayName}!</h3>
              {profile?.businessName && (
                <p className="text-xs text-gray-400 mt-0.5">{profile.businessName}</p>
              )}

              <div className="mt-3 flex flex-col items-center gap-2.5">
                {!kycVerified && (
                  <button
                    type="button"
                    onClick={() => { setIsAccountMenuOpen(false); setIsKycModalOpen(true); }}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/40 hover:bg-amber-500/30 transition-all"
                  >
                    Verify identity
                  </button>
                )}

                {/* Google-Style "Manage your Luxor Account" Pill Button */}
                <Link
                  href="/dashboard/profile"
                  onClick={() => setIsAccountMenuOpen(false)}
                  className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-all shadow-sm hover:border-white/40"
                >
                  Manage your Sterling Account
                </Link>
              </div>
            </div>

            {/* Cash Out / Offramp Button */}
            {kycVerified && (
              <button
                type="button"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  setIsOfframpOpen(true);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <ArrowDownToLine size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Cash Out (MoonPay)</p>
                    <p className="text-[11px] text-gray-400">SOL → Bank · Card · SEPA</p>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-white transition-colors">→</span>
              </button>
            )}

            {/* Fund Wallet Button */}
            {kycVerified && (
              <div className="w-full">
                <FundWalletButton
                  merchantWallet={profile?.merchantWallet}
                  onTrigger={() => setIsAccountMenuOpen(false)}
                />
              </div>
            )}

            {/* Disconnect / Sign Out */}
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors text-sm font-medium"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

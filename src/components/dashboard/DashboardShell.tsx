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
  FileText,
  LogOut,
  Users,
  Menu,
  X,
  ArrowLeftRight,
  CreditCard,
  Coins,
  ChevronDown,
  Copy,
  ExternalLink,
  Link2Off,
  Check,
  Repeat,
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { ensureMerchantProfile } from '@/lib/merchants-api';
import { useMerchant } from '@/context/MerchantContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { KycModal } from './KycModal';
import { KycVerificationBanner } from './KycVerificationBanner';
import { KycResultModal } from './KycResultModal';
import { OnrampProgressBanner } from './OnrampProgressBanner';
import { OnrampResultModal } from './OnrampResultModal';
import { clsx } from 'clsx';

const navGroups = [
  {
    title: 'Core',
    items: [
      { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { href: '/dashboard/connect', label: 'Connect', icon: CreditCard },
    ]
  },
  {
    title: 'Finance',
    items: [
      { href: '/dashboard/treasury', label: 'Treasury', icon: Coins },
      { href: '/dashboard/swap', label: 'Swap', icon: Repeat },
    ]
  },
  {
    title: 'Payments',
    items: [
      { href: '/dashboard/requests', label: 'Payment Requests', icon: ArrowLeftRight },
      { href: '/dashboard/links', label: 'Payment Links', icon: LinkIcon },
      { href: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
      { href: '/dashboard/documents', label: 'Documents', icon: FileText },
      { href: '/dashboard/pos', label: 'POS Devices', icon: Terminal },
    ]
  },
  {
    title: 'Management',
    items: [
      { href: '/dashboard/contacts', label: 'Contacts', icon: Users },
    ]
  },
  {
    title: 'System',
    items: [
      { href: '/dashboard/developers', label: 'Developers', icon: Code2 },
    ]
  }
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const { profile, setProfile, isKycModalOpen, setIsKycModalOpen } = useMerchant();
  const { publicKey, disconnect } = useWallet();
  const [isMockDisconnected, setIsMockDisconnected] = useState(false);
  const walletAddress = (!isMockDisconnected && publicKey) ? publicKey.toBase58() : (!isMockDisconnected ? '8YuQ4Z1jgb9dd42394b415a1bT8ejeJRe' : '');
  const [isWalletSettingsOpen, setIsWalletSettingsOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [rpcProvider, setRpcProvider] = useState('Helius');
  const [disableJito, setDisableJito] = useState(false);
  const [explorer, setExplorer] = useState('Orb');
  const [isExplorerDropdownOpen, setIsExplorerDropdownOpen] = useState(false);

  const formatWallet = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const handleCopyWallet = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

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

  useEffect(() => {
    // Close menus on route change
    setIsMobileMenuOpen(false);
    setIsAccountMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    sessionStorage.removeItem('luxor_kyc_dismissed');
    sessionStorage.removeItem('luxor_merchant_profile');
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#60A5FA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  // Account identity used by the top-right avatar menu. The photo comes from the
  // Google account used to sign in (Firebase user.photoURL); we fall back to an
  // initials avatar when there is no photo.
  const displayName =
    profile?.businessName?.trim() || user.displayName || user.email?.split('@')[0] || 'Account';
  const avatarUrl = user.photoURL;
  const avatarInitial = (displayName || user.email || 'A').charAt(0).toUpperCase();
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
        className="rounded-full bg-gradient-to-br from-[#60A5FA] to-[#2563EB] text-white flex items-center justify-center"
        style={{ width: size, height: size, fontFamily: 'Outfit, sans-serif', fontSize: size * 0.4, fontWeight: 500 }}
      >
        {avatarInitial}
      </div>
    );

  const NavLinks = ({ onClick, collapsed }: { onClick?: () => void; collapsed?: boolean }) => (
    <div className="flex flex-col gap-6">
      {navGroups.map((group) => (
        // Groups are only used to keep spacing between sections (no visible title).
        // Vertical metrics stay identical when collapsed so icons don't move.
        <div key={group.title} className="flex flex-col gap-1.5">
          {group.items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClick}
                title={collapsed ? label : undefined}
                className={clsx(
                  'flex items-center gap-3 rounded-xl text-sm font-light transition-all duration-300 py-2.5',
                  collapsed ? 'justify-center px-2' : 'px-3',
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5',
                )}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span className="whitespace-nowrap">{label}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-[#EDEDED] selection:bg-[#2563EB]/30 flex font-body font-light">
      {/* Desktop Sidebar */}
      <aside 
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(40px)',
          boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6)',
        }}
        className={clsx(
          "fixed left-6 top-6 bottom-6 rounded-[32px] hidden md:flex flex-col z-30 transition-all duration-300",
          isCollapsed ? "w-20" : "w-80"
        )}
      >
        <div className={clsx(
          "relative h-20 flex items-center shrink-0 transition-all duration-300",
          isCollapsed ? "px-4 justify-center" : "px-6 justify-center"
        )}>
          {!isCollapsed ? (
            <>
              <Link href="/dashboard" className="absolute left-6 top-1/2 -translate-y-1/2 hover:opacity-80 transition-all">
                <img src="https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b" alt="Logo" className="h-8 w-8 object-contain flex-shrink-0" />
              </Link>

              <span className="text-base font-light tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Luxor <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#60A5FA] to-[#2563EB]">Pay</span>
              </span>

              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex-shrink-0"
                title="Collapse sidebar"
              >
                <Menu size={18} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-105"
              title="Expand sidebar"
            >
              <img src="https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b" alt="Logo" className="h-8 w-8 object-contain" />
            </button>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto p-4 transition-all duration-300">
          <NavLinks collapsed={isCollapsed} />
        </nav>

      </aside>

      {/* Main Content Area */}
      <main className={clsx(
        "flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-all duration-300",
        isCollapsed ? "md:pl-[128px]" : "md:pl-[368px]"
      )}>
        {/* Mobile Header */}
        <header className="md:hidden flex-shrink-0 flex items-center justify-between p-4 border-b border-white/5 bg-black">
          <Link href="/dashboard" className="text-xl font-light tracking-tight font-['Outfit',sans-serif] flex items-center gap-2">
            <img src="https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b" alt="Logo" className="h-10 w-10 object-contain" />
            <span>Luxor <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#60A5FA] to-[#2563EB]">Pay</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((v) => !v)}
              className="rounded-full ring-1 ring-white/15 hover:ring-[#60A5FA]/70 transition-all"
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
            <aside className="relative flex flex-col w-72 max-w-[80%] bg-black border-r border-white/5 h-full animate-in slide-in-from-left-full duration-200">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <Link href="/dashboard" className="text-xl font-light tracking-tight font-['Outfit',sans-serif] flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
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
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl text-sm font-light transition-colors font-['Outfit',sans-serif]"
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

      {/* Account avatar (desktop, top-right corner) */}
      <button
        type="button"
        onClick={() => setIsAccountMenuOpen((v) => !v)}
        className="hidden md:flex fixed top-8 right-8 z-40 rounded-full ring-1 ring-white/15 hover:ring-[#60A5FA]/70 transition-all shadow-lg"
        title="Account"
        aria-label="Open account menu"
      >
        {renderAvatar(40)}
      </button>

      {/* Account dropdown menu (Google-style) — shared for desktop + mobile */}
      {isAccountMenuOpen && (
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

            {/* Wallet capsule */}
            {walletAddress && (
              <div className="mt-4 flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2">
                <button
                  type="button"
                  onClick={() => { setIsAccountMenuOpen(false); setIsWalletSettingsOpen(true); }}
                  className="flex items-center gap-2 flex-1 min-w-0 text-xs text-gray-300 font-mono hover:text-white transition-colors"
                  title="Wallet settings"
                >
                  <CreditCard size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{formatWallet(walletAddress)}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyWallet}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex-shrink-0"
                  title="Copy address"
                >
                  {copiedAddress ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
                <a
                  href={
                    explorer === 'Solscan'
                      ? `https://solscan.io/account/${walletAddress}`
                      : explorer === 'Solana Explorer'
                      ? `https://explorer.solana.com/address/${walletAddress}`
                      : `https://orb.club/address/${walletAddress}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex-shrink-0"
                  title="View on Explorer"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            )}

            {/* Manage account */}
            <Link
              href="/dashboard/account"
              onClick={() => setIsAccountMenuOpen(false)}
              className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-white/15 text-sm text-white hover:bg-white/5 transition-all"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Manage account
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors text-sm"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </>
      )}

      <KycModal isOpen={isKycModalOpen} onClose={handleCloseKyc} />
      <KycVerificationBanner />
      <KycResultModal />
      <OnrampProgressBanner />
      <OnrampResultModal />

      {/* Wallet Settings Popover Modal */}
      {isWalletSettingsOpen && walletAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={() => setIsWalletSettingsOpen(false)} />
          
          {/* Popover Card */}
          <div 
            style={{
              background: '#0F0F0F',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              boxShadow: '0 32px 64px -16px rgba(0,0,0,0.8)',
            }}
            className="relative w-full max-w-sm p-6 space-y-6 text-[#EDEDED] font-body animate-in zoom-in-95 duration-200"
          >
            {/* Top row: Address display, Copy, External Link */}
            <div className="flex items-center justify-between gap-2 bg-[#1A1A1A] border border-white/5 rounded-xl p-3">
              <span className="font-mono text-sm tracking-wide text-gray-300 select-all">
                {formatWallet(walletAddress)}
              </span>
              <div className="flex items-center gap-1.5 border-l border-white/5 pl-2.5">
                <button
                  type="button"
                  onClick={handleCopyWallet}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  title="Copy address"
                >
                  {copiedAddress ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
                <a
                  href={
                    explorer === 'Solscan' 
                      ? `https://solscan.io/account/${walletAddress}` 
                      : explorer === 'Solana Explorer'
                      ? `https://explorer.solana.com/address/${walletAddress}`
                      : `https://orb.club/address/${walletAddress}` // Orb fallback
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  title="View on Explorer"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>

            {/* RPC Connection Section */}
            <div className="space-y-2">
              <h5 className="text-[11px] text-gray-500 font-semibold tracking-wider uppercase font-body">
                RPC Connection
              </h5>
              <div className="grid grid-cols-3 gap-1 bg-[#1A1A1A] p-1 rounded-xl border border-white/5">
                {['Helius', 'Triton', 'Custom'].map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => setRpcProvider(provider)}
                    className={clsx(
                      "py-2 text-xs font-medium rounded-lg transition-all duration-200",
                      rpcProvider === provider
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-300"
                    )}
                  >
                    {provider}
                  </button>
                ))}
              </div>
            </div>

            {/* Disable Jito Tips Section */}
            <div className="space-y-1.5">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={disableJito}
                  onChange={(e) => setDisableJito(e.target.checked)}
                  className="mt-0.5 rounded border-white/10 bg-white/5 text-[#2563EB] focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
                <span className="text-sm text-gray-300 font-medium font-body">Disable Jito tips</span>
              </label>
              <p className="text-[11px] text-gray-500 leading-normal pl-7 font-body">
                Skips the Jito tip instruction and the Jito block engine for every transaction sent from this browser.
              </p>
            </div>

            {/* Explorer Selection Section */}
            <div className="space-y-2 relative">
              <h5 className="text-[11px] text-gray-500 font-semibold tracking-wider uppercase font-body">
                Explorer
              </h5>
              <button
                type="button"
                onClick={() => setIsExplorerDropdownOpen(!isExplorerDropdownOpen)}
                className="w-full flex items-center justify-between bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors font-body"
              >
                <span>{explorer}</span>
                <ChevronDown size={16} className={clsx("text-gray-500 transition-transform duration-200", isExplorerDropdownOpen && "rotate-180")} />
              </button>

              {isExplorerDropdownOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-10 bg-[#0F0F0F] border border-white/10 rounded-xl overflow-hidden shadow-2xl py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {['Orb', 'Solscan', 'Solana Explorer'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setExplorer(option);
                        setIsExplorerDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-body"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/5 pt-4">
              {/* Disconnect Button */}
              <button
                type="button"
                onClick={() => {
                  disconnect();
                  setIsMockDisconnected(true);
                  setIsWalletSettingsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-red-400/90 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-colors font-body"
              >
                <Link2Off size={16} />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

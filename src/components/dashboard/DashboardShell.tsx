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
  CreditCard,
  Coins,
  TrendingUp,
  Crown,
  ChevronDown,
  Copy,
  ExternalLink,
  Link2Off,
  Check,
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
      { href: '/dashboard/trade', label: 'Trade', icon: ArrowLeftRight },
      { href: '/dashboard/stake', label: 'Stake', icon: TrendingUp },
    ]
  },
  {
    title: 'Payments',
    items: [
      { href: '/dashboard/requests', label: 'Payment Requests', icon: ArrowLeftRight },
      { href: '/dashboard/links', label: 'Payment Links', icon: LinkIcon },
      { href: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
      { href: '/dashboard/pos', label: 'POS Devices', icon: Terminal },
    ]
  },
  {
    title: 'Management',
    items: [
      { href: '/dashboard/members', label: 'Members', icon: Users },
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#60A5FA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const NavLinks = ({ onClick, collapsed }: { onClick?: () => void; collapsed?: boolean }) => (
    <div className="space-y-4">
      {navGroups.map((group) => (
        <div key={group.title} className="space-y-1">
          {/* Group Title */}
          {!collapsed && (
            <h4 className="text-[10px] text-gray-600 font-body uppercase tracking-[0.2em] px-4 pt-2">
              {group.title}
            </h4>
          )}
          {collapsed && group.title !== 'Core' && (
            <div className="border-t border-white/5 my-2 w-8 mx-auto" />
          )}
          <div className="space-y-1">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClick}
                  title={collapsed ? label : undefined}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-light transition-all duration-300',
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5',
                    collapsed && 'justify-center px-0'
                  )}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className={clsx(
                    'transition-all duration-300 whitespace-nowrap',
                    collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                  )}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
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
          "border-b border-white/5 flex flex-col gap-4 transition-all duration-300",
          isCollapsed ? "p-4" : "p-6"
        )}>
          {/* Header Row: Always visible when expanded */}
          {!isCollapsed ? (
            <div className="w-full flex items-center justify-between">
              {/* Logo + Toggle Arrow */}
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1.5 hover:opacity-80 transition-all"
              >
                <img src="https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b" alt="Logo" className="h-10 w-10 object-contain flex-shrink-0" />
                <ChevronDown 
                  size={14} 
                  className={clsx(
                    "text-gray-500 transition-transform duration-300",
                    isProfileOpen && "rotate-180"
                  )} 
                />
              </button>

              {/* Collapse Button */}
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex-shrink-0"
                title="Collapse sidebar"
              >
                <Menu size={18} />
              </button>
            </div>
          ) : (
            /* Collapsed State: Logo + Sign Out */
            <div className="flex flex-col items-center gap-4">
              <button 
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-105"
                title="Expand sidebar"
              >
                <img src="https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b" alt="Logo" className="h-10 w-10 object-contain" />
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="p-1.5 text-red-400/80 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
                title="Sign out"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}

          {/* Collapsible Profile Section (Only when expanded & isProfileOpen is true) */}
          {!isCollapsed && isProfileOpen && (
            <div className="flex flex-col items-center text-center pb-2 w-full animate-in slide-in-from-top-4 duration-300 border-t border-white/5 pt-4">
              <Link 
                href="/dashboard" 
                className="text-xl font-light tracking-tight font-['Outfit',sans-serif] flex flex-col items-center gap-1.5"
              >
                <span className="whitespace-nowrap">Luxor <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#60A5FA] to-[#2563EB]">Pay</span></span>
              </Link>
              <p className="text-xs text-gray-500 font-mono mt-1.5 select-none max-w-[240px] truncate">
                {user.email}
              </p>

              {/* Wallet Capsule */}
              {walletAddress ? (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsWalletSettingsOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 font-light hover:bg-white/10 transition-colors font-mono cursor-pointer"
                  >
                    <CreditCard size={14} className="text-gray-400" />
                    <span>{formatWallet(walletAddress)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyWallet}
                    className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
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
                    className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    title="View on Explorer"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMockDisconnected(false);
                    setIsWalletSettingsOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-500 font-light mt-2 hover:bg-white/10 transition-colors font-mono cursor-pointer"
                >
                  <CreditCard size={14} className="text-gray-600 animate-pulse" />
                  <span>Wallet disconnected</span>
                </button>
              )}

              {/* Action buttons row */}
              <div className="flex items-center justify-center gap-3 mt-3">
                <Link
                  href="/dashboard/subscription"
                  className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  title="Subscription"
                >
                  <Crown size={16} />
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  title="Settings"
                >
                  <Settings size={16} />
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="p-1.5 text-red-400/80 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
        <nav className={clsx(
          "flex-1 space-y-1 overflow-y-auto transition-all duration-300",
          isCollapsed ? "p-2" : "p-4"
        )}>
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

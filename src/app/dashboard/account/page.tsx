'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useMerchant } from '@/context/MerchantContext';
import {
  Search,
  Building2,
  Coins,
  ShieldCheck,
  Contact,
  Code2,
  Receipt,
  Lock,
  Crown,
  ArrowUpRight,
  Check,
  Camera,
} from 'lucide-react';

type LinkItem = {
  key: string;
  title: string;
  desc: string;
  icon: typeof Building2;
  href: string;
};

export default function AccountManagementPage() {
  const { profile, setIsKycModalOpen } = useMerchant();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const displayName =
    profile?.businessName?.trim() || user?.displayName || user?.email?.split('@')[0] || 'Your account';
  const email = user?.email ?? '';
  const avatarUrl = user?.photoURL ?? null;
  const initial = (displayName || email || 'A').charAt(0).toUpperCase();
  const kycVerified =
    profile?.kyc === true || (profile?.kycStatus || '').toLowerCase() === 'verified';

  const linkItems: LinkItem[] = [
    { key: 'business', title: 'Business profile', desc: 'Company name and public details.', icon: Building2, href: '/dashboard/settings' },
    { key: 'wallets', title: 'Wallets & Treasury', desc: 'Genesis wallet, balances and accounts.', icon: Coins, href: '/dashboard/treasury' },
    { key: 'contacts', title: 'Contacts', desc: 'Saved payees and customers.', icon: Contact, href: '/dashboard/contacts' },
    { key: 'transactions', title: 'Transactions', desc: 'History of payments and transfers.', icon: Receipt, href: '/dashboard/transactions' },
    { key: 'developers', title: 'Developers & API', desc: 'API keys and integrations.', icon: Code2, href: '/dashboard/developers' },
    { key: 'billing', title: 'Subscription & billing', desc: 'Plan and premium features.', icon: Crown, href: '/dashboard/subscription' },
    { key: 'privacy', title: 'Data & privacy', desc: 'How your data is handled on-chain.', icon: Lock, href: '/dashboard/settings' },
  ];

  const securityDesc = kycVerified
    ? 'Identity verified — full access enabled.'
    : 'Complete KYC to unlock fiat top-ups and premium features.';

  const q = query.trim().toLowerCase();
  const matches = (title: string, desc: string) =>
    !q || title.toLowerCase().includes(q) || desc.toLowerCase().includes(q);

  const filteredLinks = useMemo(
    () => linkItems.filter((i) => matches(i.title, i.desc)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q],
  );
  const showSecurity = matches('Security & identity', securityDesc);

  return (
    <>
      <header className="p-6 md:p-10 border-b border-white/5 bg-white/[0.01]">
        <h1 className="text-2xl font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>Account</h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your company profile, wallets, security and integrations — all in one place.
        </p>
      </header>

      <div className="p-6 md:p-10 w-full max-w-5xl mx-auto space-y-10">
        {/* Profile header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-full object-cover ring-2 ring-white/10"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full bg-gradient-to-br from-[#60A5FA] to-[#2563EB] text-white flex items-center justify-center ring-2 ring-white/10"
                style={{ fontFamily: 'Outfit, sans-serif', fontSize: 40, fontWeight: 500 }}
              >
                {initial}
              </div>
            )}
            <span
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#0F0F0F] border border-white/10 flex items-center justify-center text-gray-400"
              title="Profile photo comes from your sign-in account"
            >
              <Camera size={14} />
            </span>
          </div>

          <h2 className="mt-4 text-2xl font-light text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {displayName}
          </h2>
          {email && <p className="text-sm text-gray-500 mt-1 font-mono">{email}</p>}

          <div className="mt-3">
            {kycVerified ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Check size={12} /> Identity verified
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsKycModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
              >
                <ShieldCheck size={12} /> Verify identity
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto w-full">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search account settings"
            className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#60A5FA]/60 transition-colors"
          />
        </div>

        {/* Quick chips */}
        <div className="flex flex-wrap justify-center gap-2">
          <Chip href="/dashboard/settings" label="Business profile" />
          <Chip href="/dashboard/treasury" label="Wallets" />
          <Chip href="/dashboard/developers" label="API keys" />
          <Chip href="/dashboard/transactions" label="Transactions" />
        </div>

        {/* Section cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Security & identity — opens the shared KYC modal (backend flow) */}
          {showSecurity && (
            <button
              type="button"
              onClick={() => {
                if (!kycVerified) setIsKycModalOpen(true);
              }}
              className="glass-panel p-6 flex items-start justify-between gap-4 text-left hover:bg-white/[0.04] transition-colors w-full"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl shrink-0 ${kycVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-[#60A5FA]'}`}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-light text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Security &amp; identity
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{securityDesc}</p>
                </div>
              </div>
              {!kycVerified && <ArrowUpRight size={16} className="text-gray-500 shrink-0" />}
            </button>
          )}

          {filteredLinks.map(({ key, title, desc, icon: Icon, href }) => (
            <Link
              key={key}
              href={href}
              className="glass-panel p-6 flex items-start justify-between gap-4 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-white/5 text-[#60A5FA] shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-light text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-gray-500 shrink-0" />
            </Link>
          ))}
        </div>

        {!showSecurity && filteredLinks.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-8">No settings match “{query}”.</p>
        )}

        <p className="text-center text-[11px] text-gray-600 leading-relaxed max-w-lg mx-auto">
          Only you can see and manage these settings. Luxor Pay is non-custodial — funds move directly on-chain and your private keys are never stored.
        </p>
      </div>
    </>
  );
}

function Chip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
    >
      {label}
    </Link>
  );
}

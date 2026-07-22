'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Copy, Check, ShieldCheck, ShieldAlert, Wallet, Mail, Building2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchants-api';
import { AccountStatementViewer } from '@/components/profile/AccountStatementViewer';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);
  const [kycVerified, setKycVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      setUser(currentUser);
      try {
        const token = await currentUser.getIdToken();
        const profile = await getMerchantProfile(token);
        setBusinessName(profile?.businessName || null);
        setMerchantWallet(profile?.merchantWallet || null);
        setKycVerified(profile?.kyc ?? false);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCopyWallet = async () => {
    if (!merchantWallet) return;
    try {
      await navigator.clipboard.writeText(merchantWallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard may be blocked; ignore quietly.
    }
  };

  const displayName = businessName || (user as any)?.displayName || user?.email?.split('@')[0] || 'You';
  const initial = displayName.trim().charAt(0).toUpperCase();
  const photoURL = (user as any)?.photoURL as string | null;

  return (
    <>
      {/* ── Page Header — matches all other dashboard pages ── */}
      <header className="px-6 py-6 md:px-10 md:py-8 border-b border-white/5 bg-white/[0.01]">
        <div>
          <h1
            className="text-2xl md:text-3xl font-medium text-white tracking-tight mb-1"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Profile
          </h1>
          <p className="text-gray-400 text-sm font-light" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Your account details and monthly account statements.
          </p>
        </div>
      </header>

      {/* ── Content — max-w-7xl to match all other pages ── */}
      <div className="p-6 md:p-10 w-full max-w-7xl mx-auto space-y-6">
        {loading ? (
          <div className="flex items-center gap-3 py-10">
            <div
              className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#60A5FA', borderTopColor: 'transparent' }}
            />
            <p className="text-gray-500 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Loading profile…
            </p>
          </div>
        ) : (
          <>
            {/* ── Merchant Profile Card ── */}
            <section className="glass-panel overflow-hidden">
              {/* Top: Avatar + identity */}
              <div className="relative px-6 pt-6 pb-6 flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Subtle gradient accent */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(ellipse at top left, rgba(37,99,235,0.14), transparent 60%)',
                  }}
                />

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt={displayName}
                      className="w-20 h-20 rounded-2xl object-cover"
                      style={{ boxShadow: '0 0 0 3px rgba(255,255,255,0.08), 0 12px 24px rgba(0,0,0,0.5)' }}
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-semibold"
                      style={{
                        background: 'linear-gradient(135deg, #2563EB, #60A5FA)',
                        boxShadow: '0 0 0 3px rgba(255,255,255,0.08), 0 0 28px rgba(37,99,235,0.4)',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      {initial}
                    </div>
                  )}

                  {/* KYC badge */}
                  <div
                    className="absolute -bottom-1.5 -right-1.5 rounded-full p-1"
                    style={{
                      background: kycVerified ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                      border: `1px solid ${kycVerified ? 'rgba(16,185,129,0.35)' : 'rgba(245,158,11,0.35)'}`,
                    }}
                    title={kycVerified ? 'Identity verified' : 'Identity not yet verified'}
                  >
                    {kycVerified
                      ? <ShieldCheck size={15} color="#10B981" />
                      : <ShieldAlert size={15} color="#F59E0B" />
                    }
                  </div>
                </div>

                {/* Identity text */}
                <div className="relative min-w-0">
                  <p
                    className="text-[11px] uppercase tracking-[0.14em] mb-1"
                    style={{ color: '#60A5FA', fontFamily: 'Outfit, sans-serif' }}
                  >
                    Merchant Profile
                  </p>
                  <h2
                    className="text-xl font-medium text-white truncate"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {displayName}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5 truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {user?.email || '—'}
                  </p>
                  <div className="mt-3">
                    {kycVerified ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full"
                        style={{
                          background: 'rgba(16,185,129,0.08)',
                          border: '1px solid rgba(16,185,129,0.22)',
                          color: '#10B981',
                          fontFamily: 'Outfit, sans-serif',
                        }}
                      >
                        <ShieldCheck size={11} /> Verified
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full"
                        style={{
                          background: 'rgba(245,158,11,0.08)',
                          border: '1px solid rgba(245,158,11,0.22)',
                          color: '#F59E0B',
                          fontFamily: 'Outfit, sans-serif',
                        }}
                      >
                        <ShieldAlert size={11} /> Not verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Info Grid ── */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-px"
                style={{ background: 'rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                {/* Business name */}
                <div style={{ background: 'rgba(10,10,10,0.6)', padding: '18px 24px' }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Building2 size={12} color="rgba(96,165,250,0.7)" />
                    <p
                      className="text-[11px] uppercase tracking-wider text-gray-500"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      Business Name
                    </p>
                  </div>
                  <p className="text-sm text-[#EDEDED]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {businessName || '—'}
                  </p>
                </div>

                {/* Email */}
                <div style={{ background: 'rgba(10,10,10,0.6)', padding: '18px 24px' }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Mail size={12} color="rgba(96,165,250,0.7)" />
                    <p
                      className="text-[11px] uppercase tracking-wider text-gray-500"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      Email
                    </p>
                  </div>
                  <p className="text-sm text-[#EDEDED] break-all" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {user?.email || '—'}
                  </p>
                </div>

                {/* Solana wallet — full width */}
                <div
                  className="sm:col-span-2"
                  style={{ background: 'rgba(10,10,10,0.6)', padding: '18px 24px' }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Wallet size={12} color="rgba(96,165,250,0.7)" />
                      <p
                        className="text-[11px] uppercase tracking-wider text-gray-500"
                        style={{ fontFamily: 'Outfit, sans-serif' }}
                      >
                        Solana Wallet
                      </p>
                    </div>
                    {merchantWallet && (
                      <button
                        type="button"
                        onClick={handleCopyWallet}
                        className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-[#60A5FA] transition-colors focus-visible:outline-2 focus-visible:outline-[#60A5FA] focus-visible:outline-offset-2"
                        style={{ fontFamily: 'Outfit, sans-serif' }}
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-[#EDEDED] font-mono break-all leading-relaxed">
                    {merchantWallet || '—'}
                  </p>
                </div>
              </div>
            </section>

            {/* ── Account Statements ── */}
            <AccountStatementViewer
              merchantWallet={merchantWallet}
              businessName={businessName}
              email={user?.email}
            />
          </>
        )}
      </div>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Mail,
  Building2,
  Pencil,
  Save,
  X,
  Loader2,
  ArrowDownToLine,
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { getMerchantProfile, updateMerchantProfile } from '@/features/merchant/api/merchants-api';
import { useMerchant } from '@/features/merchant/context/MerchantContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { AccountStatementViewer } from '@/features/transactions/components/AccountStatementViewer';
import { OfframpModal } from '@/features/onramp/components/OfframpModal';
import { useGetBalance } from '@/features/wallet/hooks/useGetBalance';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { profile, setProfile, setIsKycModalOpen } = useMerchant();
  const wallet = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editMerchantWallet, setEditMerchantWallet] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOfframpOpen, setIsOfframpOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      setUser(currentUser);
      try {
        const p = await getMerchantProfile();
        if (p) {
          setProfile(p);
          setEditBusinessName(p.businessName || '');
          setEditMerchantWallet(p.merchantWallet || '');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [setProfile]);

  useEffect(() => {
    if (profile) {
      setEditBusinessName(profile.businessName || '');
      setEditMerchantWallet(profile.merchantWallet || '');
    }
  }, [profile]);

  const handleCopyWallet = async () => {
    const wallet = profile?.merchantWallet || editMerchantWallet;
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard may be blocked; ignore quietly.
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const nextWallet = editMerchantWallet.trim();
      // Changing the receiving wallet needs a member wallet signature (asked only in that case).
      const walletChanged = !!nextWallet && nextWallet !== (profile?.merchantWallet ?? '');
      const updated = await updateMerchantProfile(
        {
          businessName: editBusinessName.trim() || undefined,
          merchantWallet: nextWallet || undefined,
        },
        walletChanged ? wallet : undefined,
      );

      setProfile(updated);
      setEditBusinessName(updated.businessName || '');
      setEditMerchantWallet(updated.merchantWallet || '');
      setIsEditing(false);
      toast.success('Profile saved successfully');
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const businessName = profile?.businessName || editBusinessName;
  const merchantWallet = profile?.merchantWallet || editMerchantWallet;
  const kycVerified = profile?.kyc ?? true;

  // Live SOL balance — used to pre-fill the MoonPay offramp widget
  const { data: balanceData, isLoading: isBalanceLoading } = useGetBalance(
    kycVerified ? merchantWallet : null
  );
  const solBalance = balanceData?.solBalance ?? null;

  const displayName = businessName || (user as any)?.displayName || user?.email?.split('@')[0] || 'You';
  const initial = displayName.trim().charAt(0).toUpperCase();
  const photoURL = (user as any)?.photoURL as string | null;

  return (
    <>
      {/* ── Page Header — matches all other dashboard pages ── */}
      <header className="lx-page-header">
        <div>
          <h1
            className="lx-page-title"
          >
            Profile
          </h1>
          <p className="lx-page-subtitle">
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
              style={{ borderColor: '#E2E8F0', borderTopColor: 'transparent' }}
            />
            <p className="text-gray-500 text-sm">
              Loading profile…
            </p>
          </div>
        ) : (
          <>
            {/* ── Merchant Profile Card ── */}
            <section className="glass-panel overflow-hidden relative">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="absolute top-5 right-5 z-20 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#E2E8F0] transition-all focus-visible:outline-2 focus-visible:outline-[#E2E8F0] focus-visible:outline-offset-2"
                  aria-label="Edit Profile"
                  title="Edit Profile"
                >
                  <Pencil size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditBusinessName(profile?.businessName || '');
                    setEditMerchantWallet(profile?.merchantWallet || '');
                  }}
                  disabled={saving}
                  className="absolute top-5 right-5 z-20 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all focus-visible:outline-2 focus-visible:outline-[#E2E8F0] focus-visible:outline-offset-2 disabled:opacity-50"
                  aria-label="Cancel editing"
                  title="Cancel"
                >
                  <X size={16} />
                </button>
              )}

              {/* Top: Avatar + identity */}
              <div className="relative px-6 pt-6 pb-6 pr-16 flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Subtle gradient accent */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(ellipse at top left, rgba(37, 99, 235, 0.2), transparent 60%)',
                  }}
                />

                {/* Left: Avatar + Details */}
                <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 min-w-0">
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
                          background: 'linear-gradient(135deg, #10B981, #E2E8F0)',
                          boxShadow: '0 0 0 3px rgba(255,255,255,0.08), 0 0 0 1px rgba(255,255,255,0.06)',
                          fontFamily: 'Outfit, sans-serif',
                        }}
                      >
                        {initial}
                      </div>
                    )}

                  </div>

                  {/* Identity text */}
                  <div className="relative min-w-0">
                    <p
                      className="text-[11px] uppercase tracking-[0.14em] mb-1"
                      style={{ color: '#E2E8F0', fontFamily: 'Outfit, sans-serif' }}
                    >
                      Merchant Profile
                    </p>
                    <h2
                      className="text-xl font-medium text-white truncate"
                    >
                      {displayName}
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5 truncate">
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

              </div>

              {/* ── Edit Form or Info Grid ── */}
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="p-6 border-t border-white/5 bg-black/40 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Business Name Input */}
                    <div>
                      <label
                        className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5"
                      >
                        <Building2 size={12} className="text-[#E2E8F0]" /> Business Name
                      </label>
                      <input
                        type="text"
                        value={editBusinessName}
                        onChange={(e) => setEditBusinessName(e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className="w-full bg-black/60 border border-white/10 focus:border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 transition-all outline-none"
                      />
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                      <label
                        className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5"
                      >
                        <Mail size={12} className="text-[#E2E8F0]" /> Email (Account)
                      </label>
                      <input
                        type="text"
                        value={user?.email || ''}
                        disabled
                        className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>

                  {/* Solana Wallet Address Input */}
                  <div>
                    <label
                      className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5"
                    >
                      <Wallet size={12} className="text-[#E2E8F0]" /> Solana Wallet Address
                    </label>
                    <input
                      type="text"
                      value={editMerchantWallet}
                      onChange={(e) => setEditMerchantWallet(e.target.value)}
                      placeholder="e.g. B8NUqgYnZiNLmDBZCA3cgWeRR7oWcC1xTmmXFXGaYxJ4"
                      className="w-full bg-black/60 border border-white/10 focus:border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-gray-600 transition-all outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Used to receive funds from payment links, POS terminals, and payment requests.
                    </p>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditBusinessName(profile?.businessName || '');
                        setEditMerchantWallet(profile?.merchantWallet || '');
                      }}
                      disabled={saving}
                      className="px-5 py-2 rounded-full border border-white/10 bg-transparent text-white text-xs font-medium hover:bg-white/5 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white text-black hover:bg-[#2563EB] hover:text-white text-xs font-medium transition-all shadow-md disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-[#E2E8F0]"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save size={14} /> Save Profile
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* ── Info Grid ── */
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-px"
                  style={{ background: 'rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                  {/* Business name */}
                  <div style={{ background: 'rgba(10,10,10,0.6)', padding: '18px 24px' }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Building2 size={12} color="rgba(255, 255, 255,0.7)" />
                      <p
                        className="text-[11px] uppercase tracking-wider text-gray-500"
                      >
                        Business Name
                      </p>
                    </div>
                    <p className="text-sm text-[#EDEDED]">
                      {businessName || '—'}
                    </p>
                  </div>

                  {/* Email */}
                  <div style={{ background: 'rgba(10,10,10,0.6)', padding: '18px 24px' }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Mail size={12} color="rgba(255, 255, 255,0.7)" />
                      <p
                        className="text-[11px] uppercase tracking-wider text-gray-500"
                      >
                        Email
                      </p>
                    </div>
                    <p className="text-sm text-[#EDEDED] break-all">
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
                        <Wallet size={12} color="rgba(255, 255, 255,0.7)" />
                        <p
                          className="text-[11px] uppercase tracking-wider text-gray-500"
                        >
                          Solana Wallet
                        </p>
                      </div>
                      {merchantWallet && (
                        <button
                          type="button"
                          onClick={handleCopyWallet}
                          className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-[#E2E8F0] transition-colors focus-visible:outline-2 focus-visible:outline-[#E2E8F0] focus-visible:outline-offset-2"
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
              )}
            </section>

            {/* ── Offramp / Cash Out ── */}
            <section
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px',
                padding: '24px',
                backdropFilter: 'blur(24px)',
              }}
            >
              {/* Section header */}
              <div style={{ marginBottom: '16px' }}>
                <p
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.4em',
                    textTransform: 'uppercase',
                    color: '#E2E8F0',
                    marginBottom: '4px',
                  }}
                >
                  Fiat Off-ramp
                </p>
                <h3
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '18px',
                    fontWeight: 500,
                    color: '#FFFFFF',
                    margin: 0,
                    letterSpacing: '-0.3px',
                  }}
                >
                  Cash Out
                </h3>
                <p
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '13px',
                    fontWeight: 300,
                    color: 'rgba(255,255,255,0.5)',
                    marginTop: '4px',
                    lineHeight: '1.5',
                  }}
                >
                  Convert your SOL balance into fiat currency via MoonPay.
                </p>
              </div>

              {/* KYC gate alert — shown only when not verified */}
              {!kycVerified && (
                <div
                  role="alert"
                  style={{
                    background: 'rgba(245,158,11,0.07)',
                    border: '1px solid rgba(245,158,11,0.25)',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    marginBottom: '16px',
                  }}
                >
                  <ShieldAlert size={16} style={{ color: '#F59E0B', flexShrink: 0, marginTop: '1px' }} />
                  <div>
                    <p
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '13px',
                        fontWeight: 400,
                        color: 'rgba(255,255,255,0.75)',
                        margin: 0,
                        lineHeight: 1.55,
                      }}
                    >
                      Identity verification is required to use the cash-out feature.{' '}
                      <button
                        type="button"
                        onClick={() => setIsKycModalOpen(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#E2E8F0',
                          textDecoration: 'underline',
                          textUnderlineOffset: '2px',
                        }}
                      >
                        Complete verification now
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* Offramp button */}
              <button
                id="offramp-cashout-btn"
                type="button"
                disabled={!kycVerified}
                onClick={() => kycVerified && setIsOfframpOpen(true)}
                aria-disabled={!kycVerified}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: '9999px',
                  border: kycVerified
                    ? '1px solid rgba(255,255,255,0.15)'
                    : '1px solid rgba(255,255,255,0.06)',
                  background: kycVerified
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(16px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  cursor: kycVerified ? 'pointer' : 'not-allowed',
                  opacity: kycVerified ? 1 : 0.45,
                  transition: 'all 0.25s ease',
                  boxShadow: kycVerified ? '0 4px 20px -4px rgba(0,0,0,0.4)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (kycVerified) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255,0.4)';
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16, 185, 129,0.12)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px -4px rgba(16, 185, 129,0.25)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (kycVerified) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)';
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px -4px rgba(0,0,0,0.4)';
                  }
                }}
              >
                {/* Left: icon + text */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '9999px',
                      background: kycVerified ? 'rgba(255, 255, 255,0.12)' : 'rgba(255,255,255,0.05)',
                      border: kycVerified ? '1px solid rgba(255, 255, 255,0.25)' : '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: kycVerified ? '#E2E8F0' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    <ArrowDownToLine size={17} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p
                      style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#FFFFFF',
                        margin: 0,
                        lineHeight: 1.2,
                      }}
                    >
                      Cash Out via MoonPay
                    </p>
                    <p
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '11px',
                        fontWeight: 400,
                        color: 'rgba(255,255,255,0.45)',
                        margin: '2px 0 0',
                      }}
                    >
                      SOL → Bank · Card · SEPA
                    </p>
                  </div>
                </div>

                {/* Right: KYC badge or arrow */}
                {kycVerified ? (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '9999px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgba(255,255,255,0.7)',
                      flexShrink: 0,
                    }}
                  >
                    <ArrowDownToLine size={13} />
                  </div>
                ) : (
                  <span
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#F59E0B',
                      background: 'rgba(245,158,11,0.1)',
                      border: '1px solid rgba(245,158,11,0.22)',
                      borderRadius: '9999px',
                      padding: '4px 10px',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    KYC required
                  </span>
                )}
              </button>
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

      {/* ── Offramp Modal ── */}
      <OfframpModal
        isOpen={isOfframpOpen}
        onClose={() => setIsOfframpOpen(false)}
        solBalance={solBalance}
      />
    </>
  );
}

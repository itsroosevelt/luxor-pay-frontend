'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Copy, Check, ShieldCheck, ShieldAlert, Wallet, Mail, Building2, Pencil, Save, X, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { getMerchantProfile, updateMerchantProfile } from '@/lib/merchants-api';
import { useMerchant } from '@/context/MerchantContext';
import { AccountStatementViewer } from '@/components/profile/AccountStatementViewer';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { profile, setProfile } = useMerchant();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editMerchantWallet, setEditMerchantWallet] = useState('');
  const [saving, setSaving] = useState(false);
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
        const p = await getMerchantProfile(token);
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
      const token = await user.getIdToken();
      const updated = await updateMerchantProfile(token, {
        businessName: editBusinessName.trim() || undefined,
        merchantWallet: editMerchantWallet.trim() || undefined,
      });

      setProfile(updated);
      setEditBusinessName(updated.businessName || '');
      setEditMerchantWallet(updated.merchantWallet || '');
      setIsEditing(false);
      toast.success('Profile saved successfully');
    } catch {
      toast.error('Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const businessName = profile?.businessName || editBusinessName;
  const merchantWallet = profile?.merchantWallet || editMerchantWallet;
  const kycVerified = profile?.kyc ?? false;

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
              {/* Top: Avatar + identity + Edit Button */}
              <div className="relative px-6 pt-6 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                {/* Subtle gradient accent */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(ellipse at top left, rgba(37,99,235,0.14), transparent 60%)',
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

                {/* Right: Edit Button */}
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-[#60A5FA] focus-visible:outline-offset-2 self-start sm:self-center shrink-0"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    <Pencil size={14} className="text-[#60A5FA]" /> Edit Profile
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
                    className="relative z-10 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-[#60A5FA] self-start sm:self-center shrink-0"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    <X size={14} /> Cancel
                  </button>
                )}
              </div>

              {/* ── Edit Form or Info Grid ── */}
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="p-6 border-t border-white/5 bg-black/40 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Business Name Input */}
                    <div>
                      <label
                        className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5"
                        style={{ fontFamily: 'Outfit, sans-serif' }}
                      >
                        <Building2 size={12} className="text-[#60A5FA]" /> Business Name
                      </label>
                      <input
                        type="text"
                        value={editBusinessName}
                        onChange={(e) => setEditBusinessName(e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className="w-full bg-black/60 border border-white/10 focus:border-[#60A5FA] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 transition-all outline-none"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      />
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                      <label
                        className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5"
                        style={{ fontFamily: 'Outfit, sans-serif' }}
                      >
                        <Mail size={12} className="text-[#60A5FA]" /> Email (Account)
                      </label>
                      <input
                        type="text"
                        value={user?.email || ''}
                        disabled
                        className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed outline-none"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      />
                    </div>
                  </div>

                  {/* Solana Wallet Address Input */}
                  <div>
                    <label
                      className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      <Wallet size={12} className="text-[#60A5FA]" /> Solana Wallet Address
                    </label>
                    <input
                      type="text"
                      value={editMerchantWallet}
                      onChange={(e) => setEditMerchantWallet(e.target.value)}
                      placeholder="e.g. B8NUqgYnZiNLmDBZCA3cgWeRR7oWcC1xTmmXFXGaYxJ4"
                      className="w-full bg-black/60 border border-white/10 focus:border-[#60A5FA] rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-gray-600 transition-all outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
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
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white text-black hover:bg-[#2563EB] hover:text-white text-xs font-medium transition-all shadow-md disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-[#60A5FA]"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
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
              )}
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

'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Copy, Check } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchants-api';
import { AccountStatementViewer } from '@/components/profile/AccountStatementViewer';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);
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

  const initial = (businessName || user?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <>
      <header className="p-6 md:p-10 border-b border-white/5">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Profile
        </h1>
        <p className="text-gray-400 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Your account details and monthly account statements.
        </p>
      </header>

      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
        {loading ? (
          <p className="text-gray-500 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Loading…
          </p>
        ) : (
          <>
            <section className="glass-panel overflow-hidden">
              <div className="relative px-6 pt-6 pb-5">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.18),transparent_55%)]"
                />
                <div className="relative flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#60A5FA] flex items-center justify-center text-white text-xl font-semibold flex-shrink-0 shadow-[0_0_24px_rgba(37,99,235,0.35)]"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#60A5FA] mb-1">
                      Merchant profile
                    </p>
                    <h2
                      className="text-xl font-semibold text-[#EDEDED] truncate"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {businessName || 'Your business'}
                    </h2>
                    <p className="text-sm text-gray-400 truncate mt-0.5">{user?.email || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/5 border-t border-white/5">
                <div className="bg-[#0A0A0A]/60 px-6 py-4">
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1.5">
                    Business name
                  </p>
                  <p className="text-sm text-[#EDEDED]">{businessName || '—'}</p>
                </div>
                <div className="bg-[#0A0A0A]/60 px-6 py-4">
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1.5">Email</p>
                  <p className="text-sm text-[#EDEDED] break-all">{user?.email || '—'}</p>
                </div>
                <div className="bg-[#0A0A0A]/60 px-6 py-4 sm:col-span-2">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <p className="text-[11px] uppercase tracking-wider text-gray-500">
                      Solana wallet
                    </p>
                    {merchantWallet ? (
                      <button
                        type="button"
                        onClick={handleCopyWallet}
                        className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-[#60A5FA] transition-colors"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    ) : null}
                  </div>
                  <p className="text-sm text-[#EDEDED] font-mono break-all leading-relaxed">
                    {merchantWallet || '—'}
                  </p>
                </div>
              </div>
            </section>

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

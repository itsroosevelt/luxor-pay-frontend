'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchants-api';
import { AccountStatementViewer } from '@/components/profile/AccountStatementViewer';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
        {loading ? (
          <p className="text-gray-500 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Loading…
          </p>
        ) : (
          <>
            <section className="glass-panel p-6">
              <div className="flex items-center gap-4 pb-5 mb-5 border-b border-white/5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#60A5FA] flex items-center justify-center text-white text-xl font-semibold flex-shrink-0" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {(businessName || user?.email || '?').trim().charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-[#EDEDED] truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {businessName || 'Your business'}
                  </h2>
                  <p className="text-sm text-gray-400 truncate">{user?.email || '—'}</p>
                </div>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-gray-500 mb-1">Business name</dt>
                  <dd className="text-sm text-[#EDEDED]">{businessName || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-gray-500 mb-1">Email</dt>
                  <dd className="text-sm text-[#EDEDED] break-all">{user?.email || '—'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wider text-gray-500 mb-1">Solana wallet</dt>
                  <dd className="text-sm text-[#EDEDED] font-mono break-all bg-black/30 border border-white/5 rounded-lg px-3 py-2">
                    {merchantWallet || '—'}
                  </dd>
                </div>
              </dl>
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

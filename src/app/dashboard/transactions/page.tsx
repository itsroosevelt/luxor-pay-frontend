'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchants-api';
import { TransactionsContainer } from '@/components/transactions/TransactionsContainer';

export default function TransactionsPage() {
  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const token = await user.getIdToken();
        const profile = await getMerchantProfile(token);
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
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Transactions</h1>
        <p className="text-gray-400 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          All Solana transfers for your account.
        </p>
      </header>

      <div className="p-6 md:p-10 max-w-5xl mx-auto">
        {!loading ? (
          <TransactionsContainer merchantWallet={merchantWallet} />
        ) : (
          <p className="text-gray-500 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Loading...</p>
        )}
      </div>
    </>
  );
}

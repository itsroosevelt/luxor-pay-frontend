'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchants-api';
import { TransactionsContainer } from '@/components/transactions/TransactionsContainer';
import { TransferModal } from '@/components/dashboard/overview/TransferModal';

export default function TransactionsPage() {
  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

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
      <header className="px-6 py-6 md:px-10 md:py-8 border-b border-white/5 bg-white/[0.01]">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-white tracking-tight mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Transactions
          </h1>
          <p className="text-gray-400 text-sm font-light" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            All Solana transfers and settlement transactions for your account.
          </p>
        </div>
      </header>

      <div className="p-6 md:p-10 w-full max-w-7xl mx-auto">
        {!loading ? (
          <TransactionsContainer
            merchantWallet={merchantWallet}
            onTransferClick={() => setIsTransferModalOpen(true)}
          />
        ) : (
          <p className="text-gray-500 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Loading transactions...</p>
        )}
      </div>

      <TransferModal 
        isOpen={isTransferModalOpen} 
        onClose={() => setIsTransferModalOpen(false)} 
        onSuccess={() => setIsTransferModalOpen(false)} 
      />
    </>
  );
}

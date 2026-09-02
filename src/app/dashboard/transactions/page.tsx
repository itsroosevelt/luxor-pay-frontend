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
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title">
            Transactions
          </h1>
          <p className="lx-page-subtitle">
            All Solana transfers and settlement transactions for your account.
          </p>
        </div>
      </header>

      <div className="p-6 md:p-8 w-full max-w-[1600px] mx-auto min-w-0 box-border">
        {!loading ? (
          <TransactionsContainer
            merchantWallet={merchantWallet}
            onTransferClick={() => setIsTransferModalOpen(true)}
          />
        ) : (
          <p className="text-gray-500 text-sm">Loading transactions...</p>
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

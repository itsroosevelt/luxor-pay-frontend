'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchants-api';
import { TransactionsContainer } from '@/components/transactions/TransactionsContainer';
import { TransferModal } from '@/components/dashboard/overview/TransferModal';
import styled from 'styled-components';
import { Send, RefreshCw, Info } from 'lucide-react';

const TransferButton = styled.button`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #FFFFFF;
  color: #000000;

  &:hover:not(:disabled) {
    background: #2563EB;
    color: #FFFFFF;
    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);
  }
  
  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

export default function TransactionsPage() {
  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <>
      <header className="px-6 py-6 md:px-10 md:py-8 border-b border-white/5 bg-white/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-white tracking-tight mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Transactions
          </h1>
          <p className="text-gray-400 text-sm font-light" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            All Solana transfers and settlement transactions for your account.
          </p>
        </div>

        <TransferButton onClick={() => setIsTransferModalOpen(true)}>
          <Send size={16} />
          Transfer Funds
        </TransferButton>
      </header>

      <div className="p-6 md:p-10 w-full max-w-7xl mx-auto">
        {!loading ? (
          <TransactionsContainer merchantWallet={merchantWallet} />
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

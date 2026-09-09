'use client';

import { Suspense, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchants-api';
import { TransactionsContainer } from '@/components/transactions/TransactionsContainer';
import { TransferModal } from '@/components/dashboard/overview/TransferModal';

function PortalTransactionsInner() {
  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { setLoading(false); return; }
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
          <h1 className="lx-page-title">Transactions</h1>
          <p className="lx-page-subtitle">
            History of transfers and settled payments from POS Terminals and Payment Links.
          </p>
        </div>
      </header>

      <div className="mx-auto box-border w-full min-w-0 max-w-[1600px] space-y-5 p-6 md:p-8">
        {!loading ? (
          <TransactionsContainer
            merchantWallet={merchantWallet}
            onTransferClick={() => setIsTransferModalOpen(true)}
          />
        ) : (
          <p className="text-sm" style={{ color: 'var(--lx-text-dim)' }}>Cargando transacciones…</p>
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

export default function PortalTransactionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm" style={{ color: 'var(--lx-text-dim)' }}>Cargando…</div>}>
      <PortalTransactionsInner />
    </Suspense>
  );
}

'use client';

import { Suspense, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile } from '@/features/merchant/api/merchants-api';
import { TransactionsContainer } from './TransactionsContainer';
import { TransferModal } from '@/features/transfers/components/TransferModal';

interface TransactionsPageProps {
  title: string;
  subtitle: string;
}

function TransactionsInner({ title, subtitle }: TransactionsPageProps) {
  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { setLoading(false); return; }
      try {
        const profile = await getMerchantProfile();
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
          <h1 className="lx-page-title">{title}</h1>
          <p className="lx-page-subtitle">
            {subtitle}
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

/** Transaction history page shared by the dashboard and the payment portal. */
export function TransactionsPage({ title, subtitle }: TransactionsPageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-sm" style={{ color: 'var(--lx-text-dim)' }}>Cargando…</div>}>
      <TransactionsInner title={title} subtitle={subtitle} />
    </Suspense>
  );
}

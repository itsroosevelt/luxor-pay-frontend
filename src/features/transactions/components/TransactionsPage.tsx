'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile } from '@/features/merchant/api/merchants-api';
import { TransactionsContainer } from './TransactionsContainer';
import { ProposalsPanel } from '@/features/treasury/components/ProposalsPanel';
import { TransferModal } from '@/features/transfers/components/TransferModal';
import { useProposals } from '@/features/treasury/hooks/useProposals';
import { ShieldCheck, ArrowLeftRight } from 'lucide-react';
import { clsx } from 'clsx';

interface TransactionsPageProps {
  title: string;
  subtitle: string;
  showMultisig?: boolean;
}

type TransactionTab = 'multisig' | 'transfers';

function TransactionsInner({ title, subtitle, showMultisig = true }: TransactionsPageProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const proposeVault = searchParams.get('propose');

  const [activeTab, setActiveTab] = useState<TransactionTab>(() => {
    if (!showMultisig) return 'transfers';
    if (tabParam === 'transfers') return 'transfers';
    return 'multisig';
  });

  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const { data: proposals = [] } = useProposals();

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

      <div className="mx-auto box-border w-full min-w-0 max-w-[1600px] space-y-6 p-6 md:p-8">
        {showMultisig && (
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab('multisig')}
                className={clsx(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer select-none',
                  activeTab === 'multisig'
                    ? 'bg-white/10 text-white shadow-sm border border-white/15 font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                )}
              >
                <ShieldCheck size={16} className={activeTab === 'multisig' ? 'text-blue-400' : 'text-gray-400'} />
                <span>Multisig Transactions (Squads)</span>
                {proposals.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[11px] font-mono rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {proposals.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('transfers')}
                className={clsx(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer select-none',
                  activeTab === 'transfers'
                    ? 'bg-white/10 text-white shadow-sm border border-white/15 font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                )}
              >
                <ArrowLeftRight size={15} className={activeTab === 'transfers' ? 'text-purple-400' : 'text-gray-400'} />
                <span>Direct Transfers</span>
              </button>
            </div>
          </div>
        )}

        {showMultisig && activeTab === 'multisig' ? (
          <ProposalsPanel
            defaultVaultId={proposeVault ?? undefined}
            openCreateOnMount={!!proposeVault}
          />
        ) : !loading ? (
          <TransactionsContainer
            merchantWallet={merchantWallet}
            onTransferClick={() => setIsTransferModalOpen(true)}
          />
        ) : (
          <p className="text-sm" style={{ color: 'var(--lx-text-dim)' }}>Loading transactions…</p>
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
export function TransactionsPage({ title, subtitle, showMultisig = true }: TransactionsPageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-sm" style={{ color: 'var(--lx-text-dim)' }}>Loading…</div>}>
      <TransactionsInner title={title} subtitle={subtitle} showMultisig={showMultisig} />
    </Suspense>
  );
}


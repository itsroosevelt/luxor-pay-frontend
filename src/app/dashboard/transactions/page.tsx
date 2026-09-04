'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchants-api';
import { TransactionsContainer } from '@/components/transactions/TransactionsContainer';
import { ProposalsPanel } from '@/components/dashboard/proposals/ProposalsPanel';
import { TransferModal } from '@/components/dashboard/overview/TransferModal';
import { Vote, History } from 'lucide-react';

type Tab = 'proposals' | 'history';

function TransactionsInner() {
  const params = useSearchParams();
  const proposeVault = params.get('propose');

  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('proposals');

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

  const tabs = useMemo(
    () => [
      { id: 'proposals' as Tab, label: 'Propuestas', icon: Vote },
      { id: 'history' as Tab, label: 'Historial', icon: History },
    ],
    [],
  );

  return (
    <>
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title">Transacciones</h1>
          <p className="lx-page-subtitle">
            Propuestas multisig pendientes de firma e historial de transferencias liquidadas.
          </p>
        </div>
      </header>

      <div className="mx-auto box-border w-full min-w-0 max-w-[1600px] space-y-5 p-6 md:p-8">
        {/* Tab switcher */}
        <div className="inline-flex gap-1 rounded-xl p-1" style={{ background: 'var(--lx-surface-2)', border: '1px solid var(--lx-border)' }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors"
                style={{
                  background: active ? 'var(--lx-surface)' : 'transparent',
                  color: active ? 'var(--lx-text)' : 'var(--lx-text-muted)',
                  border: `1px solid ${active ? 'var(--lx-border-strong)' : 'transparent'}`,
                }}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'proposals' ? (
          <ProposalsPanel defaultVaultId={proposeVault ?? undefined} openCreateOnMount={!!proposeVault} />
        ) : !loading ? (
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

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm" style={{ color: 'var(--lx-text-dim)' }}>Cargando…</div>}>
      <TransactionsInner />
    </Suspense>
  );
}

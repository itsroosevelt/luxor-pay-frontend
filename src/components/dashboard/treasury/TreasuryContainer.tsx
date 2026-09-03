'use client';

/**
 * TreasuryContainer — Squads-style "Treasury" screen.
 *
 * Layout:
 *   1. Total Balance card (Send / Deposit / Trade)          → <WalletBalanceView>
 *   2. Coins · Stakes · NFTs summary tiles
 *   3. Accounts section  (header + "Add Account")           → <AccountsTable>
 *
 * Reuses the exact same data hooks and modals as the Overview screen so the
 * numbers stay in sync; it just omits the Limit-Order / Inflows / Stake
 * panels that live on the dashboard.
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Coins, Layers, Image as ImageIcon, Plus } from 'lucide-react';
import { useMerchant } from '@/context/MerchantContext';
import { useGetBalance } from '@/hooks/useGetBalance';
import { WalletBalanceView } from '@/components/dashboard/WalletBalanceView';
import { AccountsTable } from '@/components/dashboard/overview/AccountsTable';
import { TransferModal } from '@/components/dashboard/overview/TransferModal';
import { TransferSuccessModal } from '@/components/dashboard/overview/TransferSuccessModal';
import { QrOperationsModal } from '@/components/dashboard/overview/QrOperationsModal';
import { ReceiveModal } from '@/components/dashboard/overview/ReceiveModal';
import { PaymentRequestModal } from '@/components/dashboard/overview/PaymentRequestModal';
import type { Transfer } from '@/lib/transfers-api';

function SummaryTile({
  value,
  label,
  icon: Icon,
}: {
  value: number | string;
  label: string;
  icon: typeof Coins;
}) {
  return (
    <div className="lx-card flex flex-col justify-between gap-6 !p-5">
      <div className="flex items-start justify-between">
        <span className="text-3xl font-semibold tracking-tight" style={{ color: 'var(--lx-text)' }}>
          {value}
        </span>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-md"
          style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border)' }}
        >
          <Icon size={14} style={{ color: 'var(--lx-text-muted)' }} />
        </span>
      </div>
      <span className="text-sm" style={{ color: 'var(--lx-text-muted)' }}>
        {label}
      </span>
    </div>
  );
}

export function TreasuryContainer() {
  const router = useRouter();
  const { profile, setIsKycModalOpen } = useMerchant();
  const merchantWallet = profile?.merchantWallet ?? null;
  const businessName = profile?.businessName?.trim() || null;

  const balance = useGetBalance(merchantWallet);

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isPaymentRequestOpen, setIsPaymentRequestOpen] = useState(false);
  const [successData, setSuccessData] = useState<Transfer | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  if (!merchantWallet) {
    return (
      <div className="p-6 md:p-8">
        <div
          className="lx-card text-sm"
          style={{ borderColor: 'rgba(245, 158, 11, 0.32)', background: 'rgba(245, 158, 11, 0.06)', color: '#FDE68A' }}
        >
          Add your Solana wallet in Settings to view your treasury.
        </div>
      </div>
    );
  }

  const coinCount = 1 + (balance.data?.tokens?.length ?? 0); // native SOL + SPL tokens

  return (
    <div className="p-6 md:p-8 w-full max-w-[1600px] mx-auto space-y-6">
      {/* 1 · Total balance + actions */}
      <WalletBalanceView
        data={balance.data}
        isLoading={balance.isLoading}
        isError={balance.isError}
        errorMessage={balance.errorMessage}
        refetch={balance.refetch}
        isPrivacyMode={balance.isPrivacyMode}
        togglePrivacyMode={balance.togglePrivacyMode}
        isKycVerified={profile?.kyc ?? false}
        onVerifyClick={() => setIsKycModalOpen(true)}
        onSendClick={() => setIsTransferOpen(true)}
        onDepositClick={() => setIsQrOpen(true)}
        onTradeClick={() => router.push('/dashboard/swap')}
        merchantWallet={merchantWallet}
      />

      {/* 2 · Summary tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryTile value={balance.isLoading ? '—' : coinCount} label="Coins" icon={Coins} />
        <SummaryTile value={0} label="Stakes" icon={Layers} />
        <SummaryTile value={0} label="NFTs" icon={ImageIcon} />
      </div>

      {/* 3 · Accounts */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--lx-text)' }}>
            Accounts
          </h2>
          <button
            type="button"
            onClick={() => router.push('/dashboard/settings')}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border-strong)', color: 'var(--lx-text-muted)' }}
          >
            <Plus size={15} />
            Add Account
          </button>
        </div>

        <AccountsTable
          merchantWallet={merchantWallet}
          balanceData={balance.data}
          solBalance={balance.data?.solBalance}
          onSendClick={() => setIsTransferOpen(true)}
          onTradeClick={() => router.push('/dashboard/swap')}
        />
      </section>

      {/* Modals — identical wiring to the Overview screen */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onSuccess={(data) => {
          setSuccessData(data);
          setIsSuccessOpen(true);
        }}
      />
      <TransferSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        transferData={successData}
      />
      <ReceiveModal
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
        merchantWallet={merchantWallet}
        onAskForPayment={() => setIsPaymentRequestOpen(true)}
      />
      <PaymentRequestModal
        isOpen={isPaymentRequestOpen}
        onClose={() => setIsPaymentRequestOpen(false)}
        requesterWallet={merchantWallet}
      />
      <QrOperationsModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        merchantWallet={merchantWallet}
        recipientLabel={businessName}
        initialMode="select"
        onCreatePaymentRequest={() => setIsPaymentRequestOpen(true)}
      />
    </div>
  );
}

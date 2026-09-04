'use client';

/**
 * TreasuryContainer — Module 1 "Creación de Tesorerías / Vaults".
 *
 *   1. Total balance card (Send / Deposit / Trade)     → <WalletBalanceView>
 *   2. Multisig policy card (address · M-de-N · miembros)
 *   3. Sub-vaults (Vault PDAs) with business labels     → create + per-vault propose
 *   4. Coins · Stakes · NFTs summary tiles
 *
 * All multisig/vault data is served by `src/mocks/handlers.ts` in Mock Mode.
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Coins, Layers, Image as ImageIcon, Plus, ShieldCheck, Copy, Users,
  Landmark, ArrowUpRight, Loader2, X, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useMerchant } from '@/context/MerchantContext';
import { useGetBalance } from '@/hooks/useGetBalance';
import { useTreasury } from '@/hooks/useTreasury';
import { WalletBalanceView } from '@/components/dashboard/WalletBalanceView';
import { TransferModal } from '@/components/dashboard/overview/TransferModal';
import { TransferSuccessModal } from '@/components/dashboard/overview/TransferSuccessModal';
import { QrOperationsModal } from '@/components/dashboard/overview/QrOperationsModal';
import { ReceiveModal } from '@/components/dashboard/overview/ReceiveModal';
import { PaymentRequestModal } from '@/components/dashboard/overview/PaymentRequestModal';
import type { Transfer } from '@/lib/transfers-api';

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const short = (a: string) => (a.length > 16 ? `${a.slice(0, 6)}…${a.slice(-6)}` : a);

function SummaryTile({ value, label, icon: Icon }: { value: number | string; label: string; icon: typeof Coins }) {
  return (
    <div className="lx-card flex flex-col justify-between gap-6 !p-5">
      <div className="flex items-start justify-between">
        <span className="text-3xl font-semibold tracking-tight" style={{ color: 'var(--lx-text)' }}>{value}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border)' }}>
          <Icon size={14} style={{ color: 'var(--lx-text-muted)' }} />
        </span>
      </div>
      <span className="text-sm" style={{ color: 'var(--lx-text-muted)' }}>{label}</span>
    </div>
  );
}

export function TreasuryContainer() {
  const router = useRouter();
  const { profile, setIsKycModalOpen } = useMerchant();
  const merchantWallet = profile?.merchantWallet ?? null;
  const businessName = profile?.businessName?.trim() || null;

  const balance = useGetBalance(merchantWallet);
  const { config, vaults, isLoading: tLoading, isError: tError, errorMessage: tErr, createVault } = useTreasury();

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isPaymentRequestOpen, setIsPaymentRequestOpen] = useState(false);
  const [successData, setSuccessData] = useState<Transfer | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const [vaultModalOpen, setVaultModalOpen] = useState(false);
  const [vaultLabel, setVaultLabel] = useState('');
  const [vaultDesc, setVaultDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const copy = (v: string) => { navigator.clipboard.writeText(v); toast.success('Copied'); };

  const totalVaultUsd = vaults.reduce((s, v) => s + v.usdValue, 0);

  const submitVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultLabel.trim()) { toast.error('Please provide a label for the vault'); return; }
    setCreating(true);
    try {
      await createVault({ label: vaultLabel.trim(), description: vaultDesc.trim() });
      setVaultLabel(''); setVaultDesc(''); setVaultModalOpen(false);
      toast.success('Vault created (Vault PDA derived from multisig)');
    } catch { toast.error('Could not create vault'); }
    finally { setCreating(false); }
  };

  if (!merchantWallet) {
    return (
      <div className="p-6 md:p-8">
        <div className="lx-card text-sm" style={{ borderColor: 'var(--lx-warning)', background: 'rgba(245, 158, 11, 0.06)', color: '#FDE68A' }}>
          Add your Solana wallet in Settings to view your treasury.
        </div>
      </div>
    );
  }

  const coinCount = 1 + (balance.data?.tokens?.length ?? 0);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-6 md:p-8">
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

      {/* 2 · Multisig policy */}
      <section className="lx-card" style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border)' }}>
            <ShieldCheck size={16} style={{ color: 'var(--lx-text-muted)' }} />
          </span>
          <div>
            <p className="lx-eyebrow" style={{ marginBottom: 2 }}>Multisig Treasury · Squads v4</p>
            <button type="button" onClick={() => config && copy(config.address)}
              className="inline-flex items-center gap-1.5 font-mono text-[13px]" style={{ color: 'var(--lx-text)' }}>
              {config ? short(config.address) : '—'} <Copy size={12} />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="lx-eyebrow" style={{ marginBottom: 2 }}>Threshold</p>
            <p className="text-[15px] font-semibold tabular-nums" style={{ color: 'var(--lx-text)' }}>
              {config ? `${config.threshold}-of-N` : '—'}
            </p>
          </div>
          <button type="button" onClick={() => router.push('/dashboard/members')}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium"
            style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border-strong)', color: 'var(--lx-text-muted)' }}>
            <Users size={14} /> Members &amp; Policy <ArrowUpRight size={13} />
          </button>
        </div>
      </section>

      {/* 3 · Vaults */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--lx-text)' }}>
            Vaults <span style={{ color: 'var(--lx-text-dim)' }}>· {vaults.length}</span>
          </h2>
          <button type="button" onClick={() => setVaultModalOpen(true)}
            className="lx-btn lx-btn-primary">
            <Plus size={15} /> Create Vault
          </button>
        </div>

        {tLoading && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm" style={{ color: 'var(--lx-text-muted)' }}>
            <Loader2 size={18} className="animate-spin" /> Loading vaults…
          </div>
        )}
        {tError && (
          <div className="flex items-center gap-3 rounded-xl p-4 text-sm" style={{ background: 'var(--lx-danger-soft)', border: '1px solid var(--lx-danger)', color: 'var(--lx-danger)' }}>
            <AlertTriangle size={16} /> {tErr || 'Error loading vaults'}
          </div>
        )}

        {!tLoading && !tError && (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <AnimatePresence>
              {vaults.map((v) => (
                <motion.div
                  key={v.id}
                  layout
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: 'spring', bounce: 0.26, duration: 0.42 }}
                  className="lx-card"
                  style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 18 }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border)', color: 'var(--lx-text-muted)' }}>
                        <Landmark size={15} />
                      </span>
                      <div>
                        <p className="text-[14px] font-semibold" style={{ color: 'var(--lx-text)' }}>{v.label}</p>
                        <p className="font-mono text-[11px]" style={{ color: 'var(--lx-text-dim)' }}>#{v.index} · {short(v.address)}</p>
                      </div>
                    </div>
                    {v.isDefault && (
                      <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: 'var(--lx-fill-hover)', color: 'var(--lx-text-muted)' }}>Default</span>
                    )}
                  </div>

                  <p className="text-[12.5px]" style={{ color: 'var(--lx-text-muted)' }}>{v.description || '—'}</p>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="lx-eyebrow" style={{ marginBottom: 2 }}>Value</p>
                      <p className="text-[20px] font-semibold tracking-tight tabular-nums" style={{ color: 'var(--lx-text)' }}>{usd(v.usdValue)}</p>
                    </div>
                    <div className="flex gap-1.5">
                      {v.tokens.filter((t) => Number(t.uiAmount) > 0).map((t) => (
                        <span key={t.mint} className="rounded-md px-1.5 py-0.5 text-[10px] font-medium" style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border)', color: 'var(--lx-text-muted)' }}>
                          {t.symbol}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => router.push('/dashboard/transactions')}
                      className="lx-btn lx-btn-secondary flex-1 !py-1.5 text-[12px]">
                      View transactions
                    </button>
                    <button type="button" onClick={() => copy(v.address)}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border)', color: 'var(--lx-text-muted)' }}>
                      <Copy size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!tLoading && vaults.length > 0 && (
          <p className="text-[12px]" style={{ color: 'var(--lx-text-dim)' }}>
            Total Vault Assets: <span className="tabular-nums" style={{ color: 'var(--lx-text-muted)' }}>{usd(totalVaultUsd)}</span>
          </p>
        )}
      </section>

      {/* 4 · Holdings summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryTile value={balance.isLoading ? '—' : coinCount} label="Coins" icon={Coins} />
        <SummaryTile value={0} label="Stakes" icon={Layers} />
        <SummaryTile value={0} label="NFTs" icon={ImageIcon} />
      </div>

      {/* Create-vault modal */}
      <AnimatePresence>
        {vaultModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !creating && setVaultModalOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: 'spring', bounce: 0.3, duration: 0.45 }}
              className="lx-card-lg w-full" style={{ maxWidth: 460, boxShadow: 'var(--lx-shadow-lg)' }}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-[17px] font-semibold" style={{ color: 'var(--lx-text)' }}>
                  <Landmark size={18} style={{ color: 'var(--lx-text-muted)' }} /> Create Vault
                </h2>
                <button type="button" onClick={() => setVaultModalOpen(false)} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border)', color: 'var(--lx-text-muted)' }}>
                  <X size={15} />
                </button>
              </div>
              <form onSubmit={submitVault} className="space-y-4">
                <label className="block">
                  <span className="lx-eyebrow">Label</span>
                  <input className="mt-1.5" value={vaultLabel} onChange={(e) => setVaultLabel(e.target.value)}
                    placeholder="e.g. Marketing Vault"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'var(--lx-surface-2)', border: '1px solid var(--lx-border)', color: 'var(--lx-text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} required />
                </label>
                <label className="block">
                  <span className="lx-eyebrow">Purpose (Optional)</span>
                  <input className="mt-1.5" value={vaultDesc} onChange={(e) => setVaultDesc(e.target.value)}
                    placeholder="What will this vault be used for"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'var(--lx-surface-2)', border: '1px solid var(--lx-border)', color: 'var(--lx-text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </label>
                <p className="text-[12px]" style={{ color: 'var(--lx-text-dim)' }}>
                  A new Vault PDA will be derived under the same multisig. Starts with 0 balance.
                </p>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" className="lx-btn lx-btn-secondary" onClick={() => setVaultModalOpen(false)} disabled={creating}>Cancel</button>
                  <button type="submit" className="lx-btn lx-btn-primary" disabled={creating}>
                    {creating ? <><Loader2 size={15} className="animate-spin" /> Creating…</> : 'Create Vault'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overview-shared modals */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onSuccess={(data) => { setSuccessData(data); setIsSuccessOpen(true); }}
      />
      <TransferSuccessModal isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} transferData={successData} />
      <ReceiveModal isOpen={isReceiveOpen} onClose={() => setIsReceiveOpen(false)} merchantWallet={merchantWallet} onAskForPayment={() => setIsPaymentRequestOpen(true)} />
      <PaymentRequestModal isOpen={isPaymentRequestOpen} onClose={() => setIsPaymentRequestOpen(false)} requesterWallet={merchantWallet} />
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

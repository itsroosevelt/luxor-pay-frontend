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
    <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-between font-mono">
      <div>
        <span className="text-2xl font-bold text-white font-['Outfit'] block">{value}</span>
        <span className="text-xs text-gray-400 font-['Montserrat'] mt-1 block">{label}</span>
      </div>
      <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
        <Icon size={18} />
      </div>
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

  const copy = (v: string) => { navigator.clipboard.writeText(v); toast.success('Copied to clipboard'); };

  const totalVaultUsd = vaults.reduce((s, v) => s + v.usdValue, 0);

  const submitVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultLabel.trim()) { toast.error('Please provide a label for the vault'); return; }
    setCreating(true);
    try {
      await createVault({ label: vaultLabel.trim(), description: vaultDesc.trim() });
      setVaultLabel(''); setVaultDesc(''); setVaultModalOpen(false);
      toast.success('Vault created successfully (Derived PDA)');
    } catch { toast.error('Could not create vault'); }
    finally { setCreating(false); }
  };

  if (!merchantWallet) {
    return (
      <div className="p-6 md:p-8">
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm font-mono">
          Add your Solana wallet in Settings to view your treasury.
        </div>
      </div>
    );
  }

  const coinCount = 1 + (balance.data?.tokens?.length ?? 0);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-6 md:p-8">
      {/* 1 · Total balance (Half-width) + Multisig Policy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6">
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
        </div>

        {/* 2 · Multisig policy card (Right Half) */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <section className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 h-full flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white font-['Outfit']">
                    Multisig Treasury
                  </h3>
                  <button
                    type="button"
                    onClick={() => config && copy(config.address)}
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-400 hover:text-white transition-colors mt-0.5"
                  >
                    {config ? short(config.address) : '—'} <Copy size={11} />
                  </button>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-white/10 text-white border border-white/15">
                {config ? `${config.threshold}-of-N Threshold` : '2-of-N Threshold'}
              </span>
            </div>

            <div className="flex items-center justify-between py-4 border-y border-white/5 font-mono text-xs">
              <div>
                <span className="text-gray-400 block text-[11px]">Active Vaults</span>
                <span className="text-white font-bold text-lg">{vaults.length}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 block text-[11px]">Signers Policy</span>
                <span className="text-white font-bold text-sm">{config ? `${config.threshold}-of-N Squads` : '2-of-3 Squads'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => router.push('/dashboard/members')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-white font-['Outfit'] hover:bg-white/20 transition-colors"
              >
                <Users size={14} /> Members &amp; Policy <ArrowUpRight size={13} />
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* 3 · Vaults */}
      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white font-['Outfit']">
              Vaults
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/10 text-gray-300 border border-white/15">
              {vaults.length}
            </span>
            {!tLoading && vaults.length > 0 && (
              <span className="text-xs font-mono text-gray-400 border-l border-white/10 pl-3">
                Total: <strong className="text-white">{usd(totalVaultUsd)}</strong>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setVaultModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-['Outfit'] font-semibold text-xs hover:bg-gray-200 transition-colors"
          >
            <Plus size={15} /> Create Vault
          </button>
        </div>

        {tLoading && (
          <div className="flex items-center justify-center gap-2 py-12 text-xs font-mono text-gray-400">
            <Loader2 size={18} className="animate-spin" /> Loading vaults…
          </div>
        )}
        {tError && (
          <div className="flex items-center gap-3 rounded-2xl p-4 text-xs font-mono bg-red-500/10 border border-red-500/20 text-red-300">
            <AlertTriangle size={16} /> {tErr || 'Error loading vaults'}
          </div>
        )}

        {!tLoading && !tError && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <AnimatePresence>
              {vaults.map((v) => (
                <motion.div
                  key={v.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: 'spring', bounce: 0.26, duration: 0.42 }}
                  className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">
                        <Landmark size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white font-['Outfit'] truncate">{v.label}</p>
                      </div>
                    </div>
                    {v.isDefault && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white/10 text-gray-300 border border-white/15 shrink-0">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{v.description || '—'}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <p className="text-xl font-bold font-mono text-white">{usd(v.usdValue)}</p>
                    <div className="flex gap-1.5">
                      {v.tokens.filter((t) => Number(t.uiAmount) > 0).map((t) => (
                        <span
                          key={t.mint}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-white/10 border border-white/15 text-white"
                        >
                          {t.symbol}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => router.push('/dashboard/transactions')}
                      className="flex-1 py-2 rounded-full bg-white/5 border border-white/15 text-xs font-['Outfit'] font-medium text-white hover:bg-white/10 transition-colors text-center"
                    >
                      View transactions
                    </button>
                    <button
                      type="button"
                      onClick={() => copy(v.address)}
                      className="w-8 h-8 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0"
                      title="Copy address"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* 4 · Asset Holdings Tile */}
      <div className="w-full">
        <SummaryTile value={balance.isLoading ? '—' : coinCount} label="Active Coins & Treasury Assets" icon={Coins} />
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

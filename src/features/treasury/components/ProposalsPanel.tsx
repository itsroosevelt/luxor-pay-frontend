'use client';

/**
 * ProposalsPanel — Module 1 "Gestión de Transacciones y Propuestas".
 *
 * The proposal lifecycle: a proposer creates a proposal → signers
 * approve / reject → once approvals reach the threshold any authorised
 * member executes it. Every action is gated on the signed-in member's
 * roles and served by `src/mocks/handlers.ts` in Mock Mode.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Loader2, ArrowUpRight, Repeat, Settings2, ShieldCheck, Shuffle,
  Check, ThumbsUp, ThumbsDown, Play, Ban, ExternalLink, Clock, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useProposals } from '@/features/treasury/hooks/useProposals';
import { useMembers } from '@/features/treasury/hooks/useMembers';
import { useTreasury } from '@/features/treasury/hooks/useTreasury';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useTokenRegistry } from '@/context/TokenRegistryContext';
import {
  PROPOSAL_STATUS_META,
  type Proposal,
  type ProposalType,
  type CreateProposalPayload,
} from '@/features/treasury/api/proposals-api';

const TYPE_META: Record<ProposalType, { label: string; icon: typeof Repeat }> = {
  transfer: { label: 'Transfer', icon: ArrowUpRight },
  swap: { label: 'Swap', icon: Repeat },
  config: { label: 'Settings', icon: Settings2 },
  redistribute: { label: 'Redistribución', icon: Shuffle },
};

const PAYOUT_LABEL: Record<string, string> = {
  pending: 'Pendiente de ejecución',
  signing: 'Enviando…',
  sent: 'Pagado desde la Principal',
  failed: 'Falló — revisar',
};

/** Native SOL (the backend also accepts the wSOL mint as native). */
const NATIVE_SOL = '11111111111111111111111111111111';

const FALLBACK_TOKENS = [
  { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL' },
  { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC' },
  { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', symbol: 'USDT' },
  { mint: '3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE', symbol: 'LXR' },
];

const EXPLORER_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'devnet';
const EXPLORER_CLUSTER = EXPLORER_NETWORK === 'mainnet-beta' ? '' : `?cluster=${EXPLORER_NETWORK}`;

const short = (a: string) => (a && a.length > 14 ? `${a.slice(0, 5)}…${a.slice(-5)}` : a || '—');
const timeAgo = (iso: string) => {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

function StatusChip({ status }: { status: Proposal['status'] }) {
  const meta = PROPOSAL_STATUS_META[status];
  const tone = meta?.tone ?? 'neutral';
  const isPositive = tone === 'positive' || status === 'executed' || status === 'approved';
  const isNegative = tone === 'negative' || status === 'rejected' || status === 'cancelled';
  const isActive = tone === 'active' || status === 'active' || status === 'draft';

  const style: React.CSSProperties = isPositive
    ? { background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', borderColor: 'rgba(16, 185, 129, 0.3)' }
    : isNegative
    ? { background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.3)' }
    : isActive
    ? { background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', borderColor: 'rgba(245, 158, 11, 0.3)' }
    : { background: 'rgba(255, 255, 255, 0.06)', color: 'rgba(255, 255, 255, 0.6)', borderColor: 'rgba(255, 255, 255, 0.15)' };
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold" style={style}>
      {isActive && <Clock size={11} />}
      {isPositive && <Check size={11} />}
      {isNegative && <Ban size={11} />}
      {meta?.label || status}
    </span>
  );
}

function VoteBar({ have, need }: { have: number; need: number }) {
  const pct = Math.min(100, Math.round((have / Math.max(1, need)) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: have >= need ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)' }} />
      </div>
      <span className="tabular-nums text-[11px] font-medium" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{have}/{need}</span>
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10,
  background: 'var(--lx-surface-2)', border: '1px solid var(--lx-border)',
  color: 'var(--lx-text)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
};

export function ProposalsPanel({
  defaultVaultId, openCreateOnMount, defaultType, onCloseCreate,
}: { defaultVaultId?: string; openCreateOnMount?: boolean; defaultType?: ProposalType; onCloseCreate?: () => void }) {
  const { data: proposals, isLoading, isError, errorMessage, refetch, createProposal, approve, reject, execute, cancel, activate, countReclaimable, reclaimRent } = useProposals();
  const { data: members } = useMembers();
  const { vaults, config } = useTreasury();
  const { tokens } = useTokenRegistry();

  const tokenList = tokens.length ? tokens.map((t) => ({ mint: t.mint, symbol: t.symbol })) : FALLBACK_TOKENS;
  // The connected wallet is the acting member (it is the one that signs on-chain).
  const { publicKey, connected } = useWallet();
  const { setVisible: openWalletModal } = useWalletModal();

  // Creating, voting and executing all require a connected wallet that signs.
  const requireWallet = (): boolean => {
    if (connected) return true;
    toast.error('Conecta tu wallet (Phantom o Solflare) para realizar esta acción.');
    openWalletModal(true);
    return false;
  };
  const connectedWallet = publicKey?.toBase58();
  // With a wallet connected, "me" is strictly that wallet's member (it is what signs);
  // a non-member wallet gets no action buttons instead of ones the backend will reject.
  const me = useMemo(
    () =>
      connectedWallet
        ? members.find((m) => m.walletAddress === connectedWallet) ?? null
        : members.find((m) => m.isCurrentUser) ?? null,
    [members, connectedWallet],
  );
  // Once on-chain, only members that are actually in the multisig can vote.
  const signers = useMemo(
    () => members.filter((m) => m.roles.signer && (!config?.onChain || m.onChain !== false)),
    [members, config?.onChain],
  );
  const effectiveSignerCount = signers.length > 0 ? signers.length : 1;
  const effectiveThreshold = config?.onChain ? (config?.threshold ?? 1) : Math.min(config?.threshold ?? 1, effectiveSignerCount);
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? 'Member';

  const canPropose = true; // Any connected user or merchant can create proposals

  // `detail` is derived from the id so it always reflects the freshest list data.
  const [detailId, setDetailId] = useState<string | null>(null);
  const detail = useMemo(() => proposals.find((p) => p.id === detailId) ?? null, [proposals, detailId]);
  // Opened from Send/Trade only after the caller checked the wallet; re-checked on submit.
  const [createOpen, setCreateOpen] = useState(!!openCreateOnMount);
  const [busy, setBusy] = useState<string | null>(null);

  const [form, setForm] = useState<{ type: ProposalType; vaultId: string; title: string; destination: string; destinationLabel: string; amount: string; mint: string; memo: string }>({
    type: defaultType ?? 'transfer', vaultId: defaultVaultId ?? '', title: '', destination: '', destinationLabel: '', amount: '', mint: '', memo: '',
  });

  // Effective values fall back to the first loaded vault / a stablecoin until the user picks.
  const effVaultId = form.vaultId || defaultVaultId || vaults[0]?.id || '';
  // What can be sent/swapped is what the source vault actually holds (SOL = native).
  const sourceVault = vaults.find((v) => v.id === effVaultId);
  const heldTokens = sourceVault
    ? [
        ...(Number(sourceVault.solBalance) > 0 ? [{ mint: NATIVE_SOL, symbol: 'SOL' }] : []),
        ...sourceVault.tokens.filter((t) => Number(t.uiAmount) > 0).map((t) => ({ mint: t.mint, symbol: t.symbol })),
      ]
    : [];
  const sendList = heldTokens.length ? heldTokens : tokenList;
  const effMint = sendList.some((t) => t.mint === form.mint) ? form.mint : sendList[0]?.mint || '';

  const run = async <T,>(label: string, fn: () => Promise<T>, ok: string | ((result: T) => string)) => {
    if (!requireWallet()) return;
    setBusy(label);
    try { const result = await fn(); toast.success(typeof ok === 'function' ? ok(result) : ok); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Action failed'); }
    finally { setBusy(null); }
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireWallet()) return;
    if (!form.title.trim()) { toast.error('Please enter a proposal title'); return; }
    if (form.type !== 'config' && !effVaultId) { toast.error('Select a source vault'); return; }
    if (form.type === 'transfer' && !form.destination.trim()) { toast.error('Recipient address is required'); return; }
    if (form.type === 'swap' && !form.destination) { toast.error('Choose the token to receive'); return; }
    if (form.type === 'swap' && form.destination === effMint) { toast.error('Pick two different tokens'); return; }
    if (form.type !== 'config' && !form.amount.trim()) { toast.error('Amount is required'); return; }

    const payload: CreateProposalPayload = {
      type: form.type,
      title: form.title.trim(),
      vaultId: effVaultId,
      amount: form.amount.trim(),
      mint: effMint,
      destination: form.destination.trim(),
      destinationLabel: form.destinationLabel.trim(),
      memo: form.memo.trim(),
    };
    setBusy('create');
    try {
      const created = await createProposal(payload);
      setCreateOpen(false);
      onCloseCreate?.();
      setForm((f) => ({ ...f, title: '', destination: '', destinationLabel: '', amount: '', memo: '' }));
      // When the creator's vote already meets the threshold it executes in the same signature.
      toast.success(created?.status === 'executed' ? 'Propuesta ejecutada on-chain' : 'Proposal created · open for voting');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Could not create proposal'); }
    finally { setBusy(null); }
  };

  // Finished proposals still hold the SOL that paid for their accounts: the team can get it back.
  const [reclaimable, setReclaimable] = useState(0);
  const [reclaiming, setReclaiming] = useState(false);
  useEffect(() => {
    let alive = true;
    void countReclaimable().then((n) => { if (alive) setReclaimable(n); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposals.length, proposals.map((p) => p.status).join()]);

  const handleReclaim = async () => {
    if (!requireWallet()) return;
    setReclaiming(true);
    try {
      const { count, remaining } = await reclaimRent();
      toast.success(count === 0 ? 'No hay propuestas por cerrar.' : remaining > 0 ? `Se cerraron ${count} propuestas y recuperaste su rent. Quedan ${remaining}: pulsa de nuevo.` : `Se cerraron ${count} propuestas y recuperaste su rent.`);
      setReclaimable(remaining);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo recuperar el rent');
    } finally {
      setReclaiming(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--lx-text-muted)' }}>
          <ShieldCheck size={14} />
          Current Threshold: <strong style={{ color: 'var(--lx-text)' }}>{config ? `${effectiveThreshold} of ${effectiveSignerCount}` : '—'}</strong> signers
        </div>
        <div className="flex items-center gap-2">
        {reclaimable > 0 && (
          <button type="button" className="lx-btn" disabled={!connected || reclaiming}
            title="Cierra las propuestas terminadas y devuelve a quien las creó el SOL que costaron sus cuentas"
            onClick={handleReclaim}>
            {reclaiming ? <Loader2 size={14} className="animate-spin" /> : null} Recuperar rent ({reclaimable})
          </button>
        )}
        <button type="button" className="lx-btn lx-btn-primary" disabled={!connected}
          title={!connected ? 'Conecta tu wallet para crear propuestas' : undefined}
          onClick={() => { if (!requireWallet()) return; setCreateOpen(true); }}>
          <Plus size={15} /> New Proposal
        </button>
        </div>
      </div>

      {isLoading && proposals.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm" style={{ color: 'var(--lx-text-muted)' }}>
          <Loader2 size={18} className="animate-spin" /> Loading proposals…
        </div>
      )}
      {isError && (
        // The last known list stays visible below; this only says it couldn't be refreshed.
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl p-3 text-sm" style={{ background: 'var(--lx-danger-soft)', border: '1px solid var(--lx-danger)', color: 'var(--lx-danger)' }}>
          <span className="flex items-center gap-2">
            <AlertTriangle size={16} />
            {proposals.length > 0 ? 'No se pudieron actualizar las propuestas. ' : ''}
            {errorMessage || 'Error loading proposals'}
          </span>
          <button type="button" className="lx-btn lx-btn-secondary !py-1.5 text-[12px]" onClick={() => { void refetch(); }} disabled={isLoading}>
            {isLoading ? <Loader2 size={13} className="animate-spin" /> : null} Reintentar
          </button>
        </div>
      )}
      {!isLoading && !isError && proposals.length === 0 && (
        <div className="rounded-xl p-10 text-center text-sm" style={{ background: 'var(--lx-surface-2)', border: '1px dashed var(--lx-border-strong)', color: 'var(--lx-text-muted)' }}>
          No proposals yet. Create your first proposal to transfer funds from a vault.
        </div>
      )}

      {proposals.length > 0 && (
        <div className="space-y-2.5">
          <AnimatePresence>
            {proposals.map((p) => {
              const TypeIcon = TYPE_META[p.type].icon;
              return (
                <motion.button
                  key={p.id}
                  layout type="button"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ type: 'spring', bounce: 0.24, duration: 0.4 }}
                  onClick={() => setDetailId(p.id)}
                  className="lx-card-interactive w-full text-left"
                  style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border)', color: 'var(--lx-text-muted)' }}>
                        <TypeIcon size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold" style={{ color: 'var(--lx-text)' }}>{p.title}</p>
                        <p className="text-[12px]" style={{ color: 'var(--lx-text-dim)' }}>
                          #{p.index} · {p.vaultLabel} · {nameOf(p.createdBy)} · {timeAgo(p.createdAt)}
                        </p>
                      </div>
                    </div>
                    <StatusChip status={p.status} />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="tabular-nums text-[13px] font-medium" style={{ color: 'var(--lx-text)' }}>
                      {p.amount ? `${p.amount} ${p.symbol}` : TYPE_META[p.type].label}
                      {p.type === 'swap' && p.destinationLabel && (
                        <span style={{ color: 'var(--lx-text-dim)' }}> → {p.destinationLabel}</span>
                      )}
                      {p.type === 'transfer' && p.destination && (
                        <span style={{ color: 'var(--lx-text-dim)' }}> → {p.destinationLabel || short(p.destination)}</span>
                      )}
                    </span>
                    <div className="w-40">
                      <VoteBar have={p.approvals.length} need={p.threshold} />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* detail modal */}
      <AnimatePresence>
        {detail && (
          <Modal onClose={() => setDetailId(null)} title={detail.title} icon={(() => { const I = TYPE_META[detail.type].icon; return <I size={18} style={{ color: 'var(--lx-text-muted)' }} />; })()} maxWidth={560}>
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip status={detail.status} />
                <span className="text-[12px]" style={{ color: 'var(--lx-text-dim)' }}>#{detail.index} · {TYPE_META[detail.type].label}</span>
              </div>

              <div className="grid gap-x-6 gap-y-2.5 rounded-xl p-4 sm:grid-cols-2" style={{ background: 'var(--lx-surface-2)', border: '1px solid var(--lx-border)' }}>
                <Row label="Source Vault" value={detail.vaultLabel} />
                <Row label="Amount" value={detail.amount ? `${detail.amount} ${detail.symbol}` : '—'} />
                {detail.type === 'transfer' && (
                  <Row label="Destination" value={detail.destinationLabel ? `${detail.destinationLabel} · ${short(detail.destination)}` : short(detail.destination)} mono />
                )}
                {detail.type === 'swap' && (
                  <Row label="Receive (minimum)" value={detail.destinationLabel || short(detail.destination)} />
                )}
                {detail.type === 'redistribute' && (
                  <Row label="Destination" value={detail.destinationLabel || detail.destination} full />
                )}
                {detail.custodial && (
                  <Row
                    label="Payout"
                    value={`${PAYOUT_LABEL[detail.payoutStatus ?? 'pending'] ?? detail.payoutStatus}${detail.payoutError ? ` · ${detail.payoutError}` : ''}`}
                    full
                  />
                )}
                <Row label="Created by" value={nameOf(detail.createdBy)} />
                <Row label="Threshold" value={`${detail.threshold} of ${signers.length}`} />
                {detail.memo && <Row label="Note" value={detail.memo} full />}
                {detail.executedSig && <Row label="Signature" value={short(detail.executedSig)} mono full />}
              </div>

              {/* vote roster */}
              <div>
                <p className="lx-eyebrow" style={{ marginBottom: 8 }}>Votes ({detail.approvals.length}/{detail.threshold} required to execute)</p>
                <VoteBar have={detail.approvals.length} need={detail.threshold} />
                <div className="mt-3 space-y-1.5">
                  {signers.map((s) => {
                    const approved = detail.approvals.includes(s.id);
                    const rejected = detail.rejections.includes(s.id);
                    return (
                      <div key={s.id} className="flex items-center justify-between text-[13px]">
                        <span style={{ color: 'var(--lx-text-muted)' }}>{s.name}{s.isCurrentUser ? ' · you' : ''}</span>
                        <span className="inline-flex items-center gap-1 text-[12px] font-medium" style={{ color: approved ? '#FFFFFF' : rejected ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.4)' }}>
                          {approved ? <><ThumbsUp size={12} /> Approved</> : rejected ? <><ThumbsDown size={12} /> Rejected</> : 'Pending'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* actions */}
              <ProposalActions
                p={detail} me={me} busy={busy} connected={connected}
                onApprove={() => run('approve', () => approve(detail.id), (p) => (p?.status === 'executed' ? 'Aprobada y ejecutada on-chain' : 'Approval vote registered'))}
                onReject={() => run('reject', () => reject(detail.id), 'Rejection vote registered')}
                onExecute={() => run('execute', () => execute(detail.id), 'Proposal executed on-chain')}
                onActivate={() => run('activate', () => activate(detail.id), 'Proposal opened for voting')}
                onCancel={() => run('cancel', async () => { await cancel(detail.id); }, 'Proposal cancelled')}
              />
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* create modal */}
      <AnimatePresence>
        {createOpen && (
          <Modal onClose={() => { if (busy !== 'create') { setCreateOpen(false); onCloseCreate?.(); } }} title="New Proposal" icon={<Plus size={18} style={{ color: 'rgba(255,255,255,0.7)' }} />} maxWidth={520}>
            <form onSubmit={submitCreate} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase' }}>
                  TITLE *
                </label>
                <input
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Vendor payout"
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase' }}>
                  SOURCE VAULT *
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  value={effVaultId}
                  onChange={(e) => setForm((f) => ({ ...f, vaultId: e.target.value }))}
                >
                  {vaults.map((v) => (
                    <option key={v.id} value={v.id} style={{ background: '#0A0A0A', color: '#FFFFFF' }}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase' }}>
                  DESTINATION *
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  value={vaults.find((v) => v.id !== effVaultId && v.address && v.address === form.destination)?.id ?? ''}
                  onChange={(e) => {
                    const target = vaults.find((v) => v.id === e.target.value);
                    if (target) {
                      setForm((f) => ({
                        ...f,
                        destination: target.address ?? '',
                        destinationLabel: target.label ?? '',
                      }));
                    } else {
                      setForm((f) => ({
                        ...f,
                        destination: '',
                        destinationLabel: '',
                      }));
                    }
                  }}
                >
                  <option value="" style={{ background: '#0A0A0A', color: '#FFFFFF' }}>
                    External address (Phantom / Solflare)
                  </option>
                  {vaults
                    .filter((v) => v.id !== effVaultId && v.address)
                    .map((v) => (
                      <option key={v.id} value={v.id} style={{ background: '#0A0A0A', color: '#FFFFFF' }}>
                        {v.label}
                      </option>
                    ))}
                </select>
              </div>

              {/* Dynamic Animated Extension: Recipient Details */}
              <AnimatePresence mode="wait">
                {!vaults.some((v) => v.id !== effVaultId && v.address && v.address === form.destination && form.destination !== '') ? (
                  <motion.div
                    key="external-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase' }}>
                        RECIPIENT ADDRESS (BILLETERA PHANTOM / SOLFLARE) *
                      </label>
                      <input
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          borderRadius: 14,
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#FFFFFF',
                          fontFamily: 'monospace',
                          fontSize: 13,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                        value={form.destination}
                        onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                        placeholder="Pega la dirección base58 de tu billetera"
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase' }}>
                        RECIPIENT LABEL (OPTIONAL)
                      </label>
                      <input
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          borderRadius: 14,
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#FFFFFF',
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: 14,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                        value={form.destinationLabel}
                        onChange={(e) => setForm((f) => ({ ...f, destinationLabel: e.target.value }))}
                        placeholder="e.g. Mi Phantom Personal"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="internal-preview"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 14,
                      padding: 16,
                      fontSize: 13,
                      color: 'rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    Destino interno: <strong style={{ color: '#FFFFFF' }}>{form.destinationLabel || 'Bóveda Interna'}</strong>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255, 255, 255, 0.45)', marginTop: 4, wordBreak: 'break-all' }}>
                      {form.destination}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Amount & Token Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase' }}>
                    AMOUNT *
                  </label>
                  <input
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 14,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#FFFFFF',
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    inputMode="decimal"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase' }}>
                    TOKEN *
                  </label>
                  <select
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 14,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#FFFFFF',
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    value={effMint}
                    onChange={(e) => setForm((f) => ({ ...f, mint: e.target.value }))}
                  >
                    {sendList.map((t) => (
                      <option key={t.mint} value={t.mint} style={{ background: '#0A0A0A', color: '#FFFFFF' }}>
                        {t.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase' }}>
                  NOTE (OPTIONAL)
                </label>
                <input
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  value={form.memo}
                  onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
                  placeholder="Internal reference"
                />
              </div>

              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
                The proposal opens for voting immediately. It requires {config?.threshold ?? 1} approvals to be executed.
              </p>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  disabled={busy === 'create'}
                  style={{
                    flex: 1,
                    height: 44,
                    padding: '11px 24px',
                    borderRadius: 9999,
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#E2E8F0',
                    cursor: 'pointer',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    fontFamily: 'Outfit, sans-serif',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy === 'create' || !connected}
                  title={!connected ? 'Conecta tu wallet para enviar la propuesta' : undefined}
                  style={{
                    flex: 1,
                    height: 44,
                    padding: '11px 24px',
                    borderRadius: 9999,
                    background: '#FFFFFF',
                    border: 'none',
                    color: '#000000',
                    cursor: 'pointer',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    fontFamily: 'Outfit, sans-serif',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {busy === 'create' ? <><Loader2 size={15} className="animate-spin" /> Creating…</> : 'Create Proposal'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── helpers ── */

function Row({ label, value, mono, full }: { label: string; value: string; mono?: boolean; full?: boolean }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <p className="lx-eyebrow" style={{ marginBottom: 2 }}>{label}</p>
      <p className={`text-[13px] ${mono ? 'font-mono break-all' : ''}`} style={{ color: 'var(--lx-text)' }}>{value}</p>
    </div>
  );
}

function ProposalActions({
  p, me, busy, connected, onApprove, onReject, onExecute, onActivate, onCancel,
}: {
  p: Proposal; me: ReturnType<typeof useMembers>['data'][number] | null; busy: string | null; connected?: boolean;
  onApprove: () => void; onReject: () => void; onExecute: () => void; onActivate: () => void; onCancel: () => void;
}) {
  if (!me) return null;
  const iVoted = p.approvals.includes(me.id) || p.rejections.includes(me.id);
  const isOwnerOrAdmin = p.createdBy === me.id || me.roles.admin;
  const spin = <Loader2 size={15} className="animate-spin" />;

  if (p.status === 'executed') {
    return p.executedSig ? (
      <a href={`https://explorer.solana.com/tx/${p.executedSig}${EXPLORER_CLUSTER}`} target="_blank" rel="noopener noreferrer"
        className="lx-btn lx-btn-secondary w-full justify-center">
        Ver en Solana Explorer <ExternalLink size={13} />
      </a>
    ) : null;
  }
  if (p.status === 'rejected' || p.status === 'cancelled') {
    return <p className="text-center text-[13px]" style={{ color: 'var(--lx-text-dim)' }}>Esta propuesta está cerrada.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {p.status === 'draft' && isOwnerOrAdmin && (
        <button type="button" className="lx-btn lx-btn-primary flex-1 justify-center" disabled={!connected || !!busy} title={!connected ? 'Conecta tu wallet para abrir a votación' : undefined} onClick={onActivate}>
          {busy === 'activate' ? spin : <><Play size={14} /> Abrir a votación</>}
        </button>
      )}

      {p.status === 'active' && me.roles.signer && !iVoted && (
        <>
          <button type="button" className="lx-btn lx-btn-primary flex-1 justify-center" disabled={!connected || !!busy} title={!connected ? 'Conecta tu wallet para votar' : undefined} onClick={onApprove}>
            {busy === 'approve' ? spin : <><ThumbsUp size={14} /> Aprobar</>}
          </button>
          <button type="button" className="lx-btn lx-btn-secondary flex-1 justify-center" style={{ color: 'var(--lx-danger)' }} disabled={!connected || !!busy} title={!connected ? 'Conecta tu wallet para votar' : undefined} onClick={onReject}>
            {busy === 'reject' ? spin : <><ThumbsDown size={14} /> Rechazar</>}
          </button>
        </>
      )}

      {p.status === 'active' && me.roles.signer && iVoted && (
        <p className="flex-1 text-center text-[13px]" style={{ color: 'var(--lx-text-dim)' }}>Ya registraste tu voto.</p>
      )}
      {p.status === 'active' && !me.roles.signer && (
        <p className="flex-1 text-center text-[13px]" style={{ color: 'var(--lx-text-dim)' }}>No tienes rol de Firmante para votar.</p>
      )}

      {p.status === 'approved' && (me.roles.signer || me.roles.proposer || me.roles.admin) && (
        <button type="button" className="lx-btn lx-btn-primary flex-1 justify-center" disabled={!connected || !!busy} title={!connected ? 'Conecta tu wallet para ejecutar' : undefined} onClick={onExecute}>
          {busy === 'execute' ? spin : <><Play size={14} /> Ejecutar on-chain</>}
        </button>
      )}

      {(p.status === 'draft' || p.status === 'active') && isOwnerOrAdmin && (
        <button type="button" className="lx-btn lx-btn-secondary justify-center" disabled={!connected || !!busy} title={!connected ? 'Conecta tu wallet para cancelar' : undefined} onClick={onCancel}>
          {busy === 'cancel' ? spin : <><Ban size={14} /> Cancelar</>}
        </button>
      )}
    </div>
  );
}

function Modal({
  title, icon, onClose, children, maxWidth = 520,
}: { title: string; icon: React.ReactNode; onClose: () => void; children: React.ReactNode; maxWidth?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', bounce: 0.35, duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '88vh',
          overflowY: 'auto',
          background: 'rgba(10, 10, 10, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 40,
          padding: '36px 40px',
          boxShadow: '0 32px 64px -16px rgba(0, 0, 0, 0.9)',
        }}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 font-['Outfit'] text-[24px] font-medium tracking-tight text-white">{icon} {title}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

'use client';

/**
 * ProposalsPanel — Module 1 "Gestión de Transacciones y Propuestas".
 *
 * The Squads-style lifecycle: a proposer creates a proposal → signers
 * approve / reject → once approvals reach the threshold any authorised
 * member executes it. Every action is gated on the signed-in member's
 * roles and served by `src/mocks/handlers.ts` in Mock Mode.
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Loader2, ArrowUpRight, Repeat, Settings2, ShieldCheck,
  Check, ThumbsUp, ThumbsDown, Play, Ban, ExternalLink, Clock, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useProposals } from '@/hooks/useProposals';
import { useMembers } from '@/hooks/useMembers';
import { useTreasury } from '@/hooks/useTreasury';
import { useTokenRegistry } from '@/context/TokenRegistryContext';
import {
  PROPOSAL_STATUS_META,
  type Proposal,
  type ProposalType,
  type CreateProposalPayload,
} from '@/lib/proposals-api';

const TYPE_META: Record<ProposalType, { label: string; icon: typeof Repeat }> = {
  transfer: { label: 'Transfer', icon: ArrowUpRight },
  swap: { label: 'Swap', icon: Repeat },
  config: { label: 'Settings', icon: Settings2 },
};

const FALLBACK_TOKENS = [
  { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL' },
  { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC' },
  { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', symbol: 'USDT' },
  { mint: '3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE', symbol: 'LXR' },
];

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
  const tone = meta.tone;
  const style: React.CSSProperties =
    tone === 'positive'
      ? { background: 'var(--lx-success-soft)', color: 'var(--lx-success)', borderColor: 'var(--lx-success-border)' }
      : tone === 'negative'
      ? { background: 'var(--lx-danger-soft)', color: 'var(--lx-danger)', borderColor: 'var(--lx-danger)' }
      : tone === 'active'
      ? { background: 'var(--lx-fill-hover)', color: 'var(--lx-text)', borderColor: 'var(--lx-border-hover)' }
      : { background: 'var(--lx-fill)', color: 'var(--lx-text-dim)', borderColor: 'var(--lx-border)' };
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold" style={style}>
      {tone === 'active' && <Clock size={11} />}
      {tone === 'positive' && <Check size={11} />}
      {tone === 'negative' && <Ban size={11} />}
      {meta.label}
    </span>
  );
}

function VoteBar({ have, need }: { have: number; need: number }) {
  const pct = Math.min(100, Math.round((have / Math.max(1, need)) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--lx-surface-2)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: have >= need ? 'var(--lx-success)' : 'var(--lx-text-muted)' }} />
      </div>
      <span className="tabular-nums text-[11px] font-medium" style={{ color: 'var(--lx-text-muted)' }}>{have}/{need}</span>
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10,
  background: 'var(--lx-surface-2)', border: '1px solid var(--lx-border)',
  color: 'var(--lx-text)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
};

export function ProposalsPanel({
  defaultVaultId, openCreateOnMount,
}: { defaultVaultId?: string; openCreateOnMount?: boolean }) {
  const { data: proposals, isLoading, isError, errorMessage, createProposal, approve, reject, execute, cancel, activate } = useProposals();
  const { data: members } = useMembers();
  const { vaults, config } = useTreasury();
  const { tokens } = useTokenRegistry();

  const tokenList = tokens.length ? tokens.map((t) => ({ mint: t.mint, symbol: t.symbol })) : FALLBACK_TOKENS;
  const me = useMemo(() => members.find((m) => m.isCurrentUser) ?? null, [members]);
  const signers = useMemo(() => members.filter((m) => m.roles.signer), [members]);
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? 'Member';

  const canPropose = !!me && (me.roles.proposer || me.roles.admin);

  // `detail` is derived from the id so it always reflects the freshest list data.
  const [detailId, setDetailId] = useState<string | null>(null);
  const detail = useMemo(() => proposals.find((p) => p.id === detailId) ?? null, [proposals, detailId]);
  const [createOpen, setCreateOpen] = useState(!!openCreateOnMount);
  const [busy, setBusy] = useState<string | null>(null);

  const [form, setForm] = useState<{ type: ProposalType; vaultId: string; title: string; destination: string; destinationLabel: string; amount: string; mint: string; memo: string }>({
    type: 'transfer', vaultId: defaultVaultId ?? '', title: '', destination: '', destinationLabel: '', amount: '', mint: '', memo: '',
  });

  // Effective values fall back to the first loaded vault / a stablecoin until the user picks.
  const effVaultId = form.vaultId || defaultVaultId || vaults[0]?.id || '';
  const effMint = form.mint || tokenList[1]?.mint || tokenList[0]?.mint || '';

  const run = async (label: string, fn: () => Promise<unknown>, ok: string) => {
    setBusy(label);
    try { await fn(); toast.success(ok); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Action failed'); }
    finally { setBusy(null); }
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPropose) { toast.error('Proposer role required'); return; }
    if (!form.title.trim()) { toast.error('Please enter a proposal title'); return; }
    if (form.type !== 'config' && !effVaultId) { toast.error('Select a source vault'); return; }
    if (form.type === 'transfer' && !form.destination.trim()) { toast.error('Recipient address is required'); return; }
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
      await createProposal(payload);
      setCreateOpen(false);
      setForm((f) => ({ ...f, title: '', destination: '', destinationLabel: '', amount: '', memo: '' }));
      toast.success('Proposal created · open for voting');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Could not create proposal'); }
    finally { setBusy(null); }
  };

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--lx-text-muted)' }}>
          <ShieldCheck size={14} />
          Current Threshold: <strong style={{ color: 'var(--lx-text)' }}>{config ? `${config.threshold} of ${signers.length}` : '—'}</strong> signers
        </div>
        <button type="button" className="lx-btn lx-btn-primary" disabled={!canPropose}
          onClick={() => { if (!canPropose) { toast.error('Proposer role required'); return; } setCreateOpen(true); }}>
          <Plus size={15} /> New Proposal
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm" style={{ color: 'var(--lx-text-muted)' }}>
          <Loader2 size={18} className="animate-spin" /> Loading proposals…
        </div>
      )}
      {isError && (
        <div className="flex items-center gap-3 rounded-xl p-4 text-sm" style={{ background: 'var(--lx-danger-soft)', border: '1px solid var(--lx-danger)', color: 'var(--lx-danger)' }}>
          <AlertTriangle size={16} /> {errorMessage || 'Error loading proposals'}
        </div>
      )}
      {!isLoading && !isError && proposals.length === 0 && (
        <div className="rounded-xl p-10 text-center text-sm" style={{ background: 'var(--lx-surface-2)', border: '1px dashed var(--lx-border-strong)', color: 'var(--lx-text-muted)' }}>
          No proposals yet. Create your first proposal to transfer funds from a vault.
        </div>
      )}

      {!isLoading && !isError && proposals.length > 0 && (
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
                        <span className="inline-flex items-center gap-1 text-[12px] font-medium" style={{ color: approved ? 'var(--lx-success)' : rejected ? 'var(--lx-danger)' : 'var(--lx-text-dim)' }}>
                          {approved ? <><ThumbsUp size={12} /> Approved</> : rejected ? <><ThumbsDown size={12} /> Rejected</> : 'Pending'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* actions */}
              <ProposalActions
                p={detail} me={me} busy={busy}
                onApprove={() => run('approve', () => approve(detail.id), 'Approval vote registered')}
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
          <Modal onClose={() => busy !== 'create' && setCreateOpen(false)} title="New Proposal" icon={<Plus size={18} style={{ color: 'var(--lx-text-muted)' }} />} maxWidth={520}>
            <form onSubmit={submitCreate} className="space-y-4">
              <div className="flex gap-2">
                {(['transfer', 'swap'] as ProposalType[]).map((t) => {
                  const I = TYPE_META[t].icon;
                  const active = form.type === t;
                  return (
                    <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, type: t }))}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-medium"
                      style={{ background: active ? 'var(--lx-fill-hover)' : 'var(--lx-surface-2)', color: active ? 'var(--lx-text)' : 'var(--lx-text-muted)', border: `1px solid ${active ? 'var(--lx-border-hover)' : 'var(--lx-border)'}` }}>
                      <I size={14} /> {TYPE_META[t].label}
                    </button>
                  );
                })}
              </div>

              <label className="block">
                <span className="lx-eyebrow">Title</span>
                <input style={fieldStyle} className="mt-1.5" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Vendor payout" required />
              </label>

              <label className="block">
                <span className="lx-eyebrow">Source Vault</span>
                <select style={fieldStyle} className="mt-1.5" value={effVaultId} onChange={(e) => setForm((f) => ({ ...f, vaultId: e.target.value }))}>
                  {vaults.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
              </label>

              {form.type === 'transfer' && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="col-span-2 block">
                    <span className="lx-eyebrow">Recipient Address</span>
                    <input style={{ ...fieldStyle, fontFamily: 'monospace', fontSize: 13 }} className="mt-1.5" value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))} placeholder="Pubkey base58" required />
                  </label>
                  <label className="col-span-2 block">
                    <span className="lx-eyebrow">Recipient Label (Optional)</span>
                    <input style={fieldStyle} className="mt-1.5" value={form.destinationLabel} onChange={(e) => setForm((f) => ({ ...f, destinationLabel: e.target.value }))} placeholder="e.g. Green Highlands" />
                  </label>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="lx-eyebrow">Amount</span>
                  <input style={fieldStyle} className="mt-1.5" inputMode="decimal" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00" required />
                </label>
                <label className="block">
                  <span className="lx-eyebrow">Token</span>
                  <select style={fieldStyle} className="mt-1.5" value={effMint} onChange={(e) => setForm((f) => ({ ...f, mint: e.target.value }))}>
                    {tokenList.map((t) => <option key={t.mint} value={t.mint}>{t.symbol}</option>)}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="lx-eyebrow">Note (Optional)</span>
                <input style={fieldStyle} className="mt-1.5" value={form.memo} onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))} placeholder="Internal reference" />
              </label>

              <p className="text-[12px]" style={{ color: 'var(--lx-text-dim)' }}>
                The proposal opens for voting immediately. It requires {config?.threshold ?? 2} approvals to be executed.
              </p>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" className="lx-btn lx-btn-secondary" onClick={() => setCreateOpen(false)} disabled={busy === 'create'}>Cancel</button>
                <button type="submit" className="lx-btn lx-btn-primary" disabled={busy === 'create'}>
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
  p, me, busy, onApprove, onReject, onExecute, onActivate, onCancel,
}: {
  p: Proposal; me: ReturnType<typeof useMembers>['data'][number] | null; busy: string | null;
  onApprove: () => void; onReject: () => void; onExecute: () => void; onActivate: () => void; onCancel: () => void;
}) {
  if (!me) return null;
  const iVoted = p.approvals.includes(me.id) || p.rejections.includes(me.id);
  const isOwnerOrAdmin = p.createdBy === me.id || me.roles.admin;
  const spin = <Loader2 size={15} className="animate-spin" />;

  if (p.status === 'executed') {
    return p.executedSig ? (
      <a href={`https://explorer.solana.com/tx/${p.executedSig}?cluster=devnet`} target="_blank" rel="noopener noreferrer"
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
        <button type="button" className="lx-btn lx-btn-primary flex-1 justify-center" disabled={!!busy} onClick={onActivate}>
          {busy === 'activate' ? spin : <><Play size={14} /> Abrir a votación</>}
        </button>
      )}

      {p.status === 'active' && me.roles.signer && !iVoted && (
        <>
          <button type="button" className="lx-btn lx-btn-primary flex-1 justify-center" disabled={!!busy} onClick={onApprove}>
            {busy === 'approve' ? spin : <><ThumbsUp size={14} /> Aprobar</>}
          </button>
          <button type="button" className="lx-btn lx-btn-secondary flex-1 justify-center" style={{ color: 'var(--lx-danger)' }} disabled={!!busy} onClick={onReject}>
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
        <button type="button" className="lx-btn lx-btn-primary flex-1 justify-center" disabled={!!busy} onClick={onExecute}>
          {busy === 'execute' ? spin : <><Play size={14} /> Ejecutar on-chain</>}
        </button>
      )}

      {(p.status === 'draft' || p.status === 'active') && isOwnerOrAdmin && (
        <button type="button" className="lx-btn lx-btn-secondary justify-center" disabled={!!busy} onClick={onCancel}>
          {busy === 'cancel' ? spin : <><Ban size={14} /> Cancelar</>}
        </button>
      )}
    </div>
  );
}

function Modal({
  title, icon, onClose, children, maxWidth = 480,
}: { title: string; icon: React.ReactNode; onClose: () => void; children: React.ReactNode; maxWidth?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: 'spring', bounce: 0.3, duration: 0.45 }}
        className="lx-card-lg w-full" style={{ maxWidth, maxHeight: '88vh', overflowY: 'auto', boxShadow: 'var(--lx-shadow-lg)' }}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-[17px] font-semibold" style={{ color: 'var(--lx-text)' }}>{icon} {title}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border)', color: 'var(--lx-text-muted)' }}>
            <X size={15} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

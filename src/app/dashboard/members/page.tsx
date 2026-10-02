'use client';

/**
 * Members — the SRS "Control de Roles y Miembros" surface for Module 1.
 *
 * Maps wallet pubkeys to the Squads-style role matrix (admin / signer /
 * proposer / auditor), shows the M-de-N signing policy, and gates every
 * mutation on the signed-in member's own roles. All data is served by
 * `src/mocks/handlers.ts` while Mock Mode is on.
 */

import React, { useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, X, User, Copy, Loader2, AlertTriangle, ShieldCheck,
  Minus, Check, ExternalLink, Eye, KeyRound, Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMembers } from '@/features/treasury/hooks/useMembers';
import { useMerchant } from '@/features/merchant/context/MerchantContext';
import { useTreasury } from '@/features/treasury/hooks/useTreasury';
import {
  MEMBER_ROLE_META,
  type Member,
  type MemberRoles,
  type MemberRoleKey,
} from '@/features/treasury/api/members-api';

const ROLE_KEYS: MemberRoleKey[] = ['admin', 'signer', 'proposer', 'auditor'];
const short = (a: string) => (a.length > 14 ? `${a.slice(0, 5)}…${a.slice(-5)}` : a);

/* ───────────────────────── small building blocks ───────────────────────── */

function RoleChip({
  role, active, onClick, disabled,
}: { role: MemberRoleKey; active: boolean; onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; disabled?: boolean }) {
  const meta = MEMBER_ROLE_META[role];
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      disabled={disabled}
      title={disabled ? meta.description : `${meta.description} — clic para cambiar`}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors disabled:cursor-default"
      style={{
        background: active ? 'var(--lx-fill-hover)' : 'transparent',
        color: active ? 'var(--lx-text)' : 'var(--lx-text-dim)',
        border: `1px solid ${active ? 'var(--lx-border-hover)' : 'var(--lx-border)'}`,
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {active && <Check size={11} />}
      {meta.short}
    </button>
  );
}

function ModalShell({
  title, icon, onClose, children, maxWidth = 480,
}: {
  title: string; icon: React.ReactNode; onClose: () => void;
  children: React.ReactNode; maxWidth?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: 'spring', bounce: 0.32, duration: 0.45 }}
        className="lx-card-lg w-full"
        style={{ maxWidth, background: 'var(--lx-surface)', boxShadow: 'var(--lx-shadow-lg)' }}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-[17px] font-semibold" style={{ color: 'var(--lx-text)' }}>
            {icon} {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border)', color: 'var(--lx-text-muted)' }}>
            <X size={15} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10,
  background: 'var(--lx-surface-2)', border: '1px solid var(--lx-border)',
  color: 'var(--lx-text)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
};

/* ─────────────────────────────── page ─────────────────────────────── */

export default function MembersPage() {
  const {
    data: members, isLoading, isError, errorMessage,
    addMember, updateMember, removeMember,
  } = useMembers();
  // Demo-only: preview the UI as a read-only auditor without editing fixtures.
  const [previewReadOnly, setPreviewReadOnly] = useState(false);
  const { connected } = useWallet();
  const { profile } = useMerchant();
  const { setVisible: openWalletModal } = useWalletModal();

  const me = useMemo(() => members.find((m) => m.isCurrentUser) ?? members[0] ?? null, [members]);
  const adminCount = useMemo(() => members.filter((m) => m.roles.admin).length, [members]);
  const canManage = !previewReadOnly;

  const [addOpen, setAddOpen] = useState(false);
  const [detail, setDetail] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState<Member | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState<{ name: string; walletAddress: string; roles: MemberRoles }>({
    name: '', walletAddress: '',
    roles: { admin: false, signer: true, proposer: true, auditor: false },
  });

  const copy = (v: string) => { navigator.clipboard.writeText(v); toast.success('Copied to clipboard'); };

  const guard = () => {
    if (!connected) {
      toast.error('Connect your wallet (Phantom or Solflare) to manage members.');
      openWalletModal(true);
      return false;
    }
    if (!canManage) {
      toast.error(previewReadOnly ? 'Read-only view active' : 'Administrator role required');
      return false;
    }
    return true;
  };

  const toggleRole = async (m: Member, key: MemberRoleKey) => {
    if (!guard()) return;
    if (key === 'admin' && m.roles.admin && adminCount <= 1) {
      toast.error('At least one Administrator must remain');
      return;
    }
    const roles = { ...m.roles, [key]: !m.roles[key] };
    try {
      await updateMember(m.id, { roles });
      setDetail((d) => (d && d.id === m.id ? { ...d, roles } : d));
      toast.success(`${MEMBER_ROLE_META[key].label} ${roles[key] ? 'assigned' : 'removed'} · ${m.name}`);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Could not update role'); }
  };

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guard()) return;
    if (!form.name.trim() || !form.walletAddress.trim()) { toast.error('Name and address are required'); return; }
    if (profile?.merchantWallet && form.walletAddress.trim() === profile.merchantWallet) {
      // The collection wallet's key is held by Sterling's server: it can't sign as a member.
      toast.error('Esa es la cuenta de cobros de Sterling, no tu wallet. Copia la dirección desde Phantom o Solflare.');
      return;
    }
    setBusy(true);
    try {
      await addMember({ name: form.name.trim(), walletAddress: form.walletAddress.trim(), roles: form.roles });
      setForm({ name: '', walletAddress: '', roles: { admin: false, signer: true, proposer: true, auditor: false } });
      setAddOpen(false);
      toast.success('Member added to multisig');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Could not add member'); }
    finally { setBusy(false); }
  };

  const confirmDelete = async () => {
    if (!deleting || !guard()) return;
    if (deleting.roles.admin && adminCount <= 1) { toast.error('Cannot remove the only Administrator'); return; }
    setBusy(true);
    try {
      await removeMember(deleting.id);
      toast.success(`${deleting.name} was removed from multisig`);
      if (detail?.id === deleting.id) setDetail(null);
      setDeleting(null);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Could not remove member'); }
    finally { setBusy(false); }
  };

  return (
    <>
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title">Members</h1>
          <p className="lx-page-subtitle">
            Multisig signers, role matrix, and access permissions.
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1200px] space-y-6 p-6 md:p-8">


        {/* Your role + preview toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-white/60">
            <KeyRound size={14} />
            Your role:
            {me
              ? ROLE_KEYS.filter((k) => me.roles[k]).map((k) => (
                  <span key={k} className="rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-white/10 border border-white/15 text-white">
                    {MEMBER_ROLE_META[k].label}
                  </span>
                ))
              : <span className="text-white/40">—</span>}
          </div>
          <button
            type="button"
            onClick={() => setPreviewReadOnly((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium bg-white/5 border border-white/15 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Preview interface as a read-only Auditor"
          >
            <Eye size={13} /> {previewReadOnly ? 'Auditor View Active' : 'Preview as Auditor'}
          </button>
        </div>

        {/* Disconnected wallet warning banner */}
        {!connected && (
          <div className="flex items-center gap-3 rounded-2xl p-4 bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm">
            <AlertTriangle size={18} className="flex-shrink-0 text-amber-400" />
            <div className="flex-1">
              <span className="font-semibold text-amber-100">Billetera no conectada: </span>
              Conecta tu billetera (Phantom o Solflare) para agregar miembros, modificar roles o firmar acciones en el Multisig.
            </div>
            <button
              type="button"
              onClick={() => openWalletModal(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-500 text-black hover:bg-amber-400 transition-colors flex-shrink-0"
            >
              Conectar Wallet
            </button>
          </div>
        )}

        {/* Members list */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-white">
              Signers <span className="text-white/40">· {members.length}</span>
            </h2>
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-white text-black font-medium text-xs hover:bg-neutral-200 transition-colors inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!connected || !canManage}
              title={!connected ? 'Conecta tu billetera para agregar miembros' : undefined}
              onClick={() => { if (guard()) setAddOpen(true); }}
            >
              <Plus size={15} /> Add member
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-white/50">
              <Loader2 size={18} className="animate-spin" /> Loading members…
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-3 rounded-xl p-4 text-sm bg-red-500/10 border border-red-500/20 text-red-300">
              <AlertTriangle size={16} /> {errorMessage || 'Error loading members'}
            </div>
          )}

          {!isLoading && !isError && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-2">
              <AnimatePresence>
                {members.map((m) => (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ type: 'spring', bounce: 0.28, duration: 0.45 }}
                    onClick={() => setDetail(m)}
                    className="cursor-pointer border-b border-white/10 pb-4 pt-2 flex flex-col gap-3.5 hover:opacity-90 transition-opacity"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/15 text-white/70">
                          <User size={16} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-[14px] font-semibold text-white">{m.name}</p>
                            {m.isCurrentUser && (
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-white/15 text-white">You</span>
                            )}
                          </div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); copy(m.walletAddress); }}
                            className="mt-0.5 inline-flex items-center gap-1 font-mono text-[11px] text-white/40 hover:text-white transition-colors">
                            {short(m.walletAddress)} <Copy size={10} />
                          </button>
                        </div>
                      </div>
                      <button type="button" aria-label="Remove member" disabled={!canManage || !connected}
                        title={!connected ? 'Conecta tu billetera para eliminar miembros' : undefined}
                        onClick={(e) => { e.stopPropagation(); if (guard()) setDeleting(m); }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/15 text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {ROLE_KEYS.map((k) => (
                        <RoleChip key={k} role={k} active={m.roles[k]} disabled={!canManage || !connected}
                          onClick={() => toggleRole(m, k)} />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>


      </div>

      {/* Add modal */}
      <AnimatePresence>
        {addOpen && (
          <ModalShell title="Add member" icon={<Plus size={18} style={{ color: 'var(--lx-text-muted)' }} />} onClose={() => !busy && setAddOpen(false)}>
            <form onSubmit={submitAdd} className="space-y-4">
              {!connected && (
                <div className="rounded-xl p-3 bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center justify-between">
                  <span>Conecta tu billetera para agregar miembros</span>
                  <button type="button" onClick={() => openWalletModal(true)} className="underline text-amber-400 font-semibold">Conectar</button>
                </div>
              )}
              <label className="block">
                <span className="lx-eyebrow">Name / Alias</span>
                <input style={fieldStyle} className="mt-1.5" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Sarah Jenkins" required />
              </label>
              <label className="block">
                <span className="lx-eyebrow">Wallet Address (Solana)</span>
                <input style={{ ...fieldStyle, fontFamily: 'monospace', fontSize: 13 }} className="mt-1.5" value={form.walletAddress} onChange={(e) => setForm((f) => ({ ...f, walletAddress: e.target.value }))} placeholder="Pubkey base58" required />
              </label>
              <div>
                <span className="lx-eyebrow">Assigned Roles</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ROLE_KEYS.map((k) => (
                    <RoleChip key={k} role={k} active={form.roles[k]} disabled={!connected}
                      onClick={() => setForm((f) => ({ ...f, roles: { ...f.roles, [k]: !f.roles[k] } }))} />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="lx-btn lx-btn-secondary" onClick={() => setAddOpen(false)} disabled={busy}>Cancel</button>
                <button type="submit" className="lx-btn lx-btn-primary" disabled={busy || !connected}>
                  {busy ? <><Loader2 size={15} className="animate-spin" /> Adding…</> : !connected ? 'Wallet required' : 'Add member'}
                </button>
              </div>
            </form>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* Detail modal */}
      <AnimatePresence>
        {detail && (
          <ModalShell title={detail.name} icon={<User size={18} style={{ color: 'var(--lx-text-muted)' }} />} onClose={() => setDetail(null)} maxWidth={520}>
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-center gap-1.5">
                  <span className="lx-eyebrow">Permissions</span>
                  <Info size={12} style={{ color: 'var(--lx-text-dim)' }} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ROLE_KEYS.map((k) => (
                    <RoleChip key={k} role={k} active={detail.roles[k]} disabled={!canManage || !connected}
                      onClick={() => toggleRole(detail, k)} />
                  ))}
                </div>
              </div>

              <div>
                <span className="lx-eyebrow">Address</span>
                <div className="mt-1.5 flex items-center justify-between gap-3 rounded-xl p-3" style={{ background: 'var(--lx-surface-2)', border: '1px solid var(--lx-border)' }}>
                  <span className="break-all font-mono text-[12px]" style={{ color: 'var(--lx-text)' }}>{detail.walletAddress}</span>
                  <div className="flex flex-shrink-0 gap-1.5">
                    <button type="button" onClick={() => copy(detail.walletAddress)} title="Copy" className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border)', color: 'var(--lx-text-muted)' }}>
                      <Copy size={14} />
                    </button>
                    <button type="button" title="View on Solana Explorer"
                      onClick={() => window.open(`https://explorer.solana.com/address/${detail.walletAddress}?cluster=devnet`, '_blank', 'noopener,noreferrer')}
                      className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border)', color: 'var(--lx-text-muted)' }}>
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {canManage && (
                <div className="flex justify-end pt-1">
                  <button type="button" className="lx-btn lx-btn-secondary" style={{ color: 'var(--lx-danger)' }}
                    disabled={!connected}
                    title={!connected ? 'Conecta tu billetera para eliminar miembros' : undefined}
                    onClick={() => { if (guard()) { setDeleting(detail); setDetail(null); } }}>
                    <Trash2 size={14} /> Remove from multisig
                  </button>
                </div>
              )}
            </div>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleting && (
          <ModalShell title="Remove member" icon={<Trash2 size={18} style={{ color: 'var(--lx-danger)' }} />} onClose={() => !busy && setDeleting(null)} maxWidth={420}>
            <p className="text-[14px]" style={{ color: 'var(--lx-text-muted)' }}>
              Remove <strong style={{ color: 'var(--lx-text)' }}>{deleting.name}</strong> from multisig?
              They will lose proposal and voting rights. This requires an on-chain configuration transaction.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="lx-btn lx-btn-secondary" onClick={() => setDeleting(null)} disabled={busy}>Cancel</button>
              <button type="button" className="lx-btn" style={{ background: 'var(--lx-danger)', color: '#fff' }} onClick={confirmDelete} disabled={busy}>
                {busy ? <Loader2 size={15} className="animate-spin" /> : 'Remove'}
              </button>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>
    </>
  );
}

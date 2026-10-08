'use client';

/**
 * Members — the SRS "Control de Roles y Miembros" surface for Module 1.
 *
 * Maps wallet pubkeys to the role matrix (admin / signer /
 * proposer / auditor), shows the M-de-N signing policy, and gates every
 * mutation on the signed-in member's own roles. All data is served by
 * `src/mocks/handlers.ts` while Mock Mode is on.
 */

import React, { useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, User, Copy, Loader2, AlertTriangle,
  ExternalLink, Eye, KeyRound, Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMembers } from '@/features/treasury/hooks/useMembers';
import { useTreasury } from '@/features/treasury/hooks/useTreasury';
import { OffChainNotice } from '@/features/treasury/components/OffChainNotice';
import { ModalShell, RoleChip, fieldStyle } from '@/features/treasury/components/member-ui';
import { AddMemberModal } from '@/features/treasury/components/AddMemberModal';
import { ApprovalRulesCard } from '@/features/treasury/components/ApprovalRulesCard';
import {
  MEMBER_ROLE_META,
  type Member,
  type MemberRoles,
  type MemberRoleKey,
} from '@/features/treasury/api/members-api';

const ROLE_KEYS: MemberRoleKey[] = ['admin', 'signer', 'proposer', 'auditor'];
const short = (a: string) => (a.length > 14 ? `${a.slice(0, 5)}…${a.slice(-5)}` : a);

/** On-chain status of a member: pending proposal, on-chain, or not in the multisig. Hidden while off-chain. */
function MemberChainBadge({ member }: { member: Member }) {
  const pending = member.pendingChange;
  if (pending) {
    const label = pending.op === 'add' ? 'Alta pendiente' : pending.op === 'remove' ? 'Baja pendiente' : 'Cambio pendiente';
    return (
      <span title="Propuesta de configuración esperando firmas / ejecución"
        className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-500/15 text-amber-300">
        {label} #{pending.proposalIndex}
      </span>
    );
  }
  if (member.onChain === true) {
    return <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-300">On-chain</span>;
  }
  if (member.onChain === false) {
    return (
      <span title="No es miembro del multisig on-chain (solo figura en Luxor)"
        className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-white/10 text-white/50">Fuera del multisig</span>
    );
  }
  return null;
}

/* ─────────────────────────────── page ─────────────────────────────── */

export default function MembersPage() {
  const {
    data: members, isLoading, isError, errorMessage,
    addMember, updateMember, removeMember,
  } = useMembers();
  // Demo-only: preview the UI as a read-only auditor without editing fixtures.
  const [previewReadOnly, setPreviewReadOnly] = useState(false);
  const { connected } = useWallet();
  const { config } = useTreasury();
  const { setVisible: openWalletModal } = useWalletModal();

  const me = useMemo(() => members.find((m) => m.isCurrentUser) ?? members[0] ?? null, [members]);
  const adminCount = useMemo(() => members.filter((m) => m.roles.admin).length, [members]);
  const canManage = !previewReadOnly;

  const [addOpen, setAddOpen] = useState(false);
  const [detail, setDetail] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState<Member | null>(null);
  const [busy, setBusy] = useState(false);

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
      const { proposalIndex } = await updateMember(m.id, { roles });
      if (proposalIndex) {
        // On-chain multisig: permissions change only when the proposal executes.
        toast.success(`Propuesta #${proposalIndex} creada · los permisos de ${m.name} cambiarán cuando el multisig la apruebe y ejecute`);
        return;
      }
      setDetail((d) => (d && d.id === m.id ? { ...d, roles } : d));
      toast.success(`${MEMBER_ROLE_META[key].label} ${roles[key] ? 'assigned' : 'removed'} · ${m.name}`);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Could not update role'); }
  };

  const [editingName, setEditingName] = useState('');
  const [editingRoles, setEditingRoles] = useState<MemberRoles>({ admin: false, signer: false, proposer: false, auditor: false });

  const openDetail = (m: Member) => {
    setDetail(m);
    setEditingName(m.name);
    setEditingRoles({ ...m.roles });
  };

  const confirmDelete = async () => {
    if (!deleting || !guard()) return;
    if (deleting.roles.admin && adminCount <= 1) { toast.error('Cannot remove the only Administrator'); return; }
    setBusy(true);
    try {
      toast.info('Confirma la transacción en tu wallet (Phantom/Solflare) para eliminar al miembro en la blockchain...');
      const { proposalIndex } = await removeMember(deleting.id);
      toast.success(
        proposalIndex
          ? `Propuesta #${proposalIndex} enviada · ${deleting.name} desvinculado del multisig`
          : `${deleting.name} fue eliminado del multisig`,
      );
      if (detail?.id === deleting.id) setDetail(null);
      setDeleting(null);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Error al eliminar el miembro'); }
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

        <OffChainNotice config={config} />

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

        <ApprovalRulesCard members={members} canEdit={canManage} guard={guard} />

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
                    onClick={() => openDetail(m)}
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
                            <MemberChainBadge member={m} />
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

      <AddMemberModal open={addOpen} onClose={() => setAddOpen(false)} addMember={addMember} />

      {/* Detail modal */}
      <AnimatePresence>
        {detail && (
          <ModalShell
            title={`Edit ${detail.name}`}
            subtitle="Manage member details, assigned permissions, and on-chain status."
            onClose={() => setDetail(null)}
            maxWidth={520}
          >
            <div className="space-y-5">
              {!connected && (
                <div className="rounded-2xl p-4 bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center justify-between">
                  <span>Conecta tu billetera para editar miembros</span>
                  <button type="button" onClick={() => openWalletModal(true)} className="px-3.5 py-1 rounded-full bg-amber-500 text-black font-semibold">Conectar</button>
                </div>
              )}

              {/* Editable Name Input */}
              <label className="block space-y-2">
                <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/50 font-sans">Name / Alias</span>
                <input
                  style={fieldStyle}
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  disabled={!canManage || !connected}
                />
              </label>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/50 font-sans">Permissions</span>
                  <Info size={13} className="text-white/40" />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {ROLE_KEYS.map((k) => (
                    <RoleChip key={k} role={k} active={editingRoles[k]} disabled={!canManage || !connected}
                      onClick={() => {
                        if (k === 'admin' && editingRoles.admin && adminCount <= 1) {
                          toast.error('At least one Administrator must remain');
                          return;
                        }
                        setEditingRoles((r) => ({ ...r, [k]: !r[k] }));
                      }} />
                  ))}
                </div>
                {detail.onChain && (
                  <p className="mt-2 text-[11px] text-white/40 leading-relaxed font-body">
                    * Los cambios en permisos de miembros en-cadena generan una propuesta en el multisig que debe ser firmada por el umbral del multisig.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/50 font-sans block">Wallet Address</span>
                <div className="flex items-center justify-between gap-3 font-mono text-[13px] text-white/90" style={fieldStyle}>
                  <span className="break-all">{detail.walletAddress}</span>
                  <div className="flex flex-shrink-0 gap-1.5 ml-2">
                    <button type="button" onClick={() => copy(detail.walletAddress)} title="Copy" className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
                      <Copy size={13} />
                    </button>
                    <button type="button" title="View on Solana Explorer"
                      onClick={() => window.open(`https://explorer.solana.com/address/${detail.walletAddress}?cluster=devnet`, '_blank', 'noopener,noreferrer')}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                {canManage && (
                  <button type="button" className="px-4 py-2.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                    disabled={!connected}
                    onClick={() => { if (guard()) { setDeleting(detail); setDetail(null); } }}>
                    <Trash2 size={14} /> Remove member
                  </button>
                )}
                <div className="flex items-center gap-3 ml-auto">
                  <button type="button" className="px-5 py-2.5 rounded-full border border-white/15 bg-white/5 text-white text-xs font-medium hover:bg-white/10 transition-all cursor-pointer" onClick={() => setDetail(null)}>
                    Close
                  </button>
                  {canManage && connected && (
                    <button
                      type="button"
                      className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-all cursor-pointer disabled:opacity-40"
                      disabled={busy || !editingName.trim() || (editingName.trim() === detail.name && JSON.stringify(editingRoles) === JSON.stringify(detail.roles))}
                      onClick={async () => {
                        if (!guard()) return;
                        setBusy(true);
                        try {
                          const { proposalIndex } = await updateMember(detail.id, { name: editingName.trim(), roles: editingRoles });
                          toast.success(proposalIndex ? `Propuesta #${proposalIndex} creada · los permisos cambiarán cuando el multisig la apruebe` : 'Miembro actualizado correctamente');
                          setDetail(null);
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : 'Error al actualizar el miembro');
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      {busy ? <Loader2 size={14} className="animate-spin inline mr-1" /> : 'Save Changes'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleting && (
          <ModalShell
            title="Remove member"
            subtitle="Confirm removing this wallet from the multisig organization."
            onClose={() => !busy && setDeleting(null)}
            maxWidth={440}
          >
            <p className="text-[14px] text-white/70 font-body leading-relaxed">
              Remove <strong className="text-white">{deleting.name}</strong> from multisig?
              They will lose proposal and voting rights. This requires an on-chain configuration transaction.
            </p>
            <div className="mt-6 flex justify-end gap-3 pt-2">
              <button type="button" className="px-5 py-2.5 rounded-full border border-white/15 bg-white/5 text-white text-xs font-medium hover:bg-white/10 transition-all cursor-pointer" onClick={() => setDeleting(null)} disabled={busy}>
                Cancel
              </button>
              <button type="button" className="px-6 py-2.5 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-all cursor-pointer disabled:opacity-40 inline-flex items-center gap-1.5" onClick={confirmDelete} disabled={busy}>
                {busy ? <Loader2 size={14} className="animate-spin" /> : 'Remove'}
              </button>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>
    </>
  );
}

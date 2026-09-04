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
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, X, User, Copy, Loader2, AlertTriangle, ShieldCheck,
  Minus, Check, ExternalLink, Eye, KeyRound, Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMembers } from '@/hooks/useMembers';
import { useTreasury } from '@/hooks/useTreasury';
import {
  MEMBER_ROLE_META,
  type Member,
  type MemberRoles,
  type MemberRoleKey,
} from '@/lib/members-api';

const ROLE_KEYS: MemberRoleKey[] = ['admin', 'signer', 'proposer', 'auditor'];
const short = (a: string) => (a.length > 14 ? `${a.slice(0, 5)}…${a.slice(-5)}` : a);

/* ───────────────────────── small building blocks ───────────────────────── */

function RoleChip({
  role, active, onClick, disabled,
}: { role: MemberRoleKey; active: boolean; onClick?: () => void; disabled?: boolean }) {
  const meta = MEMBER_ROLE_META[role];
  return (
    <button
      type="button"
      onClick={onClick}
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
  const { config, isLoading: cfgLoading, setThreshold } = useTreasury();

  // Demo-only: preview the UI as a read-only auditor without editing fixtures.
  const [previewReadOnly, setPreviewReadOnly] = useState(false);

  const me = useMemo(() => members.find((m) => m.isCurrentUser) ?? null, [members]);
  const signerCount = useMemo(() => members.filter((m) => m.roles.signer).length, [members]);
  const adminCount = useMemo(() => members.filter((m) => m.roles.admin).length, [members]);
  const canManage = !previewReadOnly && (me?.roles.admin ?? false);
  const threshold = config?.threshold ?? 2;

  const [addOpen, setAddOpen] = useState(false);
  const [detail, setDetail] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState<Member | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState<{ name: string; walletAddress: string; roles: MemberRoles }>({
    name: '', walletAddress: '',
    roles: { admin: false, signer: true, proposer: true, auditor: false },
  });

  const copy = (v: string) => { navigator.clipboard.writeText(v); toast.success('Copiado al portapapeles'); };

  const guard = () => {
    if (!canManage) {
      toast.error(previewReadOnly ? 'Vista de solo lectura activa' : 'Necesitas el rol de Administrador');
      return false;
    }
    return true;
  };

  const toggleRole = async (m: Member, key: MemberRoleKey) => {
    if (!guard()) return;
    if (key === 'admin' && m.roles.admin && adminCount <= 1) {
      toast.error('Debe quedar al menos un Administrador');
      return;
    }
    const roles = { ...m.roles, [key]: !m.roles[key] };
    try {
      await updateMember(m.id, { roles });
      setDetail((d) => (d && d.id === m.id ? { ...d, roles } : d));
      toast.success(`${MEMBER_ROLE_META[key].label} ${roles[key] ? 'asignado' : 'retirado'} · ${m.name}`);
    } catch { toast.error('No se pudo actualizar el rol'); }
  };

  const changeThreshold = async (next: number) => {
    if (!guard()) return;
    if (next < 1 || next > Math.max(1, signerCount)) return;
    try {
      await setThreshold(next);
      toast.success(`Umbral: ${next} de ${signerCount} firmantes`);
    } catch { toast.error('No se pudo cambiar el umbral'); }
  };

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.walletAddress.trim()) { toast.error('Nombre y dirección son obligatorios'); return; }
    setBusy(true);
    try {
      await addMember({ name: form.name.trim(), walletAddress: form.walletAddress.trim(), roles: form.roles });
      setForm({ name: '', walletAddress: '', roles: { admin: false, signer: true, proposer: true, auditor: false } });
      setAddOpen(false);
      toast.success('Miembro añadido al multisig');
    } catch { toast.error('No se pudo añadir el miembro'); }
    finally { setBusy(false); }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    if (deleting.roles.admin && adminCount <= 1) { toast.error('No puedes eliminar al único Administrador'); return; }
    setBusy(true);
    try {
      await removeMember(deleting.id);
      toast.success(`${deleting.name} fue removido del multisig`);
      if (detail?.id === deleting.id) setDetail(null);
      setDeleting(null);
    } catch { toast.error('No se pudo remover el miembro'); }
    finally { setBusy(false); }
  };

  return (
    <>
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title">Miembros</h1>
          <p className="lx-page-subtitle">
            Firmantes del multisig, matriz de roles y umbral de aprobación de propuestas.
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1200px] space-y-6 p-6 md:p-8">

        {/* Signing policy */}
        <section className="lx-card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24, justifyContent: 'space-between' }}>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border)' }}>
              <ShieldCheck size={16} style={{ color: 'var(--lx-text-muted)' }} />
            </span>
            <div>
              <p className="lx-eyebrow" style={{ marginBottom: 2 }}>Política de firmas</p>
              <p className="text-[15px] font-semibold" style={{ color: 'var(--lx-text)' }}>
                {cfgLoading ? '—' : `${threshold} de ${signerCount}`} firmantes para ejecutar
              </p>
              <button
                type="button"
                onClick={() => config && copy(config.address)}
                className="mt-1 inline-flex items-center gap-1.5 font-mono text-[12px]"
                style={{ color: 'var(--lx-text-dim)' }}
                title="Copiar dirección del multisig"
              >
                {config ? short(config.address) : '—'} <Copy size={11} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[12px]" style={{ color: 'var(--lx-text-dim)' }}>Umbral M-de-N</span>
            <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--lx-surface-2)', border: '1px solid var(--lx-border)' }}>
              <button type="button" aria-label="Bajar umbral" disabled={!canManage || threshold <= 1}
                onClick={() => changeThreshold(threshold - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md disabled:opacity-30"
                style={{ background: 'var(--lx-fill)', color: 'var(--lx-text)' }}>
                <Minus size={13} />
              </button>
              <span className="w-8 text-center text-[15px] font-semibold tabular-nums" style={{ color: 'var(--lx-text)' }}>{threshold}</span>
              <button type="button" aria-label="Subir umbral" disabled={!canManage || threshold >= signerCount}
                onClick={() => changeThreshold(threshold + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md disabled:opacity-30"
                style={{ background: 'var(--lx-fill)', color: 'var(--lx-text)' }}>
                <Plus size={13} />
              </button>
            </div>
          </div>
        </section>

        {/* Your role + preview toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[13px]" style={{ color: 'var(--lx-text-muted)' }}>
            <KeyRound size={14} />
            Tu rol:
            {me
              ? ROLE_KEYS.filter((k) => me.roles[k]).map((k) => (
                  <span key={k} className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border)', color: 'var(--lx-text)' }}>
                    {MEMBER_ROLE_META[k].label}
                  </span>
                ))
              : <span style={{ color: 'var(--lx-text-dim)' }}>—</span>}
          </div>
          <button
            type="button"
            onClick={() => setPreviewReadOnly((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium"
            style={{
              background: previewReadOnly ? 'var(--lx-warning)' : 'var(--lx-fill)',
              color: previewReadOnly ? '#0F1015' : 'var(--lx-text-muted)',
              border: '1px solid var(--lx-border)',
            }}
            title="Previsualiza la interfaz como un miembro de solo lectura (Auditor)"
          >
            <Eye size={13} /> {previewReadOnly ? 'Vista Auditor activa' : 'Previsualizar como Auditor'}
          </button>
        </div>

        {/* Members list */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--lx-text)' }}>
              Firmantes <span style={{ color: 'var(--lx-text-dim)' }}>· {members.length}</span>
            </h2>
            <button type="button" className="lx-btn lx-btn-primary" disabled={!canManage}
              onClick={() => { if (guard()) setAddOpen(true); }}>
              <Plus size={15} /> Añadir miembro
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-16 text-sm" style={{ color: 'var(--lx-text-muted)' }}>
              <Loader2 size={18} className="animate-spin" /> Cargando miembros…
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-3 rounded-xl p-4 text-sm" style={{ background: 'var(--lx-danger-soft)', border: '1px solid var(--lx-danger)', color: 'var(--lx-danger)' }}>
              <AlertTriangle size={16} /> {errorMessage || 'Error al cargar los miembros'}
            </div>
          )}

          {!isLoading && !isError && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <AnimatePresence>
                {members.map((m) => (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ type: 'spring', bounce: 0.28, duration: 0.45 }}
                    onClick={() => setDetail(m)}
                    className="lx-card-interactive cursor-pointer"
                    style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border)', color: 'var(--lx-text-muted)' }}>
                          <User size={16} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-[14px] font-semibold" style={{ color: 'var(--lx-text)' }}>{m.name}</p>
                            {m.isCurrentUser && (
                              <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: 'var(--lx-fill-hover)', color: 'var(--lx-text-muted)' }}>Tú</span>
                            )}
                          </div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); copy(m.walletAddress); }}
                            className="mt-0.5 inline-flex items-center gap-1 font-mono text-[11px]" style={{ color: 'var(--lx-text-dim)' }}>
                            {short(m.walletAddress)} <Copy size={10} />
                          </button>
                        </div>
                      </div>
                      <button type="button" aria-label="Eliminar miembro" disabled={!canManage}
                        onClick={(e) => { e.stopPropagation(); if (guard()) setDeleting(m); }}
                        className="flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-25"
                        style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border)', color: 'var(--lx-text-muted)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {ROLE_KEYS.map((k) => (
                        <RoleChip key={k} role={k} active={m.roles[k]} disabled={!canManage}
                          onClick={() => toggleRole(m, k)} />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Role reference */}
        <section className="lx-card">
          <p className="lx-eyebrow" style={{ marginBottom: 12 }}>Referencia de roles</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {ROLE_KEYS.map((k) => (
              <div key={k} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-6 items-center rounded-full px-2 text-[11px] font-medium" style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border)', color: 'var(--lx-text)' }}>
                  {MEMBER_ROLE_META[k].label}
                </span>
                <p className="text-[13px]" style={{ color: 'var(--lx-text-muted)' }}>{MEMBER_ROLE_META[k].description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Add modal */}
      <AnimatePresence>
        {addOpen && (
          <ModalShell title="Añadir miembro" icon={<Plus size={18} style={{ color: 'var(--lx-text-muted)' }} />} onClose={() => !busy && setAddOpen(false)}>
            <form onSubmit={submitAdd} className="space-y-4">
              <label className="block">
                <span className="lx-eyebrow">Nombre / alias</span>
                <input style={fieldStyle} className="mt-1.5" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="p. ej. Mariana Solís" required />
              </label>
              <label className="block">
                <span className="lx-eyebrow">Dirección de wallet (Solana)</span>
                <input style={{ ...fieldStyle, fontFamily: 'monospace', fontSize: 13 }} className="mt-1.5" value={form.walletAddress} onChange={(e) => setForm((f) => ({ ...f, walletAddress: e.target.value }))} placeholder="Pubkey base58" required />
              </label>
              <div>
                <span className="lx-eyebrow">Roles asignados</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ROLE_KEYS.map((k) => (
                    <RoleChip key={k} role={k} active={form.roles[k]}
                      onClick={() => setForm((f) => ({ ...f, roles: { ...f.roles, [k]: !f.roles[k] } }))} />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="lx-btn lx-btn-secondary" onClick={() => setAddOpen(false)} disabled={busy}>Cancelar</button>
                <button type="submit" className="lx-btn lx-btn-primary" disabled={busy}>
                  {busy ? <><Loader2 size={15} className="animate-spin" /> Añadiendo…</> : 'Añadir miembro'}
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
                  <span className="lx-eyebrow">Permisos</span>
                  <Info size={12} style={{ color: 'var(--lx-text-dim)' }} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ROLE_KEYS.map((k) => (
                    <RoleChip key={k} role={k} active={detail.roles[k]} disabled={!canManage}
                      onClick={() => toggleRole(detail, k)} />
                  ))}
                </div>
              </div>

              <div>
                <span className="lx-eyebrow">Dirección</span>
                <div className="mt-1.5 flex items-center justify-between gap-3 rounded-xl p-3" style={{ background: 'var(--lx-surface-2)', border: '1px solid var(--lx-border)' }}>
                  <span className="break-all font-mono text-[12px]" style={{ color: 'var(--lx-text)' }}>{detail.walletAddress}</span>
                  <div className="flex flex-shrink-0 gap-1.5">
                    <button type="button" onClick={() => copy(detail.walletAddress)} title="Copiar" className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border)', color: 'var(--lx-text-muted)' }}>
                      <Copy size={14} />
                    </button>
                    <button type="button" title="Ver en Solana Explorer"
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
                    onClick={() => { setDeleting(detail); setDetail(null); }}>
                    <Trash2 size={14} /> Remover del multisig
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
          <ModalShell title="Remover miembro" icon={<Trash2 size={18} style={{ color: 'var(--lx-danger)' }} />} onClose={() => !busy && setDeleting(null)} maxWidth={420}>
            <p className="text-[14px]" style={{ color: 'var(--lx-text-muted)' }}>
              ¿Remover a <strong style={{ color: 'var(--lx-text)' }}>{deleting.name}</strong> del multisig?
              Perderá sus derechos de propuesta y voto. Esto requeriría una transacción on-chain de cambio de configuración.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="lx-btn lx-btn-secondary" onClick={() => setDeleting(null)} disabled={busy}>Cancelar</button>
              <button type="button" className="lx-btn" style={{ background: 'var(--lx-danger)', color: '#fff' }} onClick={confirmDelete} disabled={busy}>
                {busy ? <Loader2 size={15} className="animate-spin" /> : 'Remover'}
              </button>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>
    </>
  );
}

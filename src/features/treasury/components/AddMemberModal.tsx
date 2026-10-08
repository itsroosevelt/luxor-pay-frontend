'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { toast } from 'sonner';
import { useMerchant } from '@/features/merchant/context/MerchantContext';
import type { CreateMemberPayload, Member, MemberRoleKey, MemberRoles } from '@/features/treasury/api/members-api';
import { ModalShell, RoleChip, fieldStyle } from './member-ui';

const ROLE_KEYS: MemberRoleKey[] = ['admin', 'signer', 'proposer', 'auditor'];
const DEFAULT_ROLES: MemberRoles = { admin: false, signer: true, proposer: true, auditor: false };

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  /** From the caller's own `useMembers()`, so that page refreshes its list. */
  addMember: (payload: CreateMemberPayload) => Promise<{ member: Member; proposalIndex?: number }>;
}

/** Adds a member to the active treasury. On an on-chain multisig it becomes a proposal the team approves. */
export function AddMemberModal({ open, onClose, addMember }: AddMemberModalProps) {
  const { connected } = useWallet();
  const { setVisible: openWalletModal } = useWalletModal();
  const { profile } = useMerchant();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<{ name: string; walletAddress: string; roles: MemberRoles }>({ name: '', walletAddress: '', roles: DEFAULT_ROLES });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) {
      openWalletModal(true);
      return;
    }
    const name = form.name.trim();
    const walletAddress = form.walletAddress.trim();
    if (!name || !walletAddress) {
      toast.error('El nombre y la dirección son obligatorios');
      return;
    }
    if (profile?.merchantWallet && walletAddress === profile.merchantWallet) {
      // The collection wallet's key is held by Sterling's server: it can't sign as a member.
      toast.error('Esa es la cuenta de cobros de Sterling, no tu wallet. Copia la dirección desde Phantom o Solflare.');
      return;
    }
    setBusy(true);
    try {
      const { proposalIndex } = await addMember({ name, walletAddress, roles: form.roles });
      setForm({ name: '', walletAddress: '', roles: DEFAULT_ROLES });
      onClose();
      toast.success(
        proposalIndex
          ? `Propuesta #${proposalIndex} creada · ${name} entrará al multisig cuando se apruebe y ejecute`
          : `${name} ya es miembro del multisig`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo añadir al miembro');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <ModalShell
          title="Add member"
          subtitle="Añade la wallet de un firmante o auditor a este multisig."
          onClose={() => !busy && onClose()}
          maxWidth={500}
        >
          <form onSubmit={submit} className="space-y-5">
            {!connected && (
              <div className="rounded-2xl p-4 bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center justify-between">
                <span>Conecta tu billetera para agregar miembros</span>
                <button type="button" onClick={() => openWalletModal(true)} className="px-3.5 py-1 rounded-full bg-amber-500 text-black font-semibold">Conectar</button>
              </div>
            )}
            <label className="block space-y-2">
              <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/50 font-sans">Name / Alias</span>
              <input style={fieldStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Sarah Jenkins" required />
            </label>
            <label className="block space-y-2">
              <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/50 font-sans">Wallet Address (Solana)</span>
              <input style={{ ...fieldStyle, fontFamily: 'monospace', fontSize: 13 }} value={form.walletAddress} onChange={(e) => setForm((f) => ({ ...f, walletAddress: e.target.value }))} placeholder="Pubkey base58" required />
            </label>
            <div className="space-y-2">
              <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/50 font-sans block">Assigned Roles</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {ROLE_KEYS.map((k) => (
                  <RoleChip key={k} role={k} active={form.roles[k]} disabled={!connected}
                    onClick={() => setForm((f) => ({ ...f, roles: { ...f.roles, [k]: !f.roles[k] } }))} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button type="button" className="px-6 py-3 rounded-full border border-white/15 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-all cursor-pointer" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <button type="submit" className="px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-all cursor-pointer disabled:opacity-40" disabled={busy || !connected}>
                {busy ? <><Loader2 size={15} className="animate-spin inline mr-1.5" /> Adding…</> : !connected ? 'Wallet required' : 'Add member'}
              </button>
            </div>
          </form>
        </ModalShell>
      )}
    </AnimatePresence>
  );
}

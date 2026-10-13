'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { toast } from 'sonner';
import { useMerchant } from '@/features/merchant/context/MerchantContext';
import { MEMBER_ROLE_KEYS, type CreateMemberPayload, type Member, type MemberRoles } from '@/features/treasury/api/members-api';
import { ModalShell, RoleChip, fieldStyle } from './member-ui';

const DEFAULT_ROLES: MemberRoles = { proposer: true, signer: true, executor: true };

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
      toast.error('Name and wallet address are required');
      return;
    }
    if (!form.roles.proposer && !form.roles.signer && !form.roles.executor) {
      toast.error('Select at least one role: Proposer, Voter, or Executor');
      return;
    }
    if (profile?.merchantWallet && walletAddress === profile.merchantWallet) {
      // The collection wallet's key is held by Sterling's server: it can't sign as a member.
      toast.error('That is the Sterling merchant collection wallet, not your personal wallet. Copy your address from Phantom or Solflare.');
      return;
    }
    setBusy(true);
    try {
      const { proposalIndex } = await addMember({ name, walletAddress, roles: form.roles });
      setForm({ name: '', walletAddress: '', roles: DEFAULT_ROLES });
      onClose();
      toast.success(
        proposalIndex
          ? `Proposal #${proposalIndex} created · ${name} will join the multisig once approved and executed`
          : `${name} is now a member of the multisig`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add member');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <ModalShell
          title="Add member"
          subtitle="Add a wallet to this multisig and select its permissions: propose, vote, or execute."
          onClose={() => !busy && onClose()}
          maxWidth={500}
        >
          <form onSubmit={submit} className="space-y-5">
            {!connected && (
              <div className="rounded-2xl p-4 bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center justify-between">
                <span>Connect your wallet to add members</span>
                <button type="button" onClick={() => openWalletModal(true)} className="px-3.5 py-1 rounded-full bg-amber-500 text-black font-semibold">Connect</button>
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
                {MEMBER_ROLE_KEYS.map((k) => (
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

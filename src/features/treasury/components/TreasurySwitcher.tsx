'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Check, ChevronDown, Plus, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTreasury } from '@/features/treasury/hooks/useTreasury';
import { linkTreasury, listTreasuries, type MultisigConfig } from '@/features/treasury/api/treasury-api';
import { getActiveTreasuryId, setActiveTreasuryId } from '@/lib/active-treasury';
import { WALLET_SESSION_EVENT, getWalletAuthHeaders } from '@/lib/wallet-session';

const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const SwitchButton = styled.button<{ $isOpen?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${({ $isOpen }) => ($isOpen ? '#60A5FA' : 'rgba(255, 255, 255, 0.15)')};
  backdrop-filter: blur(16px);
  color: #EDEDED;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #60A5FA;
    color: #FFFFFF;
    box-shadow: 0 0 16px rgba(96, 165, 250, 0.2);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const Badge = styled.span<{ $variant?: 'blue' | 'purple' }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 9999px;
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: ${({ $variant }) => ($variant === 'purple' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(96, 165, 250, 0.15)')};
  color: ${({ $variant }) => ($variant === 'purple' ? '#C084FC' : '#60A5FA')};
  border: 1px solid ${({ $variant }) => ($variant === 'purple' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(96, 165, 250, 0.3)')};
`;

const DropdownCard = styled(motion.div)`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 100;
  width: 320px;
  padding: 12px;
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(40px);
  border-radius: 24px;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05);

  @media (max-width: 640px) {
    left: auto;
    right: 0;
    width: 290px;
  }
`;

const DropdownHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px 10px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  span {
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
  }
`;

const TreasuryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  max-height: 260px;
  overflow-y: auto;
`;

const TreasuryItem = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  border-radius: 16px;
  background: ${({ $active }) => ($active ? 'rgba(96, 165, 250, 0.1)' : 'rgba(255, 255, 255, 0.03)')};
  border: 1px solid ${({ $active }) => ($active ? 'rgba(96, 165, 250, 0.4)' : 'rgba(255, 255, 255, 0.06)')};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const ItemTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #FFFFFF;
`;

const ItemSubtitle = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 8px;

  span.mono {
    font-family: monospace;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.4);
  }
`;

interface TreasurySwitcherProps {
  compact?: boolean;
}

function short(address: string): string {
  return address ? `${address.slice(0, 4)}...${address.slice(-4)}` : '';
}

function thresholdLabel(t: MultisigConfig): string {
  if (!t.onChain || !t.address) return 'No multisig';
  return t.memberCount ? `${t.threshold}/${t.memberCount}` : String(t.threshold);
}

/**
 * The organization's treasuries (Luxor multisigs), read from the backend. Picking one makes
 * every treasury / vault / member / proposal request use it (x-luxor-treasury header).
 * "Link" mirrors an existing multisig (e.g. a shared one) as one more treasury; the
 * connected wallet must be one of its on-chain members.
 */
export function TreasurySwitcher({ compact }: TreasurySwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [list, setList] = useState<MultisigConfig[]>([]);
  const [linking, setLinking] = useState(false);
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  /** Looking for shared treasuries: waiting for the wallet's signature, or still waiting after a while. */
  const [sharing, setSharing] = useState<'idle' | 'waiting' | 'slow'>('idle');
  const containerRef = useRef<HTMLDivElement>(null);
  const wallet = useWallet();
  const { config, vaults } = useTreasury();

  const load = useCallback(() => {
    listTreasuries()
      .then((res) => setList(res.data ?? []))
      .catch(() => undefined); // the switcher is informational: never break the page
  }, []);

  useEffect(() => {
    load();
    // Signing in with the wallet (done when it connects) unlocks the treasuries shared with it: re-read the list.
    window.addEventListener(WALLET_SESSION_EVENT, load);
    return () => window.removeEventListener(WALLET_SESSION_EVENT, load);
  }, [load]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Shared treasuries need proof of the wallet. Connecting the wallet already asks for it; this button is for
   * when that signature was declined or has expired. `auto` makes a failure silent.
   */
  const showShared = async (auto = false) => {
    setSharing('waiting');
    // A wallet popup can sit behind the browser window: after a while say so and let the user retry.
    const slowTimer = setTimeout(() => setSharing((s) => (s === 'waiting' ? 'slow' : s)), 12_000);
    try {
      await getWalletAuthHeaders(wallet);
      const res = await listTreasuries();
      setList(res.data ?? []);
      const found = (res.data ?? []).filter((t) => t.shared).length;
      const who = wallet.publicKey ? `${wallet.publicKey.toBase58().slice(0, 4)}…${wallet.publicKey.toBase58().slice(-4)}` : 'your wallet';
      if (found > 0) toast.success(found === 1 ? 'You have 1 shared treasury.' : `You have ${found} shared treasuries.`);
      else if (!auto) toast.info(`Wallet ${who} is not listed as a member of treasuries from other organizations. Ask to be added with that wallet.`);
    } catch (err: any) {
      const isRejection =
        err?.message?.includes('cancelled') ||
        err?.message?.includes('rejected') ||
        err?.name === 'WalletSignMessageError';
      if (!isRejection) {
        console.error('Shared treasuries error:', err);
      }
      if (!auto) {
        toast.error(err instanceof Error ? err.message : 'Could not load shared treasuries.');
      }
    } finally {
      clearTimeout(slowTimer);
      setSharing('idle');
    }
  };

  if (list.length === 0) return null;

  const activeId = getActiveTreasuryId();
  const active = list.find((t) => t.id === activeId || t.address === activeId) ?? list.find((t) => t.isDefault) ?? list[0];
  const totalBalance = vaults.reduce((sum, v) => sum + (Number(v.usdValue) || 0), 0);

  const select = async (t: MultisigConfig) => {
    setIsOpen(false);
    if (active && (t.id === active.id || t.address === active.address)) return;
    if (t.shared) {
      // Another organization's treasury opens only for a wallet that signed a session: ask for it now.
      try {
        await getWalletAuthHeaders(wallet);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Sign with your wallet to open a shared treasury.');
        return;
      }
    }
    toast.success(`Switching to ${t.name}…`);
    setActiveTreasuryId(t.id || t.address);
  };

  const submitLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    setBusy(true);
    try {
      const headers = await getWalletAuthHeaders(wallet);
      const res = await linkTreasury(address.trim(), name.trim() || undefined, headers);
      toast.success(`Treasury "${res.data.name}" linked successfully.`);
      setActiveTreasuryId(res.data.isDefault ? null : res.data.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not link treasury.');
      setBusy(false);
    }
  };

  return (
    <Container ref={containerRef}>
      <SwitchButton type="button" $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} title="Switch treasury" aria-expanded={isOpen}>
        <Building2 size={15} className="text-white/70" />
        {!compact && <span className="truncate max-w-[140px] md:max-w-[180px] text-white font-semibold">{active.name}</span>}
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : 'text-gray-400'}`} />
      </SwitchButton>

      <AnimatePresence>
        {isOpen && (
          <DropdownCard
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <DropdownHeader>
              <span>Your Multisig Treasuries</span>
              <ShieldCheck size={14} className="text-white/70 opacity-80" />
            </DropdownHeader>

            <TreasuryList>
              {list.map((t) => {
                const isActive = t.id === active.id;
                return (
                  <TreasuryItem key={t.id} $active={isActive} type="button" onClick={() => select(t)}>
                    <ItemInfo>
                      <ItemTitle>
                        <Building2 size={14} className="text-white/70 shrink-0" />
                        <span className="truncate">{t.name}</span>
                        {isActive && <Check size={14} className="text-white/90 shrink-0 ml-auto" />}
                      </ItemTitle>
                      <ItemSubtitle>
                        <span>{t.onChain ? `${t.memberCount ?? 0} members${t.shared ? ` · Shared${t.ownerName ? ` · by ${t.ownerName}` : ''}` : ''}` : t.isDefault ? 'Custodial' : 'Inactive'}</span>
                        {t.onChain && <span className="mono">{short(t.address)}</span>}
                      </ItemSubtitle>
                    </ItemInfo>
                    <div className="text-right shrink-0 ml-2">
                      {isActive && (
                        <div className="font-mono text-xs font-semibold text-white">
                          ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      )}
                      <div className="text-[10px] text-gray-400">Threshold {thresholdLabel(t)}</div>
                    </div>
                  </TreasuryItem>
                );
              })}
            </TreasuryList>

            {linking ? (
              <form onSubmit={submitLink} className="mt-3 space-y-2">
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Sterling multisig address"
                  required
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-white/40"
                />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name (optional)"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-white/40"
                />
                <p className="text-[10px] leading-snug text-gray-400">
                  Your connected wallet must be a member of that multisig; a signature will be required.
                </p>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setLinking(false)} disabled={busy} className="px-3 py-1.5 rounded-full text-xs text-gray-300 hover:bg-white/10">
                    Cancel
                  </button>
                  <button type="submit" disabled={busy || !address.trim()} className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-semibold disabled:opacity-40">
                    {busy ? 'Linking…' : 'Link'}
                  </button>
                </div>
              </form>
            ) : (
              <>
              {wallet.connected && !list.some((t) => t.shared) && (
                <button
                  type="button"
                  onClick={() => void showShared()}
                  disabled={sharing === 'waiting'}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 disabled:opacity-50"
                  title="Multisigs from other organizations where your wallet is a member"
                >
                  {sharing === 'waiting' ? 'Approve the signature in your wallet…' : sharing === 'slow' ? 'No signature yet · click to ask again' : 'Show shared treasuries'}
                </button>
              )}
              {sharing === 'slow' && (
                <p className="mt-2 px-1 text-[11px] leading-snug text-amber-300">
                  Open your wallet extension (Phantom or Solflare): a request to sign a message may be waiting there. It costs nothing; it only proves the wallet is yours.
                </p>
              )}
              <button
                type="button"
                onClick={() => setLinking(true)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/5"
              >
                <Plus size={14} />
                Link Sterling multisig
              </button>
              </>
            )}
          </DropdownCard>
        )}
      </AnimatePresence>
    </Container>
  );
}

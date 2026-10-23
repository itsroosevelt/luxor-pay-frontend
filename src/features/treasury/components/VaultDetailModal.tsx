'use client';

/**
 * VaultDetailModal — what a single treasury account holds (coins, stakes, NFTs),
 * read on-chain by the backend. Account view of a vault.
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { X, Copy, ExternalLink, ArrowUp, ArrowDown, ArrowLeftRight } from 'lucide-react';
import { TokenIcon } from '@/components/ui/TokenIcon';
import type { Vault } from '@/features/treasury/api/treasury-api';

type Tab = 'coins' | 'stakes' | 'nfts';

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
`;

const Title = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
`;

const Address = styled.div`
  font-family: monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  word-break: break-all;
`;

const IconBtn = styled.button`
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 2px;
  display: inline-flex;

  &:hover {
    color: #ffffff;
  }
`;

const Value = styled.p`
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
`;

const Sub = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  margin: 4px 0 0;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 18px 0;
`;

const Pill = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 9999px;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: ${({ $primary }) => ($primary ? '#FFFFFF' : 'transparent')};
  color: ${({ $primary }) => ($primary ? '#000000' : '#EDEDED')};
  border: 1px solid ${({ $primary }) => ($primary ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)')};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 8px;
`;

const TabBtn = styled.button<{ $active: boolean }>`
  background: transparent;
  border: none;
  border-bottom: 2px solid ${({ $active }) => ($active ? '#60A5FA' : 'transparent')};
  color: ${({ $active }) => ($active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)')};
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 12px;
  cursor: pointer;
`;

const List = styled.div`
  max-height: 320px;
  overflow-y: auto;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const ItemMain = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemTitle = styled.p`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  color: #ededed;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemSub = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  margin: 2px 0 0;
`;

const ItemRight = styled.div`
  text-align: right;
  font-family: monospace;
  font-size: 13px;
  color: #ededed;
`;

const StateBadge = styled.span<{ $tone: 'blue' | 'amber' | 'dim' }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 9999px;
  color: ${({ $tone }) => ($tone === 'blue' ? '#60A5FA' : $tone === 'amber' ? '#F59E0B' : 'rgba(255,255,255,0.5)')};
  background: ${({ $tone }) =>
    $tone === 'blue' ? 'rgba(96,165,250,0.1)' : $tone === 'amber' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.06)'};
`;

const NftGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
  padding-top: 8px;
`;

const NftCard = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
`;

const NftImage = styled.div<{ $src: string | null }>`
  aspect-ratio: 1;
  background: ${({ $src }) => ($src ? `center / cover no-repeat url("${$src}")` : 'rgba(255,255,255,0.05)')};
`;

const Empty = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  text-align: center;
  padding: 32px 0;
  margin: 0;
`;

const usd = (n: number, hidden: boolean) =>
  hidden ? '$ •••••' : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const amount = (v: string) => Number(v).toLocaleString('en-US', { maximumFractionDigits: 6 });
const short = (a: string) => (a.length > 12 ? `${a.slice(0, 4)}…${a.slice(-4)}` : a);

const STAKE_STATE: Record<string, { label: string; tone: 'blue' | 'amber' | 'dim' }> = {
  active: { label: 'Active', tone: 'blue' },
  activating: { label: 'Activating', tone: 'amber' },
  deactivating: { label: 'Deactivating', tone: 'amber' },
  inactive: { label: 'Inactive', tone: 'dim' },
};

interface VaultDetailModalProps {
  vault: Vault;
  /** Share (%) of the treasury's total USD value held by this account. */
  actualWeight: number;
  isPrivacyMode: boolean;
  explorerUrl: (address: string) => string;
  onClose: () => void;
  onCopy: (address: string) => void;
  onSend: () => void;
  onDeposit: () => void;
  onTrade: () => void;
  connected?: boolean;
}

export function VaultDetailModal({
  vault, actualWeight, isPrivacyMode, explorerUrl, onClose, onCopy, onSend, onDeposit, onTrade, connected = false,
}: VaultDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>('coins');

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const stakes = vault.stakes ?? [];
  const nfts = vault.nfts ?? [];
  const solPrice = vault.solUsdPrice ?? 0;
  const solUsd = Number(vault.solBalance) * solPrice;

  const coins = [
    ...(Number(vault.solBalance) > 0
      ? [{ mint: 'SOL', symbol: 'SOL', name: 'Solana', uiAmount: vault.solBalance, usdValue: solPrice ? solUsd : null }]
      : []),
    ...vault.tokens,
  ].sort((a, b) => (b.usdValue ?? 0) - (a.usdValue ?? 0));

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', bounce: 0.35, duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: 560,
          background: 'rgba(10, 10, 10, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 40,
          padding: '36px 40px',
          boxShadow: '0 32px 64px -16px rgba(0, 0, 0, 0.9)',
        }}
      >
        <Header>
          <div style={{ minWidth: 0 }}>
            <Title>{(vault.label || '').replace(/^bóveda\s+/i, '').replace(/^boveda\s+/i, '').trim() || 'Roosevelt'}</Title>
            {vault.address && (
              <Address>
                <span>{vault.address}</span>
                <IconBtn type="button" onClick={() => onCopy(vault.address)} title="Copy address">
                  <Copy size={12} />
                </IconBtn>
                <IconBtn type="button" onClick={() => window.open(explorerUrl(vault.address), '_blank')} title="View on Explorer">
                  <ExternalLink size={12} />
                </IconBtn>
              </Address>
            )}
          </div>
          <IconBtn type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </IconBtn>
        </Header>

        <Value>{usd(vault.usdValue, isPrivacyMode)}</Value>
        <Sub>
          {vault.index === 0
            ? `Roosevelt · custodial reception · ${actualWeight}% of total`
            : `${actualWeight}% of total · target ${vault.targetWeight ?? 0}%`}
        </Sub>

        <Actions>
          <Pill type="button" $primary onClick={onSend} disabled={!connected} title={!connected ? 'Connect your wallet to perform this action' : undefined}><ArrowUp size={14} /> Send</Pill>
          <Pill type="button" onClick={onDeposit} disabled={!connected} title={!connected ? 'Connect your wallet to perform this action' : undefined}><ArrowDown size={14} /> Deposit</Pill>
          <Pill type="button" onClick={onTrade} disabled={!connected} title={!connected ? 'Connect your wallet to perform this action' : undefined}><ArrowLeftRight size={14} /> Trade</Pill>
        </Actions>

        <Tabs>
          <TabBtn type="button" $active={tab === 'coins'} onClick={() => setTab('coins')}>Coins · {coins.length}</TabBtn>
          <TabBtn type="button" $active={tab === 'stakes'} onClick={() => setTab('stakes')}>Stakes · {stakes.length}</TabBtn>
          <TabBtn type="button" $active={tab === 'nfts'} onClick={() => setTab('nfts')}>NFTs · {nfts.length}</TabBtn>
        </Tabs>

        <List>
          {tab === 'coins' &&
            (coins.length === 0 ? (
              <Empty>This account has no tokens.</Empty>
            ) : (
              coins.map((c) => (
                <Item key={c.mint}>
                  <TokenIcon symbol={c.symbol} size={28} />
                  <ItemMain>
                    <ItemTitle>{c.symbol}</ItemTitle>
                    <ItemSub>{c.name ?? short(c.mint)}</ItemSub>
                  </ItemMain>
                  <ItemRight>
                    <div>{isPrivacyMode ? '•••' : amount(c.uiAmount)}</div>
                    <ItemSub>{c.usdValue != null ? usd(c.usdValue, isPrivacyMode) : 'No price'}</ItemSub>
                  </ItemRight>
                </Item>
              ))
            ))}

          {tab === 'stakes' &&
            (stakes.length === 0 ? (
              <Empty>This account has no staked SOL.</Empty>
            ) : (
              stakes.map((st) => (
                <Item key={st.address}>
                  <TokenIcon symbol="SOL" size={28} />
                  <ItemMain>
                    <ItemTitle>{short(st.address)}</ItemTitle>
                    <ItemSub>{st.validator ? `Validator ${short(st.validator)}` : 'Undelegated'}</ItemSub>
                  </ItemMain>
                  <StateBadge $tone={STAKE_STATE[st.state]?.tone ?? 'dim'}>{STAKE_STATE[st.state]?.label ?? st.state}</StateBadge>
                  <ItemRight>
                    <div>{isPrivacyMode ? '•••' : `${amount(st.sol)} SOL`}</div>
                    <ItemSub>{usd(st.usdValue ?? 0, isPrivacyMode)}</ItemSub>
                  </ItemRight>
                </Item>
              ))
            ))}

          {tab === 'nfts' &&
            (nfts.length === 0 ? (
              <Empty>This account has no NFTs.</Empty>
            ) : (
              <NftGrid>
                {nfts.map((n) => (
                  <NftCard key={n.mint} title={n.mint}>
                    <NftImage $src={n.image} />
                    <div style={{ padding: '8px 10px' }}>
                      <ItemTitle style={{ fontSize: 12 }}>{n.name ?? short(n.mint)}</ItemTitle>
                    </div>
                  </NftCard>
                ))}
              </NftGrid>
            ))}
        </List>
      </motion.div>
    </motion.div>,
    document.body
  );
}

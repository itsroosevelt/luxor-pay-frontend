'use client';

/**
 * TreasuryContainer — Redesigned with Container Minimization (Rule 10).
 * Fluid, clean, responsive UI aligned with the Sterling design system.
 * Supports Squads v4 Account Detail Views & Main Overview seamlessly.
 */

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
  Eye,
  EyeOff,
  Coins,
  Layers,
  Image as ImageIcon,
  Plus,
  Pencil,
  Copy,
  MoreHorizontal,
  X,
  ExternalLink,
  Trash2,
  ShieldCheck,
  Wallet,
  Loader2,
  Shuffle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useMerchant } from '@/context/MerchantContext';
import { useTreasury } from '@/hooks/useTreasury';
import { useMembers } from '@/hooks/useMembers';
import { useProposals } from '@/hooks/useProposals';
import { useVaultActivity } from '@/hooks/useVaultActivity';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { ProposalsPanel } from '@/components/dashboard/proposals/ProposalsPanel';
import { VaultDetailModal } from '@/components/dashboard/treasury/VaultDetailModal';
import { TokenIcon } from '@/components/shared/TokenIcon';
import { useGetTransfers } from '@/hooks/useGetTransfers';
import type { ProposalType } from '@/lib/proposals-api';
import { QrOperationsModal } from '@/components/dashboard/overview/QrOperationsModal';
import { ReceiveModal } from '@/components/dashboard/overview/ReceiveModal';
import { PaymentRequestModal } from '@/components/dashboard/overview/PaymentRequestModal';
import type { Vault } from '@/lib/treasury-api';

const formatVaultLabel = (label: string | undefined, isPrincipal?: boolean): string => {
  let clean = (label || '').replace(/^bóveda\s+/i, '').replace(/^boveda\s+/i, '').trim();
  if (isPrincipal || !clean || clean.toLowerCase() === 'principal' || clean.toLowerCase() === 'bóveda principal' || clean.toLowerCase() === 'boveda principal') {
    return 'Roosevelt';
  }
  return clean;
};

// ── Styled Components (Clean, Fluid & Mobile-First — Rule 10) ─────────────────────────────

const PageContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 28px;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px 40px 60px 40px;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    padding: 20px 24px 40px 24px;
    gap: 24px;
  }

  @media (max-width: 640px) {
    padding: 16px 14px 32px 14px;
    gap: 18px;
  }
`;

// ── Breadcrumbs ─────────────────────────────────────────────────────────────

const BreadcrumbNav = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 500;
  color: #ffffff;
`;

const BreadcrumbBtn = styled.button`
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;

  &:hover {
    color: rgba(255, 255, 255, 0.85);
  }
`;

const BreadcrumbSep = styled.span`
  color: rgba(255, 255, 255, 0.25);
  font-size: 20px;
`;

/* ──────────────────────── Balance & Actions Block ──────────────────────── */

const BalanceRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    width: 100%;
  }
`;

const BalanceLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EyebrowRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EyebrowLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
`;

const PrivacyButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  padding: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #FFFFFF;
  }
`;

const PrimaryBalanceText = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 52px;
  font-weight: 500;
  color: #FFFFFF;
  letter-spacing: -1.5px;
  line-height: 1;

  @media (max-width: 1024px) {
    font-size: 42px;
  }

  @media (max-width: 640px) {
    font-size: 34px;
  }
`;

const ActionButtonsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    width: 100%;
    gap: 8px;
  }
`;

const ActionPillButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  border-radius: 9999px;
  padding: 10px 22px;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $variant }) =>
    $variant === 'primary'
      ? `
        background: #FFFFFF;
        color: #000000;
        border: 1px solid #FFFFFF;
        &:hover:not(:disabled) {
          background: #2563EB;
          color: #FFFFFF;
          border-color: #2563EB;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
        }
      `
      : `
        background: rgba(255, 255, 255, 0.05);
        color: #EDEDED;
        border: 1px solid rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(12px);
        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          color: #FFFFFF;
          border-color: rgba(255, 255, 255, 0.3);
        }
      `}

  @media (max-width: 640px) {
    flex: 1;
    padding: 9px 14px;
    font-size: 13px;
  }
`;

const ActionIconButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  border-radius: 9999px;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $variant }) =>
    $variant === 'primary'
      ? `
        background: #FFFFFF;
        color: #000000;
        border: 1px solid #FFFFFF;
        &:hover:not(:disabled) {
          background: #2563EB;
          color: #FFFFFF;
          border-color: #2563EB;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
        }
      `
      : `
        background: rgba(255, 255, 255, 0.05);
        color: #EDEDED;
        border: 1px solid rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(12px);
        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          color: #FFFFFF;
          border-color: rgba(255, 255, 255, 0.3);
        }
      `}
`;

/* ──────────────────────── Stats Bar Block ──────────────────────── */

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  width: fit-content;
  flex: 0 0 auto;

  @media (max-width: 640px) {
    padding: 8px 12px;
    gap: 8px;
    border-radius: 12px;
  }
`;

const StatIconBadge = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #EDEDED;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: 640px) {
    width: 32px;
    height: 32px;
    border-radius: 10px;
  }
`;

const StatValueGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StatValue = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #FFFFFF;
  line-height: 1.2;

  @media (max-width: 640px) {
    font-size: 16px;
  }
`;

const StatLabel = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.45);

  @media (max-width: 640px) {
    font-size: 11px;
  }
`;

/* ──────────────────────── Accounts Section ──────────────────────── */

const SectionTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
`;

const SectionTitleText = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: -0.5px;
  color: #FFFFFF;
  margin: 0;

  @media (max-width: 640px) {
    font-size: 20px;
  }
`;

const AddAccountBtn = styled.button`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #EDEDED;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 16px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    color: #FFFFFF;
    border-color: rgba(255, 255, 255, 0.25);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const DesktopTableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;

  @media (max-width: 767px) {
    display: none;
  }
`;

const AccountsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const TableTh = styled.th`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const TableTr = styled(motion.tr)`
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`;

const TableTd = styled.td`
  padding: 18px 16px;
  vertical-align: middle;
`;

const AccountNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #FFFFFF;
`;

const EditIconButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  padding: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;

  &:hover:not(:disabled) {
    color: #60A5FA;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const AddressSubline = styled.div`
  font-family: monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PendingBadge = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 9999px;
  background: rgba(245, 158, 11, 0.15);
  color: #F59E0B;
  border: 1px solid rgba(245, 158, 11, 0.3);
`;

const ActivateInlineButton = styled.button`
  background: rgba(37, 99, 235, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.3);
  color: #60A5FA;
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 9999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &:hover:not(:disabled) {
    background: #2563EB;
    color: #FFFFFF;
  }
`;

const BalanceValueRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #FFFFFF;
`;

const TokenBadgeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: -4px;
`;

const WeightColumnContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 140px;
`;

const WeightPercentageText = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
`;

const WeightBarTrack = styled.div`
  width: 100%;
  height: 4px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
`;

const WeightBarFill = styled.div<{ $weight: number }>`
  height: 100%;
  width: ${({ $weight }) => Math.min(100, Math.max(0, $weight))}%;
  background: #FFFFFF;
  border-radius: 9999px;
`;

const TableActionsGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
`;

const TableRowActionButton = styled.button`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    color: #FFFFFF;
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

/* ──────────────────────── Mobile Accounts Cards ──────────────────────── */

const MobileAccountsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileAccountCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

/* ──────────────────────── Account Detail Views (Squads Style) ──────────────── */

const AccountDetailHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 4px 0;
`;

const AccountHeaderTopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const AccountAddressBox = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 14px;
  border-radius: 9999px;
  font-family: monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
`;

const SectionSubTabs = styled.div`
  display: flex;
  gap: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 12px;
  margin-top: 12px;
`;

const SubTabBtn = styled.button<{ $active: boolean }>`
  background: transparent;
  border: none;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: ${({ $active }) => ($active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)')};
  border-bottom: 2px solid ${({ $active }) => ($active ? '#60A5FA' : 'transparent')};
  padding-bottom: 10px;
  margin-bottom: -13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #ffffff;
  }
`;

const EmptyStateContainer = styled.div`
  padding: 36px 16px;
  text-align: center;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
`;

const CoinsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const CoinRowSubItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px 10px 52px;
  background: rgba(255, 255, 255, 0.015);
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`;

const TimelineActivityCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 580px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(96, 165, 250, 0.4);
  }
`;

const TimelineItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
`;

const helperShort = (a: string) => (a && a.length > 12 ? `${a.slice(0, 4)}…${a.slice(-4)}` : a);

const explorerAddressUrl = (addr: string) => {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'devnet';
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
  return `https://explorer.solana.com/address/${addr}${cluster}`;
};

// ── Inner Main Container Component ──────────────────────────────────────────

function TreasuryContainerInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const accountQueryParam = searchParams.get('account');

  const { profile } = useMerchant();
  const merchantWallet = profile?.merchantWallet ?? '';
  const businessName = profile?.businessName?.trim() || null;

  const { connected } = useWallet();
  const { setVisible: openWalletModal } = useWalletModal();

  const {
    vaults, config, createVault, updateVault, removeVault, deployMultisig,
    isError: treasuryError, errorMessage: treasuryErrorMessage, collector, sweepCollector,
    isLoading: isTreasuryLoading, refetch: refetchTreasury,
  } = useTreasury();
  const { data: transfersData } = useGetTransfers(10);
  const realTransfers = transfersData?.data ?? [];
  const { redistribute, data: proposalsData } = useProposals();
  const { data: members } = useMembers();

  // Surface backend failures instead of silently showing stale or invented data.
  useEffect(() => {
    if (treasuryError) toast.error(`No se pudo cargar la tesorería: ${treasuryErrorMessage ?? 'error desconocido'}`);
  }, [treasuryError, treasuryErrorMessage]);

  // Every create / edit / delete / move needs a connected wallet that signs it.
  const requireWallet = (): boolean => {
    if (connected) return true;
    toast.error('Conecta tu wallet (Phantom o Solflare) para realizar esta acción.');
    openWalletModal(true);
    return false;
  };

  const isOnChain = !!config?.onChain;
  const rawSignerCount = members.filter((m) => m.roles.signer).length;
  // Accounts without registered team members count at least 1 signer (the primary owner).
  const signerCount = rawSignerCount > 0 ? rawSignerCount : 1;
  const memberTotal = isOnChain && config?.memberCount ? config.memberCount : signerCount;
  const effectiveThreshold = isOnChain ? (config?.threshold ?? 1) : Math.min(config?.threshold ?? 1, memberTotal);
  const thresholdExceedsSigners = !!config && !isOnChain && config.threshold > memberTotal && memberTotal > 1;

  // Only real vaults from the backend — never an invented placeholder account.
  const [accountList, setAccountList] = useState<Vault[]>(() =>
    (vaults ?? []).map((v, idx) => ({
      ...v,
      label: formatVaultLabel(v.label, idx === 0 || v.index === 0 || v.isDefault),
    }))
  );
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  useEffect(() => {
    if (vaults) {
      setAccountList(
        vaults.map((v, idx) => ({
          ...v,
          label: formatVaultLabel(v.label, idx === 0 || v.index === 0 || v.isDefault),
        }))
      );
    }
  }, [vaults]);

  // Sync active accounts to localStorage for Sidebar with formatted balance
  useEffect(() => {
    if (accountList && accountList.length > 0) {
      try {
        const serialized = accountList.map((a, idx) => {
          const cleanLabel = formatVaultLabel(a.label, idx === 0 || a.index === 0 || a.isDefault);
          return {
            id: a.id,
            label: cleanLabel,
            address: a.address,
            usdValue: a.usdValue,
          };
        });
        localStorage.setItem('luxor_treasury_vaults', JSON.stringify(serialized));
        window.dispatchEvent(new Event('luxor_vaults_updated'));
      } catch {
        // ignore
      }
    }
  }, [accountList]);

  // Determine active single account view if URL query specifies one
  const activeAccount = useMemo(() => {
    if (!accountQueryParam) return null;
    const queryLower = accountQueryParam.toLowerCase();
    const found = accountList.find(
      (a) =>
        a.id === accountQueryParam ||
        a.id.toLowerCase() === queryLower ||
        a.label.toLowerCase().replace(/\s+/g, '-') === queryLower ||
        (queryLower.includes('roosevelt') && (a.index === 0 || a.isDefault)),
    );
    if (!found) return null;
    const isPrincipal = found.index === 0 || found.isDefault || accountList.indexOf(found) === 0;
    return {
      ...found,
      label: formatVaultLabel(found.label, isPrincipal),
    };
  }, [accountQueryParam, accountList]);

  // Real on-chain history of the open account (direct deposits included).
  const { items: activityItems } = useVaultActivity(activeAccount?.id);

  const handleSelectAccount = (acc: Vault | null) => {
    if (!acc) {
      router.push('/dashboard/treasury');
    } else {
      const slug = acc.id || acc.label.toLowerCase().replace(/\s+/g, '-');
      router.push(`/dashboard/treasury?account=${encodeURIComponent(slug)}`);
    }
  };

  // Detail Subtabs state
  const [detailAssetTab, setDetailAssetTab] = useState<'coins' | 'nfts'>('coins');
  const [ordersTab, setOrdersTab] = useState<'open' | 'history'>('open');
  const [streamsTab, setStreamsTab] = useState<'incoming' | 'outgoing'>('incoming');

  // Modal controls
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isPaymentRequestOpen, setIsPaymentRequestOpen] = useState(false);
  const [addAccountModalOpen, setAddAccountModalOpen] = useState(false);
  const [editAccountModalOpen, setEditAccountModalOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);

  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);

  const [newAccountLabel, setNewAccountLabel] = useState('');
  const [newAccountWeight, setNewAccountWeight] = useState('0');
  const [editAccountLabel, setEditAccountLabel] = useState('');
  const [editAccountWeight, setEditAccountWeight] = useState('0');
  const [isRedistributing, setIsRedistributing] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  const proposalsRef = React.useRef<HTMLDivElement>(null);
  const [proposalsKey, setProposalsKey] = useState(0);
  const [openProposalForm, setOpenProposalForm] = useState(false);
  const [proposalType, setProposalType] = useState<ProposalType>('transfer');
  const [detailVault, setDetailVault] = useState<Vault | null>(null);
  const [proposeVaultId, setProposeVaultId] = useState<string | undefined>(undefined);
  const [depositVault, setDepositVault] = useState<Vault | null>(null);

  const defaultVault = accountList.find((v) => v.isDefault) ?? accountList[0] ?? null;

  const showProposals = (openForm: boolean) => {
    setOpenProposalForm(openForm);
    setProposalsKey((k) => k + 1);
    // The proposals panel only exists in the overview; leave an account page first.
    if (activeAccount) router.push('/dashboard/treasury');
    setTimeout(() => proposalsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), activeAccount ? 350 : 0);
  };

  const startSend = (vault?: Vault) => {
    setActiveDropdownId(null);
    setDropdownPos(null);
    if (!requireWallet()) return;
    if (!isOnChain) {
      toast.error('Activa el multisig para mover fondos: toda salida requiere una propuesta aprobada.');
      return;
    }
    setProposeVaultId((vault ?? activeAccount ?? defaultVault)?.id);
    setProposalType('transfer');
    showProposals(true);
  };

  const startTrade = (vault?: Vault) => {
    setActiveDropdownId(null);
    setDropdownPos(null);
    if (!requireWallet()) return;
    if (!isOnChain) {
      toast.error('Activa el multisig para operar: los swaps de la tesorería requieren una propuesta aprobada.');
      return;
    }
    setProposeVaultId((vault ?? activeAccount ?? defaultVault)?.id);
    setProposalType('swap');
    showProposals(true);
  };

  const handleRedistribute = async () => {
    if (!requireWallet()) return;
    if (!isOnChain) {
      toast.error('Activa el multisig antes de redistribuir.');
      return;
    }
    // One proposal per asset so every Squads transaction fits; each needs one signature to create.
    const principal = accountList.find((v) => v.index === 0);
    const mints = [
      ...(Number(principal?.solBalance ?? 0) > 0.02 ? ['11111111111111111111111111111111'] : []),
      ...(principal?.tokens ?? []).filter((t) => Number(t.uiAmount) > 0).map((t) => t.mint),
    ];
    if (mints.length === 0) {
      toast.error('La Bóveda Principal no tiene saldo para redistribuir.');
      return;
    }
    setIsRedistributing(true);
    let created = 0;
    const failures: string[] = [];
    try {
      for (const mint of mints) {
        try {
          await redistribute(mint);
          created++;
        } catch (err) {
          failures.push(err instanceof Error ? err.message : String(err));
        }
      }
      if (created > 0) {
        toast.success(`${created} propuesta(s) de redistribución creadas · pendientes de firmas`);
        showProposals(false);
      }
      if (failures.length > 0) toast.error(failures[0]);
    } finally {
      setIsRedistributing(false);
    }
  };

  // Deposit only shows a QR / address to receive funds: it signs nothing, so it isn't wallet-gated.
  // Payments that landed in the custodial collection wallet → Principal Squads vault.
  const handleSweep = async () => {
    if (!requireWallet()) return;
    setIsSweeping(true);
    try {
      const sigs = await sweepCollector();
      toast.success(`Cobros movidos a la Bóveda Principal (${sigs.length} transacción${sigs.length === 1 ? '' : 'es'})`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudieron mover los cobros');
    } finally {
      setIsSweeping(false);
    }
  };

  const startDeposit = (vault?: Vault) => {
    setActiveDropdownId(null);
    setDropdownPos(null);
    const target = vault ?? activeAccount ?? defaultVault;
    if (target && isAwaitingActivation(target)) {
      toast.error('Esta sub-bóveda aún no tiene dirección: activa el multisig primero.');
      return;
    }
    setDepositVault(target);
    setIsQrOpen(true);
  };

  const handleWalletAction = async () => {
    if (!connected) {
      openWalletModal(true);
      return;
    }
    setIsDeploying(true);
    try {
      const deployed = await deployMultisig();
      // The backend caps the threshold at the number of signers when needed.
      toast.success(`Multisig activo en Squads v4 · umbral ${deployed.threshold} de ${deployed.memberCount ?? memberTotal}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo desplegar el multisig');
    } finally {
      setIsDeploying(false);
    }
  };

  const isAwaitingActivation = (v: Vault) => v.index > 0 && (!v.address || !isOnChain);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Dirección copiada');
  };

  const totalBalanceNumber = useMemo(() => {
    return accountList.reduce((acc, v) => acc + (v.usdValue || 0), 0);
  }, [accountList]);

  const coinCount = useMemo(() => {
    const held = new Set<string>();
    for (const v of accountList) {
      if (Number(v.solBalance) > 0) held.add('SOL');
      for (const t of v.tokens ?? []) if (Number(t.uiAmount) > 0) held.add(t.mint);
    }
    return held.size;
  }, [accountList]);

  const stakeCount = accountList.reduce((acc, v) => acc + (v.stakes?.length ?? 0), 0);
  const nftCount = accountList.reduce((acc, v) => acc + (v.nfts?.length ?? 0), 0);

  // Target allocation: sub-vaults have their own %, the Principal keeps whatever is left.
  const subTargetTotal = accountList.filter((v) => v.index > 0).reduce((acc, v) => acc + (v.targetWeight ?? 0), 0);
  const targetWeightOf = (v: Vault) => (v.index === 0 ? Math.max(0, 100 - subTargetTotal) : v.targetWeight ?? 0);
  const targetUsdOf = (v: Vault) => (totalBalanceNumber * targetWeightOf(v)) / 100;

  const actualWeightOf = (v: Vault) =>
    totalBalanceNumber > 0 ? Math.round((v.usdValue / totalBalanceNumber) * 1000) / 10 : 0;

  // More than 1 % away from the target anywhere → Redistribuir would move funds.
  const needsRedistribution =
    subTargetTotal > 0 && totalBalanceNumber > 0 && accountList.some((v) => Math.abs(actualWeightOf(v) - targetWeightOf(v)) > 1);

  const topAssetsOf = (v: Vault) =>
    [
      ...(Number(v.solBalance) > 0 ? [{ key: 'SOL', symbol: 'SOL', usd: Number(v.solBalance) * (v.solUsdPrice ?? 0) }] : []),
      ...v.tokens.map((t) => ({ key: t.mint, symbol: t.symbol, usd: t.usdValue ?? 0 })),
    ]
      .sort((a, b) => b.usd - a.usd)
      .slice(0, 3);

  const formatUsd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatAmount = (v: string | number) => Number(v).toLocaleString('en-US', { maximumFractionDigits: 6 });

  /** Every asset an account holds, valued with the prices the backend used (SOL includes staked SOL). */
  const coinsOf = (v: Vault) => {
    const solPrice = v.solUsdPrice ?? 0;
    const staked = (v.stakes ?? []).reduce((acc, st) => acc + Number(st.sol), 0);
    const liquid = Number(v.solBalance) || 0;
    const rows = [
      ...(liquid + staked > 0
        ? [{ key: 'SOL', symbol: 'SOL', name: 'Solana', explorer: v.address, amount: liquid + staked, usd: solPrice ? (liquid + staked) * solPrice : null, liquid, staked }]
        : []),
      ...v.tokens.map((t) => ({
        key: t.mint, symbol: t.symbol, name: t.name ?? null, explorer: t.mint,
        amount: Number(t.uiAmount), usd: t.usdValue ?? null, liquid: 0, staked: 0,
      })),
    ];
    const total = rows.reduce((acc, r) => acc + (r.usd ?? 0), 0);
    return rows
      .map((r) => ({ ...r, weight: total > 0 && r.usd != null ? Math.round((r.usd / total) * 1000) / 10 : 0 }))
      .sort((a, b) => (b.usd ?? 0) - (a.usd ?? 0));
  };

  /**
   * Movements that belong to this account: the Principal shows the custodial wallet's
   * transfers; a sub-vault shows executed proposals that paid into or out of it.
   */
  type AccountFlow = {
    id: string;
    direction: 'in' | 'out';
    title: string;
    subtitle: string;
    amount: string;
    symbol: string;
    counterparty: string;
    usdValue?: string;
    timestamp?: number;
  };
  const flowsOf = (v: Vault): AccountFlow[] => {
    const directFlows: AccountFlow[] =
      v.index === 0
        ? realTransfers.map((tx) => {
          const symbol = tx.symbol || 'SOL';
          const amtNum = Number(tx.amount) || 0;
          let solPrice = v.solUsdPrice || 119;
          let usd = symbol === 'USDC' || symbol === 'USDT' ? amtNum : symbol === 'EURC' ? amtNum * 1.13 : amtNum * solPrice;
          const isIncoming = merchantWallet ? (tx.toWallet || '').toLowerCase() === merchantWallet.toLowerCase() : false;
          const direction: 'in' | 'out' = isIncoming ? 'in' : 'out';
          const counterparty = isIncoming ? tx.fromWallet : tx.toWallet;
          const txTime = tx.confirmedAt ? new Date(tx.confirmedAt).getTime() : (tx.createdAt ? new Date(tx.createdAt).getTime() : Date.now());
          return {
            id: `tx-${tx.id}`,
            direction,
            title: isIncoming
              ? `From: ${helperShort(tx.fromWallet || '')}`
              : (tx.toNickname ? `To: ${tx.toNickname}` : `To: ${helperShort(tx.toWallet || '')}`),
            subtitle: tx.confirmedAt || tx.createdAt ? new Date(tx.confirmedAt || tx.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : (tx.status?.toUpperCase() || 'CONFIRMED'),
            amount: `${tx.amount}`,
            symbol,
            counterparty: counterparty || '',
            usdValue: usd > 0 ? `~$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : undefined,
            timestamp: txTime,
          };
        })
        : [];

    const proposalFlows: AccountFlow[] = proposalsData
      .filter((p) => p.status === 'executed')
      .flatMap((p): AccountFlow[] => {
        const isSource = p.vaultId === v.id || (v.index === 0 && (!p.vaultId || p.vaultId === 'vault_gemini_main'));
        const symbol = p.symbol || 'SOL';
        const amtNum = Number(p.amount) || 0;
        let solPrice = v.solUsdPrice || 119;
        let usd = symbol === 'USDC' || symbol === 'USDT' ? amtNum : symbol === 'EURC' ? amtNum * 1.13 : amtNum * solPrice;
        const formattedUsd = usd > 0 ? `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : undefined;
        const pTime = p.executedAt ? new Date(p.executedAt).getTime() : (p.createdAt ? new Date(p.createdAt).getTime() : (p.index ? p.index * 1000 : 0));

        const cleanVaultLabel = (p.vaultLabel || '').replace(/^bóveda\s+/i, '').replace(/^boveda\s+/i, '').trim() || 'Roosevelt';

        if (isSource) {
          return [
            {
              id: `prop-${p.id}`,
              direction: 'out' as const,
              title: `To: ${p.destinationLabel || helperShort(p.destination)}`,
              subtitle: `Propuesta #${p.index} · EJECUTADA`,
              amount: `${p.amount}`,
              symbol,
              counterparty: p.destination,
              usdValue: formattedUsd,
              timestamp: pTime,
            },
          ];
        }
        const legs = (p.transfers ?? []).filter((t) => t.vaultId === v.id || t.destination === v.address);
        if (legs.length === 0 && p.destination === v.address) {
          return [
            {
              id: `prop-in-${p.id}`,
              direction: 'in' as const,
              title: `From: ${cleanVaultLabel}`,
              subtitle: `Propuesta #${p.index} · EJECUTADA`,
              amount: `${p.amount}`,
              symbol,
              counterparty: cleanVaultLabel,
              usdValue: formattedUsd,
              timestamp: pTime,
            },
          ];
        }
        return legs.map((t, i) => {
          const tAmt = Number(t.amount) || 0;
          const tUsd = symbol === 'USDC' || symbol === 'USDT' ? tAmt : symbol === 'EURC' ? tAmt * 1.13 : tAmt * solPrice;
          return {
            id: `prop-leg-${p.id}-${i}`,
            direction: (t.vaultId === v.id ? 'out' : 'in') as 'out' | 'in',
            title: t.vaultId === v.id ? `To: ${helperShort(t.destination)}` : `From: ${cleanVaultLabel}`,
            subtitle: `Propuesta #${p.index} · EJECUTADA`,
            amount: `${t.amount}`,
            symbol: t.symbol || symbol,
            counterparty: t.vaultId === v.id ? t.destination : cleanVaultLabel,
            usdValue: tUsd > 0 ? `$${tUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : undefined,
            timestamp: pTime,
          };
        });
      });

    // Once the chain history is loaded it is the source of truth: it includes direct
    // deposits and forwarded payments, with real USD prices. Proposal rows remain only
    // for executions older than the history window.
    if (activityItems && v.id === activeAccount?.id) {
      const sigs = new Set(activityItems.map((a) => a.signature));
      const proposalBySig = new Map<string, (typeof proposalsData)[number]>();
      proposalsData.forEach((p) => {
        [p.executedSig, ...(p.payoutSigs ?? [])].forEach((sig) => { if (sig) proposalBySig.set(sig, p); });
      });
      const labelOf = (addr: string | null) => {
        if (!addr) return 'Desconocido';
        const found = accountList.find((a) => a.address === addr);
        if (found) {
          const clean = (found.label || '').replace(/^bóveda\s+/i, '').replace(/^boveda\s+/i, '').trim();
          return clean || 'Roosevelt';
        }
        return helperShort(addr);
      };
      const chainFlows: AccountFlow[] = activityItems.map((a, i) => {
        const p = proposalBySig.get(a.signature);
        const when = a.time ? new Date(a.time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Confirmada';
        const chainTime = a.time ? new Date(a.time).getTime() : (p?.executedAt ? new Date(p.executedAt).getTime() : 0);
        return {
          id: `chain-${a.signature}-${a.mint}-${i}`,
          direction: a.direction,
          title: `${a.direction === 'in' ? 'From' : 'To'}: ${labelOf(a.counterparty)}`,
          subtitle: p ? `Propuesta #${p.index} · ${when}` : when,
          amount: a.amount,
          symbol: a.symbol,
          counterparty: a.counterparty ?? '',
          usdValue: a.usdValue !== null && a.usdValue > 0
            ? `$${a.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
            : undefined,
          timestamp: chainTime,
        };
      });
      const olderProposalFlows = proposalFlows.filter((f) => {
        const p = proposalsData.find((x) => f.id.includes(x.id));
        return !p || ![p.executedSig, ...(p.payoutSigs ?? [])].some((sig) => sig && sigs.has(sig));
      });
      const combined = [...chainFlows, ...olderProposalFlows];
      return combined.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
    }

    const combined = [...proposalFlows, ...directFlows];
    return combined.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
  };

  const formattedTotalBalance = isPrivacyMode
    ? '$ •••••'
    : `$${totalBalanceNumber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountLabel.trim()) {
      toast.error('Por favor ingrese un nombre para la cuenta');
      return;
    }

    setIsSavingAccount(true);
    try {
      const createdAcc = await createVault({ label: newAccountLabel.trim(), targetWeight: Math.max(0, Math.min(100, Math.round(Number(newAccountWeight) || 0))) });
      setAccountList((prev) => [...prev.filter((acc) => acc.id !== createdAcc.id), createdAcc]);
      setNewAccountLabel('');
      setNewAccountWeight('0');
      setAddAccountModalOpen(false);
      toast.success('Cuenta creada exitosamente');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const openEditModal = (v: Vault) => {
    setActiveDropdownId(null);
    setDropdownPos(null);
    if (!requireWallet()) return;
    setSelectedVault(v);
    setEditAccountLabel(v.label);
    setEditAccountWeight(String(v.targetWeight ?? 0));
    setEditAccountModalOpen(true);
    setActiveDropdownId(null);
    setDropdownPos(null);
  };

  const handleToggleDropdown = (e: React.MouseEvent<HTMLButtonElement>, accId: string) => {
    e.stopPropagation();
    if (activeDropdownId === accId) {
      setActiveDropdownId(null);
      setDropdownPos(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 170;
      const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

      setDropdownPos({
        top: openUpward ? rect.top - dropdownHeight - 6 : rect.bottom + 6,
        right: Math.max(16, window.innerWidth - rect.right),
      });
      setActiveDropdownId(accId);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    setActiveDropdownId(null);
    setDropdownPos(null);
    if (!requireWallet()) return;
    try {
      await removeVault(id);
      setAccountList((prev) => prev.filter((acc) => acc.id !== id));
      toast.success('Cuenta eliminada');
    } catch (err) {
      // Only remove it from the screen when the backend actually removed it.
      toast.error(err instanceof Error ? err.message : 'No se pudo eliminar la cuenta');
    }
  };

  const activeAccountUsd = useMemo(() => {
    if (!activeAccount) return 0;
    const coins = coinsOf(activeAccount);
    const sum = coins.reduce((acc, c) => acc + (c.usd ?? 0), 0);
    return sum > 0 ? sum : (activeAccount.usdValue ?? 0);
  }, [activeAccount]);

  if (isTreasuryLoading && vaults.length === 0) {
    return (
      <PageContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: 140, height: 28, borderRadius: 8, background: 'rgba(255, 255, 255, 0.05)' }} />
          <div style={{ width: 100, height: 36, borderRadius: 9999, background: 'rgba(255, 255, 255, 0.05)' }} />
        </div>
        <div style={{ width: 220, height: 48, borderRadius: 12, background: 'rgba(255, 255, 255, 0.06)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
          <div style={{ height: 80, borderRadius: 16, background: 'rgba(255, 255, 255, 0.04)' }} />
          <div style={{ height: 80, borderRadius: 16, background: 'rgba(255, 255, 255, 0.04)' }} />
          <div style={{ height: 80, borderRadius: 16, background: 'rgba(255, 255, 255, 0.04)' }} />
        </div>
        <div style={{ width: '100%', height: 240, borderRadius: 24, background: 'rgba(255, 255, 255, 0.03)' }} />
      </PageContainer>
    );
  }

  // First load failed and there is nothing real to show: explain and offer a retry.
  if (treasuryError && vaults.length === 0) {
    return (
      <PageContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 32 }}>
        <div
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14, padding: 24, borderRadius: 20,
            background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 18, color: '#FFFFFF' }}>No se pudo cargar la tesorería</div>
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
            {treasuryErrorMessage ?? 'Error desconocido'}
          </div>
          <ActionPillButton type="button" $variant="secondary" onClick={() => { void refetchTreasury(); }}>
            Reintentar
          </ActionPillButton>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
    >
      {/* 1. Header Breadcrumbs */}
      <BreadcrumbNav>
        {activeAccount ? (
          <>
            <BreadcrumbBtn type="button" onClick={() => handleSelectAccount(null)}>
              Treasury
            </BreadcrumbBtn>
            <BreadcrumbSep>/</BreadcrumbSep>
            <span>{formatVaultLabel(activeAccount.label, activeAccount.index === 0 || activeAccount.isDefault)}</span>
          </>
        ) : (
          <span>Treasury</span>
        )}
      </BreadcrumbNav>

      {/* 2. MAIN ACCOUNT VIEW OR OVERVIEW MODE */}
      {activeAccount ? (
        /* ── SINGLE ACCOUNT DETAIL VIEW (Squads Images 2 & 3) ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <AccountDetailHeader>
            <AccountHeaderTopRow>
              <div>
                <EyebrowRow>
                  <EyebrowLabel>Account Balance</EyebrowLabel>
                  <PrivacyButton type="button" onClick={() => setIsPrivacyMode(!isPrivacyMode)}>
                    {isPrivacyMode ? <EyeOff size={14} /> : <Eye size={14} />}
                  </PrivacyButton>
                </EyebrowRow>
                <PrimaryBalanceText style={{ marginTop: 6 }}>
                  {isPrivacyMode
                    ? '$ •••••'
                    : `$${activeAccountUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </PrimaryBalanceText>
              </div>

              {activeAccount.address && (
                <AccountAddressBox>
                  <span>{helperShort(activeAccount.address)}</span>
                  <EditIconButton type="button" onClick={() => copyToClipboard(activeAccount.address)} title="Copiar dirección">
                    <Copy size={13} />
                  </EditIconButton>
                  <EditIconButton
                    type="button"
                    onClick={() => window.open(explorerAddressUrl(activeAccount.address), '_blank')}
                    title="Ver en Explorer"
                  >
                    <ExternalLink size={13} />
                  </EditIconButton>
                </AccountAddressBox>
              )}
            </AccountHeaderTopRow>

            {/* Account Stat Cards & Action Icons (On the SAME horizontal line) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginTop: 14 }}>
              <StatsRow style={{ margin: 0 }}>
                <StatItem
                  title={config?.address ? `Multisig ${config.address}` : undefined}
                  onClick={() => config?.address && copyToClipboard(config.address)}
                  style={config?.address ? { cursor: 'pointer' } : undefined}
                >
                  <StatIconBadge>
                    <ShieldCheck size={18} />
                  </StatIconBadge>
                  <StatValueGroup>
                    <StatValue>{config ? `${effectiveThreshold} / ${memberTotal}` : '—'}</StatValue>
                    <StatLabel>Threshold</StatLabel>
                  </StatValueGroup>
                </StatItem>
                <StatItem>
                  <StatIconBadge><Coins size={18} /></StatIconBadge>
                  <StatValueGroup>
                    <StatValue>{coinsOf(activeAccount).length}</StatValue>
                    <StatLabel>Coins</StatLabel>
                  </StatValueGroup>
                </StatItem>
                <StatItem>
                  <StatIconBadge><Layers size={18} /></StatIconBadge>
                  <StatValueGroup>
                    <StatValue>{activeAccount.stakes?.length ?? 0}</StatValue>
                    <StatLabel>Stakes</StatLabel>
                  </StatValueGroup>
                </StatItem>
                <StatItem>
                  <StatIconBadge><ImageIcon size={18} /></StatIconBadge>
                  <StatValueGroup>
                    <StatValue>{activeAccount.nfts?.length ?? 0}</StatValue>
                    <StatLabel>NFTs</StatLabel>
                  </StatValueGroup>
                </StatItem>
              </StatsRow>

              <ActionButtonsGroup>
                {(connected && config && !isOnChain) && (
                  <ActionIconButton type="button" $variant="secondary" onClick={handleWalletAction} disabled={isDeploying} title="Activar multisig">
                    {isDeploying ? <Loader2 size={18} className="animate-spin" /> : <Wallet size={18} />}
                  </ActionIconButton>
                )}
                <ActionIconButton type="button" $variant="primary" onClick={() => startSend(activeAccount)} disabled={!connected} title="Send">
                  <ArrowUp size={18} />
                </ActionIconButton>
                <ActionIconButton type="button" $variant="secondary" onClick={handleRedistribute} disabled={isRedistributing || !connected} title="Redistribuir">
                  {isRedistributing ? <Loader2 size={18} className="animate-spin" /> : <Shuffle size={18} />}
                </ActionIconButton>
                <ActionIconButton type="button" $variant="secondary" onClick={() => startDeposit(activeAccount)} title="Deposit">
                  <ArrowDown size={18} />
                </ActionIconButton>
                <ActionIconButton type="button" $variant="secondary" onClick={() => startTrade(activeAccount)} disabled={!connected} title="Trade">
                  <ArrowLeftRight size={18} />
                </ActionIconButton>
              </ActionButtonsGroup>
            </div>
          </AccountDetailHeader>

          {/* Subtabs: Coins | NFT */}
          <div>
            <SectionSubTabs>
              <SubTabBtn type="button" $active={detailAssetTab === 'coins'} onClick={() => setDetailAssetTab('coins')}>
                Coins
              </SubTabBtn>
              <SubTabBtn type="button" $active={detailAssetTab === 'nfts'} onClick={() => setDetailAssetTab('nfts')}>
                NFT
              </SubTabBtn>
            </SectionSubTabs>

            {detailAssetTab === 'coins' && (
              <DesktopTableWrapper style={{ marginTop: 16 }}>
                <CoinsTable>
                  <thead>
                    <tr>
                      <TableTh>Coin</TableTh>
                      <TableTh>Balance</TableTh>
                      <TableTh>Value</TableTh>
                      <TableTh>Weight</TableTh>
                      <TableTh style={{ textAlign: 'right' }}></TableTh>
                    </tr>
                  </thead>
                  <tbody>
                    {coinsOf(activeAccount).length === 0 && (
                      <TableTr>
                        <TableTd colSpan={5} style={{ textAlign: 'center', padding: '32px 16px', color: 'rgba(255, 255, 255, 0.45)' }}>
                          Esta cuenta no tiene tokens.
                        </TableTd>
                      </TableTr>
                    )}
                    {coinsOf(activeAccount).map((c) => (
                      <React.Fragment key={c.key}>
                        <TableTr>
                          <TableTd>
                            <AccountNameRow>
                              <TokenIcon symbol={c.symbol} size={26} />
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span>{c.symbol}</span>
                                  {c.explorer && (
                                    <EditIconButton type="button" onClick={() => window.open(explorerAddressUrl(c.explorer), '_blank')} title="Ver en Explorer">
                                      <ExternalLink size={12} />
                                    </EditIconButton>
                                  )}
                                </div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                                  {c.name ?? helperShort(c.key)}
                                </div>
                              </div>
                            </AccountNameRow>
                          </TableTd>
                          <TableTd>
                            <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>
                              {isPrivacyMode ? '•••' : formatAmount(c.amount)}
                            </span>
                          </TableTd>
                          <TableTd>
                            <span style={{ fontFamily: 'Outfit', fontWeight: 500 }}>
                              {isPrivacyMode ? '$ •••••' : c.usd != null ? formatUsd(c.usd) : 'Sin precio'}
                            </span>
                          </TableTd>
                          <TableTd>
                            <WeightColumnContent>
                              <WeightPercentageText>{c.weight}%</WeightPercentageText>
                              <WeightBarTrack><WeightBarFill $weight={c.weight} /></WeightBarTrack>
                            </WeightColumnContent>
                          </TableTd>
                          <TableTd />
                        </TableTr>
                        {c.key === 'SOL' && (
                          <tr>
                            <td colSpan={5} style={{ padding: 0 }}>
                              <CoinRowSubItem>
                                <span>Staked</span>
                                <span style={{ fontFamily: 'monospace' }}>
                                  {isPrivacyMode ? '•••' : `${formatAmount(c.staked)} SOL`} · {c.amount > 0 ? Math.round((c.staked / c.amount) * 100) : 0}%
                                </span>
                              </CoinRowSubItem>
                              <CoinRowSubItem>
                                <span>Unstaked</span>
                                <span style={{ fontFamily: 'monospace' }}>
                                  {isPrivacyMode ? '•••' : `${formatAmount(c.liquid)} SOL`} · {c.amount > 0 ? Math.round((c.liquid / c.amount) * 100) : 0}%
                                </span>
                              </CoinRowSubItem>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </CoinsTable>
              </DesktopTableWrapper>
            )}

            {detailAssetTab === 'nfts' &&
              ((activeAccount.nfts ?? []).length === 0 ? (
                <EmptyStateContainer style={{ marginTop: 16 }}>
                  Esta cuenta no posee NFTs registrados en Solana.
                </EmptyStateContainer>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginTop: 16 }}>
                  {(activeAccount.nfts ?? []).map((n) => (
                    <div
                      key={n.mint}
                      title={n.mint}
                      onClick={() => window.open(explorerAddressUrl(n.mint), '_blank')}
                      style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }}
                    >
                      <div style={{ aspectRatio: '1', background: n.image ? `center / cover no-repeat url("${n.image}")` : 'rgba(255,255,255,0.05)' }} />
                      <div style={{ padding: '8px 10px', fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#EDEDED', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.name ?? helperShort(n.mint)}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>

          {/* Open Orders & Order History */}
          <div>
            <SectionSubTabs>
              <SubTabBtn type="button" $active={ordersTab === 'open'} onClick={() => setOrdersTab('open')}>
                Open Orders
              </SubTabBtn>
              <SubTabBtn type="button" $active={ordersTab === 'history'} onClick={() => setOrdersTab('history')}>
                Order History
              </SubTabBtn>
            </SectionSubTabs>

            <EmptyStateContainer style={{ marginTop: 16 }}>
              {ordersTab === 'open' ? 'No open orders yet' : 'No order history'}
            </EmptyStateContainer>
          </div>

          {/* Streams */}
          <div>
            <SectionTitleText style={{ fontSize: 20 }}>Streams</SectionTitleText>
            <SectionSubTabs>
              <SubTabBtn type="button" $active={streamsTab === 'incoming'} onClick={() => setStreamsTab('incoming')}>
                Incoming Streams
              </SubTabBtn>
              <SubTabBtn type="button" $active={streamsTab === 'outgoing'} onClick={() => setStreamsTab('outgoing')}>
                Outgoing Streams
              </SubTabBtn>
            </SectionSubTabs>

            <EmptyStateContainer style={{ marginTop: 16 }}>
              No streams yet
            </EmptyStateContainer>
          </div>

          {/* Inflows and Outflows */}
          <div>
            <SectionTitleText style={{ fontSize: 20, marginBottom: 16 }}>Inflows and Outflows</SectionTitleText>

            {flowsOf(activeAccount).length === 0 ? (
              <EmptyStateContainer style={{ marginTop: 16 }}>
                No inflows or outflows recorded for this account.
              </EmptyStateContainer>
            ) : (
              <TimelineActivityCard>
                {flowsOf(activeAccount).map((f) => (
                  <TimelineItem key={f.id}>
                    {/* Left: Direction Icon Badge (COLORED) & Title/Subtitle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: f.direction === 'in' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                          border: f.direction === 'in' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {f.direction === 'in' ? (
                          <ArrowDownLeft size={18} color="#10B981" />
                        ) : (
                          <ArrowUpRight size={18} color="#EF4444" />
                        )}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 500, fontSize: 14, color: '#FFFFFF' }}>
                          {f.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.45)', marginTop: 2 }}>
                          {f.subtitle}
                        </div>
                      </div>
                    </div>

                    {/* Right: Numbers/Amount at the END (Right Side) in clean white text + Token Icon & Status */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            fontSize: 14,
                            color: '#EDEDED',
                          }}
                        >
                          {isPrivacyMode ? '•••' : `${f.direction === 'in' ? '+' : '−'}${f.amount} ${f.symbol}`}
                        </div>
                        <TokenIcon symbol={f.symbol} size={20} />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {f.usdValue && !isPrivacyMode && (
                          <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.45)' }}>
                            {f.usdValue}
                          </span>
                        )}
                        {f.counterparty && (
                          <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'monospace' }}>
                            {helperShort(f.counterparty)}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 9999,
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: 'rgba(255, 255, 255, 0.7)',
                            letterSpacing: '0.05em',
                          }}
                        >
                          CONFIRMED
                        </span>
                      </div>
                    </div>
                  </TimelineItem>
                ))}
              </TimelineActivityCard>
            )}
          </div>
        </div>
      ) : (
        /* ── MAIN TREASURY OVERVIEW MODE (Image 1 & 4) ── */
        <>
          {/* Balance Block */}
          <div>
            <EyebrowRow>
              <EyebrowLabel>Total Balance</EyebrowLabel>
              <PrivacyButton
                type="button"
                onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                title={isPrivacyMode ? 'Mostrar balance' : 'Ocultar balance'}
              >
                {isPrivacyMode ? <EyeOff size={15} /> : <Eye size={15} />}
              </PrivacyButton>
            </EyebrowRow>

            <PrimaryBalanceText style={{ marginTop: 4 }}>{formattedTotalBalance}</PrimaryBalanceText>
          </div>

          {/* Stats Bar & Action Icons (On the SAME horizontal line) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginTop: 14 }}>
            <StatsRow style={{ margin: 0 }}>
              <StatItem
                title={config?.address ? `Multisig ${config.address}` : undefined}
                onClick={() => config?.address && copyToClipboard(config.address)}
                style={config?.address ? { cursor: 'pointer' } : undefined}
              >
                <StatIconBadge>
                  <ShieldCheck size={18} />
                </StatIconBadge>
                <StatValueGroup>
                  <StatValue>{config ? `${effectiveThreshold} / ${memberTotal}` : '—'}</StatValue>
                  <StatLabel>
                    Threshold{isOnChain ? '' : ' · off-chain'}
                    {thresholdExceedsSigners && (
                      <span style={{ color: '#F59E0B' }} title="Al activar se ajustará al número de firmantes">
                        {' '}· se ajustará a {Math.max(1, memberTotal)}
                      </span>
                    )}
                  </StatLabel>
                </StatValueGroup>
              </StatItem>

              <StatItem>
                <StatIconBadge>
                  <Coins size={18} />
                </StatIconBadge>
                <StatValueGroup>
                  <StatValue>{coinCount}</StatValue>
                  <StatLabel>Coins</StatLabel>
                </StatValueGroup>
              </StatItem>

              <StatItem>
                <StatIconBadge>
                  <Layers size={18} />
                </StatIconBadge>
                <StatValueGroup>
                  <StatValue>{stakeCount}</StatValue>
                  <StatLabel>Stakes</StatLabel>
                </StatValueGroup>
              </StatItem>

              <StatItem>
                <StatIconBadge>
                  <ImageIcon size={18} />
                </StatIconBadge>
                <StatValueGroup>
                  <StatValue>{nftCount}</StatValue>
                  <StatLabel>NFTs</StatLabel>
                </StatValueGroup>
              </StatItem>
            </StatsRow>

            <ActionButtonsGroup>
              {(connected && config && !isOnChain) && (
                <ActionIconButton type="button" $variant="secondary" onClick={handleWalletAction} disabled={isDeploying} title="Activar multisig">
                  {isDeploying ? <Loader2 size={18} className="animate-spin" /> : <Wallet size={18} />}
                </ActionIconButton>
              )}
              <ActionIconButton type="button" $variant="primary" onClick={() => startSend()} disabled={!connected} title="Send">
                <ArrowUp size={18} />
              </ActionIconButton>
              <ActionIconButton type="button" $variant="secondary" onClick={handleRedistribute} disabled={isRedistributing || !connected} title="Redistribuir">
                {isRedistributing ? <Loader2 size={18} className="animate-spin" /> : <Shuffle size={18} />}
              </ActionIconButton>
              <ActionIconButton type="button" $variant="secondary" onClick={() => startDeposit()} title="Deposit">
                <ArrowDown size={18} />
              </ActionIconButton>
              <ActionIconButton type="button" $variant="secondary" onClick={() => startTrade()} disabled={!connected} title="Trade">
                <ArrowLeftRight size={18} />
              </ActionIconButton>
            </ActionButtonsGroup>
          </div>

          {/* Accounts Section */}
          {isOnChain && collector && (collector.canSweep || collector.blockedReason) && (
            <div
              style={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                padding: '12px 16px', borderRadius: 14, marginBottom: 16,
                background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)',
              }}
            >
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: '#EDEDED' }}>
                <strong style={{ color: '#F59E0B' }}>
                  {isPrivacyMode ? '$ •••••' : `$${collector.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </strong>{' '}
                en cobros recibidos ({helperShort(collector.address ?? '')}).{' '}
                {collector.blockedReason
                  ? collector.blockedReason
                  : 'Se están pasando automáticamente a la Bóveda Principal del multisig.'}
              </div>
              {(collector.canSweep || collector.needsFeePayer) && (
                <ActionPillButton type="button" $variant="secondary" onClick={handleSweep} disabled={isSweeping}>
                  {isSweeping ? <Loader2 size={15} className="animate-spin" /> : <ArrowDown size={15} />} Mover ahora
                </ActionPillButton>
              )}
            </div>
          )}


          <SectionTitleRow>
            <SectionTitleText>Accounts</SectionTitleText>
            <AddAccountBtn type="button" onClick={() => { if (requireWallet()) setAddAccountModalOpen(true); }} disabled={!connected} title={!connected ? 'Conecta tu wallet para realizar esta acción' : undefined}>
              <Plus size={14} /> Add Account
            </AddAccountBtn>
          </SectionTitleRow>

          {/* Desktop Table View (>= 768px) */}
          <DesktopTableWrapper>
            <AccountsTable>
              <thead>
                <tr>
                  <TableTh>Account</TableTh>
                  <TableTh>Balance</TableTh>
                  <TableTh>Weight</TableTh>
                  <TableTh style={{ textAlign: 'right' }}></TableTh>
                </tr>
              </thead>
              <tbody>
                {accountList.length === 0 ? (
                  <TableTr>
                    <TableTd colSpan={4} style={{ textAlign: 'center', padding: '48px 16px', color: 'rgba(255, 255, 255, 0.45)' }}>
                      No treasury accounts configured. Click &quot;Add Account&quot; above to create a vault.
                    </TableTd>
                  </TableTr>
                ) : (
                  <AnimatePresence>
                    {accountList.map((acc, idx) => {
                      const displayBalance = isPrivacyMode
                        ? '$ •••••'
                        : `$${acc.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                      return (
                        <TableTr
                          key={acc.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <TableTd>
                            <AccountNameRow>
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={() => handleSelectAccount(acc)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSelectAccount(acc)}
                                style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(96, 165, 250, 0.4)' }}
                                title="Ver detalle de la cuenta"
                              >
                                {formatVaultLabel(acc.label, idx === 0 || acc.index === 0 || acc.isDefault)}
                              </span>
                              <EditIconButton
                                type="button"
                                onClick={() => openEditModal(acc)}
                                disabled={!connected}
                                title={!connected ? 'Conecta tu wallet para realizar esta acción' : 'Editar nombre'}
                              >
                                <Pencil size={12} />
                              </EditIconButton>
                            </AccountNameRow>
                            <AddressSubline>
                              {isAwaitingActivation(acc) ? (
                                <>
                                  <PendingBadge>⏳ En espera de activación Multisig</PendingBadge>
                                  <ActivateInlineButton
                                    type="button"
                                    onClick={handleWalletAction}
                                    disabled={isDeploying}
                                    title={connected ? 'Activar el multisig de Squads v4 en Solana' : 'Conecta tu wallet para activar'}
                                  >
                                    {isDeploying ? <Loader2 size={11} className="animate-spin" /> : null}
                                    {connected ? 'Activar' : 'Conectar'}
                                  </ActivateInlineButton>
                                </>
                              ) : (
                                <>
                                  <span>{helperShort(acc.address)}</span>
                                  <EditIconButton
                                    type="button"
                                    onClick={() => copyToClipboard(acc.address)}
                                    title="Copiar dirección"
                                  >
                                    <Copy size={11} />
                                  </EditIconButton>
                                </>
                              )}
                            </AddressSubline>
                          </TableTd>

                          <TableTd>
                            <BalanceValueRow>
                              <span>{displayBalance}</span>
                              {acc.stale && (
                                <span
                                  title="Solana no respondió: es el último saldo conocido. Se actualizará solo."
                                  style={{ fontSize: 10, fontFamily: 'Montserrat, sans-serif', color: '#F59E0B' }}
                                >
                                  sin actualizar
                                </span>
                              )}
                              {topAssetsOf(acc).length > 0 && (
                                <TokenBadgeContainer>
                                  {topAssetsOf(acc).map((a) => (
                                    <TokenIcon key={a.key} symbol={a.symbol} size={18} />
                                  ))}
                                </TokenBadgeContainer>
                              )}
                            </BalanceValueRow>
                          </TableTd>

                          <TableTd>
                            <WeightColumnContent>
                              <WeightPercentageText>
                                {actualWeightOf(acc)}%
                                <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 11 }}>
                                  {` · obj ${targetWeightOf(acc)}%${isPrivacyMode ? '' : ` ($${targetUsdOf(acc).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}${acc.index === 0 ? ' · resto' : ''}`}
                                </span>
                              </WeightPercentageText>
                              <WeightBarTrack>
                                <WeightBarFill $weight={actualWeightOf(acc)} />
                              </WeightBarTrack>
                            </WeightColumnContent>
                          </TableTd>

                          <TableTd style={{ textAlign: 'right' }}>
                            <TableActionsGroup>
                              <TableRowActionButton
                                type="button"
                                onClick={() => startSend(acc)}
                                disabled={!connected}
                                title={!connected ? 'Conecta tu wallet para realizar esta acción' : 'Send'}
                              >
                                <ArrowUp size={14} />
                              </TableRowActionButton>

                              <TableRowActionButton
                                type="button"
                                onClick={() => startDeposit(acc)} title={'Deposit'}
                              >
                                <ArrowDown size={14} />
                              </TableRowActionButton>

                              <TableRowActionButton
                                type="button"
                                onClick={() => startTrade(acc)}
                                disabled={!connected}
                                title={!connected ? 'Conecta tu wallet para realizar esta acción' : 'Trade'}
                              >
                                <ArrowLeftRight size={14} />
                              </TableRowActionButton>

                              <TableRowActionButton
                                type="button"
                                onClick={(e) => handleToggleDropdown(e, acc.id)}
                                title="Opciones"
                              >
                                <MoreHorizontal size={14} />
                              </TableRowActionButton>
                            </TableActionsGroup>
                          </TableTd>
                        </TableTr>
                      );
                    })}
                  </AnimatePresence>
                )}
              </tbody>
            </AccountsTable>
          </DesktopTableWrapper>

          {/* Mobile Accounts Cards View (< 768px) */}
          <MobileAccountsContainer>
            {accountList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'rgba(255, 255, 255, 0.45)', fontSize: 13 }}>
                No treasury accounts configured. Click &quot;Add Account&quot; above to create a vault.
              </div>
            ) : (
              <AnimatePresence>
                {accountList.map((acc, idx) => {
                  const displayBalance = isPrivacyMode
                    ? '$ •••••'
                    : `$${acc.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                  return (
                    <MobileAccountCard
                      key={acc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <AccountNameRow>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectAccount(acc)}
                            style={{ cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                          >
                            {formatVaultLabel(acc.label, idx === 0 || acc.index === 0 || acc.isDefault)}
                          </span>
                          <EditIconButton type="button" onClick={() => openEditModal(acc)} disabled={!connected} title={!connected ? 'Conecta tu wallet para realizar esta acción' : 'Editar nombre'}>
                            <Pencil size={12} />
                          </EditIconButton>
                        </AccountNameRow>

                        <TableRowActionButton
                          type="button"
                          onClick={(e) => handleToggleDropdown(e, acc.id)}
                          title="Opciones"
                        >
                          <MoreHorizontal size={14} />
                        </TableRowActionButton>
                      </div>

                      <AddressSubline>
                        {isAwaitingActivation(acc) ? (
                          <>
                            <PendingBadge>⏳ En espera de activación Multisig</PendingBadge>
                            <ActivateInlineButton
                              type="button"
                              onClick={handleWalletAction}
                              disabled={isDeploying}
                            >
                              {isDeploying ? <Loader2 size={11} className="animate-spin" /> : null}
                              {connected ? 'Activar' : 'Conectar'}
                            </ActivateInlineButton>
                          </>
                        ) : (
                          <>
                            <span>{helperShort(acc.address)}</span>
                            <EditIconButton
                              type="button"
                              onClick={() => copyToClipboard(acc.address)}
                              title="Copiar dirección"
                            >
                              <Copy size={11} />
                            </EditIconButton>
                          </>
                        )}
                      </AddressSubline>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                        <BalanceValueRow>
                          <span>{displayBalance}</span>
                          {acc.stale && (
                            <span
                              title="Solana no respondió: es el último saldo conocido. Se actualizará solo."
                              style={{ fontSize: 10, fontFamily: 'Montserrat, sans-serif', color: '#F59E0B' }}
                            >
                              sin actualizar
                            </span>
                          )}
                          {topAssetsOf(acc).length > 0 && (
                            <TokenBadgeContainer>
                              {topAssetsOf(acc).map((a) => (
                                <TokenIcon key={a.key} symbol={a.symbol} size={16} />
                              ))}
                            </TokenBadgeContainer>
                          )}
                        </BalanceValueRow>

                        <WeightPercentageText style={{ fontSize: 13 }}>
                          {actualWeightOf(acc)}%
                          <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 11 }}>
                            {` · obj ${targetWeightOf(acc)}%`}
                          </span>
                        </WeightPercentageText>
                      </div>

                      <WeightBarTrack>
                        <WeightBarFill $weight={actualWeightOf(acc)} />
                      </WeightBarTrack>

                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <ActionPillButton
                          type="button"
                          $variant="secondary"
                          onClick={() => startSend(acc)}
                          disabled={!connected}
                          title={!connected ? 'Conecta tu wallet para realizar esta acción' : undefined}
                          style={{ flex: 1, padding: '6px 12px', fontSize: 12 }}
                        >
                          <ArrowUp size={13} /> Send
                        </ActionPillButton>
                        <ActionPillButton
                          type="button"
                          $variant="secondary"
                          onClick={() => startDeposit(acc)} title={undefined}
                          style={{ flex: 1, padding: '6px 12px', fontSize: 12 }}
                        >
                          <ArrowDown size={13} /> Deposit
                        </ActionPillButton>
                        <ActionPillButton
                          type="button"
                          $variant="secondary"
                          onClick={() => startTrade(acc)}
                          disabled={!connected}
                          title={!connected ? 'Conecta tu wallet para realizar esta acción' : undefined}
                          style={{ flex: 1, padding: '6px 12px', fontSize: 12 }}
                        >
                          <ArrowLeftRight size={13} /> Trade
                        </ActionPillButton>
                      </div>
                    </MobileAccountCard>
                  );
                })}
              </AnimatePresence>
            )}
          </MobileAccountsContainer>

          {/* Proposals Section */}
          <div ref={proposalsRef} style={{ marginTop: 12 }}>
            <ProposalsPanel
              key={proposalsKey}
              defaultVaultId={proposeVaultId}
              openCreateOnMount={openProposalForm}
              defaultType={proposalType}
            />
          </div>
        </>
      )}

      {/* Floating Dropdown Menu */}
      {activeDropdownId && dropdownPos && (
        <div
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            right: dropdownPos.right,
            zIndex: 99999,
            background: '#141416',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 14,
            padding: '6px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
            minWidth: 160,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {accountList.find((a) => a.id === activeDropdownId) && (
            <>
              <button
                type="button"
                onClick={() => {
                  const acc = accountList.find((a) => a.id === activeDropdownId);
                  if (acc) setDetailVault(acc);
                  setActiveDropdownId(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#EDEDED',
                  fontSize: 13,
                  fontFamily: 'Outfit, sans-serif',
                  cursor: 'pointer',
                  borderRadius: 8,
                }}
              >
                <Eye size={14} /> Ver Detalle
              </button>
              <button
                type="button"
                disabled={!connected}
                title={!connected ? 'Conecta tu wallet para editar' : undefined}
                onClick={() => {
                  const acc = accountList.find((a) => a.id === activeDropdownId);
                  if (acc) openEditModal(acc);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: connected ? '#EDEDED' : '#6B7280',
                  fontSize: 13,
                  fontFamily: 'Outfit, sans-serif',
                  cursor: connected ? 'pointer' : 'not-allowed',
                  borderRadius: 8,
                  opacity: connected ? 1 : 0.4,
                }}
              >
                <Pencil size={14} /> Editar Nombre
              </button>
              {(accountList.find((a) => a.id === activeDropdownId)?.index ?? 0) > 0 && (
                <button
                  type="button"
                  disabled={!connected}
                  title={!connected ? 'Conecta tu wallet para eliminar' : undefined}
                  onClick={() => handleDeleteAccount(activeDropdownId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: connected ? '#EF4444' : '#6B7280',
                    fontSize: 13,
                    fontFamily: 'Outfit, sans-serif',
                    cursor: connected ? 'pointer' : 'not-allowed',
                    borderRadius: 8,
                    opacity: connected ? 1 : 0.4,
                  }}
                >
                  <Trash2 size={14} /> Eliminar Cuenta
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Add Account Modal */}
      <AnimatePresence>
        {addAccountModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAddAccountModalOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
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
                maxWidth: 520,
                background: 'rgba(10, 10, 10, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 32px 64px -16px rgba(0,0,0,0.9)',
                borderRadius: 40,
                padding: '36px 40px',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 500, letterSpacing: '-1px', color: '#FFFFFF', margin: '0 0 6px 0' }}>
                    Crear Nueva Cuenta
                  </h2>
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 300, color: 'rgba(255, 255, 255, 0.7)', margin: 0, lineHeight: 1.5 }}>
                    Agrega una sub-bóveda para organizar los fondos de tu tesorería.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddAccountModalOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF', cursor: 'pointer', borderRadius: 9999, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddAccount} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase' }}>
                    NOMBRE DE LA CUENTA *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Operativa"
                    value={newAccountLabel}
                    onChange={(e) => setNewAccountLabel(e.target.value)}
                    required
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
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase' }}>
                    PESO OBJETIVO (%) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newAccountWeight}
                    onChange={(e) => setNewAccountWeight(e.target.value)}
                    required
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
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setAddAccountModalOpen(false)}
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
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAccount}
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
                    }}
                  >
                    {isSavingAccount ? 'Guardando...' : 'Crear Cuenta'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Account Modal */}
      <AnimatePresence>
        {editAccountModalOpen && selectedVault && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditAccountModalOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
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
                maxWidth: 520,
                background: 'rgba(10, 10, 10, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 32px 64px -16px rgba(0,0,0,0.9)',
                borderRadius: 40,
                padding: '36px 40px',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 500, letterSpacing: '-1px', color: '#FFFFFF', margin: '0 0 6px 0' }}>
                    Editar Cuenta
                  </h2>
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 300, color: 'rgba(255, 255, 255, 0.7)', margin: 0, lineHeight: 1.5 }}>
                    Modifica el nombre o la ponderación objetivo de esta sub-bóveda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditAccountModalOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF', cursor: 'pointer', borderRadius: 9999, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <X size={16} />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!selectedVault || !editAccountLabel.trim()) return;
                  setIsSavingAccount(true);
                  try {
                    const updated = await updateVault(selectedVault.id, {
                      label: editAccountLabel.trim(),
                      ...(selectedVault.index > 0 ? { targetWeight: Math.max(0, Math.min(100, Math.round(Number(editAccountWeight) || 0))) } : {}),
                    });
                    setAccountList((prev) =>
                      prev.map((acc) => (acc.id === selectedVault.id ? { ...acc, label: updated.label, targetWeight: updated.targetWeight } : acc)),
                    );
                    setEditAccountModalOpen(false);
                    setSelectedVault(null);
                    toast.success('Cuenta actualizada');
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'No se pudo actualizar el nombre');
                  } finally {
                    setIsSavingAccount(false);
                  }
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase' }}>
                    NOMBRE DE LA CUENTA *
                  </label>
                  <input
                    type="text"
                    value={editAccountLabel}
                    onChange={(e) => setEditAccountLabel(e.target.value)}
                    required
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
                  />
                </div>

                {selectedVault && selectedVault.index > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase' }}>
                      PESO OBJETIVO (%) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editAccountWeight}
                      onChange={(e) => setEditAccountWeight(e.target.value)}
                      required
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
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setEditAccountModalOpen(false)}
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
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAccount}
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
                    }}
                  >
                    {isSavingAccount ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Financial Operations Modals */}
      <ReceiveModal
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
        merchantWallet={merchantWallet}
        onAskForPayment={() => setIsPaymentRequestOpen(true)}
      />
      <PaymentRequestModal
        isOpen={isPaymentRequestOpen}
        onClose={() => setIsPaymentRequestOpen(false)}
        requesterWallet={merchantWallet}
      />
      <QrOperationsModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        merchantWallet={depositVault?.address || merchantWallet}
        recipientLabel={depositVault?.label ?? businessName}
        initialMode="select"
        onCreatePaymentRequest={() => setIsPaymentRequestOpen(true)}
      />

      {detailVault && (
        <VaultDetailModal
          vault={detailVault}
          actualWeight={actualWeightOf(detailVault)}
          isPrivacyMode={isPrivacyMode}
          explorerUrl={explorerAddressUrl}
          onClose={() => setDetailVault(null)}
          onCopy={(addr) => copyToClipboard(addr)}
          onSend={() => {
            const v = detailVault;
            setDetailVault(null);
            startSend(v);
          }}
          onDeposit={() => {
            const v = detailVault;
            setDetailVault(null);
            startDeposit(v);
          }}
          onTrade={() => {
            const v = detailVault;
            setDetailVault(null);
            startTrade(v);
          }}
          connected={connected}
        />
      )}
    </PageContainer>
  );
}

// ── Exported Component with Suspense Boundary for Next.js App Router ───────

export function TreasuryContainer() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading Treasury…</div>}>
      <TreasuryContainerInner />
    </Suspense>
  );
}

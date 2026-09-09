'use client';

/**
 * TreasuryContainer — Redesigned with Container Minimization (Rule 10).
 * Fluid, clean, unboxed UI aligned with the Luxor Pay design system & ContactsView.
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useMerchant } from '@/context/MerchantContext';
import { useGetBalance } from '@/hooks/useGetBalance';
import { useTreasury } from '@/hooks/useTreasury';
import { TransferModal } from '@/components/dashboard/overview/TransferModal';
import { TransferSuccessModal } from '@/components/dashboard/overview/TransferSuccessModal';
import { QrOperationsModal } from '@/components/dashboard/overview/QrOperationsModal';
import { ReceiveModal } from '@/components/dashboard/overview/ReceiveModal';
import { PaymentRequestModal } from '@/components/dashboard/overview/PaymentRequestModal';
import type { Transfer } from '@/lib/transfers-api';
import type { Vault } from '@/lib/treasury-api';

// ── Styled Components (Clean & Fluid — Rule 10) ─────────────────────────────

const PageContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 28px;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 40px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 20px 16px 40px 16px;
    gap: 20px;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 20px;
`;

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: #FFFFFF;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 26px;
  }
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  line-height: 1.5;
`;

/* ──────────────────────── Balance & Actions Block ──────────────────────── */

const BalanceRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
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

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const ActionButtonsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const ActionPillButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 9px 20px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  border: none;

  ${({ $variant }) =>
    $variant === 'primary'
      ? `
    background: #FFFFFF;
    color: #000000;
    box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);

    &:hover:not(:disabled) {
      background: #EDEDED;
      color: #000000;
    }
  `
      : `
    background: rgba(255, 255, 255, 0.04);
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(12px);

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.25);
      color: #FFFFFF;
    }
  `}

  &:focus-visible {
    outline: 2px solid #FFFFFF;
    outline-offset: 2px;
  }
`;

/* ──────────────────────── Stats Bar ──────────────────────── */

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 36px;
  padding-top: 4px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: transparent;
  border: none;
  padding: 0;
`;

const StatIconBadge = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
`;

const StatValueGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #FFFFFF;
  line-height: 1;
`;

const StatLabel = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 3px;
`;

/* ──────────────────────── Accounts Section ──────────────────────── */

const SectionTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 8px;
`;

const SectionTitleText = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
`;

const AddAccountBtn = styled.button`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 9px 20px;
  border-radius: 9999px;
  border: none;
  background: #FFFFFF;
  color: #000000;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #EDEDED;
  }

  &:focus-visible {
    outline: 2px solid #FFFFFF;
    outline-offset: 2px;
  }
`;

const TableScrollWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const AccountsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 640px;
`;

const TableTh = styled.th`
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  padding: 12px 16px 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
`;

const TableTr = styled(motion.tr)`
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.15s ease;

  &:last-child {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`;

const TableTd = styled.td`
  padding: 16px 16px 16px 0;
  vertical-align: middle;
`;

const AccountNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #FFFFFF;
`;

const EditIconButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  padding: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: color 0.15s ease;

  &:hover {
    color: #FFFFFF;
  }

  &:focus-visible {
    outline: 2px solid #FFFFFF;
    outline-offset: 2px;
  }
`;

const AddressSubline = styled.div`
  font-family: monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 3px;
`;

const BalanceValueRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: monospace;
  font-size: 15px;
  font-weight: 500;
  color: #EDEDED;
`;

const TokenBadgeContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 3px;
`;

const TokenBadgeCircle = styled.span<{ $bg?: string }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: bold;
  color: #FFFFFF;
  border: 1px solid #0A0A0A;
`;

const WeightColumnContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 120px;
`;

const WeightPercentageText = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
`;

const WeightBarTrack = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  margin-top: 6px;
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
  position: relative;
`;

const TableRowActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #FFFFFF;
    border-color: rgba(255, 255, 255, 0.25);
  }

  &:focus-visible {
    outline: 2px solid #FFFFFF;
    outline-offset: 2px;
  }
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  right: 0;
  top: 2.35rem;
  z-index: 50;
  width: 170px;
  background: #141416;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  padding: 6px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DropdownMenuItem = styled.button<{ $danger?: boolean }>`
  width: 100%;
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  text-align: left;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: ${({ $danger }) => ($danger ? '#EF4444' : '#EDEDED')};
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ $danger }) => ($danger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.08)')};
  }
`;

// Helper address truncater
const shortAddress = (addr: string) => {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
};

export function TreasuryContainer() {
  const router = useRouter();
  const { profile } = useMerchant();
  const merchantWallet = profile?.merchantWallet ?? 'HQ8ejRe7mLp2xNb9yZcVdHy3sA1eR6tYuIoP4wQ9ejRe';
  const businessName = profile?.businessName?.trim() || null;

  useGetBalance(merchantWallet);
  const { vaults } = useTreasury();

  // Local state
  const [accountList, setAccountList] = useState<Vault[]>(vaults);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  // Sync vaults from hook when loaded initially if local state is empty
  React.useEffect(() => {
    if (vaults && vaults.length > 0) {
      setAccountList(vaults);
    }
  }, [vaults]);

  // Modal controls
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isPaymentRequestOpen, setIsPaymentRequestOpen] = useState(false);
  const [successData, setSuccessData] = useState<Transfer | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Account management modals
  const [addAccountModalOpen, setAddAccountModalOpen] = useState(false);
  const [editAccountModalOpen, setEditAccountModalOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Form states
  const [newAccountLabel, setNewAccountLabel] = useState('');
  const [newAccountWeight, setNewAccountWeight] = useState('0');
  const [editAccountLabel, setEditAccountLabel] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Dirección copiada');
  };

  // Calculated totals (Dynamic sum matching 100% of vaults)
  const totalBalanceNumber = React.useMemo(() => {
    return accountList.reduce((acc, v) => acc + (v.usdValue || 0), 0);
  }, [accountList]);

  const formattedTotalBalance = isPrivacyMode
    ? '$ •••••'
    : `$${totalBalanceNumber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Handlers for Account Creation
  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountLabel.trim()) {
      toast.error('Por favor ingrese un nombre para la cuenta');
      return;
    }

    const weightNum = Math.max(0, Math.min(100, Number(newAccountWeight) || 0));
    const newVault: Vault = {
      id: `vault_${Date.now()}`,
      index: accountList.length,
      label: newAccountLabel.trim(),
      address: `Vault${Math.random().toString(36).slice(2, 6)}...${Math.random().toString(36).slice(2, 6)}`,
      description: 'Derived treasury vault',
      isDefault: false,
      usdValue: 0.00,
      weight: weightNum,
      solBalance: '0.0000',
      tokens: [],
      createdAt: new Date().toISOString(),
    };

    setAccountList((prev) => [...prev, newVault]);
    setNewAccountLabel('');
    setNewAccountWeight('0');
    setAddAccountModalOpen(false);
    toast.success('Cuenta creada exitosamente');
  };

  // Handlers for Account Editing
  const openEditModal = (v: Vault) => {
    setSelectedVault(v);
    setEditAccountLabel(v.label);
    setEditAccountModalOpen(true);
    setActiveDropdownId(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVault || !editAccountLabel.trim()) return;

    setAccountList((prev) =>
      prev.map((item) =>
        item.id === selectedVault.id ? { ...item, label: editAccountLabel.trim() } : item
      )
    );
    setEditAccountModalOpen(false);
    setSelectedVault(null);
    toast.success('Nombre actualizado');
  };

  const handleDeleteAccount = (id: string) => {
    setAccountList((prev) => prev.filter((v) => v.id !== id));
    setActiveDropdownId(null);
    toast.success('Cuenta eliminada');
  };

  return (
    <PageContainer
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
    >
      {/* Balance & Actions Row */}
      <BalanceRow>
        <BalanceLeft>
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

          <PrimaryBalanceText>{formattedTotalBalance}</PrimaryBalanceText>
        </BalanceLeft>

        <ActionButtonsGroup>
          <ActionPillButton type="button" $variant="primary" onClick={() => setIsTransferOpen(true)}>
            <ArrowUp size={15} /> Send
          </ActionPillButton>
          <ActionPillButton type="button" $variant="secondary" onClick={() => setIsQrOpen(true)}>
            <ArrowDown size={15} /> Deposit
          </ActionPillButton>
          <ActionPillButton type="button" $variant="secondary" onClick={() => router.push('/dashboard/swap')}>
            <ArrowLeftRight size={15} /> Trade
          </ActionPillButton>
        </ActionButtonsGroup>
      </BalanceRow>

      {/* Stats Bar */}
      <StatsRow>
        <StatItem>
          <StatIconBadge>
            <Coins size={18} />
          </StatIconBadge>
          <StatValueGroup>
            <StatValue>4</StatValue>
            <StatLabel>Coins</StatLabel>
          </StatValueGroup>
        </StatItem>

        <StatItem>
          <StatIconBadge>
            <Layers size={18} />
          </StatIconBadge>
          <StatValueGroup>
            <StatValue>0</StatValue>
            <StatLabel>Stakes</StatLabel>
          </StatValueGroup>
        </StatItem>

        <StatItem>
          <StatIconBadge>
            <ImageIcon size={18} />
          </StatIconBadge>
          <StatValueGroup>
            <StatValue>0</StatValue>
            <StatLabel>NFTs</StatLabel>
          </StatValueGroup>
        </StatItem>
      </StatsRow>

      {/* Accounts Section */}
      <SectionTitleRow>
        <SectionTitleText>Accounts</SectionTitleText>
        <AddAccountBtn type="button" onClick={() => setAddAccountModalOpen(true)}>
          <Plus size={14} /> Add Account
        </AddAccountBtn>
      </SectionTitleRow>

      <TableScrollWrapper>
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
            <AnimatePresence>
              {accountList.map((acc) => {
                const weightVal = acc.weight ?? 0;
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
                        <span>{acc.label}</span>
                        <EditIconButton
                          type="button"
                          onClick={() => openEditModal(acc)}
                          title="Editar nombre"
                        >
                          <Pencil size={12} />
                        </EditIconButton>
                      </AccountNameRow>
                      <AddressSubline>
                        <span>{shortAddress(acc.address)}</span>
                        <EditIconButton
                          type="button"
                          onClick={() => copyToClipboard(acc.address)}
                          title="Copiar dirección"
                        >
                          <Copy size={11} />
                        </EditIconButton>
                      </AddressSubline>
                    </TableTd>

                    <TableTd>
                      <BalanceValueRow>
                        <span>{displayBalance}</span>
                        {acc.usdValue > 0 && (
                          <TokenBadgeContainer>
                            {acc.label.includes('GENESYS') ? (
                              <TokenBadgeCircle $bg="#9945FF">S</TokenBadgeCircle>
                            ) : (
                              <>
                                <TokenBadgeCircle $bg="#2775CA">C</TokenBadgeCircle>
                                <TokenBadgeCircle $bg="#9945FF">S</TokenBadgeCircle>
                              </>
                            )}
                          </TokenBadgeContainer>
                        )}
                      </BalanceValueRow>
                    </TableTd>

                    <TableTd>
                      <WeightColumnContent>
                        <WeightPercentageText>{weightVal}%</WeightPercentageText>
                        <WeightBarTrack>
                          <WeightBarFill $weight={weightVal} />
                        </WeightBarTrack>
                      </WeightColumnContent>
                    </TableTd>

                    <TableTd style={{ textAlign: 'right' }}>
                      <TableActionsGroup>
                        <TableRowActionButton
                          type="button"
                          onClick={() => setIsTransferOpen(true)}
                          title="Send"
                        >
                          <ArrowUp size={14} />
                        </TableRowActionButton>

                        <TableRowActionButton
                          type="button"
                          onClick={() => setIsQrOpen(true)}
                          title="Deposit"
                        >
                          <ArrowDown size={14} />
                        </TableRowActionButton>

                        <TableRowActionButton
                          type="button"
                          onClick={() => router.push('/dashboard/swap')}
                          title="Trade"
                        >
                          <ArrowLeftRight size={14} />
                        </TableRowActionButton>

                        <TableRowActionButton
                          type="button"
                          onClick={() =>
                            setActiveDropdownId(activeDropdownId === acc.id ? null : acc.id)
                          }
                          title="Opciones"
                        >
                          <MoreHorizontal size={14} />
                        </TableRowActionButton>

                        {activeDropdownId === acc.id && (
                          <DropdownMenu
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                          >
                            <DropdownMenuItem type="button" onClick={() => openEditModal(acc)}>
                              <Pencil size={13} /> Editar nombre
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              type="button"
                              onClick={() => {
                                copyToClipboard(acc.address);
                                setActiveDropdownId(null);
                              }}
                            >
                              <Copy size={13} /> Copiar dirección
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              type="button"
                              onClick={() => {
                                window.open(
                                  `https://explorer.solana.com/address/${acc.address}?cluster=devnet`,
                                  '_blank'
                                );
                                setActiveDropdownId(null);
                              }}
                            >
                              <ExternalLink size={13} /> Ver en Explorer
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              type="button"
                              $danger
                              onClick={() => handleDeleteAccount(acc.id)}
                            >
                              <Trash2 size={13} /> Eliminar cuenta
                            </DropdownMenuItem>
                          </DropdownMenu>
                        )}
                      </TableActionsGroup>
                    </TableTd>
                  </TableTr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </AccountsTable>
      </TableScrollWrapper>

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
              zIndex: 200,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              style={{
                width: '100%',
                maxWidth: 440,
                background: '#141416',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 20,
                padding: 24,
                boxShadow: '0 32px 64px rgba(0, 0, 0, 0.8)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 18, fontWeight: 500, color: '#FFFFFF', margin: 0 }}>
                  Add Account
                </h3>
                <button
                  type="button"
                  onClick={() => setAddAccountModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 4 }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddAccount} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontFamily: 'Montserrat, sans-serif', color: '#9CA3AF', marginBottom: 6 }}>
                    NOMBRE DE LA CUENTA
                  </label>
                  <input
                    type="text"
                    value={newAccountLabel}
                    onChange={(e) => setNewAccountLabel(e.target.value)}
                    placeholder="Ej. Marketing Vault"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#FFFFFF',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontFamily: 'Montserrat, sans-serif', color: '#9CA3AF', marginBottom: 6 }}>
                    PESO INICIAL (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newAccountWeight}
                    onChange={(e) => setNewAccountWeight(e.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#FFFFFF',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setAddAccountModalOpen(false)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 9999,
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      borderRadius: 9999,
                      background: '#FFFFFF',
                      border: 'none',
                      color: '#000000',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    Crear Cuenta
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Account Modal */}
      <AnimatePresence>
        {editAccountModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditAccountModalOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 200,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              style={{
                width: '100%',
                maxWidth: 440,
                background: '#141416',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 20,
                padding: 24,
                boxShadow: '0 32px 64px rgba(0, 0, 0, 0.8)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 18, fontWeight: 500, color: '#FFFFFF', margin: 0 }}>
                  Editar Nombre de Cuenta
                </h3>
                <button
                  type="button"
                  onClick={() => setEditAccountModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 4 }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontFamily: 'Montserrat, sans-serif', color: '#9CA3AF', marginBottom: 6 }}>
                    NOMBRE DE LA CUENTA
                  </label>
                  <input
                    type="text"
                    value={editAccountLabel}
                    onChange={(e) => setEditAccountLabel(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#FFFFFF',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setEditAccountModalOpen(false)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 9999,
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      borderRadius: 9999,
                      background: '#FFFFFF',
                      border: 'none',
                      color: '#000000',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Financial Operations Modals */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onSuccess={(data) => {
          setSuccessData(data);
          setIsSuccessOpen(true);
        }}
      />
      <TransferSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        transferData={successData}
      />
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
        merchantWallet={merchantWallet}
        recipientLabel={businessName}
        initialMode="select"
        onCreatePaymentRequest={() => setIsPaymentRequestOpen(true)}
      />
    </PageContainer>
  );
}

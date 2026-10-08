'use client';

/**
 * TreasuryContainer — Redesigned with Container Minimization (Rule 10).
 * Fluid, clean, responsive UI aligned with the Sterling design system.
 * Account detail views and the main overview.
 */

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowDown,
  Eye,
  EyeOff,
  Coins,
  Layers,
  Image as ImageIcon,
  Plus,
  Copy,
  ExternalLink,
  ShieldCheck,
  Loader2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMerchant } from '@/features/merchant/context/MerchantContext';
import { useTreasury } from '@/features/treasury/hooks/useTreasury';
import { useMembers } from '@/features/treasury/hooks/useMembers';
import { useProposals } from '@/features/treasury/hooks/useProposals';
import { useVaultActivity } from '@/features/treasury/hooks/useVaultActivity';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { ProposalsPanel } from '@/features/treasury/components/ProposalsPanel';
import { VaultDetailModal } from '@/features/treasury/components/VaultDetailModal';
import { useGetTransfers } from '@/features/transfers/hooks/useGetTransfers';
import type { ProposalType } from '@/features/treasury/api/proposals-api';
import { QrOperationsModal } from '@/features/dashboard/components/overview/QrOperationsModal';
import { ReceiveModal } from '@/features/dashboard/components/overview/ReceiveModal';
import { PaymentRequestModal } from '@/features/payment-requests/components/PaymentRequestModal';
import type { Vault } from '@/features/treasury/api/treasury-api';
import { TreasuryActionButtons } from './TreasuryActionButtons';
import { AccountCoinsTable } from './AccountCoinsTable';
import { AccountNftGrid } from './AccountNftGrid';
import { AccountFlowsTimeline } from './AccountFlowsTimeline';
import { TreasuryAccountsList } from './TreasuryAccountsList';
import { AccountActionsMenu } from './AccountActionsMenu';
import { AccountFormModal } from './AccountFormModal';
import { TreasuryLoadError, TreasuryLoadingSkeleton } from './TreasuryLoadStates';
import { OffChainNotice } from './OffChainNotice';
import { TreasuryAddMemberStat } from './TreasuryAddMemberStat';
import {
  formatVaultLabel,
  helperShort,
  explorerAddressUrl,
  coinsOf,
  buildAccountFlows,
} from './treasury-utils';
import {
  PageContainer,
  BreadcrumbNav,
  BreadcrumbBtn,
  BreadcrumbSep,
  EyebrowRow,
  EyebrowLabel,
  PrivacyButton,
  PrimaryBalanceText,
  ActionPillButton,
  StatsRow,
  StatItem,
  StatIconBadge,
  StatValueGroup,
  StatValue,
  StatLabel,
  SectionTitleRow,
  SectionTitleText,
  AddAccountBtn,
  EditIconButton,
  AccountDetailHeader,
  AccountHeaderTopRow,
  AccountAddressBox,
  SectionSubTabs,
  SubTabBtn,
  EmptyStateContainer,
} from './treasury.styles';

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
  const [isCollectorDismissed, setIsCollectorDismissed] = useState(false);

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
    // One proposal per asset so every transaction fits; each needs one signature to create.
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
  // Payments that landed in the custodial collection wallet → Principal vault.
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
      toast.success(`Multisig activo con el contrato Luxor · umbral ${deployed.threshold} de ${deployed.memberCount ?? memberTotal}`);
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


  const flowsOf = (v: Vault) =>
    buildAccountFlows(v, { realTransfers, merchantWallet, proposalsData, activityItems, activeAccount, accountList });

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

  const handleEditAccount = async (e: React.FormEvent) => {
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
    return <TreasuryLoadingSkeleton />;
  }

  // First load failed and there is nothing real to show: explain and offer a retry.
  if (treasuryError && vaults.length === 0) {
    return <TreasuryLoadError message={treasuryErrorMessage} onRetry={() => { void refetchTreasury(); }} />;
  }

  return (
    <PageContainer
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
    >
      <BreadcrumbNav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {activeAccount ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BreadcrumbBtn type="button" onClick={() => handleSelectAccount(null)}>
              Treasury
            </BreadcrumbBtn>
            <BreadcrumbSep>/</BreadcrumbSep>
            <span>{formatVaultLabel(activeAccount.label, activeAccount.index === 0 || activeAccount.isDefault)}</span>
          </div>
        ) : (
          <span style={{ fontSize: 24, fontWeight: 600, fontFamily: "'Outfit', sans-serif", color: '#FFFFFF' }}>Treasury</span>
        )}
      </BreadcrumbNav>

      <OffChainNotice config={config} onActivate={handleWalletAction} isDeploying={isDeploying} connected={connected} />

      {/* 2. MAIN ACCOUNT VIEW OR OVERVIEW MODE */}
      {activeAccount ? (
        /* ── SINGLE ACCOUNT DETAIL VIEW (account view) ── */
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
                <TreasuryAddMemberStat />
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

              <TreasuryActionButtons
                showActivate={!!(connected && config && !isOnChain)}
                connected={connected}
                isDeploying={isDeploying}
                isRedistributing={isRedistributing}
                onActivate={handleWalletAction}
                onSend={() => startSend(activeAccount)}
                onRedistribute={handleRedistribute}
                onDeposit={() => startDeposit(activeAccount)}
                onTrade={() => startTrade(activeAccount)}
              />
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
                <AccountCoinsTable coins={coinsOf(activeAccount)} isPrivacyMode={isPrivacyMode} />
            )}

            {detailAssetTab === 'nfts' && <AccountNftGrid nfts={activeAccount.nfts ?? []} />}
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

            <AccountFlowsTimeline flows={flowsOf(activeAccount)} isPrivacyMode={isPrivacyMode} />
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

              <TreasuryAddMemberStat />

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

            <TreasuryActionButtons
              showActivate={!!(connected && config && !isOnChain)}
              connected={connected}
              isDeploying={isDeploying}
              isRedistributing={isRedistributing}
              onActivate={handleWalletAction}
              onSend={() => startSend()}
              onRedistribute={handleRedistribute}
              onDeposit={() => startDeposit()}
              onTrade={() => startTrade()}
            />
          </div>

          {/* Accounts Section */}


          <SectionTitleRow>
            <SectionTitleText>Accounts</SectionTitleText>
            <AddAccountBtn type="button" onClick={() => { if (requireWallet()) setAddAccountModalOpen(true); }} disabled={!connected} title={!connected ? 'Conecta tu wallet para realizar esta acción' : undefined}>
              <Plus size={14} /> Add Account
            </AddAccountBtn>
          </SectionTitleRow>

          <TreasuryAccountsList
            accounts={accountList}
            isPrivacyMode={isPrivacyMode}
            connected={connected}
            isDeploying={isDeploying}
            isAwaitingActivation={isAwaitingActivation}
            actualWeightOf={actualWeightOf}
            targetWeightOf={targetWeightOf}
            targetUsdOf={targetUsdOf}
            onSelect={handleSelectAccount}
            onEdit={openEditModal}
            onCopy={copyToClipboard}
            onActivate={handleWalletAction}
            onSend={startSend}
            onDeposit={startDeposit}
            onTrade={startTrade}
            onToggleMenu={handleToggleDropdown}
          />

          {/* Proposals Section */}
          <div ref={proposalsRef} style={{ marginTop: 12 }}>
            <ProposalsPanel
              key={proposalsKey}
              defaultVaultId={proposeVaultId}
              openCreateOnMount={openProposalForm}
              defaultType={proposalType}
              onCloseCreate={() => setOpenProposalForm(false)}
            />
          </div>
        </>
      )}

      {/* Floating Dropdown Menu */}
      {activeDropdownId && dropdownPos && (
        <AccountActionsMenu
          position={dropdownPos}
          account={accountList.find((a) => a.id === activeDropdownId)}
          connected={connected}
          onViewDetail={() => {
            const acc = accountList.find((a) => a.id === activeDropdownId);
            if (acc) setDetailVault(acc);
            setActiveDropdownId(null);
          }}
          onEdit={() => {
            const acc = accountList.find((a) => a.id === activeDropdownId);
            if (acc) openEditModal(acc);
          }}
          onDelete={() => handleDeleteAccount(activeDropdownId)}
        />
      )}

      {/* Add Account Modal */}
      <AccountFormModal
        open={addAccountModalOpen}
        title="Crear Nueva Cuenta"
        subtitle="Agrega una sub-bóveda para organizar los fondos de tu tesorería."
        label={newAccountLabel}
        onLabelChange={setNewAccountLabel}
        labelPlaceholder="Ej. Operativa"
        showWeight
        weight={newAccountWeight}
        onWeightChange={setNewAccountWeight}
        isSaving={isSavingAccount}
        submitLabel="Crear Cuenta"
        onClose={() => setAddAccountModalOpen(false)}
        onSubmit={handleAddAccount}
      />

      {/* Edit Account Modal */}
      <AccountFormModal
        open={editAccountModalOpen && !!selectedVault}
        title="Editar Cuenta"
        subtitle="Modifica el nombre o la ponderación objetivo de esta sub-bóveda."
        label={editAccountLabel}
        onLabelChange={setEditAccountLabel}
        showWeight={!!selectedVault && selectedVault.index > 0}
        weight={editAccountWeight}
        onWeightChange={setEditAccountWeight}
        isSaving={isSavingAccount}
        submitLabel="Guardar Cambios"
        onClose={() => setEditAccountModalOpen(false)}
        onSubmit={handleEditAccount}
      />

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

'use client';

import React, { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Droplet, Box, Sparkles, Search, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  PageContainer,
  ContentLayout,
  SubTabsRow,
  SubTabButton,
  OverviewCard,
  OverviewTopGrid,
  StatBlock,
  StatLabelText,
  SolPriceFlex,
  SolPriceText,
  EpochTimeText,
  EpochProgressBar,
  OverviewBottomBar,
  MetricPillsGroup,
  StakedMetricPill,
  IconCircle,
  ClaimMevButton,
  ValidatorFilterBar,
  FilterSubTab,
  SearchFilterGroup,
  SearchInputWrapper,
  SearchInput,
  SelectBox,
  CardsGrid,
  StakeCard,
  CardHeader,
  PoolLogoBadge,
  PoolTitle,
  ApyMetricRow,
  StakedDetailRow,
  CardButtonsRow,
  ActionButton,
  ModalOverlay,
  ModalBox,
  ModalHeader,
  ModalCloseButton,
  InputGroup,
  AmountInputWrapper,
} from '@/features/stake/components/stake.styles';

// ─── Interfaces ──────────────────────────────────────────────────────────────
export interface LiquidStakePool {
  id: string;
  name: string;
  tokenSymbol: string;
  apy: number;
  stakedAmount: number;
  logoColor: string;
  description?: string;
}

export interface ValidatorNode {
  id: string;
  name: string;
  apy: number;
  totalStakedSol: number;
  commission: number;
  logoColor: string;
  status: 'active' | 'delinquent';
  stakedAmount: number;
}

// ─── Initial Mock Data (From Squads Screenshots) ──────────────────────────────
const LIQUID_POOLS: LiquidStakePool[] = [
  {
    id: 'jito',
    name: 'Jito stake pool',
    tokenSymbol: 'JitoSOL',
    apy: 4.90,
    stakedAmount: 0,
    logoColor: '#34D399',
    description: 'Liquid staking pool with MEV rewards powered by Jito Network.',
  },
  {
    id: 'helius',
    name: 'Helius stake pool',
    tokenSymbol: 'hSOL',
    apy: 5.21,
    stakedAmount: 0,
    logoColor: '#F97316',
    description: 'High-performance liquid staking pool backed by Helius infrastructure.',
  },
  {
    id: 'drift',
    name: 'Drift stake pool',
    tokenSymbol: 'dSOL',
    apy: 5.09,
    stakedAmount: 0,
    logoColor: '#6366F1',
    description: 'DeFi integrated liquid staking token optimized for margin trading.',
  },
  {
    id: 'stke',
    name: 'STKE stake pool',
    tokenSymbol: 'STKESOL',
    apy: 4.98,
    stakedAmount: 0,
    logoColor: '#EC4899',
    description: 'Institutional-grade staking pool with automated yield optimization.',
  },
  {
    id: 'marinade',
    name: 'Marinade stake pool',
    tokenSymbol: 'mSOL',
    apy: 5.45,
    stakedAmount: 0,
    logoColor: '#3B82F6',
    description: 'The premier liquid staking protocol on Solana with instant liquidity.',
  },
  {
    id: 'solblaze',
    name: 'Solblaze stake pool',
    tokenSymbol: 'bSOL',
    apy: 4.77,
    stakedAmount: 0,
    logoColor: '#06B6D4',
    description: 'Community supported stake pool promoting Solana decentralization.',
  },
  {
    id: 'luxor_vault',
    name: 'Luxor Protocol Vault',
    tokenSymbol: 'LXR-SOL',
    apy: 18.20,
    stakedAmount: 0,
    logoColor: '#60A5FA',
    description: 'Luxor native liquidity vault with protocol revenue share & LXR boost.',
  },
];

const VALIDATORS: ValidatorNode[] = [
  {
    id: 'squads',
    name: 'Squads Validator',
    apy: 5.09,
    totalStakedSol: 133316.98,
    commission: 4,
    logoColor: '#FFFFFF',
    status: 'active',
    stakedAmount: 0,
  },
  {
    id: 'laine',
    name: 'Laine ❤️ for SOL Strategy',
    apy: 5.03,
    totalStakedSol: 401670.47,
    commission: 5,
    logoColor: '#EF4444',
    status: 'active',
    stakedAmount: 0,
  },
  {
    id: 'jito_val',
    name: 'Jito Validator Node',
    apy: 5.08,
    totalStakedSol: 528579.01,
    commission: 4,
    logoColor: '#10B981',
    status: 'active',
    stakedAmount: 0,
  },
  {
    id: 'everstake',
    name: 'Everstake',
    apy: 4.82,
    totalStakedSol: 7384460.72,
    commission: 5,
    logoColor: '#3B82F6',
    status: 'active',
    stakedAmount: 0,
  },
  {
    id: 'marinade_native',
    name: 'Marinade Native',
    apy: 5.27,
    totalStakedSol: 3969695.12,
    commission: 0,
    logoColor: '#3B82F6',
    status: 'active',
    stakedAmount: 0,
  },
  {
    id: 'cogent',
    name: 'Cogent Crypto 0% MEV',
    apy: 5.26,
    totalStakedSol: 171359.80,
    commission: 0,
    logoColor: '#F59E0B',
    status: 'active',
    stakedAmount: 0,
  },
  {
    id: 'helius_val',
    name: 'Helius Validator',
    apy: 5.15,
    totalStakedSol: 2145000.00,
    commission: 0,
    logoColor: '#F97316',
    status: 'active',
    stakedAmount: 0,
  },
  {
    id: 'luxor_validator',
    name: 'Luxor Enterprise Validator',
    apy: 6.20,
    totalStakedSol: 1500000.00,
    commission: 0,
    logoColor: '#60A5FA',
    status: 'active',
    stakedAmount: 0,
  },
];

const MiniSparklineSvg = () => (
  <svg width="120" height="32" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2 24L20 18L38 22L56 12L74 15L92 5L118 8"
      stroke="#FFFFFF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SquadsStakePage() {
  const [activeTab, setActiveTab] = useState<'liquid' | 'validator'>('liquid');
  const [liquidPools, setLiquidPools] = useState<LiquidStakePool[]>(LIQUID_POOLS);
  const [validators, setValidators] = useState<ValidatorNode[]>(VALIDATORS);
  const [validatorSearch, setValidatorSearch] = useState('');
  const [validatorFilter, setValidatorFilter] = useState('all');

  // Modal State
  const [activeStakeItem, setActiveStakeItem] = useState<{
    name: string;
    apy: number;
    symbol?: string;
    type: 'pool' | 'validator';
    id: string;
  } | null>(null);
  const [stakeAmount, setStakeAmount] = useState('1.5');
  const [isProcessing, setIsProcessing] = useState(false);

  // User Staked Totals
  const totalLiquidStaked = useMemo(
    () => liquidPools.reduce((acc, p) => acc + p.stakedAmount, 0),
    [liquidPools]
  );
  const totalValidatorStaked = useMemo(
    () => validators.reduce((acc, v) => acc + v.stakedAmount, 0),
    [validators]
  );

  // Filtered Validators
  const filteredValidators = useMemo(() => {
    return validators.filter((v) => {
      const matchesSearch = v.name.toLowerCase().includes(validatorSearch.toLowerCase());
      const matchesFilter = validatorFilter === 'all' || v.status === validatorFilter;
      return matchesSearch && matchesFilter;
    });
  }, [validators, validatorSearch, validatorFilter]);

  const handleOpenStakeModal = (
    name: string,
    apy: number,
    id: string,
    type: 'pool' | 'validator',
    symbol?: string
  ) => {
    setActiveStakeItem({ name, apy, id, type, symbol });
    setStakeAmount('1.5');
  };

  const handleConfirmStake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStakeItem) return;
    const amountNum = parseFloat(stakeAmount) || 0;
    if (amountNum <= 0) {
      toast.error('Enter a valid SOL amount');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      if (activeStakeItem.type === 'pool') {
        setLiquidPools((prev) =>
          prev.map((p) =>
            p.id === activeStakeItem.id
              ? { ...p, stakedAmount: p.stakedAmount + amountNum }
              : p
          )
        );
      } else {
        setValidators((prev) =>
          prev.map((v) =>
            v.id === activeStakeItem.id
              ? { ...v, stakedAmount: v.stakedAmount + amountNum }
              : v
          )
        );
      }

      setIsProcessing(false);
      setActiveStakeItem(null);
      toast.success(`Successfully staked ${amountNum} SOL in ${activeStakeItem.name}!`);
    }, 1200);
  };

  return (
    <PageContainer>
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title">Stake</h1>
          <p className="lx-page-subtitle">
            Liquid staking pools, validator node delegation, and MEV yield rewards on Solana.
          </p>
        </div>
      </header>

      <ContentLayout>
        {/* Sub-Tabs: Liquid / Validator */}
        <SubTabsRow>
          <SubTabButton
            $active={activeTab === 'liquid'}
            onClick={() => setActiveTab('liquid')}
          >
            Liquid
          </SubTabButton>
          <SubTabButton
            $active={activeTab === 'validator'}
            onClick={() => setActiveTab('validator')}
          >
            Validator
          </SubTabButton>
        </SubTabsRow>

        {/* Squads Overview Header Card */}
        <OverviewCard>
          <OverviewTopGrid>
            {/* SOL Price Ticker & Mini Sparkline */}
            <StatBlock>
              <StatLabelText>SOL</StatLabelText>
              <SolPriceFlex>
                <SolPriceText>$168.42</SolPriceText>
                <MiniSparklineSvg />
              </SolPriceFlex>
            </StatBlock>

            {/* Epoch Time Countdown */}
            <StatBlock style={{ alignItems: 'flex-start' }}>
              <StatLabelText>Epoch</StatLabelText>
              <EpochTimeText>1d 0h 37m</EpochTimeText>
              <EpochProgressBar>
                <div />
              </EpochProgressBar>
            </StatBlock>
          </OverviewTopGrid>

          {/* Bottom Metrics Pills Bar */}
          <OverviewBottomBar>
            <MetricPillsGroup>
              <StakedMetricPill>
                <IconCircle>
                  <Droplet size={14} />
                </IconCircle>
                <div>
                  <div className="amount">{totalLiquidStaked} SOL</div>
                  <div className="label">Liquid Staked</div>
                </div>
              </StakedMetricPill>

              <StakedMetricPill>
                <IconCircle>
                  <Box size={14} />
                </IconCircle>
                <div>
                  <div className="amount">{totalValidatorStaked} SOL</div>
                  <div className="label">Validator Staked</div>
                </div>
              </StakedMetricPill>
            </MetricPillsGroup>

            <ClaimMevButton onClick={() => toast.info('No MEV rewards available to claim')}>
              Claim All MEV Rewards <Sparkles size={14} />
            </ClaimMevButton>
          </OverviewBottomBar>
        </OverviewCard>

        {/* TAB 1: Liquid Staking Pools */}
        {activeTab === 'liquid' && (
          <CardsGrid
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {liquidPools.map((pool) => (
              <StakeCard key={pool.id}>
                <div>
                  <CardHeader>
                    <PoolLogoBadge>
                      {pool.tokenSymbol.charAt(0)}
                    </PoolLogoBadge>
                    <PoolTitle>{pool.name}</PoolTitle>
                  </CardHeader>

                  <ApyMetricRow>
                    <span className="value">{pool.apy.toFixed(2)}%</span>
                    <span className="unit">APY</span>
                  </ApyMetricRow>

                  <div style={{ marginTop: '16px' }}>
                    <StakedDetailRow>
                      <span>Staked</span>
                      <span className="val">{pool.stakedAmount} {pool.tokenSymbol}</span>
                    </StakedDetailRow>
                  </div>
                </div>

                <CardButtonsRow>
                  <ActionButton
                    $variant="primary"
                    onClick={() =>
                      handleOpenStakeModal(
                        pool.name,
                        pool.apy,
                        pool.id,
                        'pool',
                        pool.tokenSymbol
                      )
                    }
                  >
                    Stake
                  </ActionButton>
                  <ActionButton
                    $variant="secondary"
                    onClick={() => toast.info(`No ${pool.tokenSymbol} staked to unstake`)}
                  >
                    Unstake
                  </ActionButton>
                </CardButtonsRow>
              </StakeCard>
            ))}
          </CardsGrid>
        )}

        {/* TAB 2: Validator Staking */}
        {activeTab === 'validator' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Filter Toolbar for Validator Tab */}
            <ValidatorFilterBar>
              <FilterSubTab $active>All</FilterSubTab>

              <SearchFilterGroup>
                <SearchInputWrapper>
                  <Search size={16} />
                  <SearchInput
                    type="text"
                    placeholder="Search validators..."
                    value={validatorSearch}
                    onChange={(e) => setValidatorSearch(e.target.value)}
                  />
                </SearchInputWrapper>

                <SelectBox
                  value={validatorFilter}
                  onChange={(e) => setValidatorFilter(e.target.value)}
                >
                  <option value="all">Select status</option>
                  <option value="active">Active</option>
                  <option value="delinquent">Delinquent</option>
                </SelectBox>
              </SearchFilterGroup>
            </ValidatorFilterBar>

            <CardsGrid
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredValidators.map((val) => (
                <StakeCard key={val.id}>
                  <div>
                    <CardHeader>
                      <PoolLogoBadge>
                        {val.name.charAt(0)}
                      </PoolLogoBadge>
                      <PoolTitle>{val.name}</PoolTitle>
                    </CardHeader>

                    <ApyMetricRow>
                      <span className="value">{val.apy.toFixed(2)}%</span>
                      <span className="unit">APY</span>
                    </ApyMetricRow>

                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <StakedDetailRow>
                        <span>Total Staked</span>
                        <span className="val">{val.totalStakedSol.toLocaleString('en-US')} SOL</span>
                      </StakedDetailRow>
                      <StakedDetailRow>
                        <span>Commission</span>
                        <span className="val">{val.commission}%</span>
                      </StakedDetailRow>
                    </div>
                  </div>

                  <CardButtonsRow>
                    <ActionButton
                      $variant="primary"
                      onClick={() =>
                        handleOpenStakeModal(
                          val.name,
                          val.apy,
                          val.id,
                          'validator'
                        )
                      }
                    >
                      Stake
                    </ActionButton>
                  </CardButtonsRow>
                </StakeCard>
              ))}
            </CardsGrid>
          </div>
        )}
      </ContentLayout>

      {/* Staking Action Modal */}
      <AnimatePresence>
        {activeStakeItem && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveStakeItem(null)}
          >
            <ModalBox
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <h2>Stake SOL into {activeStakeItem.name}</h2>
                <ModalCloseButton type="button" onClick={() => setActiveStakeItem(null)}>
                  <X size={16} />
                </ModalCloseButton>
              </ModalHeader>

              <form onSubmit={handleConfirmStake} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <InputGroup>
                  <div className="top-label">
                    <span>Deposit Amount</span>
                    <span>Available: 14.85 SOL</span>
                  </div>
                  <AmountInputWrapper>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                    />
                    <button
                      type="button"
                      className="max-btn"
                      onClick={() => setStakeAmount('14.85')}
                    >
                      MAX
                    </button>
                  </AmountInputWrapper>
                </InputGroup>

                <div
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)' }}>
                    <span>Estimated APY</span>
                    <strong style={{ color: '#34D399' }}>{activeStakeItem.apy.toFixed(2)}% APY</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)' }}>
                    <span>Est. Annual Earnings</span>
                    <strong style={{ color: '#FFFFFF', fontFamily: 'monospace' }}>
                      +{(parseFloat(stakeAmount || '0') * (activeStakeItem.apy / 100)).toFixed(3)} SOL
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)' }}>
                    <span>Lockup Period</span>
                    <strong style={{ color: '#FFFFFF' }}>None (Liquid Withdrawal)</strong>
                  </div>
                </div>

                <ActionButton
                  type="submit"
                  $variant="primary"
                  disabled={isProcessing}
                  style={{ height: '48px', fontSize: '15px', marginTop: '8px' }}
                >
                  {isProcessing ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <RefreshCw size={16} className="animate-spin" /> Confirming Transaction...
                    </span>
                  ) : (
                    `Confirm Stake ${stakeAmount} SOL`
                  )}
                </ActionButton>
              </form>
            </ModalBox>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}

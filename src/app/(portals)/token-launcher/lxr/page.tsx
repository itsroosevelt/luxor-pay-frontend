'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ExternalLink,
  Users,
  Droplets,
  TrendingUp,
  Coins,
  Lock,
  Flame,
  ArrowUpRight,
  Calculator,
  Percent,
  Copy,
  Check,
  Wallet,
  Sparkles,
  ChevronRight,
  PieChart,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@solana/wallet-adapter-react';

const LXR_MINT_ADDRESS = '3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE';

interface LxrStat {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
}

const STATS: LxrStat[] = [
  { label: 'Token Price', value: '$0.0731', sub: '+12.8% (24h)', icon: TrendingUp },
  { label: 'Market Cap', value: '$73.1M', sub: 'FDV $73.1M', icon: Coins },
  { label: 'Liquidity Pool', value: '$227,380', sub: 'Raydium & Meteora', icon: Droplets },
  { label: 'Token Holders', value: '312', sub: 'On-chain wallets', icon: Users },
];

const DEX_POOLS = [
  { pair: 'LXR / SOL', dex: 'Raydium AMM V4', tvl: '$145,280', apr: '48.2%', volume24h: '$32.4K', url: 'https://raydium.io/swap/' },
  { pair: 'LXR / USDC', dex: 'Meteora DLMM', tvl: '$82,100', apr: '36.5%', volume24h: '$15.8K', url: 'https://app.meteora.ag/' },
];

const FEE_TIERS = [
  { name: 'Standard', threshold: '0 - 10K LXR', fee: '0.50%', perks: 'Basic POS & Payment Links', active: false },
  { name: 'Silver Tier', threshold: '10K - 100K LXR', fee: '0.25%', perks: '50% Fee Discount + Priority Support', active: true },
  { name: 'Gold VIP', threshold: '100K+ LXR', fee: '0.00%', perks: '0% Fees + Governance Voting Power', active: false },
];

const TOKENOMICS = [
  { category: 'Community Treasury', percentage: 40, amount: '400,000,000 LXR' },
  { category: 'Staking & Yield Rewards', percentage: 25, amount: '250,000,000 LXR' },
  { category: 'DEX Liquidity Pools', percentage: 20, amount: '200,000,000 LXR' },
  { category: 'Ecosystem Development', percentage: 15, amount: '150,000,000 LXR' },
];

const PageContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: #ededed;
  font-family: 'Montserrat', sans-serif;
  padding: 24px 32px 60px 32px;
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export default function LxrTokenPage() {
  const { connected, publicKey } = useWallet();
  const [copiedMint, setCopiedMint] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('1000');
  const [stakePeriod, setStakePeriod] = useState<'30' | '90' | '365'>('90');
  const [isStaking, setIsStaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [unclaimedRewards, setUnclaimedRewards] = useState(142.5);

  const handleCopyMint = () => {
    navigator.clipboard.writeText(LXR_MINT_ADDRESS);
    setCopiedMint(true);
    toast.success('Token Mint Address copied to clipboard!');
    setTimeout(() => setCopiedMint(false), 2000);
  };

  const calculateReward = () => {
    const amt = Number(stakeAmount) || 0;
    const apy = stakePeriod === '365' ? 0.24 : stakePeriod === '90' ? 0.18 : 0.12;
    return (amt * apy * (Number(stakePeriod) / 365)).toFixed(2);
  };

  const handleStakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakeAmount || Number(stakeAmount) <= 0) {
      toast.error('Please enter a valid LXR amount to stake');
      return;
    }
    setIsStaking(true);
    setTimeout(() => {
      setIsStaking(false);
      toast.success(`Successfully staked ${Number(stakeAmount).toLocaleString()} LXR for ${stakePeriod} days!`);
    }, 1200);
  };

  const handleClaimRewards = () => {
    if (unclaimedRewards <= 0) {
      toast.info('No rewards available to claim yet.');
      return;
    }
    setIsClaiming(true);
    setTimeout(() => {
      setIsClaiming(false);
      setUnclaimedRewards(0);
      toast.success('Successfully claimed 142.50 LXR rewards to your wallet!');
    }, 1200);
  };

  return (
    <PageContainer>
      {/* Header with Title and Web3 Quick Actions */}
      <header className="lx-page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1">
              <ShieldCheck size={11} /> Verified Token
            </span>
            <span className="text-xs font-mono text-gray-400">Solana SPL</span>
          </div>
          <h1 className="lx-page-title flex items-center gap-3">
            <Coins size={26} className="text-white" /> $LXR Ecosystem Token
          </h1>
          <p className="lx-page-subtitle">
            The native utility and governance token powering the Luxor Pay Web3 ecosystem.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 mt-3 pt-3 border-t border-white/10">
            {/* Mint Copy Pill */}
            <button
              type="button"
              onClick={handleCopyMint}
              className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 flex items-center gap-2 transition-all"
              title="Copy Solana Mint Address"
            >
              <span className="text-gray-400 font-bold">Mint:</span>
              <span>{LXR_MINT_ADDRESS.slice(0, 4)}...{LXR_MINT_ADDRESS.slice(-4)}</span>
              {copiedMint ? <Check size={13} className="text-green-400" /> : <Copy size={13} className="text-gray-400" />}
            </button>

            {/* Solana Explorer */}
            <a
              href={`https://explorer.solana.com/address/${LXR_MINT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-white flex items-center gap-1.5 transition-all"
            >
              Solana Explorer <ExternalLink size={12} />
            </a>

            {/* Buy on Jupiter */}
            <a
              href={`https://jup.ag/swap/SOL-${LXR_MINT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-full bg-white text-black font-bold font-['Outfit'] text-xs flex items-center gap-1.5 hover:bg-gray-200 transition-all shadow-md"
            >
              Buy on Jupiter <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </header>

      {/* Metrics Row - Clean Fluid Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-4 mb-8 border-b border-white/10">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="space-y-1 sm:border-r border-white/5 last:border-0 pr-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-400 uppercase">{s.label}</span>
                <Icon size={15} className="text-gray-500" />
              </div>
              <p className="text-2xl font-bold font-mono text-white tracking-tight">{s.value}</p>
              <p className="text-[11px] font-mono text-gray-400">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Main 2 Column Fluid Layout (Frameless Rule 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-8">
        
        {/* Left Column: Tokenomics, Utilities, DEX Pools (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* About & Security Guarantees */}
          <div className="space-y-3 pb-6 border-b border-white/10">
            <h2 className="text-base font-semibold text-white font-['Outfit'] flex items-center gap-2">
              <ShieldCheck size={18} className="text-white" /> About $LXR & Immutable Security
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              $LXR is the native utility token of the Luxor Pay ecosystem. Holding or staking $LXR drastically reduces merchant payment gateway fees, unlocks higher multisig treasury thresholds, and provides governance rights over protocol parameters.
            </p>
            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              Deployed on Solana with <strong>Mint Authority Revoked</strong> and <strong>Freeze Authority Revoked</strong> — total supply is permanently fixed and unmintable.
            </p>

            <div className="flex flex-wrap gap-2 pt-2 text-xs font-mono">
              <span className="px-3 py-1 rounded-full bg-white/5 text-white border border-white/10">
                ✓ Mint Authority Revoked
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-white border border-white/10">
                ✓ Freeze Authority Revoked
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-white border border-white/10">
                Fixed Supply: 250B LXR
              </span>
            </div>
          </div>

          {/* Fee Discount Tiers for Merchants */}
          <div className="space-y-4 pb-6 border-b border-white/10">
            <h2 className="text-base font-semibold text-white font-['Outfit'] flex items-center gap-2">
              <Award size={18} className="text-white" /> Merchant Gateway Fee Tiers
            </h2>
            <p className="text-xs text-gray-400">
              Your active discount tier is determined by your total $LXR balance on-chain.
            </p>
            
            <div className="space-y-2 font-mono text-xs">
              {FEE_TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    tier.active
                      ? 'bg-white/10 border-white/30 text-white'
                      : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/10'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-['Outfit'] font-bold text-sm text-white">{tier.name}</span>
                      {tier.active && (
                        <span className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-bold">
                          ACTIVE TIER
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">{tier.perks}</p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <p className="text-base font-bold text-white font-mono">{tier.fee}</p>
                    <p className="text-[10px] text-gray-400">Req: {tier.threshold}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tokenomics Distribution Breakdown */}
          <div className="space-y-4 pb-6 border-b border-white/10">
            <h2 className="text-base font-semibold text-white font-['Outfit'] flex items-center gap-2">
              <PieChart size={18} className="text-white" /> Tokenomics Allocation
            </h2>
            <div className="space-y-3 font-mono text-xs">
              {TOKENOMICS.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300 font-sans">{item.category}</span>
                    <span className="text-white font-bold">{item.percentage}% ({item.amount})</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-white h-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DEX Liquidity Pools - Clean Fluid List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white font-['Outfit'] flex items-center gap-2">
                <Droplets size={18} className="text-white" /> Active DEX Pools
              </h2>
              <span className="text-xs font-mono text-gray-400">Raydium & Meteora</span>
            </div>
            <div className="divide-y divide-white/[0.04] font-mono text-xs">
              {DEX_POOLS.map((pool, idx) => (
                <div
                  key={idx}
                  className="py-3.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-bold font-['Outfit'] text-sm flex items-center gap-1.5">
                      {pool.pair}
                      <a href={pool.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white">
                        <ExternalLink size={12} />
                      </a>
                    </p>
                    <p className="text-[11px] text-gray-400">{pool.dex}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-sm">{pool.apr} APR</p>
                    <p className="text-[10px] text-gray-500">TVL {pool.tvl} · 24h {pool.volume24h}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Staking Engine & Rewards (5 Cols) */}
        <div className="lg:col-span-5 lg:pl-6 lg:border-l lg:border-white/10 space-y-6">
          
          {/* User Wallet Staking Overview */}
          <div className="space-y-3 pb-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white font-['Outfit'] flex items-center gap-2">
                <Wallet size={18} className="text-white" /> Staking Dashboard
              </h2>
              {connected ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white">
                  Wallet Connected
                </span>
              ) : (
                <span className="text-[10px] font-mono text-gray-500">Demo Mode</span>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 font-mono">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Total Staked Balance</span>
                <span className="text-white font-bold text-sm">10,000.00 LXR</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                <span className="text-gray-400">Unclaimed Staking Rewards</span>
                <span className="text-white font-bold text-sm">+{unclaimedRewards.toFixed(2)} LXR</span>
              </div>

              <button
                type="button"
                onClick={handleClaimRewards}
                disabled={isClaiming || unclaimedRewards <= 0}
                className="w-full mt-2 py-2.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-semibold transition-all disabled:opacity-50"
              >
                {isClaiming ? 'Claiming Rewards...' : `Claim ${unclaimedRewards.toFixed(2)} LXR Rewards`}
              </button>
            </div>
          </div>

          {/* Staking Yield Calculator */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-white font-['Outfit'] flex items-center gap-2">
              <Calculator size={18} className="text-white" /> Lock $LXR & Calculate Yield
            </h2>
            <p className="text-xs text-gray-400">
              Lock $LXR to earn automated protocol revenue share in SOL & LXR.
            </p>

            <form onSubmit={handleStakeSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1.5">
                  Amount to Stake (LXR)
                </label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 focus:border-white/30 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none transition-colors"
                  placeholder="Enter amount..."
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1.5">
                  Lock Duration
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  {(['30', '90', '365'] as const).map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setStakePeriod(days)}
                      className={`py-2 rounded-full border transition-all ${
                        stakePeriod === days
                          ? 'bg-white text-black font-bold border-white'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>

              <div className="py-3 border-t border-white/10 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Estimated Yield (APY)</span>
                  <span className="text-white font-bold">
                    {stakePeriod === '365' ? '24.0%' : stakePeriod === '90' ? '18.0%' : '12.0%'}
                  </span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1">
                  <span>Expected Reward</span>
                  <span>+{calculateReward()} LXR</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isStaking}
                className="w-full py-3.5 rounded-full bg-white hover:bg-gray-200 text-black font-bold font-['Outfit'] text-sm transition-all shadow-md"
              >
                {isStaking ? 'Locking LXR...' : 'Stake $LXR'}
              </button>
            </form>
          </div>

        </div>

      </div>
    </PageContainer>
  );
}

'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  Zap,
  Search,
  Star,
  Flame,
  Clock,
  Plus,
  Play,
  CheckCircle2,
  Heart,
  MessageSquare,
  Repeat,
  Users,
  Eye,
  SlidersHorizontal,
  ExternalLink,
  Award,
  DollarSign,
  TrendingUp,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';

interface BountyFeedItem {
  id: string;
  type: 'bounty' | 'submission' | 'update_box';
  status?: 'OPEN' | 'PAID' | 'CLOSED' | 'SUBMISSION';
  tokenBadge?: { symbol: string; marketCap: string };
  title?: string;
  description?: string;
  creator?: string;
  rewardUsd?: string;
  rewardCrypto?: string;
  timeLeft?: string;
  submissionsCount?: number;
  likesCount?: number;
  imageBanner?: string;
  imageEmoji?: string;
  hasVideoPreview?: boolean;
}

interface HighestBounty {
  rank: number;
  title: string;
  rewardUsd: string;
  submissions: number;
  timeLeft: string;
  isTopFeatured?: boolean;
}

interface RecentPayout {
  user: string;
  amount: string;
  avatarBg: string;
}

interface TopEarner {
  user: string;
  payoutsCount: number;
  amount: string;
  avatarBg: string;
}

const HIGHEST_BOUNTIES: HighestBounty[] = [
  {
    rank: 1,
    title: 'Create Viral TikTok Meme Video for $LXR Launch',
    rewardUsd: '$5,000 USDC',
    submissions: 42,
    timeLeft: '3 days left',
    isTopFeatured: true,
  },
  {
    rank: 2,
    title: 'Design 3D Animated Mascot for Solana DEX',
    rewardUsd: '$2,500 USDC',
    submissions: 18,
    timeLeft: '5 days left',
  },
  {
    rank: 3,
    title: 'Write Technical Thread on Bonding Curve Architecture',
    rewardUsd: '$1,200 USDC',
    submissions: 29,
    timeLeft: '12 hours left',
  },
];

const RECENT_PAYOUTS: RecentPayout[] = [
  { user: 'solana_ninja', amount: '+$850 USDC', avatarBg: 'bg-emerald-600' },
  { user: 'crypto_artisan', amount: '+$1,500 USDC', avatarBg: 'bg-purple-600' },
  { user: 'meme_lord_99', amount: '+$300 USDC', avatarBg: 'bg-amber-600' },
  { user: 'web3_builder', amount: '+$2,100 USDC', avatarBg: 'bg-indigo-600' },
];

const HIGHEST_EARNERS: TopEarner[] = [
  { user: 'alex_sol', payoutsCount: 14, amount: '$18,400 USDC', avatarBg: 'bg-blue-600' },
  { user: 'design_wizard', payoutsCount: 9, amount: '$12,250 USDC', avatarBg: 'bg-pink-600' },
  { user: 'dev_guru', payoutsCount: 7, amount: '$9,800 USDC', avatarBg: 'bg-teal-600' },
];

const FEED_ITEMS: BountyFeedItem[] = [
  {
    id: 'update-box-1',
    type: 'update_box',
  },
  {
    id: 'bounty-1',
    type: 'bounty',
    status: 'OPEN',
    tokenBadge: { symbol: '$LXR', marketCap: '$14.2M' },
    title: 'Create Viral TikTok & Reel Series for Luxor Pay Ecosystem',
    description: 'Produce high-energy short form video content highlighting instant Solana POS settlements and zero fees.',
    rewardUsd: '$5,000 USDC',
    timeLeft: '3 days left',
    imageBanner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'bounty-2',
    type: 'bounty',
    status: 'OPEN',
    tokenBadge: { symbol: '$SOLPUMP', marketCap: '$4.8M' },
    title: 'Custom Sticker Pack & Animated GIFs for Telegram Community',
    description: 'Design 15 high-res animated stickers featuring our mascot for hype reactions and trading alerts.',
    rewardUsd: '$1,500 USDC',
    timeLeft: '2 days left',
    imageBanner: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'bounty-3',
    type: 'bounty',
    status: 'OPEN',
    tokenBadge: { symbol: '$BONKAI', marketCap: '$890K' },
    title: 'Write Deep-Dive Thread & Educational Article on DEX Liquidity',
    description: 'Explain concentrated liquidity pools vs bonding curves for non-technical retail traders.',
    rewardUsd: '$800 USDC',
    timeLeft: '6 hours left',
    imageBanner: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=60',
  },
];

const PageContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: #ededed;
  font-family: 'Montserrat', sans-serif;
  padding: 16px 24px 60px 24px;
  max-width: 1750px;
  margin: 0 auto;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

export default function GoBountiesPage() {
  const [activeTab, setActiveTab] = useState<'Trending' | 'Bounties' | 'Submissions' | 'Mine'>('Trending');
  const [updateText, setUpdateText] = useState('');

  const handleCreateBounty = () => {
    toast.success('Create Bounty Modal opened');
  };

  const handlePostUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateText.trim()) return;
    toast.success('Callout update posted!');
    setUpdateText('');
  };

  return (
    <PageContainer>
      {/* Standard Header */}
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title flex items-center gap-3">
            <Zap size={28} className="text-white shrink-0" /> GO Bounties &amp; Rewards
          </h1>
          <p className="lx-page-subtitle">
            Community bounties and viral submissions gaining momentum on Solana.
          </p>
        </div>
      </header>

      {/* Top Search Bar - Clear top right controls */}
      <div className="flex items-center gap-3 mb-3 w-full md:max-w-[calc(100%-360px)]">
        <div className="flex-1 relative flex items-center">
          <Search size={16} className="absolute left-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search for coins and users..."
            className="w-full bg-[#141416] border border-white/10 rounded-xl py-2.5 pl-10 pr-16 text-xs text-white placeholder-gray-500 outline-none focus:border-white/25 focus:bg-[#18181b] transition-all"
          />
          <span className="absolute right-3 bg-white/10 border border-white/15 rounded px-1.5 py-0.5 text-[10px] font-mono text-gray-400 pointer-events-none">
            ⌘ K
          </span>
        </div>
        <button
          type="button"
          className="p-2.5 rounded-xl bg-[#141416] border border-white/10 text-gray-400 hover:text-white transition-colors shrink-0"
          title="Filter search"
        >
          <SlidersHorizontal size={15} />
        </button>
      </div>

      {/* Watchlist Banner */}
      <div className="flex items-center gap-2.5 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl mb-6 text-xs text-gray-400 font-mono md:max-w-[calc(100%-360px)]">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Star size={13} />
          <Flame size={13} />
          <Clock size={13} />
        </div>
        <span className="truncate">Nothing on your watchlist yet. Star a coin to follow it here.</span>
      </div>

      {/* Sub-tabs Row */}
      <div className="flex items-center gap-6 border-b border-white/10 pb-3 mb-6 font-['Outfit']">
        {(['Trending', 'Bounties', 'Submissions', 'Mine'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-semibold transition-all relative pb-2 ${
              activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
            {tab === 'Bounties' && <span className="ml-1 text-xs text-gray-300 font-mono">77</span>}
            {tab === 'Submissions' && <span className="ml-1 text-xs text-gray-500 font-mono">24.5k</span>}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Main Grid: Masonry Feed (Left) + Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Bounties Masonry Feed (9 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEED_ITEMS.map((item) => {
              if (item.type === 'update_box') {
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white/[0.03] space-y-3 sm:col-span-2 lg:col-span-1"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-[10px]">
                        U
                      </div>
                      <span className="text-xs font-semibold text-white font-['Outfit']">
                        Add an update to your callout
                      </span>
                    </div>

                    <form onSubmit={handlePostUpdate} className="space-y-2">
                      <textarea
                        rows={3}
                        value={updateText}
                        onChange={(e) => setUpdateText(e.target.value)}
                        placeholder="Share your progress or post links..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 outline-none focus:border-white/30 resize-none font-sans"
                      />
                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                        <span>{updateText.length}/2000</span>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-full bg-white text-black font-bold font-['Outfit'] hover:bg-gray-200 transition-colors"
                        >
                          Post
                        </button>
                      </div>
                    </form>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden flex flex-col justify-between"
                >
                  {/* Card Cover Image / Video if available */}
                  {item.imageBanner && (
                    <div className="relative h-44 w-full bg-black/80 overflow-hidden flex items-center justify-center">
                      <img src={item.imageBanner} alt={item.title} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    {item.tokenBadge && (
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-gray-300 font-semibold">
                        {item.tokenBadge.symbol} • MC {item.tokenBadge.marketCap}
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-white font-['Outfit'] leading-snug">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-gray-400 font-sans line-clamp-2">{item.description}</p>
                    )}
                  </div>

                  <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-bold">{item.rewardUsd}</span>
                    <span className="text-gray-500 text-[11px]">{item.timeLeft}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Sidebar Stats (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <button
            type="button"
            onClick={() => toast.success('Opening Create Bounty flow')}
            className="w-full py-3 px-4 rounded-full bg-white hover:bg-gray-200 text-black font-bold font-['Outfit'] text-sm flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <Plus size={18} /> Create bounty
          </button>

          {/* Box 1: HIGHEST VALUE · OPEN */}
          <div className="space-y-3 border-b border-white/10 pb-5">
            <div className="flex items-center justify-between pb-2 text-xs font-mono">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                HIGHEST VALUE · OPEN
              </span>
              <span className="text-white font-semibold cursor-pointer hover:underline text-[11px]">All open →</span>
            </div>

            <div className="space-y-2">
              {HIGHEST_BOUNTIES.map((hb) => (
                <div
                  key={hb.rank}
                  className={`p-3 rounded-xl transition-all ${
                    hb.isTopFeatured
                      ? 'bg-white/5 hover:bg-white/10'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  {hb.isTopFeatured && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="w-4 h-4 rounded-full bg-white text-black font-extrabold text-[10px] flex items-center justify-center">
                        1
                      </span>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-300">
                        TOP OPEN BOUNTY
                      </span>
                    </div>
                  )}

                  <p className="text-lg font-bold font-mono text-white tracking-tight">{hb.rewardUsd}</p>
                  <h4 className="text-xs font-semibold text-white font-['Outfit'] mt-0.5">{hb.title}</h4>

                  <div className="flex items-center justify-between pt-2 font-mono text-[10px] text-gray-400 mt-2">
                    <span>{hb.timeLeft}</span>
                    <span>{hb.submissions} subs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Box 2: RECENT PAYOUTS */}
          <div className="space-y-3 border-b border-white/10 pb-5">
            <div className="flex items-center justify-between pb-2 text-xs font-mono">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                RECENT PAYOUTS
              </span>
            </div>

            <div className="space-y-1.5">
              {RECENT_PAYOUTS.map((rp, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-mono py-1 px-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full ${rp.avatarBg} text-white flex items-center justify-center font-bold text-[10px]`}>
                      {rp.user.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-300 font-medium">@{rp.user}</span>
                  </div>
                  <span className="text-emerald-400 font-bold">{rp.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Box 3: HIGHEST EARNERS · 30D */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 text-xs font-mono">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                HIGHEST EARNERS · 30D
              </span>
            </div>

            <div className="space-y-2">
              {HIGHEST_EARNERS.map((he, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-mono py-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full ${he.avatarBg} text-white flex items-center justify-center font-bold text-[10px]`}>
                      {he.user.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-white font-semibold block leading-none">@{he.user}</span>
                      <span className="text-[9px] text-gray-500">{he.payoutsCount} payout</span>
                    </div>
                  </div>
                  <span className="text-white font-bold">{he.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}


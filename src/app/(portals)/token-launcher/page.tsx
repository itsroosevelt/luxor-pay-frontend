'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Star,
  Flame,
  Clock,
  TrendingUp,
  Filter,
  Grid as GridIcon,
  MoreHorizontal,
  CheckCircle2,
  Repeat,
  MessageSquare,
  Heart,
  Users,
  Eye,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface TopProfitTrader {
  rank: number;
  handle: string;
  isVerified: boolean;
  profit: string;
  avatarColor: string;
}

interface CalloutPost {
  id: string;
  author: string;
  timeAgo: string;
  content: string;
  coinName?: string;
  coinSymbol?: string;
  position?: string;
  profit?: string;
  marketCap?: string;
  reposts: number;
  comments: number;
  likes: number;
  followers?: number;
  views?: string;
  avatarBg: string;
}

interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  isHot?: boolean;
  marketCap: string;
  change?: string;
  isPositive?: boolean;
  avatarUrl?: string;
}

const TOP_PROFIT_TRADERS: TopProfitTrader[] = [
  { rank: 1, handle: 'J777Crypto', isVerified: true, profit: '+$1,566,844', avatarColor: 'bg-white/10 text-white border border-white/15' },
  { rank: 2, handle: 'counter17', isVerified: false, profit: '+$1,267,583', avatarColor: 'bg-white/10 text-white border border-white/15' },
  { rank: 3, handle: 'brc20niubi', isVerified: true, profit: '+$1,201,313', avatarColor: 'bg-white/10 text-white border border-white/15' },
  { rank: 4, handle: 'munji', isVerified: false, profit: '+$1,051,066', avatarColor: 'bg-white/10 text-white border border-white/15' },
  { rank: 5, handle: 'MomsFavourite', isVerified: false, profit: '+$1,020,853', avatarColor: 'bg-white/10 text-white border border-white/15' },
  { rank: 6, handle: 'Mirage', isVerified: true, profit: '+$1,012,874', avatarColor: 'bg-white/10 text-white border border-white/15' },
  { rank: 7, handle: 'gr3gor14n', isVerified: true, profit: '+$958,434', avatarColor: 'bg-white/10 text-white border border-white/15' },
  { rank: 8, handle: 'curb1', isVerified: false, profit: '+$756,594', avatarColor: 'bg-white/10 text-white border border-white/15' },
  { rank: 9, handle: 'swayzeeee', isVerified: false, profit: '+$665,186', avatarColor: 'bg-white/10 text-white border border-white/15' },
  { rank: 10, handle: 'sapphy', isVerified: true, profit: '+$660,268', avatarColor: 'bg-white/10 text-white border border-white/15' },
  { rank: 11, handle: '_logjam', isVerified: true, profit: '+$641,538', avatarColor: 'bg-white/10 text-white border border-white/15' },
  { rank: 12, handle: 'slingoor', isVerified: true, profit: '+$505,344', avatarColor: 'bg-white/10 text-white border border-white/15' },
  { rank: 13, handle: 'remp', isVerified: true, profit: '+$493,695', avatarColor: 'bg-white/10 text-white border border-white/15' },
  { rank: 14, handle: 'tradeslop', isVerified: false, profit: '+$488,922', avatarColor: 'bg-white/10 text-white border border-white/15' },
  { rank: 15, handle: 'wovenkraken4022', isVerified: false, profit: '+$474,455', avatarColor: 'bg-white/10 text-white border border-white/15' },
  { rank: 16, handle: '360ng', isVerified: false, profit: '+$467,677', avatarColor: 'bg-white/10 text-white border border-white/15' },
  { rank: 17, handle: 'Nexybtw', isVerified: false, profit: '+$457,639', avatarColor: 'bg-white/10 text-white border border-white/15' },
];

const CALLOUT_POSTS: CalloutPost[] = [
  {
    id: 'post_1',
    author: 'riisio',
    timeAgo: '6d ago',
    content:
      'Mobi the gorilla is going giga viral again and we have never ran it properly with cashback, millions of views on X and Instagram too, funny af monkey',
    coinName: 'Mobi The Gorilla',
    coinSymbol: 'Mobi',
    position: '$1,778.62',
    profit: '+$573.42',
    marketCap: '8282K',
    reposts: 31,
    comments: 3,
    likes: 25,
    followers: 8,
    views: '36.2K',
    avatarBg: 'bg-white/10 text-white border border-white/15',
  },
  {
    id: 'post_2',
    author: 'riisio',
    timeAgo: '7h ago',
    content: 'Millions soon.',
    reposts: 3,
    comments: 0,
    likes: 7,
    avatarBg: 'bg-white/10 text-white border border-white/15',
  },
  {
    id: 'post_3',
    author: 'ogantd',
    timeAgo: '2h ago',
    content: "Bnb couldn't behave, maybe the SOL version wins",
    coinName: 'Eloncoin',
    coinSymbol: 'Eloncoin',
    position: '$4,110.60',
    profit: '+$4,942.48',
    marketCap: '$778K',
    reposts: 5,
    comments: 5,
    likes: 16,
    followers: 2,
    views: '13.9K',
    avatarBg: 'bg-white/10 text-white border border-white/15',
  },
  {
    id: 'post_4',
    author: 'ogantd',
    timeAgo: '1h ago',
    content: 'Eloncoin x Uberdriver barbell',
    reposts: 0,
    comments: 0,
    likes: 4,
    avatarBg: 'bg-white/10 text-white border border-white/15',
  },
  {
    id: 'post_5',
    author: 'JustSerg',
    timeAgo: '1h ago',
    content: '@a1lon @alonalon Can you crime it please?',
    coinName: 'Pump Cat Coin',
    coinSymbol: 'PUMPCAT',
    position: '$640.24',
    profit: '+$1,442.18',
    reposts: 0,
    comments: 1,
    likes: 8,
    avatarBg: 'bg-white/10 text-white border border-white/15',
  },
];

const TRENDING_COINS: TrendingCoin[] = [
  { id: 't1', name: 'LAPTOP', symbol: '$LAPTOP', isHot: true, marketCap: '$630K', change: '+8340%', isPositive: true },
  { id: 't2', name: 'Pump Cat Coin', symbol: '$PUMPCAT', isHot: true, marketCap: '$872K', change: '+3815%', isPositive: true },
  { id: 't3', name: 'OffChain Dog', symbol: '$zDOG', isHot: true, marketCap: '$738K', change: '+12401%', isPositive: true },
  { id: 't4', name: 'LeverHedge', symbol: '$LEVERHEDGE', isHot: true, marketCap: '$4.11M' },
  { id: 't5', name: 'Anonymous Cat', symbol: '$ZCAT', isHot: true, marketCap: '$141M', change: '+3.32%', isPositive: true },
  { id: 't6', name: 'Homestar Runner', symbol: '$RUNNER', marketCap: '$80.2K' },
  { id: 't7', name: 'vc.fun', symbol: '$VC', marketCap: '$1.58M', change: '+50177%', isPositive: true },
  { id: 't8', name: 'honter boden', symbol: '$HONTER', marketCap: '$755K', change: '+3201%', isPositive: true },
  { id: 't9', name: 'Eloncoin', symbol: '$ELONCOIN', marketCap: '$796K' },
  { id: 't10', name: 'STONK', symbol: '$STONK', marketCap: '$119M', change: '-28.71%', isPositive: false },
  { id: 't11', name: 'OTC', symbol: '$OTC', marketCap: '$17.0M', change: '+88.87%', isPositive: true },
  { id: 't12', name: 'WHEEL SMITH', symbol: '$WHEEL', marketCap: '$103K' },
];

export default function TokenLauncherHomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'1W' | '24h' | '7d'>('1W');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-['Montserrat',sans-serif] p-4 md:p-6 max-w-[1800px] mx-auto w-full box-border"
    >
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title">Token Launcher &amp; DEX</h1>
          <p className="lx-page-subtitle">
            Explore trending Solana tokens, trader callouts, and launch new liquidity pools.
          </p>
        </div>
      </header>

      {/* Top Search Bar */}
      <div className="flex items-center gap-3 mb-4 w-full md:max-w-[calc(100%-360px)]">
        <div className="flex-1 relative flex items-center">
          <Search size={15} className="absolute left-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for coins and users..."
            className="w-full bg-white/[0.03] border border-white/10 focus:border-white/30 rounded-xl py-2 pl-10 pr-16 text-xs text-white placeholder-gray-500 outline-none transition-all"
          />
          <span className="absolute right-3 bg-white/10 rounded px-1.5 py-0.5 text-[10px] font-mono text-gray-400 pointer-events-none">
            ⌘ K
          </span>
        </div>
        <button
          type="button"
          className="p-2 rounded-xl bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white transition-colors shrink-0"
          title="Filter search"
        >
          <SlidersHorizontal size={15} />
        </button>
      </div>

      {/* Watchlist Strip (Monochrome frameless banner) */}
      <div className="flex items-center gap-2.5 py-1.5 px-1 mb-5 text-xs text-gray-400 font-mono border-b border-white/5 pb-3 md:max-w-[calc(100%-360px)]">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Star size={13} />
          <Flame size={13} />
          <Clock size={13} />
        </div>
        <span className="truncate">Nothing on your watchlist yet. Star a coin to follow it here.</span>
      </div>

      {/* Main 3-Column Fluid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        {/* Column 1: Top Profit (3 Cols) - Clean Fluid Column */}
        <div className="lg:col-span-3 flex flex-col min-w-0 w-full">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 w-full min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-xs font-semibold text-white font-['Outfit'] tracking-wider uppercase">Top Profit</h2>
              <button
                type="button"
                className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-gray-300 font-mono flex items-center gap-0.5 hover:bg-white/10 transition-colors"
              >
                Profit <ChevronDown size={10} />
              </button>
              <button
                type="button"
                className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-gray-300 font-mono hover:bg-white/10 transition-colors"
              >
                {timeFilter}
              </button>
            </div>
            <div className="flex items-center gap-1 text-gray-400 shrink-0">
              <button type="button" className="hover:text-white p-1 transition-colors"><Filter size={12} /></button>
              <button type="button" className="hover:text-white p-1 transition-colors"><GridIcon size={12} /></button>
              <button type="button" className="hover:text-white p-1 transition-colors"><MoreHorizontal size={12} /></button>
            </div>
          </div>

          {/* Leaderboard List - Clean borderless rows */}
          <div className="overflow-y-auto max-h-[750px] pr-1 w-full min-w-0 divide-y divide-white/[0.04]">
            {TOP_PROFIT_TRADERS.map((t) => (
              <div
                key={t.rank}
                className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-white/[0.04] transition-all text-xs font-mono w-full min-w-0 group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <span className="text-gray-500 font-bold text-[11px] w-4 text-right shrink-0">{t.rank}</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${t.avatarColor}`}>
                    {t.handle.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white font-medium truncate text-[12px] min-w-0 flex-1 group-hover:text-white transition-colors">{t.handle}</span>
                  {t.isVerified && (
                    <CheckCircle2 size={12} className="text-gray-300 shrink-0 ml-0.5" />
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-white font-bold text-[12px]">{t.profit}</span>
                  <Users size={12} className="text-gray-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Recommended Callouts (6 Cols) - Clean Fluid Timeline Feed */}
        <div className="lg:col-span-6 flex flex-col min-w-0 w-full lg:px-4 lg:border-x lg:border-white/[0.06]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 w-full min-w-0">
            <h2 className="text-xs font-semibold text-white font-['Outfit'] tracking-wider uppercase flex items-center gap-2">
              <Flame size={14} className="text-gray-300" /> Recommended callouts
            </h2>
            <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
              <button type="button" className="hover:text-white p-1 transition-colors"><Filter size={12} /></button>
              <button type="button" className="hover:text-white p-1 transition-colors"><GridIcon size={12} /></button>
              <button type="button" className="hover:text-white p-1 transition-colors"><Search size={12} /></button>
              <button type="button" className="hover:text-white p-1 transition-colors"><MoreHorizontal size={12} /></button>
            </div>
          </div>

          {/* Posts Feed - Monochrome timeline layout */}
          <div className="overflow-y-auto max-h-[750px] pr-1 w-full min-w-0 space-y-6">
            {CALLOUT_POSTS.map((p) => (
              <div
                key={p.id}
                className="pb-6 border-b border-white/[0.06] last:border-b-0 space-y-3 w-full min-w-0"
              >
                {/* Author info */}
                <div className="flex items-center justify-between text-xs font-mono w-full">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-full ${p.avatarBg} flex items-center justify-center font-bold text-[11px] shrink-0`}>
                      {p.author.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white font-semibold truncate hover:underline cursor-pointer">@{p.author}</span>
                    <span className="text-gray-500 shrink-0">• {p.timeAgo}</span>
                  </div>
                  <Users size={13} className="text-gray-500 hover:text-white cursor-pointer shrink-0 transition-colors" />
                </div>

                {/* Text Content */}
                <p className="text-xs text-gray-200 leading-relaxed font-sans w-full break-words pl-9">{p.content}</p>

                {/* Attached Coin Badge/Chip (Monochrome) */}
                {p.coinName && (
                  <div className="ml-9 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors flex items-center justify-between text-xs font-mono w-full gap-2 cursor-pointer border border-white/5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white/10 text-white font-['Outfit'] font-bold text-[11px] flex items-center justify-center shrink-0 border border-white/15">
                        {p.coinSymbol?.slice(0, 3).toUpperCase() || 'COIN'}
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="text-white font-semibold font-['Outfit'] truncate">{p.coinSymbol}</p>
                        <p className="text-[10px] text-gray-400 truncate">{p.coinName}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-gray-400">Pos <strong className="text-white">{p.position}</strong></span>
                        <span className="text-gray-400">Profit <strong className="text-white">{p.profit}</strong></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Social Reaction Bar */}
                <div className="ml-9 flex items-center justify-between pt-1 text-[11px] font-mono text-gray-500 w-full">
                  <div className="flex items-center gap-4">
                    <button type="button" className="flex items-center gap-1 hover:text-white transition-colors">
                      <Repeat size={12} /> {p.reposts}
                    </button>
                    <button type="button" className="flex items-center gap-1 hover:text-white transition-colors">
                      <MessageSquare size={12} /> {p.comments}
                    </button>
                    <button type="button" className="flex items-center gap-1 hover:text-white transition-colors">
                      <Heart size={12} /> {p.likes}
                    </button>
                    {p.followers !== undefined && (
                      <button type="button" className="flex items-center gap-1 hover:text-white transition-colors">
                        <Users size={12} /> {p.followers}
                      </button>
                    )}
                    {p.views && (
                      <button type="button" className="flex items-center gap-1 hover:text-white transition-colors">
                        <Eye size={12} /> {p.views}
                      </button>
                    )}
                  </div>

                  {p.marketCap && (
                    <span className="text-gray-400 font-semibold shrink-0">MC {p.marketCap}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Trending Coins (3 Cols) - Clean Monochrome List */}
        <div className="lg:col-span-3 flex flex-col min-w-0 w-full">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 w-full min-w-0">
            <h2 className="text-xs font-semibold text-white font-['Outfit'] tracking-wider uppercase flex items-center gap-1.5">
              <TrendingUp size={14} className="text-gray-300" /> Trending
            </h2>
            <div className="flex items-center gap-1 text-gray-400 shrink-0">
              <button type="button" className="hover:text-white p-1 transition-colors"><Filter size={12} /></button>
              <button type="button" className="hover:text-white p-1 transition-colors"><GridIcon size={12} /></button>
              <button type="button" className="hover:text-white p-1 transition-colors"><Search size={12} /></button>
              <button type="button" className="hover:text-white p-1 transition-colors"><MoreHorizontal size={12} /></button>
            </div>
          </div>

          {/* Trending Coins List - Clean borderless monochrome rows */}
          <div className="overflow-y-auto max-h-[750px] pr-1 w-full min-w-0 divide-y divide-white/[0.04]">
            {TRENDING_COINS.map((tc) => (
              <div
                key={tc.id}
                onClick={() => toast.success(`Viewing ${tc.name} (${tc.symbol})`)}
                className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-white/[0.04] transition-all cursor-pointer text-xs font-mono w-full min-w-0 group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-white/5 text-white font-['Outfit'] font-bold text-[10px] flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-white/10 transition-colors">
                    {tc.symbol.replace('$', '').slice(0, 3)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-white font-semibold font-['Outfit'] text-[12px] truncate block leading-tight group-hover:text-white transition-colors">{tc.name}</span>
                      {tc.isHot && (
                        <span className="px-1 py-0.1 rounded text-[8px] font-bold uppercase bg-white/10 text-white border border-white/15 shrink-0">
                          HOT
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono truncate">{tc.symbol}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-white font-bold text-[12px]">{tc.marketCap}</p>
                  {tc.change && (
                    <p className="text-[10px] font-bold text-gray-300">
                      {tc.change}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}




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
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface TopProfitTrader {
  rank: number;
  handle: string;
  isVerified: boolean;
  profit: string;
  tradesCount: number;
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
  views?: string;
}

interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  isHot?: boolean;
  marketCap: string;
  change?: string;
}

const TOP_PROFIT_TRADERS: TopProfitTrader[] = [
  { rank: 1, handle: 'J777Crypto', isVerified: true, profit: '+$1,566,844', tradesCount: 142 },
  { rank: 2, handle: 'counter17', isVerified: false, profit: '+$1,267,583', tradesCount: 98 },
  { rank: 3, handle: 'brc20niubi', isVerified: true, profit: '+$1,201,313', tradesCount: 210 },
  { rank: 4, handle: 'munji', isVerified: false, profit: '+$1,051,066', tradesCount: 84 },
  { rank: 5, handle: 'MomsFavourite', isVerified: false, profit: '+$1,020,853', tradesCount: 67 },
  { rank: 6, handle: 'Mirage', isVerified: true, profit: '+$1,012,874', tradesCount: 119 },
  { rank: 7, handle: 'gr3gor14n', isVerified: true, profit: '+$958,434', tradesCount: 76 },
  { rank: 8, handle: 'curb1', isVerified: false, profit: '+$756,594', tradesCount: 52 },
  { rank: 9, handle: 'swayzeeee', isVerified: false, profit: '+$665,186', tradesCount: 41 },
  { rank: 10, handle: 'sapphy', isVerified: true, profit: '+$660,268', tradesCount: 93 },
  { rank: 11, handle: '_logjam', isVerified: true, profit: '+$641,538', tradesCount: 58 },
  { rank: 12, handle: 'slingoor', isVerified: true, profit: '+$505,344', tradesCount: 61 },
  { rank: 13, handle: 'remp', isVerified: true, profit: '+$493,695', tradesCount: 39 },
  { rank: 14, handle: 'tradeslop', isVerified: false, profit: '+$488,922', tradesCount: 88 },
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
    marketCap: '$828K',
    reposts: 31,
    comments: 3,
    likes: 25,
    views: '36.2K',
  },
  {
    id: 'post_2',
    author: 'riisio',
    timeAgo: '7h ago',
    content: 'Millions soon. Community takeover confirmed on Solana.',
    reposts: 3,
    comments: 0,
    likes: 7,
  },
  {
    id: 'post_3',
    author: 'ogantd',
    timeAgo: '2h ago',
    content: "Bnb couldn't behave, maybe the SOL version wins. Liquidity locked for 1 year.",
    coinName: 'Eloncoin',
    coinSymbol: 'ELON',
    position: '$4,110.60',
    profit: '+$4,942.48',
    marketCap: '$778K',
    reposts: 5,
    comments: 5,
    likes: 16,
    views: '13.9K',
  },
  {
    id: 'post_4',
    author: 'JustSerg',
    timeAgo: '1h ago',
    content: '@a1lon @alonalon Can you crime it please? High volume break out incoming.',
    coinName: 'Pump Cat Coin',
    coinSymbol: 'PUMPCAT',
    position: '$640.24',
    profit: '+$1,442.18',
    marketCap: '$872K',
    reposts: 8,
    comments: 4,
    likes: 32,
    views: '18.4K',
  },
];

const TRENDING_COINS: TrendingCoin[] = [
  { id: 't1', name: 'LAPTOP', symbol: '$LAPTOP', isHot: true, marketCap: '$630K', change: '+8,340%' },
  { id: 't2', name: 'Pump Cat Coin', symbol: '$PUMPCAT', isHot: true, marketCap: '$872K', change: '+3,815%' },
  { id: 't3', name: 'OffChain Dog', symbol: '$zDOG', isHot: true, marketCap: '$738K', change: '+12,401%' },
  { id: 't4', name: 'LeverHedge', symbol: '$LEVERHEDGE', isHot: true, marketCap: '$4.11M', change: '+245%' },
  { id: 't5', name: 'Anonymous Cat', symbol: '$ZCAT', isHot: true, marketCap: '$141M', change: '+3.32%' },
  { id: 't6', name: 'Homestar Runner', symbol: '$RUNNER', marketCap: '$80.2K', change: '+18.4%' },
  { id: 't7', name: 'vc.fun', symbol: '$VC', marketCap: '$1.58M', change: '+50,177%' },
  { id: 't8', name: 'honter boden', symbol: '$HONTER', marketCap: '$755K', change: '+3,201%' },
  { id: 't9', name: 'Eloncoin', symbol: '$ELONCOIN', marketCap: '$796K', change: '+142%' },
  { id: 't10', name: 'STONK', symbol: '$STONK', marketCap: '$119M', change: '-28.71%' },
  { id: 't11', name: 'OTC Token', symbol: '$OTC', marketCap: '$17.0M', change: '+88.87%' },
  { id: 't12', name: 'WHEEL SMITH', symbol: '$WHEEL', marketCap: '$103K', change: '+64.2%' },
];

export default function TokenLauncherHomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'1W' | '24h' | '7d'>('1W');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-['Montserrat',sans-serif] p-3 sm:p-5 md:p-8 max-w-[1700px] mx-auto w-full box-border space-y-6 overflow-x-hidden"
    >
      {/* Header Section (Pure Monochrome) */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="font-['Outfit'] text-2xl md:text-3xl font-medium tracking-tight text-white">
            Token Launcher &amp; DEX
          </h1>
          <p className="text-xs md:text-sm font-light text-white/60 mt-1">
            Explore trending Solana tokens, trader callouts, and launch new liquidity pools.
          </p>
        </div>

        <Link
          href="/token-launcher/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-['Outfit'] font-semibold text-xs transition-colors hover:bg-white/90 shrink-0 self-start md:self-auto"
        >
          <Plus size={15} /> Launch Liquidity Pool
        </Link>
      </header>

      {/* Search Bar with Integrated Filter Icon (Clean Monochrome) */}
      <div className="w-full relative flex items-center">
        <Search size={15} className="absolute left-4 text-white/40 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search coins by name, symbol or contract address..."
          className="w-full bg-white/5 border border-white/12 focus:border-white/30 rounded-full py-2.5 pl-11 pr-20 text-xs text-white placeholder-white/40 outline-none transition-all box-border"
        />
        <div className="absolute right-3.5 flex items-center gap-2">
          <span className="bg-white/10 rounded px-1.5 py-0.5 text-[10px] font-mono text-white/50 pointer-events-none hidden sm:inline-block">
            ⌘ K
          </span>
          <button
            type="button"
            onClick={() => toast.info('Filter search results')}
            className="p-1 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10 flex items-center justify-center"
            title="Filter search"
          >
            <SlidersHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Ticker Banner (Clean Text Line) */}
      <div className="flex items-center gap-2 text-xs font-mono text-white/50 pb-2 border-b border-white/10">
        <Star size={13} className="text-white/40 shrink-0" />
        <span className="truncate">Nothing on your watchlist yet. Star a coin to follow it here.</span>
      </div>

      {/* Main 3-Column Containerless Fluid Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 w-full items-start">
        {/* Column 1: Top Profit (No Container Box & Invisible Scrollbar) */}
        <div className="lg:col-span-3 flex flex-col min-w-0 w-full">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 w-full min-w-0">
            <h2 className="text-xs font-semibold text-white font-['Outfit'] tracking-wider uppercase">
              Top Profit
            </h2>
            <button
              type="button"
              onClick={() => setTimeFilter(timeFilter === '1W' ? '24h' : '1W')}
              className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/70 font-mono flex items-center gap-1 hover:bg-white/10 transition-colors border border-white/10"
            >
              {timeFilter} <ChevronDown size={10} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[750px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full min-w-0 divide-y divide-white/[0.04]">
            {TOP_PROFIT_TRADERS.map((t) => (
              <div
                key={t.rank}
                onClick={() => toast.success(`Viewing trader @${t.handle}`)}
                className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-white/[0.04] transition-all text-xs font-mono w-full min-w-0 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <span className="text-white/40 font-bold text-[11px] w-4 text-right shrink-0">{t.rank}</span>
                  <div className="w-6 h-6 rounded-full bg-white/10 text-white font-bold text-[10px] flex items-center justify-center shrink-0 border border-white/15">
                    {t.handle.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white font-medium truncate text-[12px] min-w-0 flex-1 group-hover:text-white transition-colors">
                    {t.handle}
                  </span>
                  {t.isVerified && <CheckCircle2 size={12} className="text-white/60 shrink-0" />}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-white font-bold text-[12px] font-mono block">{t.profit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Recommended Callouts (No Container Box & Invisible Scrollbar) */}
        <div className="md:col-span-2 lg:col-span-6 flex flex-col min-w-0 w-full lg:px-4 lg:border-x lg:border-white/10">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 w-full min-w-0">
            <h2 className="text-xs font-semibold text-white font-['Outfit'] tracking-wider uppercase flex items-center gap-2">
              <Flame size={14} className="text-white/60" /> Recommended callouts
            </h2>
          </div>

          <div className="overflow-y-auto max-h-[750px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full min-w-0 space-y-6">
            {CALLOUT_POSTS.map((p) => (
              <div
                key={p.id}
                className="pb-6 border-b border-white/[0.06] last:border-b-0 space-y-3 w-full min-w-0"
              >
                <div className="flex items-center justify-between text-xs font-mono w-full">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-white/10 text-white font-bold text-[11px] flex items-center justify-center shrink-0 border border-white/15">
                      {p.author.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white font-semibold truncate hover:underline cursor-pointer">@{p.author}</span>
                    <span className="text-white/40 shrink-0">• {p.timeAgo}</span>
                  </div>
                  <Users size={13} className="text-white/40 hover:text-white cursor-pointer shrink-0 transition-colors" />
                </div>

                <p className="text-xs text-white/80 leading-relaxed font-sans w-full break-words pl-2 sm:pl-9">{p.content}</p>

                {p.coinName && (
                  <div
                    onClick={() => toast.info(`Opening ${p.coinName} details`)}
                    className="sm:ml-9 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors flex flex-wrap sm:flex-nowrap items-center justify-between text-xs font-mono w-full gap-2 cursor-pointer border border-white/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white/10 text-white font-['Outfit'] font-bold text-[11px] flex items-center justify-center shrink-0 border border-white/15">
                        {p.coinSymbol?.slice(0, 3).toUpperCase() || 'COIN'}
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="text-white font-semibold font-['Outfit'] truncate">{p.coinSymbol}</p>
                        <p className="text-[10px] text-white/50 truncate">{p.coinName}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-mono">
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-white/50">Pos <strong className="text-white">{p.position}</strong></span>
                        <span className="text-white/50">Profit <strong className="text-white">{p.profit}</strong></span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="sm:ml-9 flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono text-white/50 w-full">
                  <div className="flex items-center gap-4 flex-wrap">
                    <button type="button" className="flex items-center gap-1 hover:text-white transition-colors">
                      <Repeat size={12} /> {p.reposts}
                    </button>
                    <button type="button" className="flex items-center gap-1 hover:text-white transition-colors">
                      <MessageSquare size={12} /> {p.comments}
                    </button>
                    <button type="button" className="flex items-center gap-1 hover:text-white transition-colors">
                      <Heart size={12} /> {p.likes}
                    </button>
                    {p.views && (
                      <span className="flex items-center gap-1 text-white/40">
                        <Eye size={12} /> {p.views}
                      </span>
                    )}
                  </div>

                  {p.marketCap && (
                    <span className="text-white/60 font-semibold shrink-0">MC {p.marketCap}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Trending Coins (No Container Box & Invisible Scrollbar) */}
        <div className="lg:col-span-3 flex flex-col min-w-0 w-full">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 w-full min-w-0">
            <h2 className="text-xs font-semibold text-white font-['Outfit'] tracking-wider uppercase flex items-center gap-1.5">
              <TrendingUp size={14} className="text-white/60" /> Trending
            </h2>
          </div>

          <div className="overflow-y-auto max-h-[750px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full min-w-0 divide-y divide-white/[0.04]">
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
                      <span className="text-white font-semibold font-['Outfit'] text-[12px] truncate block leading-tight group-hover:text-white transition-colors">
                        {tc.name}
                      </span>
                      {tc.isHot && (
                        <span className="px-1 py-0.1 rounded text-[8px] font-bold uppercase bg-white/10 text-white border border-white/15 shrink-0">
                          HOT
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-white/40 font-mono truncate">{tc.symbol}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-white font-bold text-[12px]">{tc.marketCap}</p>
                  {tc.change && (
                    <p className="text-[10px] font-bold text-white/70">
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




'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  ArrowUpRight,
  BarChart2,
  Clock,
  Zap,
  Search,
  Mic,
  Clipboard,
  Wallet,
  Globe,
  MessageCircle,
  Twitter,
  Radio,
  Flame,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface TrenchCoin {
  id: string;
  name: string;
  symbol: string;
  handle: string;
  timeAgo: string;
  volume: string;
  marketCap: string;
  solAmount: string;
  progressPercent: number;
  avatarUrl: string;
  isVerified?: boolean;
}

const NEW_TOKENS: TrenchCoin[] = [];
const SOON_TOKENS: TrenchCoin[] = [];
const MIGRATED_TOKENS: TrenchCoin[] = [];

const BIDS = [
  { price: '0.0731', amount: '14,200', total: '$1,038' },
  { price: '0.0730', amount: '8,500', total: '$620' },
  { price: '0.0728', amount: '22,100', total: '$1,608' },
  { price: '0.0725', amount: '45,000', total: '$3,262' },
];

const ASKS = [
  { price: '0.0732', amount: '12,500', total: '$915' },
  { price: '0.0735', amount: '19,800', total: '$1,455' },
  { price: '0.0738', amount: '35,400', total: '$2,612' },
  { price: '0.0740', amount: '88,000', total: '$6,512' },
];

const CHART_POINTS = [40, 44, 42, 48, 52, 50, 58, 63, 60, 68, 72, 70, 78];

const PageViewport = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 70px);
  background: #0a0a0a;
  color: #ededed;
  font-family: 'Montserrat', sans-serif;
  padding: 16px 24px;
  max-width: 1700px;
  margin: 0 auto;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 12px;
    height: auto;
    overflow-y: auto;
  }
`;

export default function TerminalPage() {
  const [activeTab, setActiveTab] = useState<'Trenches' | 'Terminal' | 'Trending' | 'Portfolio'>('Trenches');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickAmount, setQuickAmount] = useState('0.1');

  // Chart state for Terminal mode
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const w = 600;
  const h = 180;
  const max = Math.max(...CHART_POINTS);
  const min = Math.min(...CHART_POINTS);
  const points = CHART_POINTS.map((v, i) => {
    const x = (i / (CHART_POINTS.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h;
    return `${x},${y}`;
  }).join(' ');

  const handleQuickBuy = (coin: TrenchCoin) => {
    toast.success(`Quick Order Sent: ${quickAmount} SOL for ${coin.name} (${coin.symbol})`);
  };

  const handlePasteCA = () => {
    navigator.clipboard.readText().then((text) => {
      if (text) {
        setSearchQuery(text);
        toast.info(`Pasted Contract Address: ${text.slice(0, 8)}...`);
      } else {
        toast.error('Clipboard is empty');
      }
    }).catch(() => {
      toast.info('Pasted test Contract Address: 7xKX...gAsU');
      setSearchQuery('7xKXtg2P7WfL9x8Ym2b1vCq9wR3zN8vX');
    });
  };

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount in SOL');
      return;
    }
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      toast.success(`${side === 'buy' ? 'Bought' : 'Sold'} ${amount} SOL via Raydium AMM!`);
      setAmount('');
    }, 1000);
  };

  return (
    <PageViewport>
      {/* 1 · Standard Header Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 shrink-0">
        <div>
          <h1 className="lx-page-title flex items-center gap-3">
            <BarChart2 size={26} className="text-white shrink-0" /> Pro DEX Terminal
          </h1>
          <p className="lx-page-subtitle">
            Real-time SPL token trenches, bonding curve streams, and instant execution.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Solana Mainnet
          </span>
        </div>
      </header>

      {/* 2 · Sub Navigation Bar & Quick Controls (Image 2 style) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3 border-b border-white/10 shrink-0">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {(['Trenches', 'Terminal', 'Trending', 'Portfolio'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-white/[0.03] text-gray-400 border border-white/5 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab === 'Trenches' && <Activity size={13} className="inline mr-1.5" />}
              {tab === 'Terminal' && <BarChart2 size={13} className="inline mr-1.5" />}
              {tab === 'Trending' && <TrendingUp size={13} className="inline mr-1.5" />}
              {tab === 'Portfolio' && <Wallet size={13} className="inline mr-1.5" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Actions Bar */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] sm:w-[260px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name or CA..."
              className="w-full bg-white/[0.04] border border-white/10 focus:border-white/30 rounded-full pl-9 pr-4 py-1.5 text-xs font-mono text-white outline-none placeholder-gray-500 transition-colors"
            />
          </div>

          {/* Voice Chat */}
          <button
            type="button"
            onClick={() => toast.info('Voice Chat channel active: 42 listeners')}
            className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 flex items-center gap-1.5 transition-all shrink-0"
            title="Join Voice Chat"
          >
            <Mic size={13} className="text-white" />
            <span className="hidden sm:inline">Voice chat</span>
          </button>

          {/* Paste CA */}
          <button
            type="button"
            onClick={handlePasteCA}
            className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 flex items-center gap-1.5 transition-all shrink-0"
            title="Paste Contract Address"
          >
            <Clipboard size={13} className="text-white" />
            <span className="hidden sm:inline">Paste CA</span>
          </button>

          {/* Deposit SOL Button */}
          <button
            type="button"
            onClick={() => toast.success('Deposit SOL address copied to clipboard!')}
            className="px-4 py-1.5 rounded-full bg-white text-black font-['Outfit'] font-bold text-xs hover:bg-gray-200 transition-all shrink-0 shadow-md"
          >
            Deposit SOL
          </button>
        </div>
      </div>

      {/* 3 · Main Single-Page View Content Container */}
      <div className="flex-1 min-h-0 pt-3 overflow-hidden">
        {activeTab === 'Trenches' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full overflow-y-auto no-scrollbar pb-4">
            
            {/* COLUMN 1: NEW */}
            <div className="flex flex-col h-full bg-white/[0.015] border border-white/10 rounded-3xl p-3 overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 shrink-0">
                <span className="font-['Outfit'] text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white" /> New Launches
                </span>
                <span className="text-[10px] font-mono text-gray-400">{NEW_TOKENS.length} coins</span>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
                {NEW_TOKENS.map((coin) => (
                  <div
                    key={coin.id}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={coin.avatarUrl} alt={coin.name} className="w-8 h-8 rounded-full border border-white/20 object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className="font-['Outfit'] text-xs font-bold text-white truncate flex items-center gap-1">
                            {coin.name}
                            {coin.isVerified && <CheckCircle2 size={11} className="text-white shrink-0" />}
                          </p>
                          <p className="text-[10px] font-mono text-gray-400 truncate">{coin.symbol} · {coin.handle}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 shrink-0">{coin.timeAgo}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-white/5">
                      <div>
                        <span className="text-gray-500">V: </span>
                        <span className="text-white font-bold">{coin.volume}</span>
                        <span className="text-gray-500 ml-2">MC: </span>
                        <span className="text-white font-bold">{coin.marketCap}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickBuy(coin)}
                        className="px-3 py-1 rounded-full bg-white text-black font-mono font-bold text-[10px] hover:bg-gray-200 transition-all shrink-0 shadow"
                      >
                        {coin.solAmount}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 2: SOON (Bonding Curve Completion) */}
            <div className="flex flex-col h-full bg-white/[0.015] border border-white/10 rounded-3xl p-3 overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 shrink-0">
                <span className="font-['Outfit'] text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Zap size={14} className="text-white" /> Graduation Soon
                </span>
                <span className="text-[10px] font-mono text-gray-400">{SOON_TOKENS.length} coins</span>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
                {SOON_TOKENS.map((coin) => (
                  <div
                    key={coin.id}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={coin.avatarUrl} alt={coin.name} className="w-8 h-8 rounded-full border border-white/20 object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className="font-['Outfit'] text-xs font-bold text-white truncate flex items-center gap-1">
                            {coin.name}
                            {coin.isVerified && <CheckCircle2 size={11} className="text-white shrink-0" />}
                          </p>
                          <p className="text-[10px] font-mono text-gray-400 truncate">{coin.symbol} · {coin.handle}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 shrink-0">{coin.timeAgo}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-white h-full transition-all"
                        style={{ width: `${coin.progressPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-white/5">
                      <div>
                        <span className="text-gray-500">V: </span>
                        <span className="text-white font-bold">{coin.volume}</span>
                        <span className="text-gray-500 ml-2">MC: </span>
                        <span className="text-white font-bold">{coin.marketCap}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickBuy(coin)}
                        className="px-3 py-1 rounded-full bg-white text-black font-mono font-bold text-[10px] hover:bg-gray-200 transition-all shrink-0 shadow"
                      >
                        {coin.solAmount}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 3: MIGRATED (Raydium Live DEX) */}
            <div className="flex flex-col h-full bg-white/[0.015] border border-white/10 rounded-3xl p-3 overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 shrink-0">
                <span className="font-['Outfit'] text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Flame size={14} className="text-white" /> Raydium Migrated
                </span>
                <span className="text-[10px] font-mono text-gray-400">{MIGRATED_TOKENS.length} coins</span>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
                {MIGRATED_TOKENS.map((coin) => (
                  <div
                    key={coin.id}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={coin.avatarUrl} alt={coin.name} className="w-8 h-8 rounded-full border border-white/20 object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className="font-['Outfit'] text-xs font-bold text-white truncate flex items-center gap-1">
                            {coin.name}
                            {coin.isVerified && <CheckCircle2 size={11} className="text-white shrink-0" />}
                          </p>
                          <p className="text-[10px] font-mono text-gray-400 truncate">{coin.symbol} · {coin.handle}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 shrink-0">{coin.timeAgo}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-white/5">
                      <div>
                        <span className="text-gray-500">V: </span>
                        <span className="text-white font-bold">{coin.volume}</span>
                        <span className="text-gray-500 ml-2">MC: </span>
                        <span className="text-white font-bold">{coin.marketCap}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickBuy(coin)}
                        className="px-3 py-1 rounded-full bg-white text-black font-mono font-bold text-[10px] hover:bg-gray-200 transition-all shrink-0 shadow"
                      >
                        {coin.solAmount}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'Terminal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full overflow-y-auto no-scrollbar pb-4">
            {/* Chart View (8 Cols) */}
            <div className="lg:col-span-8 bg-white/[0.015] border border-white/10 rounded-3xl p-4 flex flex-col space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                    LXR
                  </div>
                  <div>
                    <h3 className="font-['Outfit'] font-bold text-sm text-white">LXR / SOL</h3>
                    <p className="text-[10px] font-mono text-gray-400">Raydium AMM V4 · $0.0731 (+12.8%)</p>
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-gray-400">
                  Vol 24h: $48.2K · Liq: $145.2K
                </div>
              </div>

              <div className="flex-1 min-h-[220px] relative flex items-center justify-center">
                <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full max-h-[220px]" preserveAspectRatio="none">
                  <polyline points={points} fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                  <polygon points={`0,${h} ${points} ${w},${h}`} fill="url(#termGrad)" opacity="0.1" />
                  <defs>
                    <linearGradient id="termGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Quick Swap Order Form & Orderbook (4 Cols) */}
            <div className="lg:col-span-4 bg-white/[0.015] border border-white/10 rounded-3xl p-4 flex flex-col space-y-4">
              <div className="flex gap-2 p-1 rounded-full bg-black border border-white/10">
                <button
                  type="button"
                  onClick={() => setSide('buy')}
                  className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                    side === 'buy' ? 'bg-white text-black' : 'text-gray-400'
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setSide('sell')}
                  className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                    side === 'sell' ? 'bg-white text-black' : 'text-gray-400'
                  }`}
                >
                  Sell
                </button>
              </div>

              <form onSubmit={handleExecuteTrade} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-1 uppercase">Amount SOL</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00 SOL"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-full px-4 py-2 text-xs font-mono text-white outline-none focus:border-white/30"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isExecuting}
                  className="w-full py-2.5 rounded-full bg-white text-black font-['Outfit'] font-bold text-xs hover:bg-gray-200 transition-all shadow-md"
                >
                  {isExecuting ? 'Executing...' : `Execute ${side.toUpperCase()}`}
                </button>
              </form>

              <div className="pt-2 border-t border-white/10 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-gray-400">
                  <span>Order Book Spread</span>
                  <span className="text-white">0.0001</span>
                </div>
                {BIDS.slice(0, 3).map((b, i) => (
                  <div key={i} className="flex justify-between text-gray-400">
                    <span className="text-white">{b.price}</span>
                    <span>{b.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'Trending' || activeTab === 'Portfolio') && (
          <div className="flex items-center justify-center h-full border border-white/10 rounded-3xl bg-white/[0.015] p-8 text-center">
            <div className="space-y-2">
              <Activity size={32} className="mx-auto text-gray-400" />
              <p className="font-['Outfit'] font-bold text-base text-white">{activeTab} Live Engine</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto font-mono">
                Streaming real-time Solana DEX telemetry and automated position tracking.
              </p>
            </div>
          </div>
        )}
      </div>
    </PageViewport>
  );
}

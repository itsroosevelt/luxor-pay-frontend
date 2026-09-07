'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Zap,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  User,
  ArrowRight,
  X,
  Play,
  RotateCcw,
  Sliders,
  Coins,
  Bot,
  HelpCircle,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  MousePointer,
} from 'lucide-react';
import { toast } from 'sonner';

interface MayhemTrader {
  rank: number;
  handle: string;
  winRate: string;
  profit24h: string;
  profit7d: string;
}

interface WinningCoin {
  rank: number;
  name: string;
  symbol: string;
  address: string;
  state: 'AGENT ENDED' | 'AGENT PAUSED' | 'AGENT ACTIVE';
  volume: string;
  traders: number;
  netInflow: string;
  marketCap: string;
}

interface ScreenerCoin {
  rank: number;
  name: string;
  symbol: string;
  marketCap: string;
  volume: string;
  state: 'AGENT ACTIVE' | 'AGENT PAUSED' | 'AGENT ENDED';
}

const MAYHEM_TRADERS: MayhemTrader[] = [
  { rank: 1, handle: '@JTmovez', winRate: '33.1%', profit24h: '+$2.5k', profit7d: '7d +$2.8k' },
  { rank: 2, handle: '@Illshrimp24945', winRate: '35.2%', profit24h: '+$2.1k', profit7d: '7d +$2.6k' },
  { rank: 3, handle: '@ChadMeteorPolka', winRate: '63.4%', profit24h: '+$2k', profit7d: '7d +$13.4k' },
  { rank: 4, handle: '@dualnarwhal3031', winRate: '100.0%', profit24h: '+$2k', profit7d: '7d +$9.1k' },
  { rank: 5, handle: '@VastBoomChief', winRate: '57.4%', profit24h: '+$1.4k', profit7d: '7d +$10.5k' },
];

const WINNING_COINS: WinningCoin[] = [
  {
    rank: 1,
    name: 'Zuko',
    symbol: 'Zuko',
    address: '8QMT...pump',
    state: 'AGENT ENDED',
    volume: '$246.2k',
    traders: 78,
    netInflow: '+$12.8K',
    marketCap: '$748.93',
  },
  {
    rank: 2,
    name: 'Regret Wall',
    symbol: '$REGRET',
    address: '6osC...pump',
    state: 'AGENT PAUSED',
    volume: '$17.4k',
    traders: 7,
    netInflow: '+$5.7K',
    marketCap: '$10.4k',
  },
  {
    rank: 3,
    name: 'Buttensor',
    symbol: 'Buttensor',
    address: '7TSv...pump',
    state: 'AGENT ENDED',
    volume: '$160.1k',
    traders: 39,
    netInflow: '+$4.8K',
    marketCap: '$26.82',
  },
];

const SCREENER_COINS: ScreenerCoin[] = [
  { rank: 1, name: 'A Memecoin Agency', symbol: '$AMA', marketCap: '$5.9k', volume: '$51.48', state: 'AGENT ACTIVE' },
  { rank: 2, name: 'Mayhem Doge', symbol: '$MDOGE', marketCap: '$12.4k', volume: '$1.2k', state: 'AGENT ACTIVE' },
  { rank: 3, name: 'Zuko AI', symbol: '$ZUKO', marketCap: '$748k', volume: '$246.2k', state: 'AGENT ENDED' },
  { rank: 4, name: 'Regret Wall', symbol: '$REGRET', marketCap: '$10.4k', volume: '$17.4k', state: 'AGENT PAUSED' },
];

const PageContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: #ededed;
  font-family: 'Montserrat', sans-serif;
`;

const ContentLayout = styled.div`
  padding: 24px 32px 60px 32px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const MonochromeLaunchButton = styled.button`
  width: 100%;
  padding: 14px 20px;
  border-radius: 9999px;
  background: #ffffff;
  color: #000000;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #2563eb;
    color: #ffffff;
    box-shadow: 0 4px 20px rgba(37, 99, 235, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TogglePill = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 10px 16px;
  border-radius: 9999px;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)')};
  background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)')};
  color: ${({ $active }) => ($active ? '#ffffff' : 'rgba(255, 255, 255, 0.5)')};

  &:hover {
    background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.05)')};
    color: #ffffff;
  }
`;

export default function MayhemPage() {
  const [showBanner, setShowBanner] = useState(true);
  const [screenerFilter, setScreenerFilter] = useState<'All' | 'Active' | 'Paused' | 'Ended'>('All');

  // Form State for Launch Coin
  const [coinName, setCoinName] = useState('');
  const [ticker, setTicker] = useState('');
  const [initialBuy, setInitialBuy] = useState('0.06');
  const [pairWith, setPairWith] = useState<'SOL' | 'USDC'>('SOL');
  const [triggerMode, setTriggerMode] = useState<'Auto' | 'Manual'>('Auto');
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunchCoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinName.trim() || !ticker.trim()) {
      toast.error('Please fill in Coin Name and Ticker');
      return;
    }
    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      toast.success(`$${ticker.toUpperCase()} launched with Mayhem AI Agent!`);
      setCoinName('');
      setTicker('');
    }, 1500);
  };

  return (
    <PageContainer>
      {/* Top Banner Announcement */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-black/90 border-b border-white/5 px-6 py-2.5 flex items-center justify-between text-xs font-mono"
          >
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold uppercase border border-white/15">
                MAYHEM
              </span>
              <span className="text-white">
                <strong>$wow</strong> just launched with Mayhem AI Agent
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowBanner(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <ContentLayout>
        {/* Main Section: Try your hand. Launch a coin */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          {/* Header Row */}
          <header className="lx-page-header border-b border-white/10 pb-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <h1 className="lx-page-title">
                  Try your hand. Launch a coin.
                </h1>
                <p className="lx-page-subtitle">
                  Name it, pick Auto or Manual, and the agent trades it for its first 24 hours.
                </p>
              </div>
              <div className="text-xs font-mono text-gray-400">
                <span className="text-white font-bold">6,577</span> coins minted in the last 24h.
              </div>
            </div>
          </header>

          {/* Form and Explanation Grid - Clean Fluid Layout without Heavy Container Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Launch Form (6 Cols) - Frameless layout */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <form onSubmit={handleLaunchCoin} className="space-y-5">
                {/* Top Row: Upload Image + Coin Name & Initial Buy */}
                <div className="flex gap-4">
                  {/* Upload Image Box */}
                  <div className="w-24 h-24 rounded-2xl bg-white/[0.03] border border-dashed border-white/20 flex items-center justify-center text-gray-400 hover:border-white/40 hover:text-white cursor-pointer transition-all shrink-0">
                    <ImageIcon size={26} />
                  </div>

                  {/* Inputs Right Side */}
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-3">
                      {/* Coin Name */}
                      <div className="flex-1">
                        <input
                          type="text"
                          value={coinName}
                          onChange={(e) => setCoinName(e.target.value)}
                          placeholder="Coin name"
                          className="w-full bg-white/[0.03] border border-white/10 focus:border-white/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-colors"
                          required
                        />
                      </div>
                      {/* Initial Buy */}
                      <div className="w-32">
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={initialBuy}
                            onChange={(e) => setInitialBuy(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 focus:border-white/30 rounded-xl pl-3 pr-10 py-2.5 text-xs font-mono text-white outline-none transition-colors"
                          />
                          <span className="absolute right-3 text-[10px] font-mono text-gray-400 font-bold">SOL</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-mono mt-1 text-right">Initial buy · min 0.06</p>
                      </div>
                    </div>

                    {/* $ TICKER */}
                    <div>
                      <input
                        type="text"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value)}
                        placeholder="$ TICKER"
                        className="w-full bg-white/[0.03] border border-white/10 focus:border-white/30 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-gray-500 outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* PAIR WITH */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-gray-400 mb-2">
                    PAIR WITH
                  </label>
                  <div className="flex gap-3">
                    <TogglePill
                      type="button"
                      $active={pairWith === 'SOL'}
                      onClick={() => setPairWith('SOL')}
                    >
                      SOL
                    </TogglePill>
                    <TogglePill
                      type="button"
                      $active={pairWith === 'USDC'}
                      onClick={() => setPairWith('USDC')}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-white/20 text-white text-[9px] font-bold flex items-center justify-center">$</span>
                      USDC
                    </TogglePill>
                  </div>
                </div>

                {/* AGENT TRIGGER MODE */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-gray-400 mb-2">
                    AGENT TRIGGER MODE
                  </label>
                  <div className="flex gap-3">
                    <TogglePill
                      type="button"
                      $active={triggerMode === 'Auto'}
                      onClick={() => setTriggerMode('Auto')}
                    >
                      <span className="text-white font-extrabold">•</span> Auto
                    </TogglePill>
                    <TogglePill
                      type="button"
                      $active={triggerMode === 'Manual'}
                      onClick={() => setTriggerMode('Manual')}
                    >
                      Manual
                    </TogglePill>
                  </div>
                </div>

                {/* Cycle length */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <span className="text-gray-400 font-mono">Cycle length</span>
                  <span className="font-mono text-white font-semibold">24h · auto-burns unused</span>
                </div>

                {/* Action Button */}
                <MonochromeLaunchButton type="submit" disabled={isLaunching}>
                  {isLaunching ? 'Launching with Mayhem…' : 'Launch with Mayhem'}
                </MonochromeLaunchButton>

                {/* Footnote */}
                <p className="text-[11px] text-gray-500 leading-normal">
                  Activity is <span className="italic underline">not guaranteed</span>. The agent decides per-coin based on engagement, capacity, and randomization.
                </p>
              </form>
            </div>

            {/* Right Column: Clean Feature Descriptions (6 Cols) - Fluid without outer boxed cards */}
            <div className="lg:col-span-6 space-y-6 lg:pl-6 lg:border-l lg:border-white/10 flex flex-col justify-between h-full">
              {/* Feature 1: Auto */}
              <div className="pb-5 border-b border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/15">
                    <RefreshCw size={17} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white font-['Outfit']">Auto</h3>
                    <p className="text-xs text-gray-400">The agent runs itself.</p>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-gray-300 pl-11">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 font-bold shrink-0 mt-0.5">•</span>
                    <span>Self-exciting trade cadence. The more you trade, the more activity from the agent.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 font-bold shrink-0 mt-0.5">•</span>
                    <span>The agent buys and sells at random, with different trade sizes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 font-bold shrink-0 mt-0.5">•</span>
                    <span>The agent trades for 24 hours as long as there&apos;s enough liquidity to keep it running.</span>
                  </li>
                </ul>
              </div>

              {/* Feature 2: Manual */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 text-gray-300 flex items-center justify-center shrink-0 border border-white/10">
                    <MousePointer size={17} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white font-['Outfit']">Manual</h3>
                    <p className="text-xs text-gray-400">You fire each trade.</p>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-gray-300 pl-11">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 font-bold shrink-0 mt-0.5">•</span>
                    <span>The agent only trades when prompted by the coin creator.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 font-bold shrink-0 mt-0.5">•</span>
                    <span>Same as Auto: trade direction and trade sizes are random.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 font-bold shrink-0 mt-0.5">•</span>
                    <span>Have the agent trade once, or not at all. It&apos;s up to you.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live Metrics Strip */}
        <div className="flex items-center gap-4 text-xs font-mono text-gray-400 py-3 mb-6 border-y border-white/10 flex-wrap">
          <span><strong className="text-white">58</strong> active coins</span>
          <span>·</span>
          <span><strong className="text-white">$3.9M</strong> agent vol 24h</span>
          <span>·</span>
          <span><strong className="text-white">6,577</strong> launched 24h</span>
          <span>·</span>
          <span><strong className="text-white">5,391</strong> traders 24h</span>
        </div>

        {/* Live Ticker Strip - Clean frameless strip */}
        <div className="py-2.5 px-3 rounded-xl bg-white/[0.02] border border-white/5 mb-8 flex items-center gap-3 overflow-x-auto text-xs font-mono">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white font-bold shrink-0 border border-white/15">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> LIVE
          </span>
          <div className="flex items-center gap-6 truncate text-gray-300">
            <span>BUY <strong className="text-white">AMA</strong> <span className="text-white">+0.04 SOL</span></span>
            <span>SELL <strong className="text-white">56DZ...pump</strong> <span className="text-white">+0.03 SOL</span></span>
            <span>BUY <strong className="text-white">JIBWAR</strong> <span className="text-gray-400">-0.02 SOL</span></span>
            <span>BUY <strong className="text-white">wow</strong> <span className="text-white">+0.01 SOL</span></span>
          </div>
        </div>

        {/* Top Mayhem Traders & Top Winning Coins - Clean Fluid Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Column 1: Top Mayhem Traders */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div>
                <h2 className="text-sm font-semibold text-white font-['Outfit']">Top mayhem traders</h2>
                <p className="text-[10px] text-gray-500 font-mono">Updated 5m ago</p>
              </div>
              <div className="flex gap-1 bg-white/5 p-1 rounded-full text-[11px] font-mono">
                <button type="button" className="px-2.5 py-0.5 rounded-full bg-white text-black font-semibold">24h</button>
                <button type="button" className="px-2.5 py-0.5 rounded-full text-gray-400 hover:text-white">7d</button>
              </div>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {MAYHEM_TRADERS.map((t) => (
                <div key={t.rank} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-white/[0.03] transition-all text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-bold w-4">{t.rank}</span>
                    <div className="w-7 h-7 rounded-full bg-white/10 text-white font-bold flex items-center justify-center text-[10px] border border-white/15">
                      {t.handle.charAt(1).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{t.handle}</p>
                      <p className="text-[10px] text-gray-500">{t.winRate} win</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-white font-bold">{t.profit24h}</p>
                      <p className="text-[10px] text-gray-500">{t.profit7d}</p>
                    </div>
                    <button type="button" className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors">
                      Follow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Top Winning Coins */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div>
                <h2 className="text-sm font-semibold text-white font-['Outfit']">Top winning coins</h2>
                <p className="text-[10px] text-gray-500 font-mono">Updated 5m ago</p>
              </div>
              <div className="flex gap-1 bg-white/5 p-1 rounded-full text-[11px] font-mono">
                <button type="button" className="px-2.5 py-0.5 rounded-full bg-white text-black font-semibold">24h</button>
                <button type="button" className="px-2.5 py-0.5 rounded-full text-gray-400 hover:text-white">7d</button>
              </div>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {WINNING_COINS.map((c) => (
                <div key={c.rank} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-white/[0.03] transition-all text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-bold w-4">{c.rank}</span>
                    <div>
                      <p className="text-white font-medium font-['Outfit']">{c.name} <span className="text-gray-400 font-mono text-[11px]">${c.symbol}</span></p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> {c.state} · Vol {c.volume}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{c.netInflow}</p>
                    <p className="text-[10px] text-gray-500">MC {c.marketCap}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mayhem Screener Table */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between pb-4 mb-2">
            <h2 className="text-base font-semibold text-white font-['Outfit']">Mayhem screener</h2>
            <div className="flex gap-2">
              {(['All', 'Active', 'Paused', 'Ended'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setScreenerFilter(tab)}
                  className={`px-3 py-1 rounded-full text-xs font-medium font-mono transition-all ${
                    screenerFilter === tab
                      ? 'bg-white text-black font-semibold'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-gray-500 border-b border-white/10">
                  <th className="pb-2">#</th>
                  <th className="pb-2">COIN</th>
                  <th className="pb-2">MCAP</th>
                  <th className="pb-2">VOLUME</th>
                  <th className="pb-2">STATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {SCREENER_COINS.map((sc) => (
                  <tr key={sc.rank} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 text-gray-500">{sc.rank}</td>
                    <td className="py-3">
                      <span className="text-white font-semibold">{sc.name}</span>
                      <span className="text-gray-500 ml-2">{sc.symbol}</span>
                    </td>
                    <td className="py-3 text-white">{sc.marketCap}</td>
                    <td className="py-3 text-white">{sc.volume}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white border border-white/15">
                        {sc.state}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ContentLayout>
    </PageContainer>
  );
}



'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  Clock,
  Layers,
  Zap,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderBookEntry {
  price: string;
  amount: string;
  total: string;
}

const BIDS: OrderBookEntry[] = [
  { price: '0.0731', amount: '14,200', total: '$1,038' },
  { price: '0.0730', amount: '8,500', total: '$620' },
  { price: '0.0728', amount: '22,100', total: '$1,608' },
  { price: '0.0725', amount: '45,000', total: '$3,262' },
  { price: '0.0720', amount: '110,000', total: '$7,920' },
];

const ASKS: OrderBookEntry[] = [
  { price: '0.0732', amount: '12,500', total: '$915' },
  { price: '0.0735', amount: '19,800', total: '$1,455' },
  { price: '0.0738', amount: '35,400', total: '$2,612' },
  { price: '0.0740', amount: '88,000', total: '$6,512' },
  { price: '0.0745', amount: '140,000', total: '$10,430' },
];

const RECENT_TRADES = [
  { time: '17:42:01', type: 'BUY', price: '0.0731', amount: '5,000 LXR', usd: '$365.50' },
  { time: '17:41:48', type: 'SELL', price: '0.0730', amount: '2,100 LXR', usd: '$153.30' },
  { time: '17:41:22', type: 'BUY', price: '0.0731', amount: '12,400 LXR', usd: '$906.44' },
  { time: '17:40:59', type: 'BUY', price: '0.0729', amount: '8,000 LXR', usd: '$583.20' },
];

const CHART_POINTS = [40, 44, 42, 48, 52, 50, 58, 63, 60, 68, 72, 70, 78];

const PageContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: #ededed;
  font-family: 'Montserrat', sans-serif;
  padding: 24px 32px 60px 32px;
  max-width: 1600px;
  margin: 0 auto;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export default function TerminalPage() {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5%');
  const [timeframe, setTimeframe] = useState('15m');
  const [isExecuting, setIsExecuting] = useState(false);

  const w = 700;
  const h = 220;
  const max = Math.max(...CHART_POINTS);
  const min = Math.min(...CHART_POINTS);
  const points = CHART_POINTS.map((v, i) => {
    const x = (i / (CHART_POINTS.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h;
    return `${x},${y}`;
  }).join(' ');

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      toast.success(`${side === 'buy' ? 'Bought' : 'Sold'} ${amount} SOL of LXR via Raydium AMM!`);
      setAmount('');
    }, 1200);
  };

  return (
    <PageContainer>
      <header className="lx-page-header">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="lx-page-title flex items-center gap-3">
              <BarChart2 size={26} className="text-white" /> Pro DEX Terminal
            </h1>
            <p className="lx-page-subtitle">
              Advanced trading view, live orderbook, and real-time execution engine for SPL tokens.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-full bg-white/10 text-white border border-white/15">
              Network: Solana Mainnet
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chart & Live Trades (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Chart Panel */}
          <div className="p-6 rounded-3xl bg-[#121214]/80 border border-white/10 backdrop-blur-xl space-y-4">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold font-['Outfit']">
                  LXR
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white font-['Outfit'] flex items-center gap-2">
                    LXR / SOL <span className="text-xs text-gray-400 font-mono">Raydium AMM V4</span>
                  </h2>
                  <p className="text-xs text-gray-400 font-mono">24h Vol: $48,210 · Liquidity: $145,280</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right font-mono">
                  <p className="text-xl font-bold text-white">$0.0731</p>
                  <p className="text-xs text-emerald-400 flex items-center gap-0.5 justify-end">
                    <ArrowUpRight size={13} /> +12.8% (24h)
                  </p>
                </div>

                {/* Timeframe selector */}
                <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 text-xs font-mono">
                  {(['5m', '15m', '1h', '4h', '1D'] as const).map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTimeframe(tf)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        timeframe === tf ? 'bg-white text-black font-semibold' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SVG Interactive Candlestick Sparkline */}
            <div className="relative py-4">
              <svg viewBox={`0 0 ${w} ${h}`} className="h-[220px] w-full" preserveAspectRatio="none">
                <polyline points={points} fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                <polygon points={`0,${h} ${points} ${w},${h}`} fill="url(#terminalGradient)" opacity="0.15" />
                <defs>
                  <linearGradient id="terminalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Terminal Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-3 border-t border-white/10">
              <div>
                <span className="text-gray-500 block">24h High</span>
                <span className="text-white font-bold text-sm">$0.0782</span>
              </div>
              <div>
                <span className="text-gray-500 block">24h Low</span>
                <span className="text-white font-bold text-sm">$0.0645</span>
              </div>
              <div>
                <span className="text-gray-500 block">Total Holders</span>
                <span className="text-white font-bold text-sm">312</span>
              </div>
              <div>
                <span className="text-gray-500 block">Pool State</span>
                <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                  <ShieldCheck size={14} /> Active / Verifed
                </span>
              </div>
            </div>
          </div>

          {/* Recent Trades Table */}
          <div className="p-6 rounded-3xl bg-[#121214]/80 border border-white/10 backdrop-blur-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono flex items-center gap-2">
              <Clock size={14} /> Recent Trades Feed
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-gray-500 border-b border-white/10 pb-2">
                    <th className="pb-2">TIME</th>
                    <th className="pb-2">TYPE</th>
                    <th className="pb-2">PRICE (USD)</th>
                    <th className="pb-2">AMOUNT</th>
                    <th className="pb-2 text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {RECENT_TRADES.map((tr, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 text-gray-400">{tr.time}</td>
                      <td className="py-2.5 font-bold">
                        <span className={tr.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>
                          {tr.type}
                        </span>
                      </td>
                      <td className="py-2.5 text-white">{tr.price}</td>
                      <td className="py-2.5 text-gray-300">{tr.amount}</td>
                      <td className="py-2.5 text-right font-bold text-white">{tr.usd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Order Book & Execution Form (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Execution Form Card */}
          <div className="p-6 rounded-3xl bg-[#121214]/80 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white font-['Outfit'] flex items-center gap-2">
                <Zap size={16} className="text-white" /> Quick Order
              </h3>
              <div className="flex items-center gap-1 text-[11px] font-mono text-gray-400">
                <span>Slippage:</span>
                {(['0.5%', '1%'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlippage(s)}
                    className={`px-2 py-0.5 rounded ${slippage === s ? 'bg-white/20 text-white' : 'hover:text-white'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Buy / Sell Toggle Pill */}
            <div className="flex gap-2 p-1 rounded-2xl bg-black/60 border border-white/10">
              <button
                type="button"
                onClick={() => setSide('buy')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold font-['Outfit'] transition-all ${
                  side === 'buy' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                Buy LXR
              </button>
              <button
                type="button"
                onClick={() => setSide('sell')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold font-['Outfit'] transition-all ${
                  side === 'sell' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                Sell LXR
              </button>
            </div>

            <form onSubmit={handleExecuteTrade} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1.5">
                  Amount (SOL)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00 SOL"
                  className="w-full bg-black/60 border border-white/15 rounded-2xl px-4 py-3 text-sm font-mono text-white placeholder-gray-500 outline-none focus:border-white/40"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isExecuting}
                className="w-full py-3.5 rounded-full bg-white hover:bg-gray-200 text-black font-bold font-['Outfit'] text-sm transition-all shadow-lg"
              >
                {isExecuting ? 'Executing Swap…' : side === 'buy' ? 'Execute Buy LXR' : 'Execute Sell LXR'}
              </button>
            </form>

            <p className="text-[11px] text-gray-500 leading-normal font-mono">
              Order connected to Raydium AMM V4 Liquidity engine with automated slippage protection.
            </p>
          </div>

          {/* Order Book */}
          <div className="p-6 rounded-3xl bg-[#121214]/80 border border-white/10 backdrop-blur-xl space-y-3 font-mono text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
              <span>Order Book</span>
              <span className="text-[10px] text-gray-500">Spread: 0.0001</span>
            </h3>

            {/* Asks (Sell Orders) */}
            <div className="space-y-1 text-[11px]">
              {ASKS.slice().reverse().map((a, idx) => (
                <div key={idx} className="flex justify-between items-center text-rose-400 hover:bg-white/[0.02] py-0.5 px-1 rounded">
                  <span>{a.price}</span>
                  <span className="text-gray-400">{a.amount}</span>
                  <span className="text-gray-300">{a.total}</span>
                </div>
              ))}
            </div>

            {/* Spread Divider */}
            <div className="py-1.5 border-y border-white/10 text-center text-white font-bold text-sm">
              $0.0731 <span className="text-[10px] text-emerald-400 font-normal">Last Trade</span>
            </div>

            {/* Bids (Buy Orders) */}
            <div className="space-y-1 text-[11px]">
              {BIDS.map((b, idx) => (
                <div key={idx} className="flex justify-between items-center text-emerald-400 hover:bg-white/[0.02] py-0.5 px-1 rounded">
                  <span>{b.price}</span>
                  <span className="text-gray-400">{b.amount}</span>
                  <span className="text-gray-300">{b.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}


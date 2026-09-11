'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { Radio, Play, Users, MessageSquare, Send, Sparkles, Activity, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface Stream {
  id: string;
  title: string;
  streamer: string;
  viewers: number;
  tokenSymbol: string;
  tokenName: string;
  marketCap: string;
  bgGradient: string;
}

const LIVE_STREAMS: Stream[] = [
  {
    id: 'stream_1',
    title: '$LXR ECOSYSTEM UTILITY & LIQUIDITY EXPANSION AMA',
    streamer: 'LuxorDev',
    viewers: 1420,
    tokenSymbol: 'LXR',
    tokenName: 'Luxor Token',
    marketCap: '$73.1M',
    bgGradient: 'from-white/10 to-black/90',
  },
  {
    id: 'stream_2',
    title: 'SOLANA ECOSYSTEM POS & LIQUIDITY POOL METRICS',
    streamer: 'SolanaLXR',
    viewers: 2890,
    tokenSymbol: 'SOL',
    tokenName: 'Solana',
    marketCap: '$78.4B',
    bgGradient: 'from-white/10 to-black/90',
  },
  {
    id: 'stream_3',
    title: 'MERCHANT USDC SETTLEMENT & PAYMENTS DEMO',
    streamer: 'PayOps',
    viewers: 940,
    tokenSymbol: 'USDC',
    tokenName: 'USD Coin',
    marketCap: '$34.2B',
    bgGradient: 'from-white/10 to-black/90',
  },
];

const PageContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: #ededed;
  font-family: 'Montserrat', sans-serif;
`;

const ContentLayout = styled.div`
  padding: 32px 40px 60px 40px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

export default function LivePage() {
  const [activeStream, setActiveStream] = useState<Stream>(LIVE_STREAMS[0]);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([
    'anon: LFG TO THE MOON 🚀',
    'solWhale: just ape 5 SOL in!',
    'trenchMaster: bonding curve at 84%',
  ]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setMessages((prev) => [...prev, `you: ${chatMessage.trim()}`]);
    setChatMessage('');
  };

  return (
    <PageContainer>
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title flex items-center gap-3">
            <Radio size={28} className="text-white" /> Live Token Streams
          </h1>
          <p className="lx-page-subtitle">
            Watch live developer streams, voice AMAs, and real-time token minting feeds.
          </p>
        </div>
      </header>

      <ContentLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Stream Container */}
          <div className="lg:col-span-2 space-y-4">
            <div
              className={`w-full aspect-video rounded-3xl bg-gradient-to-br ${activeStream.bgGradient} border border-white/15 relative flex flex-col items-center justify-center p-6 text-center overflow-hidden shadow-2xl`}
            >
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/20 backdrop-blur-md text-white text-xs font-bold font-mono px-3 py-1 rounded-full uppercase tracking-wider border border-white/20">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" /> LIVE
              </div>

              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-xs font-mono text-gray-300 px-3 py-1 rounded-full border border-white/10">
                <Users size={12} /> {activeStream.viewers.toLocaleString()} watching
              </div>

              <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mb-3 hover:scale-110 transition-transform cursor-pointer">
                <Play size={24} className="ml-1 text-white fill-white" />
              </div>

              <h2 className="text-lg font-semibold text-white font-['Outfit'] max-w-lg">
                {activeStream.title}
              </h2>
              <p className="text-xs text-gray-300 mt-1 font-mono">
                Streamer: @{activeStream.streamer} · Token: ${activeStream.tokenSymbol} ({activeStream.marketCap} MC)
              </p>
            </div>

            {/* Stream Grid Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {LIVE_STREAMS.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setActiveStream(s)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    activeStream.id === s.id
                      ? 'bg-white/15 border-white/30'
                      : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
                  }`}
                >
                  <p className="text-xs font-semibold text-white truncate font-['Outfit']">{s.title}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-1">
                    ${s.tokenSymbol} · {s.viewers} viewers
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Live Chat Sidebar */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-4 flex flex-col h-[480px]">
            <div className="pb-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-semibold text-white font-['Outfit'] flex items-center gap-1.5">
                <MessageSquare size={14} className="text-gray-300" /> Live Stream Chat
              </span>
              <span className="text-[10px] font-mono text-gray-300 font-semibold">Active</span>
            </div>

            <div className="flex-1 overflow-y-auto my-3 space-y-2 text-xs font-mono pr-1">
              {messages.map((m, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-gray-300">
                  {m}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="relative mt-auto">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Say something in stream chat…"
                className="w-full bg-black/60 border border-white/15 rounded-2xl pl-3 pr-10 py-2.5 text-xs text-white outline-none focus:border-white/40"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 text-gray-300 hover:text-white transition-colors"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </ContentLayout>
    </PageContainer>
  );
}


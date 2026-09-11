'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { Radio, Play, Users, MessageSquare, Send, ChevronRight, Eye, Sparkles } from 'lucide-react';
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

interface StreamCardItem {
  id: string;
  title: string;
  symbol: string;
  streamer: string;
  viewers: string;
  marketCap: string;
  imageUrl: string;
}

interface ClipItem {
  id: string;
  title: string;
  symbol: string;
  streamer: string;
  views: string;
  marketCap: string;
  imageUrl: string;
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

const MOST_VIEWERS: StreamCardItem[] = [
  { id: 'mv1', title: 'BaldDegen', symbol: 'BDG', streamer: 'balddegen', viewers: '102 viewers', marketCap: '$2.81K', imageUrl: 'https://picsum.photos/seed/bdg/300/180' },
  { id: 'mv2', title: 'Cope Cat', symbol: 'COPECAT', streamer: 'copecat', viewers: '70 viewers', marketCap: '$2.78K', imageUrl: 'https://picsum.photos/seed/copecat/300/180' },
  { id: 'mv3', title: 'Pump Mental Health', symbol: 'HOTLINE', streamer: 'hotline', viewers: '4 viewers', marketCap: '$10.9K', imageUrl: 'https://picsum.photos/seed/hotline/300/180' },
  { id: 'mv4', title: 'GTA VI Token', symbol: 'GTA6', streamer: 'gta6', viewers: '2 viewers', marketCap: '$2.81K', imageUrl: 'https://picsum.photos/seed/gta6/300/180' },
  { id: 'mv5', title: 'VOXIE Stream', symbol: 'VOXIE', streamer: 'voxie', viewers: '2 viewers', marketCap: '$62.0K', imageUrl: 'https://picsum.photos/seed/voxie/300/180' },
  { id: 'mv6', title: 'Stonk Wars', symbol: 'STONK', streamer: 'stonkWars', viewers: '1 viewer', marketCap: '$4.96K', imageUrl: 'https://picsum.photos/seed/stonkwars/300/180' },
];

const HIGHEST_MC: StreamCardItem[] = [
  { id: 'hm1', title: 'BULLENCIAGA', symbol: 'BULLEN', streamer: 'bullen', viewers: '45 viewers', marketCap: '$211K', imageUrl: 'https://picsum.photos/seed/bullen/300/180' },
  { id: 'hm2', title: 'VOXIE Pro', symbol: 'VOXIE', streamer: 'voxie', viewers: '18 viewers', marketCap: '$62.0K', imageUrl: 'https://picsum.photos/seed/voxie2/300/180' },
  { id: 'hm3', title: 'elchef Live', symbol: 'elchef', streamer: 'elchef', viewers: '12 viewers', marketCap: '$51.7K', imageUrl: 'https://picsum.photos/seed/elchef/300/180' },
  { id: 'hm4', title: 'PrivateDAO', symbol: 'PDAO', streamer: 'pdao', viewers: '8 viewers', marketCap: '$37.5K', imageUrl: 'https://picsum.photos/seed/pdao/300/180' },
  { id: 'hm5', title: 'Stuck to 5M', symbol: 'STUCK', streamer: 'stuck', viewers: '1 viewer', marketCap: '$32.8K', imageUrl: 'https://picsum.photos/seed/stuck/300/180' },
  { id: 'hm6', title: 'Hotline Solana', symbol: 'HOTLINE', streamer: 'hotline', viewers: '4 viewers', marketCap: '$10.9K', imageUrl: 'https://picsum.photos/seed/hotline2/300/180' },
];

const TRENDING_CLIPS: ClipItem[] = [
  { id: 'tc1', title: 'Snowball bot moving...', symbol: 'snowball', streamer: 'snowball', views: '243K views', marketCap: '$140K', imageUrl: 'https://picsum.photos/seed/snowball/300/180' },
  { id: 'tc2', title: 'Sheeeeeit AMA', symbol: 'Joker', streamer: 'joker', views: '223K views', marketCap: '$44.7K', imageUrl: 'https://picsum.photos/seed/joker/300/180' },
  { id: 'tc3', title: 'XerisCoin Pump', symbol: 'XERIS', streamer: 'xeris', views: '153K views', marketCap: '$3.14M', imageUrl: 'https://picsum.photos/seed/xeris/300/180' },
  { id: 'tc4', title: 'aman Sol Stream', symbol: 'SOL', streamer: 'aman', views: '122K views', marketCap: '$78.6K', imageUrl: 'https://picsum.photos/seed/aman/300/180' },
  { id: 'tc5', title: 'aceabase Clash', symbol: '$ACE', streamer: 'aceabase', views: '107K views', marketCap: '$2.36K', imageUrl: 'https://picsum.photos/seed/ace/300/180' },
  { id: 'tc6', title: 'grand Grandma Token', symbol: 'Grandma', streamer: 'grand', views: '104K views', marketCap: '$20.1K', imageUrl: 'https://picsum.photos/seed/grand/300/180' },
];

const POPULAR_PAST_STREAMS: ClipItem[] = [
  { id: 'ps1', title: 'Solana Dev Workshop', symbol: 'SOL', streamer: 'soldev', views: '89K views', marketCap: '$1.2M', imageUrl: 'https://picsum.photos/seed/past1/300/180' },
  { id: 'ps2', title: 'Meme Launch Party', symbol: 'MEME', streamer: 'memeking', views: '72K views', marketCap: '$540K', imageUrl: 'https://picsum.photos/seed/past2/300/180' },
  { id: 'ps3', title: 'Liquidity Pool Lock', symbol: 'LP', streamer: 'lplock', views: '64K views', marketCap: '$320K', imageUrl: 'https://picsum.photos/seed/past3/300/180' },
  { id: 'ps4', title: 'Tokenomics Q&A', symbol: 'LXR', streamer: 'luxor', views: '58K views', marketCap: '$73M', imageUrl: 'https://picsum.photos/seed/past4/300/180' },
  { id: 'ps5', title: 'Trading Competition', symbol: 'TRADE', streamer: 'trader', views: '49K views', marketCap: '$180K', imageUrl: 'https://picsum.photos/seed/past5/300/180' },
  { id: 'ps6', title: 'Multisig Governance', symbol: 'GOV', streamer: 'gov', views: '41K views', marketCap: '$950K', imageUrl: 'https://picsum.photos/seed/past6/300/180' },
];

const PageContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: #ededed;
  font-family: 'Montserrat', sans-serif;
`;

const ContentLayout = styled.div`
  padding: 24px 32px 60px 32px;
  max-width: 1700px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
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

  const handleSelectStreamCard = (card: StreamCardItem) => {
    setActiveStream({
      id: card.id,
      title: `${card.title.toUpperCase()} LIVE STREAM`,
      streamer: card.streamer,
      viewers: Number(card.viewers.split(' ')[0]) || 120,
      tokenSymbol: card.symbol,
      tokenName: card.title,
      marketCap: card.marketCap,
      bgGradient: 'from-white/10 to-black/90',
    });
    toast.success(`Switched to stream: ${card.title}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageContainer>
      {/* Upper Portal Header */}
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title flex items-center gap-3">
            <Radio size={28} className="text-white shrink-0" /> Live Token Streams
          </h1>
          <p className="lx-page-subtitle">
            Watch live developer streams, voice AMAs, and real-time token minting feeds.
          </p>
        </div>
      </header>

      <ContentLayout className="space-y-10">
        {/* 1 · Main Video Player & Live Chat Section */}
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

            {/* Stream Selector Pills */}
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

        {/* 2 · Unboxed Category Rows (Rule 10 Minimal Containers) */}
        
        {/* SECTION A: Most Viewers */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="font-['Outfit'] text-base font-bold text-white flex items-center gap-2">
              Most Viewers
            </h2>
            <button
              type="button"
              onClick={() => toast.info('Viewing all Most Viewers streams')}
              className="text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              Show all <ChevronRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {MOST_VIEWERS.map((card) => (
              <div
                key={card.id}
                onClick={() => handleSelectStreamCard(card)}
                className="group cursor-pointer space-y-2"
              >
                {/* Thumbnail */}
                <div className="aspect-video w-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative group-hover:border-white/30 transition-all">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  
                  {/* Live Badge */}
                  <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-white uppercase tracking-wider border border-white/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> LIVE
                  </div>

                  {/* Market Cap Badge */}
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold text-white border border-white/10">
                    {card.marketCap}
                  </div>

                  {/* Viewer Count overlay */}
                  <div className="absolute bottom-2 left-2 text-[10px] font-mono text-gray-200 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {card.viewers}
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-center gap-2 pt-0.5">
                  <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white shrink-0 font-mono">
                    {card.title.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-['Outfit'] text-xs font-semibold text-white truncate group-hover:text-gray-300 transition-colors">
                      {card.title}
                    </p>
                    <p className="text-[10px] font-mono text-gray-400 truncate">{card.symbol}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION B: Highest Market Cap */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="font-['Outfit'] text-base font-bold text-white flex items-center gap-2">
              Highest Market Cap
            </h2>
            <button
              type="button"
              onClick={() => toast.info('Viewing all Highest Market Cap streams')}
              className="text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              Show all <ChevronRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {HIGHEST_MC.map((card) => (
              <div
                key={card.id}
                onClick={() => handleSelectStreamCard(card)}
                className="group cursor-pointer space-y-2"
              >
                {/* Thumbnail */}
                <div className="aspect-video w-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative group-hover:border-white/30 transition-all">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  
                  {/* Live Badge */}
                  <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-white uppercase tracking-wider border border-white/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> LIVE
                  </div>

                  {/* Market Cap Badge */}
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold text-white border border-white/10">
                    {card.marketCap}
                  </div>

                  {/* Viewer Count overlay */}
                  <div className="absolute bottom-2 left-2 text-[10px] font-mono text-gray-200 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {card.viewers}
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-center gap-2 pt-0.5">
                  <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white shrink-0 font-mono">
                    {card.title.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-['Outfit'] text-xs font-semibold text-white truncate group-hover:text-gray-300 transition-colors">
                      {card.title}
                    </p>
                    <p className="text-[10px] font-mono text-gray-400 truncate">{card.symbol}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION C: Trending Clips */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="font-['Outfit'] text-base font-bold text-white flex items-center gap-2">
              Trending Clips
            </h2>
            <button
              type="button"
              onClick={() => toast.info('Viewing all Trending Clips')}
              className="text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              Show all <ChevronRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {TRENDING_CLIPS.map((clip) => (
              <div
                key={clip.id}
                onClick={() => toast.info(`Playing clip: ${clip.title}`)}
                className="group cursor-pointer space-y-2"
              >
                {/* Thumbnail */}
                <div className="aspect-video w-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative group-hover:border-white/30 transition-all">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={clip.imageUrl} alt={clip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />

                  {/* Market Cap Badge */}
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold text-white border border-white/10">
                    {clip.marketCap}
                  </div>

                  {/* Views Count overlay */}
                  <div className="absolute bottom-2 left-2 text-[10px] font-mono text-gray-200 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1">
                    <Eye size={10} /> {clip.views}
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-center gap-2 pt-0.5">
                  <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white shrink-0 font-mono">
                    {clip.streamer.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-['Outfit'] text-xs font-semibold text-white truncate group-hover:text-gray-300 transition-colors">
                      {clip.title}
                    </p>
                    <p className="text-[10px] font-mono text-gray-400 truncate">{clip.symbol}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION D: Popular Past Streams */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="font-['Outfit'] text-base font-bold text-white flex items-center gap-2">
              Popular Past Streams
            </h2>
            <button
              type="button"
              onClick={() => toast.info('Viewing all Popular Past Streams')}
              className="text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              Show all <ChevronRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {POPULAR_PAST_STREAMS.map((clip) => (
              <div
                key={clip.id}
                onClick={() => toast.info(`Playing past stream: ${clip.title}`)}
                className="group cursor-pointer space-y-2"
              >
                {/* Thumbnail */}
                <div className="aspect-video w-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative group-hover:border-white/30 transition-all">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={clip.imageUrl} alt={clip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />

                  {/* Market Cap Badge */}
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold text-white border border-white/10">
                    {clip.marketCap}
                  </div>

                  {/* Views Count overlay */}
                  <div className="absolute bottom-2 left-2 text-[10px] font-mono text-gray-200 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1">
                    <Eye size={10} /> {clip.views}
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-center gap-2 pt-0.5">
                  <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white shrink-0 font-mono">
                    {clip.streamer.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-['Outfit'] text-xs font-semibold text-white truncate group-hover:text-gray-300 transition-colors">
                      {clip.title}
                    </p>
                    <p className="text-[10px] font-mono text-gray-400 truncate">{clip.symbol}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </ContentLayout>
    </PageContainer>
  );
}

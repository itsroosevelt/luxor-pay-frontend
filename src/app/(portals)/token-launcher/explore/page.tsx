'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { ChevronDown, SlidersHorizontal, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';

interface ExploreCoin {
  id: string;
  name: string;
  symbol: string;
  marketCap: string;
  creator: string;
  timeAgo: string;
  description?: string;
  imageUrl: string;
  chartColor: string;
  chartPath: string; // SVG sparkline path
}

const EXPLORE_COINS: ExploreCoin[] = [
  {
    id: '1',
    name: 'LAPTOP',
    symbol: '$LAPTOP',
    marketCap: '$743K',
    creator: '0x71c0',
    timeAgo: '2h',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80',
    chartColor: '#10B981',
    chartPath: 'M 0 35 Q 40 25 80 30 T 160 15 T 240 5',
  },
  {
    id: '2',
    name: 'Anonymous Cat',
    symbol: '$ZCAT',
    marketCap: '$142M',
    creator: 'zendolphin',
    timeAgo: '7d',
    description: 'Anonymous Cat was launched on StonkFun.',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=80',
    chartColor: '#10B981',
    chartPath: 'M 0 40 Q 50 30 100 20 T 200 10 T 240 2',
  },
  {
    id: '3',
    name: 'ProPetro Holding Corp.',
    symbol: '$PUMP',
    marketCap: '$30.4K',
    creator: 'WoollyMang',
    timeAgo: '2m',
    description: 'https://x.com/zuckcooks/status/2097015253959651588',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80',
    chartColor: '#10B981',
    chartPath: 'M 0 38 Q 60 10 120 28 T 240 8',
  },
  {
    id: '4',
    name: 'Hunter Bison',
    symbol: '$Hunter',
    marketCap: '$42.5K',
    creator: '0xkgc',
    timeAgo: '18m',
    imageUrl: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=500&q=80',
    chartColor: '#10B981',
    chartPath: 'M 0 32 Q 40 38 80 20 T 160 18 T 240 4',
  },
  {
    id: '5',
    name: 'Golden Fries',
    symbol: '$FRIES',
    marketCap: '$210K',
    creator: 'frymaster',
    timeAgo: '1h',
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&q=80',
    chartColor: '#10B981',
    chartPath: 'M 0 35 Q 50 20 100 30 T 200 15 T 240 5',
  },
  {
    id: '6',
    name: 'Pepe Original',
    symbol: '$PEPE',
    marketCap: '$1.2M',
    creator: 'pepedev',
    timeAgo: '4h',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&q=80',
    chartColor: '#10B981',
    chartPath: 'M 0 42 Q 60 30 120 15 T 240 2',
  },
  {
    id: '7',
    name: 'Yellow Shrek',
    symbol: '$SHREK',
    marketCap: '$95K',
    creator: 'shrek99',
    timeAgo: '30m',
    imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=500&q=80',
    chartColor: '#10B981',
    chartPath: 'M 0 30 Q 50 40 100 20 T 200 10 T 240 4',
  },
  {
    id: '8',
    name: 'Bison Runner',
    symbol: '$BISON',
    marketCap: '$540K',
    creator: 'bisonboy',
    timeAgo: '5h',
    imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=500&q=80',
    chartColor: '#10B981',
    chartPath: 'M 0 38 Q 60 15 120 25 T 240 6',
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

const FilterPill = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 18px;
  border-radius: 9999px;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid ${(props) => (props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.12)')};
  background: ${(props) => (props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.04)')};
  color: ${(props) => (props.$active ? '#000000' : '#ffffff')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.08)')};
  }
`;

export default function ExploreCoinsPage() {
  const [activeCategory, setActiveCategory] = useState<'Movers' | 'Mayhem' | 'New' | 'Charities'>('Movers');
  const [quickBuyAmount, setQuickBuyAmount] = useState('0.5');

  const handleBuy = (coin: ExploreCoin) => {
    toast.success(`Quick Bought ${quickBuyAmount} SOL of ${coin.name} (${coin.symbol})`);
  };

  return (
    <PageContainer>
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title">Explore coins</h1>
          <p className="lx-page-subtitle">
            Discover new meme coins, top movers, and viral bonding curves.
          </p>
        </div>
      </header>

      <ContentLayout>
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Left Category Filter Tags - Minimal text-only pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <FilterPill
              $active={activeCategory === 'Movers'}
              onClick={() => setActiveCategory('Movers')}
            >
              Movers
            </FilterPill>
            <FilterPill
              $active={activeCategory === 'Mayhem'}
              onClick={() => setActiveCategory('Mayhem')}
            >
              Mayhem
            </FilterPill>
            <FilterPill
              $active={activeCategory === 'New'}
              onClick={() => setActiveCategory('New')}
            >
              New
            </FilterPill>
            <FilterPill
              $active={activeCategory === 'Charities'}
              onClick={() => setActiveCategory('Charities')}
            >
              Charities
            </FilterPill>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-['Outfit'] font-semibold text-gray-400 hover:text-white bg-white/5 border border-white/10"
            >
              More <ChevronDown size={14} />
            </button>
          </div>

          {/* Right Control Actions */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/15">
              <span className="text-gray-400">Quick buy</span>
              <input
                type="text"
                value={quickBuyAmount}
                onChange={(e) => setQuickBuyAmount(e.target.value)}
                className="w-10 bg-transparent text-white font-bold text-center outline-none border-b border-white/30"
              />
              <span className="text-white font-bold">SOL</span>
            </div>

            <button
              type="button"
              className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white"
              title="Filters"
            >
              <SlidersHorizontal size={14} />
            </button>
            <button
              type="button"
              className="p-2 rounded-full bg-white/5 border border-white/10 text-white"
              title="Grid View"
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>

        {/* 4-Column Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EXPLORE_COINS.map((coin) => (
            <div
              key={coin.id}
              onClick={() => handleBuy(coin)}
              className="group rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/25 overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Top Banner Image with Overlay Sparkline Chart */}
              <div className="relative h-48 bg-black/60 overflow-hidden">
                <img
                  src={coin.imageUrl}
                  alt={coin.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />

                {/* Overlaid Sparkline Chart */}
                <svg
                  className="absolute bottom-0 left-0 w-full h-12 pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                  viewBox="0 0 240 50"
                  preserveAspectRatio="none"
                >
                  <path
                    d={coin.chartPath}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeOpacity="0.9"
                  />
                </svg>
              </div>

              {/* Card Footer Details */}
              <div className="p-4 space-y-2">
                <div>
                  <h3 className="text-base font-semibold text-white font-['Outfit'] truncate">
                    {coin.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono font-medium">{coin.symbol}</p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-mono font-bold text-white">
                    {coin.marketCap} <span className="text-[10px] text-gray-400 font-normal">MC</span>
                  </span>
                </div>

                {coin.description && (
                  <p className="text-[11px] text-gray-400 truncate line-clamp-1">{coin.description}</p>
                )}

                <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono pt-1 border-t border-white/5">
                  <span className="truncate">@{coin.creator}</span>
                  <span>{coin.timeAgo} ago</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ContentLayout>
    </PageContainer>
  );
}



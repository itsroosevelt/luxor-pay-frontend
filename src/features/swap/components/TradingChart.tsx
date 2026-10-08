"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Layers } from 'lucide-react';

import { TokenIcon } from '@/components/ui/VectorTokenIcon';

const ChartCard = styled.div`
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PairBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 15px;
  color: #FFFFFF;
`;

const IconGroup = styled.div`
  display: flex;
  align-items: center;

  svg:first-child {
    z-index: 2;
  }
  svg:last-child {
    margin-left: -6px;
    z-index: 1;
  }
`;

const StatsRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 20px;
  flex-wrap: wrap;
`;

const BigPrice = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 600;
  color: #FFFFFF;
  letter-spacing: -0.02em;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  .label {
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.45);
  }
  .value {
    font-family: monospace;
    font-size: 13px;
    font-weight: 500;
    color: #FFFFFF;
  }
  .negative {
    color: #F87171;
  }
`;

const TimeframeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TimeframeBtn = styled.button<{ $active?: boolean }>`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.25)' : 'transparent')};
  background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)')};
  cursor: pointer;
  transition: all 0.16s ease;

  &:hover {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.06);
  }
`;

const SvgContainer = styled.div`
  width: 100%;
  height: 200px;
  position: relative;
`;

const OrdersSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
`;

const OrdersTabs = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 8px;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  background: none;
  border: none;
  color: ${({ $active }) => ($active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)')};
  cursor: pointer;
  position: relative;
  padding-bottom: 4px;
  transition: color 0.16s ease;

  ${({ $active }) =>
    $active &&
    `
    &::after {
      content: '';
      position: absolute;
      bottom: -9px;
      left: 0;
      right: 0;
      height: 2px;
      background: #FFFFFF;
      border-radius: 9999px;
    }
  `}

  &:hover {
    color: #FFFFFF;
  }
`;

const EmptyOrdersCard = styled.div`
  background: transparent;
  border: none;
  padding: 30px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  min-height: 160px;
`;

export function TradingChart() {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [ordersTab, setOrdersTab] = useState<'open' | 'history'>('open');

  return (
    <div className="space-y-6 w-full">
      <ChartCard>
        {/* Header */}
        <HeaderRow>
          <PairBadge>
            <IconGroup>
              <TokenIcon symbol="SOL" size={22} />
              <TokenIcon symbol="USDC" size={22} />
            </IconGroup>
            SOL-USDC
          </PairBadge>
          <button
            type="button"
            className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            title="Expand chart"
          >
            <Maximize2 size={15} />
          </button>
        </HeaderRow>

        {/* Stats */}
        <div>
          <BigPrice>$168.42</BigPrice>
          <StatsRow className="mt-2">
            <StatItem>
              <span className="label">24h change</span>
              <span className="value positive">+2.47%</span>
            </StatItem>
            <StatItem>
              <span className="label">24h High</span>
              <span className="value">$172.50</span>
            </StatItem>
            <StatItem>
              <span className="label">24h Low</span>
              <span className="value">$164.10</span>
            </StatItem>
          </StatsRow>
        </div>

        {/* Timeframe Selectors */}
        <TimeframeRow>
          {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
            <TimeframeBtn
              key={tf}
              $active={timeframe === tf}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </TimeframeBtn>
          ))}
        </TimeframeRow>

        {/* Dynamic SVG Price Chart */}
        <SvgContainer>
          <svg width="100%" height="100%" viewBox="0 0 500 180" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

            {/* Price values left axis */}
            <text x="5" y="32" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">104.67</text>
            <text x="5" y="65" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">103.73</text>
            <text x="5" y="100" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">102.80</text>
            <text x="5" y="135" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">101.87</text>

            {/* Chart Area Fill */}
            <path
              d="M 50 40 
                 L 80 85 L 110 50 L 140 70 L 170 45 L 200 65 L 230 40 L 250 110 
                 L 270 95 L 290 120 L 320 100 L 350 115 L 380 90 L 410 115 L 440 100 L 480 125
                 L 480 160 L 50 160 Z"
              fill="url(#chartGradient)"
            />

            {/* Chart Line Path matching image curve */}
            <path
              d="M 50 40 
                 L 80 85 L 110 50 L 140 70 L 170 45 L 200 65 L 230 40 L 250 110 
                 L 270 95 L 290 120 L 320 100 L 350 115 L 380 90 L 410 115 L 440 100 L 480 125"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Time axis labels */}
          <div className="flex justify-between px-10 mt-1 text-[11px] font-mono text-white/40">
            <span>18:00</span>
            <span>21:00</span>
            <span>00:00</span>
            <span>03:00</span>
            <span>06:00</span>
            <span>09:00</span>
            <span>12:00</span>
            <span>15:00</span>
          </div>
        </SvgContainer>
      </ChartCard>

      {/* Orders Section */}
      <OrdersSection>
        <OrdersTabs>
          <TabButton
            $active={ordersTab === 'open'}
            onClick={() => setOrdersTab('open')}
          >
            Open Orders
          </TabButton>
          <TabButton
            $active={ordersTab === 'history'}
            onClick={() => setOrdersTab('history')}
          >
            Order History
          </TabButton>
        </OrdersTabs>

        <AnimatePresence mode="wait">
          {ordersTab === 'open' ? (
            <motion.div
              key="open"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <EmptyOrdersCard>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                  <Layers size={22} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">No open limit orders</p>
                  <p className="text-xs text-white/40 mt-1">Your active limit orders will appear here when submitted.</p>
                </div>
              </EmptyOrdersCard>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <EmptyOrdersCard>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                  <Layers size={22} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">No order history</p>
                  <p className="text-xs text-white/40 mt-1">Executed and cancelled limit orders will be listed here.</p>
                </div>
              </EmptyOrdersCard>
            </motion.div>
          )}
        </AnimatePresence>
      </OrdersSection>
    </div>
  );
}

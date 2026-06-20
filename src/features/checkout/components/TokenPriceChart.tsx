'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { theme } from '@/styles/theme';

interface TokenPriceChartProps {
  currency: 'SOL' | 'USDC';
}

type Timeframe = '1D' | '1W' | '1M' | '1Y';

// Mock price history generator
function generateMockHistory(currency: 'SOL' | 'USDC', timeframe: Timeframe): { points: number[]; dates: string[] } {
  const pointsCount = 30;
  const points: number[] = [];
  const dates: string[] = [];
  
  let basePrice = currency === 'SOL' ? 145.24 : 1.0;
  let volatility = currency === 'SOL' ? 0.015 : 0.0004;

  const now = new Date();

  for (let i = pointsCount - 1; i >= 0; i--) {
    let dateStr = '';
    const diff = new Date(now);
    
    switch (timeframe) {
      case '1D':
        diff.setHours(now.getHours() - i);
        dateStr = diff.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        break;
      case '1W':
        diff.setDate(now.getDate() - i);
        dateStr = diff.toLocaleDateString('es-ES', { weekday: 'short' });
        break;
      case '1M':
        diff.setDate(now.getDate() - i);
        dateStr = diff.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        break;
      case '1Y':
        diff.setMonth(now.getMonth() - i);
        dateStr = diff.toLocaleDateString('es-ES', { month: 'short' });
        break;
    }
    dates.push(dateStr);

    // Random walk with drift
    const factor = i / pointsCount; // make it trend upwards towards the end
    const change = basePrice * volatility * (Math.random() - 0.45 + factor * 0.1);
    basePrice = currency === 'SOL' 
      ? Math.max(10, basePrice - change)
      : Math.min(1.002, Math.max(0.998, basePrice - change));
    points.push(basePrice);
  }

  // Ensure last point is exactly the current base price
  points[points.length - 1] = currency === 'SOL' ? 145.24 : 1.0;

  return { points, dates };
}

export function TokenPriceChart({ currency }: TokenPriceChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'network'>('orders');
  
  // Real-time price fluctuations
  const [livePrice, setLivePrice] = useState(currency === 'SOL' ? 145.24 : 1.0);
  const [priceChange24h, setPriceChange24h] = useState(currency === 'SOL' ? 3.42 : 0.02);

  // Generate history based on currency and timeframe
  const history = useMemo(() => generateMockHistory(currency, timeframe), [currency, timeframe]);

  // Dynamic live fluctuations
  useEffect(() => {
    setLivePrice(currency === 'SOL' ? 145.24 : 1.0);
    setPriceChange24h(currency === 'SOL' ? 3.42 : 0.02);

    const interval = setInterval(() => {
      setLivePrice((prev) => {
        const delta = currency === 'SOL' 
          ? (Math.random() - 0.5) * 0.28
          : (Math.random() - 0.5) * 0.0002;
        const nextPrice = Number((prev + delta).toFixed(currency === 'SOL' ? 2 : 4));
        
        // Simular cambio porcentual acorde
        setPriceChange24h((c) => {
          const deltaPct = (delta / prev) * 100;
          return Number((c + deltaPct).toFixed(2));
        });

        return nextPrice;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currency]);

  // SVG Calculations
  const width = 500;
  const height = 180;
  const padding = 15;

  const minVal = Math.min(...history.points);
  const maxVal = Math.max(...history.points);
  const valRange = maxVal - minVal || 1;

  const svgPoints = useMemo(() => {
    return history.points.map((val, idx) => {
      const x = padding + (idx / (history.points.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - minVal) / valRange) * (height - padding * 2);
      return { x, y, value: val, date: history.dates[idx] };
    });
  }, [history, minVal, maxVal, valRange]);

  const pathD = useMemo(() => {
    if (svgPoints.length === 0) return '';
    return svgPoints.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');
  }, [svgPoints]);

  const fillD = useMemo(() => {
    if (svgPoints.length === 0) return '';
    return `${pathD} L ${svgPoints[svgPoints.length - 1].x} ${height} L ${svgPoints[0].x} ${height} Z`;
  }, [svgPoints, pathD]);

  const currentPrice = hoverIndex !== null ? svgPoints[hoverIndex].value : livePrice;
  const currentDate = hoverIndex !== null ? svgPoints[hoverIndex].date : 'Ahora';

  // Mock Solana transactions for the orders tab
  const mockTransactions = useMemo(() => {
    return [
      { signature: '3xG4...8nKy', type: 'Transfer', amount: currency === 'SOL' ? '0.24 SOL' : '35.00 USDC', time: 'Hace 1 min', status: 'success' },
      { signature: '5vP2...9LmX', type: 'Payment', amount: currency === 'SOL' ? '1.50 SOL' : '218.15 USDC', time: 'Hace 4 min', status: 'success' },
      { signature: '8zN9...1RtW', type: 'Approve', amount: '--', time: 'Hace 12 min', status: 'success' },
    ];
  }, [currency]);

  return (
    <Container
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
    >
      <Header>
        <TokenInfo>
          <TokenBadge $currency={currency}>
            {currency === 'SOL' ? 'SOL' : 'USDC'}
          </TokenBadge>
          <PairName>{currency === 'SOL' ? 'SOL-USD' : 'USDC-USD'}</PairName>
        </TokenInfo>
        <TimeframeSelector>
          {(['1D', '1W', '1M', '1Y'] as const).map((t) => (
            <TimeButton
              key={t}
              $active={timeframe === t}
              onClick={() => { setTimeframe(t); setHoverIndex(null); }}
            >
              {t}
            </TimeButton>
          ))}
        </TimeframeSelector>
      </Header>

      <PriceSection>
        <PriceContainer>
          <PriceLabel>
            {currency === 'SOL' 
              ? `$${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : `$${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`
            }
          </PriceLabel>
          <ChangeBadge $positive={priceChange24h >= 0}>
            {priceChange24h >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(priceChange24h).toFixed(2)}% (24h)</span>
          </ChangeBadge>
        </PriceContainer>
        <DateIndicator>{currentDate}</DateIndicator>
      </PriceSection>

      <ChartWrapper>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={currency === 'SOL' ? 'rgba(20, 241, 149, 0.25)' : 'rgba(37, 99, 235, 0.25)'} />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((ratio, i) => (
            <line
              key={i}
              x1={padding}
              y1={height * ratio}
              x2={width - padding}
              y2={height * ratio}
              stroke="rgba(255, 255, 255, 0.03)"
              strokeDasharray="4 4"
            />
          ))}

          {/* Area Fill */}
          <path d={fillD} fill="url(#chartGradient)" />

          {/* Sparkline Path */}
          <motion.path
            d={pathD}
            fill="none"
            stroke={currency === 'SOL' ? '#14f195' : '#60a5fa'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.0, ease: 'easeInOut' }}
          />

          {/* Hover Tracker line & point */}
          {hoverIndex !== null && svgPoints[hoverIndex] && (
            <>
              <line
                x1={svgPoints[hoverIndex].x}
                y1={padding}
                x2={svgPoints[hoverIndex].x}
                y2={height - padding}
                stroke="rgba(255, 255, 255, 0.15)"
                strokeDasharray="2 2"
              />
              <circle
                cx={svgPoints[hoverIndex].x}
                cy={svgPoints[hoverIndex].y}
                r="6"
                fill={currency === 'SOL' ? '#14f195' : '#60a5fa'}
                stroke="#0A0A0A"
                strokeWidth="2"
              />
            </>
          )}

          {/* Invisible interactive zones for hovering */}
          {svgPoints.map((p, idx) => {
            const stepWidth = (width - padding * 2) / (svgPoints.length - 1);
            return (
              <rect
                key={idx}
                x={p.x - stepWidth / 2}
                y={0}
                width={stepWidth}
                height={height}
                fill="transparent"
                style={{ cursor: 'crosshair' }}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            );
          })}
        </svg>
      </ChartWrapper>

      {/* Tabs list similar to Squads */}
      <TabsList>
        <TabButton $active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>
          Transacciones
        </TabButton>
        <TabButton $active={activeTab === 'network'} onClick={() => setActiveTab('network')}>
          Detalles de Red
        </TabButton>
      </TabsList>

      <TabContent>
        {activeTab === 'orders' ? (
          <TxList>
            {mockTransactions.map((tx, idx) => (
              <TxItem key={idx}>
                <TxMeta>
                  <CheckCircle2 size={13} className="text-[#14f195] shrink-0" />
                  <TxType>{tx.type}</TxType>
                  <TxHash>{tx.signature}</TxHash>
                </TxMeta>
                <TxValue>
                  <TxAmount>{tx.amount}</TxAmount>
                  <TxTime>{tx.time}</TxTime>
                </TxValue>
              </TxItem>
            ))}
          </TxList>
        ) : (
          <NetworkDetails>
            <DetailRow>
              <DetailLabel>Blockchain</DetailLabel>
              <DetailVal className="font-mono">Solana Mainnet</DetailVal>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Estado de Red</DetailLabel>
              <DetailVal className="text-[#14f195] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14f195] animate-ping" />
                Operativo
              </DetailVal>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Comisión Promedio</DetailLabel>
              <DetailVal className="font-mono">&lt; 0.00005 SOL (~$0.007)</DetailVal>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Seguridad</DetailLabel>
              <DetailVal className="flex items-center gap-1 text-[11px] text-[var(--dash-muted)]">
                <ShieldCheck size={12} className="text-[#14f195]" /> Multi-sign
              </DetailVal>
            </DetailRow>
          </NetworkDetails>
        )}
      </TabContent>
    </Container>
  );
}

// Styled Components complying with design tokens
const Container = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 480px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);

  @media (max-width: 1024px) {
    min-height: auto;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
`;

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const TokenBadge = styled.span<{ $currency: string }>`
  font-family: ${theme.fonts.heading};
  font-size: 11px;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  color: #ffffff;
  background: ${({ $currency }) => $currency === 'SOL' ? '#14f195' : '#2563EB'};
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
`;

const PairName = styled.span`
  font-family: ${theme.fonts.heading};
  font-size: 15px;
  font-weight: 500;
  color: #ffffff;
`;

const TimeframeSelector = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px;
  border-radius: 8px;
`;

const TimeButton = styled.button<{ $active: boolean }>`
  font-family: ${theme.fonts.heading};
  font-size: 11px;
  font-weight: 500;
  color: ${({ $active }) => $active ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'};
  background: ${({ $active }) => $active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border: none;
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
  }
`;

const PriceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const PriceLabel = styled.h2`
  font-family: ${theme.fonts.heading};
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -0.8px;
  color: #ffffff;
  margin: 0;
`;

const ChangeBadge = styled.span<{ $positive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-family: ${theme.fonts.body};
  font-size: 12px;
  font-weight: 500;
  color: ${({ $positive }) => $positive ? '#14f195' : '#ef4444'};
  background: ${({ $positive }) => $positive ? 'rgba(20, 241, 149, 0.08)' : 'rgba(239, 68, 68, 0.08)'};
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
`;

const DateIndicator = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
`;

const ChartWrapper = styled.div`
  height: 180px;
  width: 100%;
  margin-bottom: 1.5rem;
  position: relative;
`;

const TabsList = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  gap: 1rem;
  margin-bottom: 1rem;
`;

const TabButton = styled.button<{ $active: boolean }>`
  font-family: ${theme.fonts.heading};
  font-size: 13px;
  font-weight: 500;
  color: ${({ $active }) => $active ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'};
  background: transparent;
  border: none;
  border-bottom: 2px solid ${({ $active }) => $active ? '#60A5FA' : 'transparent'};
  padding: 0.5rem 0;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: -1px;

  &:hover {
    color: #ffffff;
  }
`;

const TabContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 120px;
`;

const TxList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TxItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 0.85rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
`;

const TxMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
`;

const TxType = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
`;

const TxHash = styled.span`
  font-family: ${theme.fonts.mono};
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.04);
  padding: 0.15rem 0.35rem;
  border-radius: 4px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 80px;
`;

const TxValue = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
`;

const TxAmount = styled.span`
  font-family: ${theme.fonts.mono};
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
`;

const TxTime = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
`;

const NetworkDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.04);

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
`;

const DetailVal = styled.span`
  font-family: ${theme.fonts.heading};
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
`;

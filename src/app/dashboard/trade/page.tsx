'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchant-data';
import { useGetBalance } from '@/hooks/useGetBalance';
import { toast } from 'sonner';
import {
  ChevronDown,
  Info,
  CheckCircle2,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Maximize2
} from 'lucide-react';

// --- Styled Components ---

const Container = styled.div`
  padding: 16px;
  max-width: 1400px;
  margin: 0 auto;
  space-y: 24px;
  color: #EDEDED;
  font-family: 'Montserrat', sans-serif;

  @media (min-width: 768px) {
    padding: 24px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  color: #FFFFFF;
  letter-spacing: -1px;
  margin: 0;
`;

const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1.2fr) minmax(280px, 1fr);
  }
`;

const GlassCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(40px);
  border-radius: 40px;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.6);
  padding: 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at top left, rgba(37, 99, 235, 0.1), transparent 55%);
    pointer-events: none;
    z-index: 0;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 24px;
  padding-bottom: 12px;
  position: relative;
  z-index: 1;
`;

const TabList = styled.div`
  display: flex;
  gap: 16px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: ${({ $active }) => ($active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)')};
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  position: relative;
  transition: color 0.2s ease;

  &:hover {
    color: #FFFFFF;
  }

  ${({ $active }) =>
    $active &&
    `
    &::after {
      content: '';
      position: absolute;
      bottom: -13px;
      left: 0;
      right: 0;
      height: 2px;
      background: #60A5FA;
    }
  `}
`;

const StepsBadge = styled.span`
  font-family: monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 1;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.05em;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BalanceTrigger = styled.button`
  font-family: monospace;
  font-size: 12px;
  color: #60A5FA;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    text-decoration: underline;
  }
`;

const CustomSelectWrapper = styled.div`
  position: relative;
  width: 120px;
`;

const SelectTrigger = styled.button`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 10px 14px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const SelectMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  width: 120px;
  background: #0f0f12;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  overflow: hidden;
  z-index: 50;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
`;

const SelectOption = styled.button`
  width: 100%;
  padding: 10px 14px;
  color: #EDEDED;
  background: transparent;
  border: none;
  text-align: left;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #FFFFFF;
  }
`;

const SwapInputContainer = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  &:focus-within {
    border-color: #60A5FA;
  }
`;

const NumericInput = styled.input`
  background: transparent;
  border: none;
  color: #FFFFFF;
  font-family: monospace;
  font-size: 28px;
  font-weight: 500;
  width: 100%;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }
`;

const UsdEstimate = styled.p`
  font-family: monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin: 4px 0 0 0;
`;

const SwapDivider = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: -10px 0;
  position: relative;
  z-index: 10;
`;

const SwapCircleButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: #222225;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #60A5FA;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #2d2d31;
    color: #FFFFFF;
    transform: scale(1.1);
  }
`;

const DropdownTrigger = styled.button`
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 14px 18px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.02);
  }
`;

const Disclaimer = styled.div`
  display: flex;
  gap: 10px;
  background: rgba(37, 99, 235, 0.06);
  border: 1px solid rgba(37, 99, 235, 0.15);
  border-radius: 16px;
  padding: 12px 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
`;

const PrimaryButton = styled.button`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  border-radius: 9999px;
  padding: 16px;
  width: 100%;
  background: #FFFFFF;
  color: #000000;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: #60A5FA;
    color: #FFFFFF;
    box-shadow: 0 0 20px rgba(96, 165, 250, 0.4);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// --- Chart Related Styled Components ---

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const PairTitle = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PriceText = styled.p`
  font-family: monospace;
  font-size: 32px;
  font-weight: 700;
  color: #FFFFFF;
  margin: 6px 0;
  letter-spacing: -0.5px;
`;

const MetricBadge = styled.span<{ $negative?: boolean }>`
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  background: ${({ $negative }) => ($negative ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)')};
  color: ${({ $negative }) => ($negative ? '#F87171' : '#34D399')};
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const MetricRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 8px;

  span {
    color: #FFFFFF;
    font-family: monospace;
  }
`;

const TimeframeContainer = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
`;

const TimeButton = styled.button<{ $active: boolean }>`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.08)' : 'transparent')};
  border: 1px solid ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.15)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)')};

  &:hover {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.05);
  }
`;

const SVGWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 240px;
  margin: 10px 0;
`;

const OrdersTabs = styled.div`
  display: flex;
  gap: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 32px;
  padding-bottom: 10px;
`;

const OrdersTabButton = styled.button<{ $active: boolean }>`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ $active }) => ($active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)')};
  position: relative;
  padding: 4px 0;

  ${({ $active }) =>
    $active &&
    `
    &::after {
      content: '';
      position: absolute;
      bottom: -11px;
      left: 0;
      right: 0;
      height: 2px;
      background: #FFFFFF;
    }
  `}
`;

const EmptyStateIllustration = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.35);

  svg {
    opacity: 0.25;
    margin-bottom: 12px;
  }

  p {
    font-size: 13px;
    margin: 4px 0 0 0;
  }
`;

// --- Wallet signing modal simulated components ---

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  items-center: center;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled(motion.div)`
  background: #0f0f12;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 30px;
  width: 90%;
  max-width: 440px;
  padding: 32px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  text-align: center;
  position: relative;
  z-index: 110;
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const LoadingSpinner = styled(Loader2)`
  animation: ${rotate} 2s linear infinite;
  color: #60A5FA;
  margin: 0 auto 20px auto;
`;

// --- SVG Logos and Illustrations ---

const SolanaLogo = () => (
  <svg width="18" height="18" viewBox="0 0 397 311" fill="none" style={{ flexShrink: 0 }}>
    <path d="M64.6 237.9c-2.4-2.4-5.7-3.8-9.2-3.8H4.8c-2.9 0-4.8 2.9-3.8 5.7l23.1 57c2.4 2.4 5.7 3.8 9.2 3.8h50.6c2.9 0 4.8-2.9 3.8-5.7l-23.1-57z" fill="#9945FF"/>
    <path d="M332.4 73.1c2.4 2.4 5.7 3.8 9.2 3.8h50.6c2.9 0 4.8-2.9 3.8-5.7L363 14.2c-2.4-2.4-5.7-3.8-9.2-3.8H303.2c-2.9 0-4.8 2.9-3.8 5.7l23.1 57.0z" fill="#14F195"/>
    <path d="M23.1 129.2c-2.4-2.4-5.7-3.8-9.2-3.8H4.8c-2.9 0-4.8 2.9-3.8 5.7l23.1 57c2.4 2.4 5.7 3.8 9.2 3.8h50.6c2.9 0 4.8-2.9 3.8-5.7l-23.1-57z" fill="url(#solana-grad)"/>
    <defs>
      <linearGradient id="solana-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#9945FF" />
        <stop offset="100%" stopColor="#14F195" />
      </linearGradient>
    </defs>
  </svg>
);

const UsdcLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" fill="#2775CA" />
    <text x="12" y="16.5" fill="white" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">$</text>
  </svg>
);

const LxrLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" fill="url(#lxrGrad)" />
    <text x="12" y="16" fill="black" fontSize="11" fontWeight="bold" textAnchor="middle">L</text>
    <defs>
      <linearGradient id="lxrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
    </defs>
  </svg>
);

const CandlestickIllustration = () => (
  <svg width="180" height="100" viewBox="0 0 180 100" fill="none" style={{ opacity: 0.3, marginBottom: '16px' }}>
    {/* Candlestick 1 */}
    <line x1="30" y1="25" x2="30" y2="85" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
    <rect x="26" y="40" width="8" height="30" rx="2" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
    
    {/* Candlestick 2 */}
    <line x1="60" y1="15" x2="60" y2="95" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
    <rect x="56" y="30" width="8" height="45" rx="2" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
    
    {/* Candlestick 3 (active style) */}
    <line x1="90" y1="5" x2="90" y2="85" stroke="#60A5FA" strokeWidth="1.5" style={{ opacity: 0.8 }} />
    <rect x="86" y="15" width="8" height="50" rx="2" fill="rgba(96,165,250,0.12)" stroke="#60A5FA" strokeWidth="1.5" style={{ opacity: 0.8 }} />
    
    {/* Candlestick 4 */}
    <line x1="120" y1="35" x2="120" y2="90" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
    <rect x="116" y="50" width="8" height="30" rx="2" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

    {/* Candlestick 5 */}
    <line x1="150" y1="20" x2="150" y2="75" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
    <rect x="146" y="35" width="8" height="25" rx="2" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
    
    {/* Check overlay circle */}
    <circle cx="90" cy="40" r="14" fill="#0F0F12" stroke="#60A5FA" strokeWidth="1.5" />
    <path d="M86 40l3 3 5-5" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// --- Component ---

export default function TradePage() {
  const [activeTab, setActiveTab] = useState<'limit' | 'swap' | 'dca'>('limit');
  const [merchantProfile, setMerchantProfile] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Get dynamic balance using useGetBalance hook
  const { data: balanceData, isLoading: balanceLoading } = useGetBalance(walletAddress);

  // Form states
  const [sellToken, setSellToken] = useState<'SOL' | 'USDC' | 'LXR'>('SOL');
  const [buyToken, setBuyToken] = useState<'SOL' | 'USDC' | 'LXR'>('USDC');
  const [sellAmount, setSellAmount] = useState<string>('0');
  const [limitPrice, setLimitPrice] = useState<string>('68.851620');
  const [expiry, setExpiry] = useState<string>('Never');

  // Custom Select states
  const [sellSelectOpen, setSellSelectOpen] = useState(false);
  const [buySelectOpen, setBuySelectOpen] = useState(false);
  const [expiryOpen, setExpiryOpen] = useState(false);

  // Chart States
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [chartPrice, setChartPrice] = useState<number>(68.87);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; price: number; label: string } | null>(null);
  const [ordersTab, setOrdersTab] = useState<'open' | 'history'>('open');

  // Simulation steps: 1 = Form, 2 = Awaiting signature, 3 = Processing tx, 4 = Success, 5 = Error
  const [txStep, setTxStep] = useState<number>(1);
  const [txError, setTxError] = useState<string>('');

  // Fetch Merchant profile on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const profile = await getMerchantProfile(user.uid);
        setMerchantProfile(profile);
        setWalletAddress(profile?.merchantWallet || null);
      } catch (err) {
        console.error(err);
      }
    });
    return () => unsubscribe();
  }, []);

  // Update sell/buy tokens when they collide
  const handleSelectSell = (tok: 'SOL' | 'USDC' | 'LXR') => {
    setSellToken(tok);
    if (tok === buyToken) {
      setBuyToken(tok === 'SOL' ? 'USDC' : 'SOL');
    }
    setSellSelectOpen(false);
  };

  const handleSelectBuy = (tok: 'SOL' | 'USDC' | 'LXR') => {
    setBuyToken(tok);
    if (tok === sellToken) {
      setSellToken(tok === 'SOL' ? 'USDC' : 'SOL');
    }
    setBuySelectOpen(false);
  };

  const handleSwapTokens = () => {
    const temp = sellToken;
    setSellToken(buyToken);
    setBuyToken(temp);
  };

  // Prices approximation matching screenshot's SOL price of $68.87
  const tokenPrices = {
    SOL: 68.87,
    USDC: 1.0,
    LXR: 3.5
  };

  const sellPrice = tokenPrices[sellToken];
  const buyPrice = tokenPrices[buyToken];

  // Dynamic price calculation
  const calculatedBuyAmount = useMemo(() => {
    const amt = parseFloat(sellAmount) || 0;
    if (activeTab === 'limit') {
      const price = parseFloat(limitPrice) || 0;
      return (amt * price).toFixed(6);
    } else {
      // Swap calculates based on token prices ratio
      return ((amt * sellPrice) / buyPrice).toFixed(6);
    }
  }, [sellAmount, sellToken, buyToken, activeTab, limitPrice, sellPrice, buyPrice]);

  const sellUsd = (parseFloat(sellAmount) || 0) * sellPrice;
  const buyUsd = parseFloat(calculatedBuyAmount) * buyPrice;

  // Real balance helper
  const maxSellBalance = useMemo(() => {
    if (!balanceData) return 0;
    if (sellToken === 'SOL') return parseFloat(balanceData.solBalance);
    const tok = balanceData.tokens.find((t) => t.symbol === sellToken);
    return tok ? parseFloat(tok.uiAmount) : 0;
  }, [balanceData, sellToken]);

  // Fluctuating Chart Price Simulator
  useEffect(() => {
    const basePrice = sellPrice / buyPrice;
    setChartPrice(basePrice);
    
    const interval = setInterval(() => {
      const scale = basePrice * 0.002; // 0.2% variance
      const delta = (Math.random() - 0.5) * scale;
      setChartPrice((prev) => parseFloat((prev + delta).toFixed(6)));
    }, 3000);

    return () => clearInterval(interval);
  }, [sellToken, buyToken, sellPrice, buyPrice]);

  // Interactive Custom SVG Chart Points Creator
  const chartPoints = useMemo(() => {
    const points: number[] = [];
    const count = 30;
    const baseVal = sellPrice / buyPrice;
    
    for (let i = 0; i < count; i++) {
      const dev = baseVal * 0.015 * (Math.sin(i / 3) + (Math.random() - 0.5));
      points.push(baseVal + dev);
    }
    // Set last point as current animated price
    points[points.length - 1] = chartPrice;
    return points;
  }, [sellToken, buyToken, chartPrice, sellPrice, buyPrice]);

  const minChartPrice = Math.min(...chartPoints);
  const maxChartPrice = Math.max(...chartPoints);
  const priceRange = maxChartPrice - minChartPrice || 1;

  // Generate SVG Path accommodating labels
  const svgPath = useMemo(() => {
    const leftMargin = 45;
    const chartW = 355;
    const height = 180;
    const pointsCount = chartPoints.length;
    const pathString = chartPoints
      .map((val, idx) => {
        const x = leftMargin + (idx / (pointsCount - 1)) * chartW;
        const y = 15 + (height - 50) - ((val - minChartPrice) / priceRange) * (height - 50);
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');
    
    // Create closed path for gradient fill
    const fillString = `${pathString} L 400 145 L 45 145 Z`;
    return { pathString, fillString };
  }, [chartPoints, minChartPrice, priceRange]);

  // Handle Chart mouse move interactions
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const leftMargin = 45;
    const chartW = 355;
    const pointsCount = chartPoints.length;
    
    const clientXPercent = (e.clientX - rect.left) / rect.width;
    const xCoord = clientXPercent * 400;
    
    let idx = Math.floor(((xCoord - leftMargin) / chartW) * pointsCount);
    idx = Math.min(pointsCount - 1, Math.max(0, idx));

    const price = chartPoints[idx];
    const x = leftMargin + (idx / (pointsCount - 1)) * chartW;
    const y = 145 - ((price - minChartPrice) / priceRange) * 115;
    
    const timeLabels = ['15:00', '17:00', '19:00', '21:00', '23:00', '01:00', '03:00', '05:00', '07:00', '09:00', '11:00', '13:00'];
    const timeIdx = Math.floor((idx / pointsCount) * timeLabels.length);
    const label = timeLabels[timeIdx] || '12:00';

    setHoveredPoint({ x, y, price, label });
  };

  // Simulated Web3 Signature flow
  const handleExecuteTx = () => {
    const amount = parseFloat(sellAmount) || 0;
    if (amount <= 0) {
      toast.error('Ingresa un monto de venta válido');
      return;
    }
    if (amount > maxSellBalance) {
      toast.error('Saldo insuficiente en tu cuenta');
      return;
    }

    setTxStep(2); // Awaiting wallet approval
    
    // Simulate approval delay
    setTimeout(() => {
      setTxStep(3); // Processing on chain
      
      setTimeout(() => {
        // 90% Success probability
        if (Math.random() > 0.1) {
          setTxStep(4); // Success
          toast.success('Transacción ejecutada con éxito');
          if (balanceData) {
            // Subtract simulated balance
            setSellAmount('0');
          }
        } else {
          setTxStep(5); // Reverted/Failed
          setTxError('Transaction failed: Slippage tolerance exceeded.');
          toast.error('Error al procesar transacción');
        }
      }, 2500);
    }, 2000);
  };

  return (
    <Container>
      <Header>
        <Title>Trade</Title>
        <div style={{ display: 'flex', gap: '8px' }}>
          <MetricBadge>
            <CheckCircle2 size={14} />
            <span>Solana Mainnet</span>
          </MetricBadge>
        </div>
      </Header>

      <LayoutGrid>
        {/* Left column: swap form */}
        <GlassCard
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
        >
          <TabsContainer>
            <TabList>
              <TabButton
                $active={activeTab === 'limit'}
                onClick={() => {
                  setActiveTab('limit');
                  setLimitPrice((sellPrice / buyPrice).toFixed(4));
                }}
              >
                Limit Order
              </TabButton>
              <TabButton $active={activeTab === 'swap'} onClick={() => setActiveTab('swap')}>
                Swap
              </TabButton>
              <TabButton $active={activeTab === 'dca'} onClick={() => setActiveTab('dca')}>
                DCA
              </TabButton>
            </TabList>
            <StepsBadge>Steps 1/2</StepsBadge>
          </TabsContainer>

          <FormSection>
            <InputGroup>
              <Label>Choose Account</Label>
              <DropdownTrigger>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono text-[10px] font-bold">
                    GP
                  </span>
                  <span>Billetera Principal (SOL)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="font-mono text-zinc-400 text-xs">
                    {balanceLoading ? 'Cargando...' : `$${(maxSellBalance * sellPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </span>
                  <ChevronDown size={16} className="text-zinc-500" />
                </div>
              </DropdownTrigger>
            </InputGroup>

            {/* SELL Section */}
            <InputGroup>
              <Label>
                <span>Sell</span>
                <BalanceTrigger onClick={() => setSellAmount(maxSellBalance.toString())}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.7, marginRight: '4px' }}>
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
                    <path d="M12 11h.01M17 11h.01M8 11h.01M12 15h.01M17 15h.01M8 15h.01" />
                  </svg>
                  <span>{maxSellBalance.toFixed(2)}</span>
                  <span style={{ color: '#60A5FA', fontWeight: 600, marginLeft: '6px' }}>MAX</span>
                </BalanceTrigger>
              </Label>
              <SwapInputContainer>
                <div style={{ flex: 1 }}>
                  <NumericInput
                    type="text"
                    value={sellAmount}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9.]/g, '');
                      setSellAmount(cleaned);
                    }}
                    placeholder="0"
                  />
                  <UsdEstimate>~${sellUsd.toFixed(2)}</UsdEstimate>
                </div>
                <CustomSelectWrapper>
                  <SelectTrigger onClick={() => setSellSelectOpen(!sellSelectOpen)} style={{ padding: '8px 12px', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {sellToken === 'SOL' ? <SolanaLogo /> : sellToken === 'USDC' ? <UsdcLogo /> : <LxrLogo />}
                      <span>{sellToken}</span>
                    </div>
                    <ChevronDown size={14} className="text-zinc-400" />
                  </SelectTrigger>
                  {sellSelectOpen && (
                    <SelectMenu>
                      <SelectOption onClick={() => handleSelectSell('SOL')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <SolanaLogo /><span>SOL</span>
                        </div>
                      </SelectOption>
                      <SelectOption onClick={() => handleSelectSell('USDC')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <UsdcLogo /><span>USDC</span>
                        </div>
                      </SelectOption>
                      <SelectOption onClick={() => handleSelectSell('LXR')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <LxrLogo /><span>LXR</span>
                        </div>
                      </SelectOption>
                    </SelectMenu>
                  )}
                </CustomSelectWrapper>
              </SwapInputContainer>
            </InputGroup>

            <SwapDivider>
              <SwapCircleButton type="button" onClick={handleSwapTokens}>
                <ArrowUpDown size={16} />
              </SwapCircleButton>
            </SwapDivider>

            {/* Limit Order price input */}
            {activeTab === 'limit' && (
              <InputGroup>
                <Label>
                  <span>Limit price</span>
                  <span className="text-xs text-zinc-500 font-medium px-2 py-0.5 rounded bg-zinc-800/80 cursor-pointer hover:bg-zinc-700/80" onClick={() => setLimitPrice(chartPrice.toFixed(6))}>
                    Market rate
                  </span>
                </Label>
                <SwapInputContainer style={{ padding: '12px 16px' }}>
                  <NumericInput
                    style={{ fontSize: '20px' }}
                    type="text"
                    value={limitPrice}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9.]/g, '');
                      setLimitPrice(cleaned);
                    }}
                    placeholder="68.85"
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '6px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {buyToken === 'SOL' ? <SolanaLogo /> : buyToken === 'USDC' ? <UsdcLogo /> : <LxrLogo />}
                    <span className="font-mono text-white text-sm font-semibold">{buyToken}</span>
                  </div>
                </SwapInputContainer>
              </InputGroup>
            )}

            {/* Expiry Selector */}
            {activeTab === 'limit' && (
              <InputGroup>
                <Label>Expiry</Label>
                <CustomSelectWrapper style={{ width: '100%' }}>
                  <SelectTrigger onClick={() => setExpiryOpen(!expiryOpen)} style={{ borderRadius: '16px', padding: '14px 18px' }}>
                    <span>{expiry}</span>
                    <ChevronDown size={16} className="text-zinc-500" />
                  </SelectTrigger>
                  {expiryOpen && (
                    <SelectMenu style={{ width: '100%' }}>
                      <SelectOption onClick={() => { setExpiry('Never'); setExpiryOpen(false); }}>Never</SelectOption>
                      <SelectOption onClick={() => { setExpiry('1 Day'); setExpiryOpen(false); }}>1 Day</SelectOption>
                      <SelectOption onClick={() => { setExpiry('1 Week'); setExpiryOpen(false); }}>1 Week</SelectOption>
                      <SelectOption onClick={() => { setExpiry('1 Month'); setExpiryOpen(false); }}>1 Month</SelectOption>
                    </SelectMenu>
                  )}
                </CustomSelectWrapper>
              </InputGroup>
            )}

            {/* BUY Section */}
            <InputGroup>
              <Label>Buy</Label>
              <SwapInputContainer>
                <div style={{ flex: 1 }}>
                  <NumericInput type="text" value={calculatedBuyAmount} readOnly placeholder="0" />
                  <UsdEstimate>~${buyUsd.toFixed(2)}</UsdEstimate>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '8px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {buyToken === 'SOL' ? <SolanaLogo /> : buyToken === 'USDC' ? <UsdcLogo /> : <LxrLogo />}
                  <span className="font-mono text-white text-sm font-semibold">{buyToken}</span>
                </div>
              </SwapInputContainer>
            </InputGroup>

            {activeTab === 'limit' && (
              <Disclaimer>
                <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <p>Expiry time countdown starts upon initiation of the transaction, not execution.</p>
              </Disclaimer>
            )}

            <PrimaryButton type="button" onClick={handleExecuteTx} disabled={parseFloat(sellAmount) <= 0}>
              Next
            </PrimaryButton>
          </FormSection>
        </GlassCard>

        {/* Right column: interactive price chart & open orders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <GlassCard
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.8, delay: 0.1 }}
          >
            <ChartHeader>
              <div>
                <PairTitle>
                  <span className="font-semibold text-white">{sellToken}-{buyToken}</span>
                  <Maximize2 size={14} className="text-zinc-500 cursor-pointer hover:text-white" />
                </PairTitle>
                <PriceText>
                  {chartPrice.toFixed(4)} <span className="text-sm font-normal text-zinc-500 font-mono">{buyToken}</span>
                </PriceText>
                <MetricRow>
                  <MetricBadge $negative={false}>
                    <TrendingUp size={12} />
                    <span>+2.45%</span>
                  </MetricBadge>
                  <div>
                    24h High: <span>{(sellPrice / buyPrice * 1.03).toFixed(4)}</span>
                  </div>
                  <div>
                    24h Low: <span>{(sellPrice / buyPrice * 0.97).toFixed(4)}</span>
                  </div>
                </MetricRow>
              </div>
            </ChartHeader>

            <TimeframeContainer>
              <TimeButton $active={timeframe === '1D'} onClick={() => setTimeframe('1D')}>1D</TimeButton>
              <TimeButton $active={timeframe === '1W'} onClick={() => setTimeframe('1W')}>1W</TimeButton>
              <TimeButton $active={timeframe === '1M'} onClick={() => setTimeframe('1M')}>1M</TimeButton>
              <TimeButton $active={timeframe === '1Y'} onClick={() => setTimeframe('1Y')}>1Y</TimeButton>
            </TimeframeContainer>

            <SVGWrapper>
              <svg
                width="100%"
                height="180"
                viewBox="0 0 400 180"
                preserveAspectRatio="none"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ overflow: 'visible', cursor: 'crosshair' }}
              >
                <defs>
                  <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Y-axis Labels */}
                <text x="0" y="20" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">69.83</text>
                <text x="0" y="60" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">69.22</text>
                <text x="0" y="100" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">68.61</text>
                <text x="0" y="140" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">68.00</text>

                {/* Grid Lines */}
                {[...Array(4)].map((_, i) => (
                  <line
                    key={i}
                    x1="45"
                    y1={20 + i * 40}
                    x2="400"
                    y2={20 + i * 40}
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="1"
                  />
                ))}

                {/* X-axis Labels */}
                {['15:00', '17:00', '19:00', '21:00', '23:00', '01:00', '03:00', '05:00', '07:00', '09:00', '11:00', '13:00'].map((label, idx) => {
                  const x = 45 + (idx / 11) * 345;
                  return (
                    <text
                      key={idx}
                      x={x}
                      y="168"
                      fill="rgba(255,255,255,0.4)"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {label}
                    </text>
                  );
                })}

                {/* Fill Area */}
                <path d={svgPath.fillString} fill="url(#glowGrad)" />

                {/* Main Price Line */}
                <path
                  d={svgPath.pathString}
                  fill="none"
                  stroke="#60A5FA"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Hover vertical line and point marker */}
                {hoveredPoint && (
                  <>
                    <line
                      x1={hoveredPoint.x}
                      y1="0"
                      x2={hoveredPoint.x}
                      y2="150"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
                    <foreignObject
                      x={hoveredPoint.x > 300 ? hoveredPoint.x - 110 : hoveredPoint.x + 10}
                      y={hoveredPoint.y > 100 ? hoveredPoint.y - 60 : hoveredPoint.y + 10}
                      width="100"
                      height="50"
                    >
                      <div className="bg-[#18181b] border border-white/10 rounded-lg p-1.5 text-[10px] shadow-lg">
                        <p className="text-zinc-400 font-medium">{hoveredPoint.label}</p>
                        <p className="text-white font-mono font-semibold mt-0.5">
                          {hoveredPoint.price.toFixed(6)}
                        </p>
                      </div>
                    </foreignObject>
                  </>
                )}
              </svg>
            </SVGWrapper>

            <OrdersTabs>
              <OrdersTabButton $active={ordersTab === 'open'} onClick={() => setOrdersTab('open')}>
                Open Orders
              </OrdersTabButton>
              <OrdersTabButton $active={ordersTab === 'history'} onClick={() => setOrdersTab('history')}>
                Order History
              </OrdersTabButton>
            </OrdersTabs>

            {ordersTab === 'open' ? (
              <EmptyStateIllustration>
                <CandlestickIllustration />
                <p className="font-semibold text-white text-sm">No active orders</p>
                <p className="text-xs">Your open limit orders and DCA strategies will appear here.</p>
              </EmptyStateIllustration>
            ) : (
              <EmptyStateIllustration>
                <CandlestickIllustration />
                <p className="font-semibold text-white text-sm">History is empty</p>
                <p className="text-xs">Executed swaps and DCA strategies logs will be shown here.</p>
              </EmptyStateIllustration>
            )}
          </GlassCard>
        </div>
      </LayoutGrid>

      {/* simulated wallet action modals */}
      <AnimatePresence>
        {txStep === 2 && (
          <Overlay>
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <LoadingSpinner size={48} className="animate-spin mb-4" />
              <h3 className="font-semibold text-white text-lg font-family['Outfit']">Awaiting Signature</h3>
              <p className="text-sm text-zinc-400 mt-2">
                Aprove la transacción de intercambio en la extensión de su billetera Solana para continuar.
              </p>
            </ModalContent>
          </Overlay>
        )}

        {txStep === 3 && (
          <Overlay>
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <LoadingSpinner size={48} className="animate-spin mb-4" />
              <h3 className="font-semibold text-white text-lg font-family['Outfit']">Processing Transaction</h3>
              <p className="text-sm text-zinc-400 mt-2">
                Confirmando su intercambio en la blockchain de Solana. Por favor espere...
              </p>
            </ModalContent>
          </Overlay>
        )}

        {txStep === 4 && (
          <Overlay>
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="font-semibold text-white text-lg font-family['Outfit']">Swap Successful</h3>
              <p className="text-sm text-zinc-400 mt-2">
                Su intercambio se ejecutó con éxito en Solana Mainnet.
              </p>
              <PrimaryButton
                onClick={() => setTxStep(1)}
                style={{ marginTop: '24px', background: '#FFFFFF', color: '#000000' }}
              >
                Cerrar
              </PrimaryButton>
            </ModalContent>
          </Overlay>
        )}

        {txStep === 5 && (
          <Overlay>
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="font-semibold text-white text-lg font-family['Outfit']">Swap Failed</h3>
              <p className="text-sm text-zinc-400 mt-2">
                {txError || 'Hubo un error inesperado al firmar la transacción.'}
              </p>
              <PrimaryButton
                onClick={() => setTxStep(1)}
                style={{ marginTop: '24px', background: '#FFFFFF', color: '#000000' }}
              >
                Reintentar
              </PrimaryButton>
            </ModalContent>
          </Overlay>
        )}
      </AnimatePresence>
    </Container>
  );
}

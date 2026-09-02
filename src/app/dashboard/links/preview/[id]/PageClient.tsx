"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { getPaymentLink } from '@/lib/payments-api';
import { PaymentLink } from '@luxor/contracts';
import { ArrowLeft, Monitor, Smartphone, ShoppingBag, Store, Wallet, Calendar, DollarSign, Copy, Check, Lock, RefreshCw, Wifi, Battery, Signal, ChevronLeft, ChevronRight, Plus, Menu } from 'lucide-react';
import { toast } from 'sonner';
import { useTokenPrice } from '@/hooks/useTokenPrice';
import { Decimal } from 'decimal.js';

const DESKTOP_PREVIEW_WIDTH = 900;

const PageContainer = styled(motion.div)`
  padding: 16px;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  box-sizing: border-box;
  overflow: visible;

  @media (min-width: 768px) {
    padding: 40px;
    gap: 32px;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 8px 16px;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:focus-visible {
    outline: 2px solid #34D399;
    outline-offset: 2px;
  }
`;

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
  text-align: left;

  @media (min-width: 768px) {
    font-size: 32px;
  }
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin: 4px 0 0 0;
  text-align: left;
`;

const TopHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 20px;
`;

const ControlsRow = styled.div`
  display: none;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  @media (min-width: 768px) {
    display: flex;
  }
`;

const MobileBackRow = styled.div`
  display: flex;
  width: 100%;

  @media (min-width: 768px) {
    display: none;
  }
`;

const PreviewColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  min-width: 0;
`;

const MobilePreviewControls = styled.div`
  display: flex;
  width: 100%;

  @media (min-width: 768px) {
    display: none;
  }
`;

const CreateLinkButton = styled.button`
  background: #FFFFFF;
  color: #000000;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: #10B981;
    color: #FFFFFF;
  }
  
  &:focus-visible {
    outline: 2px solid #34D399;
    outline-offset: 2px;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 4px;
  width: 100%;
  
  @media (min-width: 768px) {
    width: auto;
  }
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  background: ${({ $active }) => ($active ? '#FFFFFF' : 'transparent')};
  color: ${({ $active }) => ($active ? '#000000' : 'rgba(255,255,255,0.6)')};
  border: none;
  border-radius: 9999px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;

  &:hover {
    color: ${({ $active }) => ($active ? '#000000' : '#FFFFFF')};
  }
  
  &:focus-visible {
    outline: 2px solid #34D399;
    outline-offset: 2px;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: start;
  
  @media (min-width: 1024px) {
    grid-template-columns: 380px 1fr;
    gap: 32px;
  }
`;

const MetaCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: fit-content;
  box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.5);
`;

const MetaCardTitle = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  gap: 16px;

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.45);

  svg {
    color: #34D399;
    opacity: 0.8;
  }
`;

const DetailValue = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: #FFFFFF;
  text-align: right;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.08);
  }

  &:focus-visible {
    outline: 2px solid #34D399;
  }
`;

const PreviewArea = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  width: 100%;
  min-width: 0;
`;

const DesktopPreviewFit = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const DesktopPreviewInner = styled.div<{ $scale: number; $scaledHeight?: number }>`
  @media (max-width: 767px) {
    width: ${({ $scale }) => `${DESKTOP_PREVIEW_WIDTH * $scale}px`};
    height: ${({ $scaledHeight }) => ($scaledHeight ? `${$scaledHeight}px` : 'auto')};
    overflow: hidden;
    margin: 0 auto;
  }

  @media (min-width: 768px) {
    width: 100%;
    max-width: ${DESKTOP_PREVIEW_WIDTH}px;
  }
`;

const DesktopPreviewCanvas = styled.div<{ $scale: number }>`
  @media (max-width: 767px) {
    width: ${DESKTOP_PREVIEW_WIDTH}px;
    transform: scale(${({ $scale }) => $scale});
    transform-origin: top left;
  }

  @media (min-width: 768px) {
    width: 100%;
  }
`;

// Simulator Frames
const BrowserFrame = styled(motion.div)`
  width: 100%;
  max-width: 900px;
  background: #18181B;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  flex-shrink: 0;
`;

const BrowserHeader = styled.div`
  background: #27272A;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const BrowserTabBar = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 12px 0 12px;
  background: #1e1e20;
  gap: 12px;
`;

const BrowserDots = styled.div`
  display: flex;
  gap: 6px;
  
  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    
    &:nth-child(1) { background: #EF4444; }
    &:nth-child(2) { background: #F59E0B; }
    &:nth-child(3) { background: #10B981; }
  }
`;

const BrowserTabsContainer = styled.div`
  display: flex;
  gap: 4px;
`;

const BrowserTab = styled.div`
  background: #27272A;
  padding: 6px 16px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: none;
  
  span {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const BrowserTabPlus = styled.div`
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  padding: 2px;
  cursor: pointer;
  
  &:hover {
    color: #FFFFFF;
  }
`;

const BrowserAddressBarRow = styled.div`
  background: #27272A;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BrowserNavButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.4);
  
  svg {
    transition: color 0.2s;
    
    &.active:hover {
      color: #FFFFFF;
      cursor: pointer;
    }
  }
`;

const BrowserAddressBar = styled.div`
  flex: 1;
  background: #09090B;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 4px 12px;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  max-width: 450px;
  margin: 0 auto;
  
  svg {
    color: #10B981;
  }
`;

const MobileBrowserHeader = styled.div`
  background: #121212;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MobileAddressBar = styled.div`
  background: #1C1C1E;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 4px 8px;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  max-width: 220px;
  justify-content: center;

  svg {
    color: #10B981;
  }
`;

const MobileFrame = styled(motion.div)`
  width: 100%;
  max-width: 340px;
  height: 640px;
  background: #000000;
  border: 12px solid #27272A;
  border-radius: 40px;
  overflow: hidden;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
  margin: 0 auto;
  flex-shrink: 0;
`;

const MobileStatusBar = styled.div`
  height: 24px;
  background: #000000;
  color: #FFFFFF;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 500;
  z-index: 5;
`;

const MobileStatusIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.8;
`;

const MobileHomeIndicator = styled.div`
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 9999px;
  z-index: 10;
  pointer-events: none;
`;

// Simulated Page Elements
const SimulatedPageWrapper = styled.div<{ $mode: 'desktop' | 'mobile' }>`
  min-height: ${({ $mode }) => ($mode === 'mobile' ? '580px' : '500px')};
  max-height: ${({ $mode }) => ($mode === 'mobile' ? '580px' : '550px')};
  background: #000000;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  position: relative;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #000000;
  }
  &::-webkit-scrollbar-thumb {
    background: #27272A;
    border-radius: 3px;
  }
`;

const SimulatedHeaderNav = styled.nav<{ $mode: 'desktop' | 'mobile' }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ $mode }) => ($mode === 'mobile' ? '12px 16px' : '14px 24px')};
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  width: 100%;
  box-sizing: border-box;
`;

const SimulatedBrandLogo = styled.div<{ $mode: 'desktop' | 'mobile' }>`
  font-family: 'Outfit', sans-serif;
  font-size: ${({ $mode }) => ($mode === 'mobile' ? '14px' : '16px')};
  font-weight: 700;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 4px;

  span {
    color: #34D399;
  }
`;

const SimulatedHeaderButton = styled.div<{ $mode: 'desktop' | 'mobile' }>`
  background: transparent;
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  padding: ${({ $mode }) => ($mode === 'mobile' ? '4px 10px' : '6px 12px')};
  font-family: 'Outfit', sans-serif;
  font-size: ${({ $mode }) => ($mode === 'mobile' ? '10px' : '11px')};
  font-weight: 500;
  user-select: none;
`;

const SimulatedMainContent = styled.div<{ $mode: 'desktop' | 'mobile' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ $mode }) => ($mode === 'mobile' ? '16px 12px' : '24px 16px')};
  box-sizing: border-box;
  width: 100%;
`;

const SimulatedCheckoutCard = styled.div<{ $mode: 'desktop' | 'mobile' }>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40px);
  border-radius: 20px;
  padding: ${({ $mode }) => ($mode === 'mobile' ? '20px 16px' : '28px 24px')};
  width: 100%;
  max-width: ${({ $mode }) => ($mode === 'mobile' ? '280px' : '340px')};
  text-align: center;
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.8);
  box-sizing: border-box;
`;

const SimulatedBusinessName = styled.div<{ $mode: 'desktop' | 'mobile' }>`
  font-family: 'Outfit', sans-serif;
  font-size: ${({ $mode }) => ($mode === 'mobile' ? '11px' : '12px')};
  font-weight: 500;
  color: #34D399;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 6px;
`;

const SimulatedProductName = styled.div<{ $mode: 'desktop' | 'mobile' }>`
  font-family: 'Outfit', sans-serif;
  font-size: ${({ $mode }) => ($mode === 'mobile' ? '18px' : '20px')};
  font-weight: 500;
  color: #FFFFFF;
  margin-bottom: ${({ $mode }) => ($mode === 'mobile' ? '16px' : '20px')};
`;

const SimulatedAmountText = styled.div<{ $mode: 'desktop' | 'mobile' }>`
  font-family: 'Outfit', sans-serif;
  font-size: ${({ $mode }) => ($mode === 'mobile' ? '32px' : '38px')};
  font-weight: 500;
  letter-spacing: -1px;
  background: linear-gradient(to right, #34D399, #10B981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 4px;
`;

const SimulatedCurrencyText = styled.div<{ $mode: 'desktop' | 'mobile' }>`
  font-family: 'Montserrat', sans-serif;
  font-size: ${({ $mode }) => ($mode === 'mobile' ? '12px' : '13px')};
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: ${({ $mode }) => ($mode === 'mobile' ? '20px' : '24px')};
`;

const SimulatedPayButton = styled.div<{ $mode: 'desktop' | 'mobile' }>`
  background: #FFFFFF;
  color: #000000;
  font-family: 'Outfit', sans-serif;
  font-size: ${({ $mode }) => ($mode === 'mobile' ? '13px' : '14px')};
  font-weight: 500;
  padding: ${({ $mode }) => ($mode === 'mobile' ? '10px 20px' : '12px 24px')};
  border-radius: 9999px;
  width: 100%;
  text-align: center;
  box-sizing: border-box;
  user-select: none;
`;

const SimulatedFooter = styled.footer<{ $mode: 'desktop' | 'mobile' }>`
  padding: 12px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-family: 'Montserrat', sans-serif;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
  width: 100%;
  box-sizing: border-box;

  p {
    margin: 2px 0;
  }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(52, 211, 153, 0.3);
  border-radius: 50%;
  border-top-color: #34D399;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default function PreviewPaymentLinkPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedWallet, setCopiedWallet] = useState(false);
  const desktopFrameRef = useRef<HTMLDivElement>(null);
  const [desktopPreviewScale, setDesktopPreviewScale] = useState(1);
  const [desktopPreviewHeight, setDesktopPreviewHeight] = useState<number | undefined>();

  const updateDesktopPreviewScale = useCallback(() => {
    const frame = desktopFrameRef.current;
    if (!frame || window.innerWidth >= 768) {
      setDesktopPreviewScale(1);
      setDesktopPreviewHeight(undefined);
      return;
    }

    const availableWidth = window.innerWidth - 32;
    const scale = Math.min(1, availableWidth / DESKTOP_PREVIEW_WIDTH);
    setDesktopPreviewScale(scale);
    setDesktopPreviewHeight(frame.offsetHeight * scale);
  }, []);

  const { data: usdRate, isLoading: isPriceLoading } = useTokenPrice(link?.currency);

  const getUsdEquivalent = () => {
    if (!link || !link.amount || usdRate === null) return null;
    try {
      return new Decimal(link.amount).mul(usdRate).toNumber();
    } catch {
      return null;
    }
  };

  const usdAmount = getUsdEquivalent();

  useLayoutEffect(() => {
    if (mode !== 'desktop') return;

    let resizeObserver: ResizeObserver | null = null;
    let frameId = 0;

    const setup = () => {
      const frame = desktopFrameRef.current;
      if (!frame) {
        frameId = requestAnimationFrame(setup);
        return;
      }

      updateDesktopPreviewScale();
      resizeObserver = new ResizeObserver(updateDesktopPreviewScale);
      resizeObserver.observe(frame);
    };

    setup();
    window.addEventListener('resize', updateDesktopPreviewScale);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateDesktopPreviewScale);
    };
  }, [mode, link, updateDesktopPreviewScale]);

  useEffect(() => {
    async function fetchLink() {
      try {
        const data = await getPaymentLink(id);
        setLink(data);
      } catch (error) {
        toast.error('Failed to load payment link details');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchLink();
    }
  }, [id]);

  const handleCopyWallet = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedWallet(true);
    toast.success('Wallet address copied');
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  if (loading) {
    return (
      <PageContainer style={{ justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <LoadingSpinner />
      </PageContainer>
    );
  }

  if (!link) {
    return (
      <PageContainer>
        <Header>
          <BackButton onClick={() => router.back()}>
            <ArrowLeft size={16} /> Back to Links
          </BackButton>
        </Header>
        <div style={{ textAlign: 'center', marginTop: '100px', color: 'rgba(255,255,255,0.5)' }}>
          Payment link not found.
        </div>
      </PageContainer>
    );
  }

  return (
    <>
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title">
            Payment Links
          </h1>
          <p className="lx-page-subtitle">
            Checkout URLs for your website, email, or social.
          </p>
        </div>
      </header>

      <PageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
    >
      <ControlsRow>
        <BackButton onClick={() => router.back()}>
          <ArrowLeft size={16} /> Back
        </BackButton>
        <ToggleContainer>
          <ToggleButton
            $active={mode === 'desktop'}
            onClick={() => setMode('desktop')}
          >
            <Monitor size={16} /> Desktop
          </ToggleButton>
          <ToggleButton
            $active={mode === 'mobile'}
            onClick={() => setMode('mobile')}
          >
            <Smartphone size={16} /> Mobile
          </ToggleButton>
        </ToggleContainer>
      </ControlsRow>

      <MobileBackRow>
        <BackButton onClick={() => router.back()}>
          <ArrowLeft size={16} /> Back
        </BackButton>
      </MobileBackRow>

      <ContentGrid>
        <MetaCard>
          <MetaCardTitle>
            Link Details
          </MetaCardTitle>

          <DetailRow>
            <DetailLabel>
              <ShoppingBag size={15} />
              <span>Product / Service</span>
            </DetailLabel>
            <DetailValue className="notranslate" translate="no">
              {link.name}
            </DetailValue>
          </DetailRow>

          <DetailRow>
            <DetailLabel>
              <Store size={15} />
              <span>Business</span>
            </DetailLabel>
            <DetailValue className="notranslate" translate="no">
              {link.businessName || 'N/A'}
            </DetailValue>
          </DetailRow>

          <DetailRow>
            <DetailLabel>
              <DollarSign size={15} />
              <span>Amount</span>
            </DetailLabel>
            <DetailValue className="notranslate" translate="no" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#34D399' }}>
              {link.amount} {link.currency}
            </DetailValue>
          </DetailRow>

          <DetailRow>
            <DetailLabel>
              <Wallet size={15} />
              <span>Target Wallet</span>
            </DetailLabel>
            <DetailValue className="notranslate" translate="no">
              <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                {link.merchantWallet ? `${link.merchantWallet.slice(0, 6)}...${link.merchantWallet.slice(-6)}` : 'N/A'}
              </span>
              {link.merchantWallet && (
                <CopyButton type="button" onClick={() => handleCopyWallet(link.merchantWallet)} title="Copy wallet address">
                  {copiedWallet ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                </CopyButton>
              )}
            </DetailValue>
          </DetailRow>

          <DetailRow>
            <DetailLabel>
              <Calendar size={15} />
              <span>Created At</span>
            </DetailLabel>
            <DetailValue style={{ fontSize: '13px' }}>
              {new Date(link.createdAt).toLocaleString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </DetailValue>
          </DetailRow>
        </MetaCard>

        <PreviewColumn>
          <MobilePreviewControls>
            <ToggleContainer>
              <ToggleButton
                $active={mode === 'desktop'}
                onClick={() => setMode('desktop')}
              >
                <Monitor size={16} /> Desktop
              </ToggleButton>
              <ToggleButton
                $active={mode === 'mobile'}
                onClick={() => setMode('mobile')}
              >
                <Smartphone size={16} /> Mobile
              </ToggleButton>
            </ToggleContainer>
          </MobilePreviewControls>

        <PreviewArea>
          <AnimatePresence mode="wait">
            {mode === 'desktop' ? (
              <DesktopPreviewFit>
              <DesktopPreviewInner $scale={desktopPreviewScale} $scaledHeight={desktopPreviewHeight}>
              <DesktopPreviewCanvas $scale={desktopPreviewScale}>
              <BrowserFrame
                ref={desktopFrameRef}
                key="desktop"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <BrowserHeader>
                  <BrowserTabBar>
                    <BrowserDots>
                      <span />
                      <span />
                      <span />
                    </BrowserDots>
                    <BrowserTabsContainer>
                      <BrowserTab>
                        <ShoppingBag size={10} color="#34D399" />
                        <span>Luxor Pay - Checkout</span>
                      </BrowserTab>
                      <BrowserTabPlus>
                        <Plus size={12} />
                      </BrowserTabPlus>
                    </BrowserTabsContainer>
                  </BrowserTabBar>
                  <BrowserAddressBarRow>
                    <BrowserNavButtons>
                      <ChevronLeft size={14} />
                      <ChevronRight size={14} />
                      <RefreshCw size={12} />
                    </BrowserNavButtons>
                    <BrowserAddressBar>
                      <Lock size={10} />
                      <span>pay.luxor.com/pay/link/{id.slice(0, 8)}...</span>
                    </BrowserAddressBar>
                    <div style={{ width: 14 }} />
                  </BrowserAddressBarRow>
                </BrowserHeader>
                <SimulatedPageWrapper $mode="desktop">
                  <SimulatedHeaderNav $mode="desktop">
                    <SimulatedBrandLogo $mode="desktop">
                      Luxor <span>Pay</span>
                    </SimulatedBrandLogo>
                    <SimulatedHeaderButton $mode="desktop">
                      Login / Create Account
                    </SimulatedHeaderButton>
                  </SimulatedHeaderNav>
                  <SimulatedMainContent $mode="desktop">
                    <SimulatedCheckoutCard $mode="desktop">
                      <SimulatedBusinessName $mode="desktop">
                        {link.businessName || 'Merchant Checkout'}
                      </SimulatedBusinessName>
                      <SimulatedProductName $mode="desktop">
                        {link.name}
                      </SimulatedProductName>
                      <SimulatedAmountText $mode="desktop">
                        {usdAmount !== null ? (
                          `$${usdAmount.toFixed(2)}`
                        ) : isPriceLoading ? (
                          '$...'
                        ) : (
                          `$${(parseFloat(String(link.amount || '0')) * (usdRate ?? 0)).toFixed(2)}`
                        )}
                      </SimulatedAmountText>
                      <SimulatedCurrencyText $mode="desktop">
                        {parseFloat(String(link.amount || '0')).toFixed(link.currency === 'SOL' ? 9 : 2)} {link.currency}
                      </SimulatedCurrencyText>
                      <SimulatedPayButton $mode="desktop">
                        Pay Now
                      </SimulatedPayButton>
                    </SimulatedCheckoutCard>
                  </SimulatedMainContent>
                  <SimulatedFooter $mode="desktop">
                    <p>Luxor Pay © {new Date().getFullYear()}. All rights reserved.</p>
                  </SimulatedFooter>
                </SimulatedPageWrapper>
              </BrowserFrame>
              </DesktopPreviewCanvas>
              </DesktopPreviewInner>
              </DesktopPreviewFit>
            ) : (
              <MobileFrame
                key="mobile"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <MobileStatusBar>
                  <span>09:41</span>
                  <MobileStatusIcons>
                    <Signal size={10} />
                    <Wifi size={10} />
                    <Battery size={12} />
                  </MobileStatusIcons>
                </MobileStatusBar>
                <MobileBrowserHeader>
                  <MobileAddressBar>
                    <Lock size={8} />
                    <span>pay.luxor.com</span>
                  </MobileAddressBar>
                </MobileBrowserHeader>
                <SimulatedPageWrapper $mode="mobile">
                  <SimulatedHeaderNav $mode="mobile">
                    <SimulatedBrandLogo $mode="mobile">
                      Luxor <span>Pay</span>
                    </SimulatedBrandLogo>
                    <SimulatedHeaderButton $mode="mobile">
                      Login
                    </SimulatedHeaderButton>
                  </SimulatedHeaderNav>
                  <SimulatedMainContent $mode="mobile">
                    <SimulatedCheckoutCard $mode="mobile">
                      <SimulatedBusinessName $mode="mobile">
                        {link.businessName || 'Merchant Checkout'}
                      </SimulatedBusinessName>
                      <SimulatedProductName $mode="mobile">
                        {link.name}
                      </SimulatedProductName>
                      <SimulatedAmountText $mode="mobile">
                        {usdAmount !== null ? (
                          `$${usdAmount.toFixed(2)}`
                        ) : isPriceLoading ? (
                          '$...'
                        ) : (
                          `$${(parseFloat(String(link.amount || '0')) * (usdRate ?? 0)).toFixed(2)}`
                        )}
                      </SimulatedAmountText>
                      <SimulatedCurrencyText $mode="mobile">
                        {parseFloat(String(link.amount || '0')).toFixed(link.currency === 'SOL' ? 9 : 2)} {link.currency}
                      </SimulatedCurrencyText>
                      <SimulatedPayButton $mode="mobile">
                        Pay Now
                      </SimulatedPayButton>
                    </SimulatedCheckoutCard>
                  </SimulatedMainContent>
                  <SimulatedFooter $mode="mobile">
                    <p>Luxor Pay © {new Date().getFullYear()}.</p>
                  </SimulatedFooter>
                </SimulatedPageWrapper>
                <MobileHomeIndicator />
              </MobileFrame>
            )}
          </AnimatePresence>
        </PreviewArea>
        </PreviewColumn>
      </ContentGrid>
    </PageContainer>
    </>
  );
}

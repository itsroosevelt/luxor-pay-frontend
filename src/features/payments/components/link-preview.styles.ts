import styled from 'styled-components';
import { motion } from 'framer-motion';

export const DESKTOP_PREVIEW_WIDTH = 900;

export const PageContainer = styled(motion.div)`
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

export const Header = styled.div`
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

export const BackButton = styled.button`
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
    outline: 2px solid #E2E8F0;
    outline-offset: 2px;
  }
`;

export const ControlsRow = styled.div`
  display: none;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  @media (min-width: 768px) {
    display: flex;
  }
`;

export const MobileBackRow = styled.div`
  display: flex;
  width: 100%;

  @media (min-width: 768px) {
    display: none;
  }
`;

export const PreviewColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  min-width: 0;
`;

export const MobilePreviewControls = styled.div`
  display: flex;
  width: 100%;

  @media (min-width: 768px) {
    display: none;
  }
`;

export const ToggleContainer = styled.div`
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

export const ToggleButton = styled.button<{ $active: boolean }>`
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
    outline: 2px solid #E2E8F0;
    outline-offset: 2px;
  }
`;

export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: start;
  
  @media (min-width: 1024px) {
    grid-template-columns: 340px 1fr;
    gap: 32px;
  }
`;

export const DetailsInfoSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: fit-content;
  padding: 8px 0;
`;

export const MetaCardTitle = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const DetailRow = styled.div`
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

export const DetailLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.45);

  svg {
    color: #E2E8F0;
    opacity: 0.8;
  }
`;

export const DetailValue = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: #FFFFFF;
  text-align: right;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const CopyButton = styled.button`
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
    outline: 2px solid #E2E8F0;
  }
`;

export const PreviewArea = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  width: 100%;
  min-width: 0;
`;

export const DesktopPreviewFit = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

export const DesktopPreviewInner = styled.div<{ $scale: number; $scaledHeight?: number }>`
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

export const DesktopPreviewCanvas = styled.div<{ $scale: number }>`
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
export const BrowserFrame = styled(motion.div)`
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

export const BrowserHeader = styled.div`
  background: #27272A;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

export const BrowserTabBar = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 12px 0 12px;
  background: #1e1e20;
  gap: 12px;
`;

export const BrowserDots = styled.div`
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

export const BrowserTabsContainer = styled.div`
  display: flex;
  gap: 4px;
`;

export const BrowserTab = styled.div`
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

export const BrowserTabPlus = styled.div`
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  padding: 2px;
  cursor: pointer;
  
  &:hover {
    color: #FFFFFF;
  }
`;

export const BrowserAddressBarRow = styled.div`
  background: #27272A;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const BrowserNavButtons = styled.div`
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

export const BrowserAddressBar = styled.div`
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

export const MobileBrowserHeader = styled.div`
  background: #121212;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const MobileAddressBar = styled.div`
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

export const MobileFrame = styled(motion.div)`
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

export const MobileStatusBar = styled.div`
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

export const MobileStatusIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.8;
`;

export const MobileHomeIndicator = styled.div`
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
export const SimulatedPageWrapper = styled.div<{ $mode: 'desktop' | 'mobile' }>`
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

export const SimulatedHeaderNav = styled.nav<{ $mode: 'desktop' | 'mobile' }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ $mode }) => ($mode === 'mobile' ? '12px 16px' : '14px 24px')};
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  width: 100%;
  box-sizing: border-box;
`;

export const SimulatedBrandLogo = styled.div<{ $mode: 'desktop' | 'mobile' }>`
  font-family: 'Outfit', sans-serif;
  font-size: ${({ $mode }) => ($mode === 'mobile' ? '14px' : '16px')};
  font-weight: 700;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 4px;

  span {
    color: #E2E8F0;
  }
`;

export const SimulatedHeaderButton = styled.div<{ $mode: 'desktop' | 'mobile' }>`
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

export const SimulatedMainContent = styled.div<{ $mode: 'desktop' | 'mobile' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ $mode }) => ($mode === 'mobile' ? '16px 12px' : '24px 16px')};
  box-sizing: border-box;
  width: 100%;
`;

export const SimulatedCheckoutCard = styled.div<{ $mode: 'desktop' | 'mobile' }>`
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

export const SimulatedBusinessName = styled.div<{ $mode: 'desktop' | 'mobile' }>`
  font-family: 'Outfit', sans-serif;
  font-size: ${({ $mode }) => ($mode === 'mobile' ? '11px' : '12px')};
  font-weight: 500;
  color: #E2E8F0;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 6px;
`;

export const SimulatedProductName = styled.div<{ $mode: 'desktop' | 'mobile' }>`
  font-family: 'Outfit', sans-serif;
  font-size: ${({ $mode }) => ($mode === 'mobile' ? '18px' : '20px')};
  font-weight: 500;
  color: #FFFFFF;
  margin-bottom: ${({ $mode }) => ($mode === 'mobile' ? '16px' : '20px')};
`;

export const SimulatedAmountText = styled.div<{ $mode: 'desktop' | 'mobile' }>`
  font-family: 'Outfit', sans-serif;
  font-size: ${({ $mode }) => ($mode === 'mobile' ? '32px' : '38px')};
  font-weight: 500;
  letter-spacing: -1px;
  background: linear-gradient(to right, #60A5FA, #2563EB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 4px;
`;

export const SimulatedCurrencyText = styled.div<{ $mode: 'desktop' | 'mobile' }>`
  font-family: 'Montserrat', sans-serif;
  font-size: ${({ $mode }) => ($mode === 'mobile' ? '12px' : '13px')};
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: ${({ $mode }) => ($mode === 'mobile' ? '12px' : '16px')};
`;

export const SimulatedDetailsBox = styled.div<{ $mode: 'desktop' | 'mobile' }>`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: ${({ $mode }) => ($mode === 'mobile' ? '12px 14px' : '14px 18px')};
  margin: ${({ $mode }) => ($mode === 'mobile' ? '12px 0 16px 0' : '16px 0 20px 0')};
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
`;

export const SimulatedAccountSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

export const SimulatedAccountRow = styled.div<{ $mode: 'desktop' | 'mobile' }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  .account-label {
    font-family: 'Outfit', sans-serif;
    font-size: ${({ $mode }) => ($mode === 'mobile' ? '10px' : '11px')};
    font-weight: 600;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .account-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
  }

  .account-name {
    font-family: 'Outfit', sans-serif;
    font-size: ${({ $mode }) => ($mode === 'mobile' ? '11px' : '12px')};
    font-weight: 500;
    color: #FFFFFF;
  }

  .account-wallet {
    font-family: monospace;
    font-size: ${({ $mode }) => ($mode === 'mobile' ? '9px' : '10px')};
    color: rgba(255, 255, 255, 0.6);
  }
`;

export const SimulatedFlowArrowRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -4px 0;
  color: rgba(96, 165, 250, 0.6);
`;

export const SimulatedDetailRow = styled.div<{ $mode: 'desktop' | 'mobile' }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: ${({ $mode }) => ($mode === 'mobile' ? '11px' : '12px')};

  .label {
    font-family: 'Montserrat', sans-serif;
    color: rgba(255, 255, 255, 0.5);
  }

  .value {
    font-family: 'Outfit', sans-serif;
    color: #FFFFFF;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .monospace {
    font-family: monospace;
    font-size: ${({ $mode }) => ($mode === 'mobile' ? '10px' : '11px')};
    color: rgba(255, 255, 255, 0.9);
  }
`;

export const SimulatedPayButton = styled.div<{ $mode: 'desktop' | 'mobile' }>`
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

export const SimulatedFooter = styled.footer<{ $mode: 'desktop' | 'mobile' }>`
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

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #E2E8F0;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

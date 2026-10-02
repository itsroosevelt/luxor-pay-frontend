import styled from "styled-components";
import { motion } from "framer-motion";

export const ItemContainer = styled(motion.div)<{ $visualType: 'sent' | 'received' | 'failed' }>`
  display: flex;
  flex-direction: column;
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`;

export const MainRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 4px;
  cursor: pointer;
  gap: 16px;
`;

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const PartyAndDate = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const PartyTitle = styled.span`
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 15px;
  color: #FFFFFF;
`;

export const DateSubtitle = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  display: flex;
  align-items: center;
  gap: 5px;
`;

export const AmountAndStatus = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
`;

export const IconBadge = styled.div<{ $visualType: 'sent' | 'received' | 'failed' }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;

  ${({ $visualType }) =>
    $visualType === 'sent'
      ? `
    background: var(--lx-danger-soft, rgba(248, 113, 113, 0.12));
    border: 1px solid var(--lx-danger-border, rgba(248, 113, 113, 0.2));
    color: var(--lx-danger, #F87171);
  `
      : $visualType === 'failed'
      ? `
    background: var(--lx-warning-soft, rgba(234, 179, 8, 0.12));
    border: 1px solid var(--lx-warning-border, rgba(234, 179, 8, 0.2));
    color: var(--lx-warning, #EAB308);
  `
      : `
    background: var(--lx-success-soft, rgba(16, 185, 129, 0.12));
    border: 1px solid var(--lx-success-border, rgba(16, 185, 129, 0.2));
    color: var(--lx-success, #34D399);
  `}
`;

export const TokenCircle = styled.span<{ $symbol?: string }>`
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: ${({ $symbol }) =>
    $symbol === 'SOL'
      ? 'linear-gradient(135deg, #14F195, #9945FF)'
      : $symbol === 'USDC'
      ? 'linear-gradient(135deg, #2775CA, #1E508F)'
      : $symbol === 'USDT'
      ? 'linear-gradient(135deg, #26A17B, #1A6C52)'
      : 'linear-gradient(135deg, #E2E8F0, #10B981)'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-size: 8px;
  font-weight: 700;
  color: #FFFFFF;
  flex-shrink: 0;
`;

export const ValueAmount = styled.span`
  font-family: monospace;
  font-size: 15px;
  font-weight: 600;
  color: #FFFFFF; /* Muted color to match white/gray premium styling */
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const StatusPill = styled.div<{ $status: string }>`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 3px 10px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  text-transform: uppercase;
  ${({ $status }) => {
    const s = ($status || '').toLowerCase();
    if (s === 'confirmed' || s === 'executed' || s === 'success' || s === 'completed' || s === 'approved') {
      return `
        background: rgba(16, 185, 129, 0.15);
        color: #34D399;
        border: 1px solid rgba(16, 185, 129, 0.3);
      `;
    }
    if (s === 'rejected' || s === 'failed' || s === 'error' || s === 'cancelled' || s === 'reverted') {
      return `
        background: rgba(239, 68, 68, 0.15);
        color: #F87171;
        border: 1px solid rgba(239, 68, 68, 0.3);
      `;
    }
    if (s === 'pending' || s === 'processing' || s === 'active' || s === 'draft' || s === 'submitting') {
      return `
        background: rgba(245, 158, 11, 0.15);
        color: #FBBF24;
        border: 1px solid rgba(245, 158, 11, 0.3);
      `;
    }
    return `
      background: rgba(255, 255, 255, 0.05);
      color: #EDEDED;
      border: 1px solid rgba(255, 255, 255, 0.15);
    `;
  }}
`;

export const ExpandIconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
  }

  &:focus-visible {
    outline: 2px solid #E2E8F0;
    outline-offset: 2px;
  }
`;

export const ExpandedDrawer = styled(motion.div)`
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.2);
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  backdrop-filter: blur(10px);

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const DrawerPanel = styled.div`
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.03);
`;

export const PanelTitle = styled.h4`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
`;

export const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  gap: 12px;
`;

export const DetailKey = styled.span`
  font-family: 'Montserrat', sans-serif;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
`;

export const DetailVal = styled.span`
  font-family: monospace;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 6px;
  word-break: break-all;
`;

export const LinkButton = styled.a`
  color: #E2E8F0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const ExplorerButton = styled.a`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 10px 22px;
  border-radius: 9999px;
  background: rgba(15, 25, 48, 0.85);
  border: 1px solid var(--lx-success-border, rgba(6,95,70,0.55));
  color: #E2E8F0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(16, 185, 129, 0.25);
    border-color: rgba(255, 255, 255, 0.6);
    color: #FFFFFF;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid #E2E8F0;
    outline-offset: 2px;
  }
`;

export const DrawerButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
`;

export const DrawerButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 18px;
  border-radius: 9999px; /* Circular Rule 3 requirement */
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  background: ${({ $variant }) => ($variant === 'primary' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.03)')};
  color: ${({ $variant }) => ($variant === 'primary' ? '#000000' : '#FFFFFF')};
  border: ${({ $variant }) => ($variant === 'secondary' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none')};

  &:hover {
    background: ${({ $variant }) => ($variant === 'primary' ? '#2563EB' : 'rgba(255, 255, 255, 0.1)')};
    color: #FFFFFF;
    ${({ $variant }) => $variant === 'primary' && 'box-shadow: 0 0 20px rgba(37, 99, 235, 0.45);'}
  }
  
  &:focus-visible {
    outline: 2px solid #E2E8F0;
    outline-offset: 2px;
  }
`;

export const ProgressGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 640px) {
    grid-template-columns: 1.4fr 1fr;
  }
`;

export const TimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const TimelineStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

export const TimelineDot = styled.div<{ $status?: string }>`
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background: ${({ $status }) => {
    if ($status === 'done') return 'rgba(16, 185, 129, 0.2)';
    if ($status === 'failed') return 'rgba(239, 68, 68, 0.2)';
    if ($status === 'pending') return 'rgba(245, 158, 11, 0.2)';
    return 'rgba(255, 255, 255, 0.08)';
  }};
  border: ${({ $status }) => {
    if ($status === 'done') return '1px solid rgba(16, 185, 129, 0.4)';
    if ($status === 'failed') return '1px solid rgba(239, 68, 68, 0.4)';
    if ($status === 'pending') return '1px solid rgba(245, 158, 11, 0.4)';
    return '1px solid rgba(255, 255, 255, 0.1)';
  }};
  color: ${({ $status }) => {
    if ($status === 'done') return '#34D399';
    if ($status === 'failed') return '#F87171';
    if ($status === 'pending') return '#FBBF24';
    return 'rgba(255, 255, 255, 0.4)';
  }};
  box-shadow: ${({ $status }) => {
    if ($status === 'done') return '0 0 10px rgba(16, 185, 129, 0.35)';
    if ($status === 'failed') return '0 0 10px rgba(239, 68, 68, 0.35)';
    if ($status === 'pending') return '0 0 10px rgba(245, 158, 11, 0.35)';
    return 'none';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
`;

export const TimelineInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const TimelineText = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #FFFFFF;
`;

export const TimelineSub = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
`;

export const SignersBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-left: 1px solid rgba(255, 255, 255, 0.06);
  padding-left: 16px;
`;

export const SignerTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
`;

export const SignerItem = styled.div`
  font-family: monospace;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 4px;
`;

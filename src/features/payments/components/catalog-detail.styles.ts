import Link from 'next/link';
import styled from 'styled-components';
import { motion } from 'framer-motion';

export const PageContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: #ededed;
  font-family: 'Montserrat', sans-serif;
  display: flex;
  flex-direction: column;
`;

export const MainContent = styled.div`
  padding: 0 40px 60px 40px;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 768px) {
    padding: 0 16px 40px 16px;
    gap: 20px;
  }
`;

export const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  width: fit-content;

  &:hover {
    color: #ffffff;
    transform: translateX(-2px);
  }
`;

/* Stripe Top Banner */
export const StripeHeaderCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 24px 28px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  backdrop-filter: blur(20px);

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export const ProductHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

export const ProductAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const HeaderTitleMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ProductTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const ProductTitle = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.02em;
`;

export const StatusBadge = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 3px 10px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;

export const HeaderPriceText = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);

  strong {
    font-weight: 600;
    color: #ffffff;
    font-size: 16px;
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 9px 20px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  outline: none;

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.4);
    outline-offset: 2px;
  }

  ${({ $variant = 'primary' }) =>
    $variant === 'primary' &&
    `
    background: #FFFFFF;
    color: #000000;
    &:hover {
      background: #EDEDED;
      color: #000000;
    }
  `}

  ${({ $variant }) =>
    $variant === 'secondary' &&
    `
    background: rgba(255, 255, 255, 0.05);
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.12);
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.25);
    }
  `}
`;

export const IconMenuButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
`;

export const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 44px;
  right: 0;
  background: rgba(10, 10, 10, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  z-index: 50;
  min-width: 180px;
  padding: 6px 0;
`;

export const DropdownItem = styled.button`
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  padding: 10px 16px;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
  }
`;

/* 2-Column Grid */
export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 28px;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

/* Section Header */
export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const SectionTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const SectionTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
`;

export const SectionBadge = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

export const MiniAddButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #ffffff;
  }
`;

/* Table / Glass Cards */
export const RatesTableWrapper = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  overflow: hidden;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
`;

export const Th = styled.th`
  padding: 12px 18px;
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

export const Td = styled.td`
  padding: 14px 18px;
  color: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
`;

export const DefaultBadge = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.15);
  margin-left: 8px;
`;

export const DashedBox = styled.div`
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.45);
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  p {
    margin: 0;
  }
`;

export const SubtitleDescription = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: -8px 0 12px 0;

  a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

export const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 360px;
`;

export const SearchInput = styled.input`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 9px 16px 9px 38px;
  color: #ffffff;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.35);
  }
`;

export const SearchIconAbs = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
  display: flex;
`;

/* Right Sidebar Cards */
export const SidebarCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const SidebarCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    font-family: 'Outfit', sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: #ffffff;
    margin: 0;
  }
`;

export const EditIconBtn = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #ffffff;
  }
`;

export const MetaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const MetaLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const MetaValue = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 6px;

  &.mono {
    font-family: monospace;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
  }
`;

export const LogRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.04);
  font-family: monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);

  span.method {
    color: #ffffff;
    font-weight: 600;
  }

  span.status {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
    padding: 2px 6px;
    border-radius: 4px;
  }

  span.time {
    color: rgba(255, 255, 255, 0.4);
    font-size: 11px;
  }
`;

export const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: rgba(255, 255, 255, 0.6);
  gap: 12px;
  font-family: 'Outfit', sans-serif;
`;

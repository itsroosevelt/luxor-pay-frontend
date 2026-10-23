import styled from 'styled-components';
import { motion } from 'framer-motion';

// ── Styled Components (Clean, Fluid & Mobile-First — Rule 10) ─────────────────────────────

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px 40px 60px 40px;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    padding: 20px 24px 40px 24px;
    gap: 24px;
  }

  @media (max-width: 640px) {
    padding: 16px 14px 32px 14px;
    gap: 18px;
  }
`;

// ── Breadcrumbs ─────────────────────────────────────────────────────────────

export const BreadcrumbNav = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 500;
  color: #ffffff;
`;

export const BreadcrumbBtn = styled.button`
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;

  &:hover {
    color: rgba(255, 255, 255, 0.85);
  }
`;

export const BreadcrumbSep = styled.span`
  color: rgba(255, 255, 255, 0.25);
  font-size: 20px;
`;

/* ──────────────────────── Balance & Actions Block ──────────────────────── */

export const BalanceRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    width: 100%;
  }
`;

export const BalanceLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const EyebrowRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const EyebrowLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
`;

export const PrivacyButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  padding: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #FFFFFF;
  }
`;

export const PrimaryBalanceText = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 52px;
  font-weight: 500;
  color: #FFFFFF;
  letter-spacing: -1.5px;
  line-height: 1;

  @media (max-width: 1024px) {
    font-size: 42px;
  }

  @media (max-width: 640px) {
    font-size: 34px;
  }
`;

export const ActionButtonsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    width: 100%;
    gap: 8px;
  }
`;

export const ActionPillButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  border-radius: 9999px;
  padding: 10px 22px;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $variant }) =>
    $variant === 'primary'
      ? `
        background: #FFFFFF;
        color: #000000;
        border: 1px solid #FFFFFF;
        &:hover:not(:disabled) {
          background: #2563EB;
          color: #FFFFFF;
          border-color: #2563EB;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
        }
      `
      : `
        background: rgba(255, 255, 255, 0.05);
        color: #EDEDED;
        border: 1px solid rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(12px);
        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          color: #FFFFFF;
          border-color: rgba(255, 255, 255, 0.3);
        }
      `}

  @media (max-width: 640px) {
    flex: 1;
    padding: 9px 14px;
    font-size: 13px;
  }
`;

export const ActionIconButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  border-radius: 9999px;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $variant }) =>
    $variant === 'primary'
      ? `
        background: #FFFFFF;
        color: #000000;
        border: 1px solid #FFFFFF;
        &:hover:not(:disabled) {
          background: #2563EB;
          color: #FFFFFF;
          border-color: #2563EB;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
        }
      `
      : `
        background: rgba(255, 255, 255, 0.05);
        color: #EDEDED;
        border: 1px solid rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(12px);
        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          color: #FFFFFF;
          border-color: rgba(255, 255, 255, 0.3);
        }
      `}
`;

/* ──────────────────────── Stats Bar Block ──────────────────────── */

export const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  width: fit-content;
  flex: 0 0 auto;

  @media (max-width: 640px) {
    padding: 8px 12px;
    gap: 8px;
    border-radius: 12px;
  }
`;

export const StatIconBadge = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #EDEDED;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: 640px) {
    width: 32px;
    height: 32px;
    border-radius: 10px;
  }
`;

export const StatValueGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const StatValue = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #FFFFFF;
  line-height: 1.2;

  @media (max-width: 640px) {
    font-size: 16px;
  }
`;

export const StatLabel = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.45);

  @media (max-width: 640px) {
    font-size: 11px;
  }
`;

/* ──────────────────────── Accounts Section ──────────────────────── */

export const SectionTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
`;

export const SectionTitleText = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: -0.5px;
  color: #FFFFFF;
  margin: 0;

  @media (max-width: 640px) {
    font-size: 20px;
  }
`;

export const AddAccountBtn = styled.button`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #EDEDED;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 16px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    color: #FFFFFF;
    border-color: rgba(255, 255, 255, 0.25);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const DesktopTableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;

  @media (max-width: 767px) {
    display: none;
  }
`;

export const AccountsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

export const TableTh = styled.th`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

export const TableTr = styled(motion.tr)`
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`;

export const TableTd = styled.td`
  padding: 18px 16px;
  vertical-align: middle;
`;

export const AccountNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #FFFFFF;
`;

export const EditIconButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  padding: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;

  &:hover:not(:disabled) {
    color: #60A5FA;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

export const AddressSubline = styled.div`
  font-family: monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const PendingBadge = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 9999px;
  background: rgba(245, 158, 11, 0.15);
  color: #F59E0B;
  border: 1px solid rgba(245, 158, 11, 0.3);
`;

export const ActivateInlineButton = styled.button`
  background: rgba(37, 99, 235, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.3);
  color: #60A5FA;
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 9999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &:hover:not(:disabled) {
    background: #2563EB;
    color: #FFFFFF;
  }
`;

export const BalanceValueRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #FFFFFF;
`;

export const TokenBadgeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: -4px;
`;

export const WeightColumnContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 140px;
`;

export const WeightPercentageText = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
`;

export const WeightBarTrack = styled.div`
  width: 100%;
  height: 4px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
`;

export const WeightBarFill = styled.div<{ $weight: number }>`
  height: 100%;
  width: ${({ $weight }) => Math.min(100, Math.max(0, $weight))}%;
  background: #FFFFFF;
  border-radius: 9999px;
`;

export const TableActionsGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
`;

export const TableRowActionButton = styled.button`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    color: #FFFFFF;
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

/* ──────────────────────── Mobile Accounts Cards ──────────────────────── */

export const MobileAccountsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 768px) {
    display: none;
  }
`;

export const MobileAccountCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

/* ──────────────────────── Account Detail Views (account view) ──────────────── */

export const AccountDetailHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 4px 0;
`;

export const AccountHeaderTopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const AccountAddressBox = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 14px;
  border-radius: 9999px;
  font-family: monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
`;

export const SectionSubTabs = styled.div`
  display: flex;
  gap: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 12px;
  margin-top: 12px;
`;

export const SubTabBtn = styled.button<{ $active: boolean }>`
  background: transparent;
  border: none;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: ${({ $active }) => ($active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)')};
  border-bottom: 2px solid ${({ $active }) => ($active ? '#60A5FA' : 'transparent')};
  padding-bottom: 10px;
  margin-bottom: -13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #ffffff;
  }
`;

export const EmptyStateContainer = styled.div`
  padding: 36px 16px;
  text-align: center;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
`;

export const CoinsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

export const CoinRowSubItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px 10px 52px;
  background: rgba(255, 255, 255, 0.015);
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`;

export const TimelineActivityCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 580px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(96, 165, 250, 0.4);
  }
`;

export const TimelineItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
`;

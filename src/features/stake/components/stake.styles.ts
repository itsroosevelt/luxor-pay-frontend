import styled from 'styled-components';
import { motion } from 'framer-motion';

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #0a0a0a;
  color: #ededed;
  font-family: 'Montserrat', sans-serif;
`;

export const ContentLayout = styled.div`
  padding: 0 40px 60px 40px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 28px;

  @media (max-width: 768px) {
    padding: 0 16px 40px 16px;
    gap: 20px;
  }
`;

/* Title Header Row */
export const HeaderSection = styled.header`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #ffffff;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 40px;
  }
`;

/* Navigation Sub-Tabs */
export const SubTabsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
  flex-wrap: nowrap;
  padding-bottom: 2px;
`;

export const SubTabButton = styled.button<{ $active?: boolean }>`
  background: transparent;
  border: none;
  padding: 10px 0;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: ${({ $active }) => ($active ? '500' : '400')};
  color: ${({ $active }) => ($active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)')};
  border-bottom: 2px solid ${({ $active }) => ($active ? '#FFFFFF' : 'transparent')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #ffffff;
  }
`;

/* Overview Stats Box (Top Squads Style Card) */
export const OverviewCard = styled.div`
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const OverviewTopGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const StatBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const StatLabelText = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const SolPriceFlex = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const SolPriceText = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 38px;
  font-weight: 500;
  color: #ffffff;
  letter-spacing: -1px;
`;

export const EpochTimeText = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 36px;
  font-weight: 400;
  color: #ffffff;
  letter-spacing: -0.5px;
`;

export const EpochProgressBar = styled.div`
  width: 100%;
  max-width: 240px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  overflow: hidden;
  margin-top: 8px;

  div {
    height: 100%;
    width: 78%;
    background: #ffffff;
    border-radius: 9999px;
  }
`;

export const OverviewBottomBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

export const MetricPillsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
`;

export const StakedMetricPill = styled.div`
  background: transparent;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 12px;

  .amount {
    font-family: 'Outfit', sans-serif;
    font-size: 20px;
    font-weight: 500;
    color: #ffffff;
  }

  .label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 400;
  }
`;

export const IconCircle = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
`;

export const ClaimMevButton = styled.button`
  background: transparent;
  border: none;
  font-family: 'Outfit', sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #ffffff;
  }
`;

/* Filter Controls Toolbar (For Validator Tab) */
export const ValidatorFilterBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const FilterSubTab = styled.button<{ $active?: boolean }>`
  background: transparent;
  border: none;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  color: ${({ $active }) => ($active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)')};
  border-bottom: 2px solid ${({ $active }) => ($active ? '#FFFFFF' : 'transparent')};
  padding: 6px 0;
  cursor: pointer;
`;

export const SearchFilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  max-width: 500px;
  width: 100%;

  @media (max-width: 640px) {
    max-width: 100%;
    flex-wrap: wrap;
  }
`;

export const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;

  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.4);
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 10px 16px 10px 40px;
  font-size: 13.5px;
  color: #ffffff;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

export const SelectBox = styled.select`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 10px 16px;
  font-size: 13.5px;
  color: #ffffff;
  outline: none;
  cursor: pointer;

  option {
    background: #0a0a0a;
    color: #ffffff;
  }
`;

/* Grid for Pools and Validators Cards */
export const CardsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const StakeCard = styled.div`
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0;
  padding: 16px 0 20px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  transition: all 0.2s ease;

  &:hover {
    border-bottom-color: rgba(255, 255, 255, 0.2);
  }
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const PoolLogoBadge = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
`;

export const PoolTitle = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
`;

export const ApyMetricRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 12px;

  .value {
    font-family: 'Outfit', sans-serif;
    font-size: 24px;
    font-weight: 600;
    color: #ffffff;
  }

  .unit {
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
  }
`;

export const StakedDetailRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);

  span.val {
    font-family: monospace;
    font-weight: 500;
    color: #ffffff;
  }
`;

export const CardButtonsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  border-radius: 9999px;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;

  ${({ $variant }) =>
    $variant === 'secondary'
      ? `
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.12);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.25);
      color: #FFFFFF;
    }
  `
      : `
    background: #FFFFFF;
    color: #000000;
    box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);

    &:hover {
      background: #EDEDED;
      color: #000000;
    }
  `}
`;

/* Staking Action Modal */
export const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

export const ModalBox = styled(motion.div)`
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 28px;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.9);
  width: 100%;
  max-width: 440px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    font-family: 'Outfit', sans-serif;
    font-size: 20px;
    font-weight: 500;
    color: #ffffff;
    margin: 0;
  }
`;

export const ModalCloseButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  border-radius: 9999px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .top-label {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }
`;

export const AmountInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  input {
    width: 100%;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    padding: 14px 70px 14px 16px;
    font-family: monospace;
    font-size: 16px;
    color: #ffffff;
    outline: none;
    box-sizing: border-box;

    &:focus {
      border-color: rgba(255, 255, 255, 0.4);
    }
  }

  button.max-btn {
    position: absolute;
    right: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #ffffff;
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 8px;
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
`;

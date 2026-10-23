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
  padding: 24px 40px 60px 40px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 768px) {
    padding: 16px 16px 40px 16px;
    gap: 16px;
  }
`;

export const HeaderSection = styled.header`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const HeaderTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 30px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #ffffff;
  margin: 0;
`;

export const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
`;

export const TableControlsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 4px;
`;

export const TableSectionTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
`;

export const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const ButtonBase = styled.button<{ $variant?: 'primary' | 'secondary' | 'ghost' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  border-radius: 9999px;
  padding: 9px 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  border: none;

  ${({ $variant }) =>
    $variant === 'primary' &&
    `
    background: #FFFFFF;
    color: #000000;
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.85);
      color: #000000;
    }
  `}

  ${({ $variant }) =>
    ($variant === 'secondary' || !$variant) &&
    `
    background: rgba(255, 255, 255, 0.05);
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.12);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.25);
    }
  `}

  ${({ $variant }) =>
    $variant === 'ghost' &&
    `
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.05);
      color: #FFFFFF;
    }
  `}
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  width: 100%;
`;

export const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Outfit', sans-serif;
  font-size: 13px;

  svg {
    color: #60A5FA;
  }
`;

export const StatValue = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #FFFFFF;
`;

export const StatSubtitle = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
`;

export const InfoBanner = styled.div`
  background: rgba(37, 99, 235, 0.06);
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;

  svg {
    color: #60A5FA;
    flex-shrink: 0;
  }
`;

/* Unified Data Table (Borderless Canvas Layout) */
export const TableWrapper = styled(motion.div)`
  background: transparent;
  border: none;
  box-shadow: none;
  border-radius: 0;
  width: 100%;
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

export const Th = styled.th`
  background: transparent;
  padding: 12px 16px;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--lx-text-dim);
  border-bottom: 1px solid var(--lx-border);
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

export const ThRight = styled(Th)`
  text-align: right;
`;

export const Td = styled.td`
  padding: 16px;
  font-size: 14px;
  color: var(--lx-text);
  border-bottom: 1px solid var(--lx-border);
  vertical-align: middle;
`;

export const DeviceCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const LocationTd = styled(Td)`
  color: var(--lx-text-muted);
  font-size: 13px;
`;

export const VolumeTd = styled(Td)`
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  color: var(--lx-text);
`;

export const ActiveTd = styled(Td)`
  color: var(--lx-text-dim);
  font-size: 13px;
`;

export const ActionTdRight = styled(Td)`
  text-align: right;
`;

export const ActionRowGroup = styled.div`
  display: inline-flex;
  gap: 8px;
  justify-content: flex-end;
`;

export const ModalHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: -4px;
`;

export const ModalTitleH3 = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.5px;
  color: #ffffff;
  margin: 0;
`;

export const ModalSubtitleText = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  margin: 4px 0 0 0;
`;

export const ModalCloseButton = styled.button`
  background: none;
  border: none;
  color: var(--lx-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  &:hover {
    color: var(--lx-text);
  }
`;

export const ModalFormCol = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const FormLabelText = styled.label`
  font-size: 12px;
  color: var(--lx-text-muted);
  display: block;
  margin-bottom: 6px;
`;

export const QrCodeContainer = styled.div`
  background: #FFFFFF;
  padding: 24px;
  border-radius: 24px;
  display: inline-block;
`;

export const QrCodeSerial = styled.p`
  color: #000000;
  font-size: 16px;
  font-weight: 700;
  font-family: monospace;
  margin: 8px 0 0 0;
`;

export const Tr = styled.tr`
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  &:last-child ${Td} {
    border-bottom: 1px solid var(--lx-border);
  }
`;

export const DeviceNameText = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #ffffff;
`;

export const SerialText = styled.span`
  font-family: monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
`;

export const StatusBadge = styled.span<{ $online?: boolean }>`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.06);
  color: ${({ $online }) => ($online ? '#ffffff' : 'rgba(255, 255, 255, 0.4)')};
  border: 1px solid rgba(255, 255, 255, 0.12);
`;

/* Modal Styles */
export const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

export const KeypadModalBox = styled(motion.div)`
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 28px;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.9);
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const KeypadDisplay = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 20px;
  text-align: right;

  .currency-tag {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .amount {
    font-family: 'Outfit', sans-serif;
    font-size: 38px;
    font-weight: 600;
    color: #ffffff;
    margin-top: 4px;
  }
`;

export const KeypadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

export const KeypadButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  height: 56px;
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
  }

  &:active {
    transform: scale(0.95);
  }
`;

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
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 768px) {
    padding: 0 16px 40px 16px;
    gap: 16px;
  }
`;

/* Header Row */
export const HeaderRow = styled.div`
  padding: 28px 32px 16px 32px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    padding: 24px 16px 12px 16px;
  }
`;

export const HeaderTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TitleText = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.15;
`;

export const SubtitleText = styled.p`
  margin-top: 4px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0;
  line-height: 1.5;
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 9px 20px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  border: none;

  ${({ $variant }) =>
    $variant === 'primary'
      ? `
    background: #FFFFFF;
    color: #000000;
    box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);

    &:hover:not(:disabled) {
      background: #EDEDED;
      color: #000000;
    }
  `
      : `
    background: rgba(255, 255, 255, 0.05);
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(12px);

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.3);
      color: #FFFFFF;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const KeyBadge = styled.span`
  background: rgba(255, 255, 255, 0.12);
  color: inherit;
  font-size: 11px;
  font-family: monospace;
  padding: 1px 5px;
  border-radius: 4px;
  font-weight: 600;
`;

/* Filters & Export Toolbar */
export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 4px;
`;

export const FilterPillsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

export const FilterPill = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
  padding: 6px 14px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
`;

export const ClearFilterButton = styled.button`
  background: transparent;
  border: none;
  font-size: 13px;
  color: #ffffff;
  font-weight: 500;
  cursor: pointer;
  padding: 6px;

  &:hover {
    text-decoration: underline;
  }
`;

export const ExportLinksGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

export const ExportLink = styled.button`
  background: transparent;
  border: none;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #ffffff;
  }
`;

/* Data Table (Borderless Canvas Layout) */
export const TableWrapper = styled.div`
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

export const Th = styled.th<{ $width?: string }>`
  background: transparent;
  padding: 12px 16px;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--lx-text-dim);
  border-bottom: 1px solid var(--lx-border);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  ${({ $width }) => $width && `width: ${$width};`}
`;

export const Td = styled.td`
  padding: 16px;
  font-size: 14px;
  color: var(--lx-text);
  border-bottom: 1px solid var(--lx-border);
  vertical-align: middle;
`;

export const PriceTd = styled(Td)`
  color: var(--lx-text);
  font-family: monospace;
  font-weight: 500;
`;

export const CategoryTd = styled(Td)`
  color: var(--lx-text-muted);
`;

export const DateTd = styled(Td)`
  color: var(--lx-text-dim);
`;

export const CenteredTd = styled(Td)`
  text-align: center;
  padding: 0;
`;

export const ActionTd = styled(Td)`
  position: relative;
`;

export const FilterPillStrong = styled.strong`
  color: var(--lx-text);
  margin-left: 4px;
`;

export const Tr = styled.tr`
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  &:last-child ${Td} {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

export const ProductFlexCell = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

export const ProductIconThumb = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
`;

export const ProductNameText = styled.span`
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  color: #ffffff;
`;

export const ActionMenuButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  padding: 6px 10px;
  border-radius: 9999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
`;

export const ActionDropdown = styled.div`
  position: absolute;
  right: 20px;
  margin-top: 4px;
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  z-index: 50;
  min-width: 160px;
  padding: 6px 0;
`;

export const DropdownItem = styled.button`
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  padding: 10px 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  &.danger {
    color: #f87171;
    &:hover {
      background: rgba(239, 68, 68, 0.15);
    }
  }
`;

export const TableFooterText = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  padding: 4px 0;
`;

export const EmptyOrLoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 64px 24px;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  svg.animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;

/* Dark Modal */
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
  max-width: 480px;
  padding: 28px;
  position: relative;
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

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  input,
  select {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    padding: 12px 16px;
    font-size: 14px;
    color: #ffffff;
    outline: none;

    &:focus {
      border-color: #60a5fa;
      box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.3);
    }
  }

  option {
    background: #0a0a0a;
    color: #ffffff;
  }
`;

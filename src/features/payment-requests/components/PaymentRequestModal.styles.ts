import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

export const ModalContent = styled(motion.div)<{ $wide?: boolean }>`
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.8);
  border-radius: 40px;
  width: 100%;
  max-width: ${({ $wide }) => ($wide ? '880px' : '480px')};
  padding: 40px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: left;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 24px;
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
  }
`;

export const Title = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.5px;
  color: #FFFFFF;
  margin: 0 0 6px 0;
  text-align: left;
`;

export const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 20px 0;
  text-align: left;
  line-height: 1.5;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
`;

export const FieldGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const FieldLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 2px;
  display: block;
`;

export const FieldHelpText = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.4;
  margin-top: 4px;
  display: block;
`;

export const TextInput = styled.input`
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 14px 18px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #E2E8F0;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

export const Select = styled.select`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 14px 18px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;

  &:focus {
    outline: none;
    border-color: #E2E8F0;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
  }

  option {
    background: #0A0A0A;
    color: #FFFFFF;
  }
  
  optgroup {
    background: #0A0A0A;
    color: #E2E8F0;
    font-weight: 600;
  }
`;

export const ToggleLink = styled.button`
  background: none;
  border: none;
  color: #E2E8F0;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  &:hover { text-decoration: underline; }
`;

export const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 16px 0;
  width: 100%;
`;

export const ActionButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-top: 16px;
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 9px 20px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  flex: 1;
  min-width: 0;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;

  ${({ $variant = 'primary' }) =>
    $variant === 'primary' &&
    `
    background: #FFFFFF;
    color: #000000;
    &:hover:not(:disabled) {
      background: #2563EB;
      color: #FFFFFF;
      box-shadow: 0 0 20px rgba(37, 99, 235, 0.45);
    }
  `}

  ${({ $variant }) =>
    $variant === 'secondary' &&
    `
    background: transparent;
    color: #E2E8F0;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(12px);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      color: #FFFFFF;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #E2E8F0;
    outline-offset: 2px;
  }
`;

export const AdvancedToggle = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 0;
  transition: color 0.2s;

  &:hover {
    color: #FFFFFF;
  }
`;

export const SuccessWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 20px;
  padding: 20px 0;
  width: 100%;
`;

export const SuccessIcon = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 9999px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22C55E;
`;

export const SuccessId = styled.div`
  font-family: monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 16px;
  word-break: break-all;
  width: 100%;
`;

export const ErrorBanner = styled.div`
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 14px;
  padding: 12px 16px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: #FCA5A5;
  width: 100%;
`;

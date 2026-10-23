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
  align-items: ${({ $wide }) => ($wide ? 'stretch' : 'center')};
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
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #FFFFFF;
  margin: 0 0 8px 0;
  text-align: center;
`;

export const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 32px 0;
  text-align: center;
  line-height: 1.5;
`;

export const OptionButton = styled.button`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 24px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  margin-bottom: 16px;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid #E2E8F0;
    outline-offset: 2px;
  }

  &:last-of-type {
    margin-bottom: 0;
  }
`;

export const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  color: #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const OptionTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const OptionTitle = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #FFFFFF;
`;

export const OptionDesc = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
`;

export const ReceiveLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  width: 100%;
  align-items: start;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
`;

export const ReceiveHeader = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  min-width: 0;

  @media (max-width: 768px) {
    order: 1;
    width: 100%;
  }
`;

export const ReceiveConfigSection = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  grid-column: 1;
  grid-row: 2;

  @media (max-width: 768px) {
    order: 5;
    width: 100%;
  }
`;

export const ReceiveVisualWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  width: 100%;
  grid-column: 2;
  grid-row: 2;

  @media (max-width: 768px) {
    display: flex;
    order: 2;
    gap: 24px;
  }
`;

export const ReceiveQrSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

export const ReceiveInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    margin-bottom: 0;
  }
`;

export const InfoBox = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
`;

export const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const InfoLabel = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
`;

export const InfoValue = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #FFFFFF;
`;

export const InfoValueBlue = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #E2E8F0;
`;

export const InfoDivider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 16px 0;
  width: 100%;
`;

export const ReceiveAddressSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

export const ReceiveTitle = styled(Title)`
  text-align: left;
`;

export const ReceiveSubtitle = styled(Subtitle)`
  text-align: left;
  margin-bottom: 24px;
`;

export const QrContainer = styled.div`
  background: #FFFFFF;
  padding: 28px;
  border-radius: 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16px 32px rgba(0,0,0,0.5);
  width: 100%;
  max-width: 380px;

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 20px;
  }
`;

export const AddressLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  text-transform: uppercase;
`;

export const RightAddressLabel = styled(AddressLabel)`
  align-self: flex-start;
  width: 100%;
`;

export const AddressWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  width: 100%;
  margin-bottom: 24px;
`;

export const AddressText = styled.span`
  font-family: monospace;
  font-size: 15px;
  color: #E2E8F0;
  word-break: break-all;
  flex: 1;
  text-align: left;
`;

export const QrTypeSelector = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  padding: 4px;
  margin-bottom: 16px;
  width: 100%;
  max-width: 380px;
  box-sizing: border-box;
`;

export const QrTypeButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px 12px;
  border-radius: 9999px;
  border: none;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $active }) => ($active ? '#FFFFFF' : 'transparent')};
  color: ${({ $active }) => ($active ? '#000000' : 'rgba(255, 255, 255, 0.6)')};

  &:hover {
    color: ${({ $active }) => ($active ? '#000000' : '#FFFFFF')};
    background: ${({ $active }) => ($active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)')};
  }

  &:focus-visible {
    outline: 2px solid #E2E8F0;
    outline-offset: 2px;
  }
`;

export const IconButton = styled.button<{ $copied?: boolean }>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: ${({ $copied }) => ($copied ? '#10B981' : '#FFFFFF')};
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const BackNav = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
  margin-bottom: 24px;
  align-self: flex-start;
  padding: 0;

  &:hover {
    color: #FFFFFF;
  }
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 14px 24px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;

  &:last-of-type {
    margin-bottom: 0;
  }

  ${({ $variant = 'primary' }) =>
    $variant === 'primary' &&
    `
    background: #FFFFFF;
    color: #000000;
    &:hover {
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
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `}
`;

export const ConfigFields = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`;

export const InputRow = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
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

export const AmountInput = styled(TextInput)`
  flex: 1;
  width: auto;
`;

export const TokenSelect = styled.select`
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
  width: 110px;

  &:focus {
    outline: none;
    border-color: #E2E8F0;
  }

  option {
    background: #0A0A0A;
    color: #FFFFFF;
  }
`;

export const FieldLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  display: block;
`;

export const FieldGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const InfoField = styled.div<{ $mono?: boolean }>`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 14px 18px;
  color: rgba(255, 255, 255, 0.9);
  font-family: ${({ $mono }) => ($mono ? 'monospace' : "'Outfit', sans-serif")};
  font-size: ${({ $mono }) => ($mono ? '13px' : '15px')};
  word-break: break-all;
`;

export const ContactSelect = styled.select`
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  option {
    background: #0A0A0A;
    color: #FFFFFF;
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

export const NoteText = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.4);
  margin: 4px 0 0 0;
  line-height: 1.4;
`;

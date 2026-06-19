"use client";

import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/navigation';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantWallet: string | null;
}

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const ModalContent = styled(motion.div)`
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.8);
  border-radius: 40px;
  width: 100%;
  max-width: 440px;
  padding: 40px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const Title = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #FFFFFF;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 32px 0;
`;

const QrContainer = styled.div`
  background: #FFFFFF;
  padding: 24px;
  border-radius: 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16px 32px rgba(0,0,0,0.5);
`;

const AddressLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  text-transform: uppercase;
`;

const Address = styled.div`
  font-family: monospace;
  font-size: 15px;
  color: #60A5FA;
  word-break: break-all;
  background: rgba(96, 165, 250, 0.1);
  padding: 12px 16px;
  border-radius: 12px;
  width: 100%;
  margin-bottom: 32px;
  border: 1px dashed rgba(96, 165, 250, 0.3);
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
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

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  ${({ $variant = 'primary' }) =>
    $variant === 'primary' &&
    `
    background: #FFFFFF;
    color: #000000;
    &:hover {
      background: #2563EB;
      color: #FFFFFF;
    }
  `}

  ${({ $variant }) =>
    $variant === 'secondary' &&
    `
    background: transparent;
    color: #60A5FA;
    border: 1px solid rgba(255, 255, 255, 0.2);
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `}
`;

export function ReceiveModal({ isOpen, onClose, merchantWallet }: ReceiveModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleCreateLink = () => {
    onClose();
    router.push('/dashboard/links');
  };

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContent
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
        >
          <Title>Receive Funds</Title>
          <Subtitle>Show this QR code to accept direct payments.</Subtitle>

          {merchantWallet ? (
            <>
              <QrContainer>
                <QRCodeSVG 
                  value={merchantWallet} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </QrContainer>

              <AddressLabel>YOUR DEPOSIT ADDRESS</AddressLabel>
              <Address>{merchantWallet}</Address>
            </>
          ) : (
            <div style={{ marginBottom: '32px', color: '#F87171' }}>
              No active wallet found. Please configure your wallet in settings first.
            </div>
          )}

          <ButtonGroup>
            <Button type="button" $variant="primary" onClick={handleCreateLink}>
              Create Payment Link
            </Button>
            <Button type="button" $variant="secondary" onClick={onClose}>
              Close
            </Button>
          </ButtonGroup>
        </ModalContent>
      </Overlay>
    </AnimatePresence>
  );
}

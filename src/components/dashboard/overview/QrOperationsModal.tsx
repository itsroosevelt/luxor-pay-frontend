"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { buildOpenAmountQrUrl } from '@/lib/solana-pay-url';
import { routeScannedPaymentContent } from '@/lib/qr-scan-routing';
import { QrCameraScanner } from '@/components/qr/QrCameraScanner';
import { Camera, QrCode, ArrowLeft, X } from 'lucide-react';

interface QrOperationsModalProps {
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
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
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
  max-width: 480px;
  padding: 40px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CloseButton = styled.button`
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

const Title = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #FFFFFF;
  margin: 0 0 8px 0;
  text-align: center;
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 32px 0;
  text-align: center;
  line-height: 1.5;
`;

const OptionButton = styled.button`
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
    border-color: rgba(96, 165, 250, 0.4);
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(96, 165, 250, 0.1);
  color: #60A5FA;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const OptionTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const OptionTitle = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #FFFFFF;
`;

const OptionDesc = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
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
  text-align: center;
`;

const BackNav = styled.button`
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

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
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

export function QrOperationsModal({ isOpen, onClose, merchantWallet }: QrOperationsModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'select' | 'receive' | 'scan'>('select');

  useEffect(() => {
    if (isOpen) {
      setMode('select');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleScannedResult(result: string): void {
    const route = routeScannedPaymentContent(result);

    switch (route.type) {
      case 'link':
        router.push(`/pay/link/${route.linkId}`);
        toast.success('Payment link detected');
        onClose();
        return;
      case 'reference':
        router.push(`/pay/${route.reference}`);
        toast.success('Payment reference detected');
        onClose();
        return;
      case 'wallet':
        toast.success('Solana wallet address detected');
        return;
      default:
        toast.error('Invalid payment QR code');
    }
  }

  const receiveQrUrl = merchantWallet ? buildOpenAmountQrUrl(merchantWallet, 'Luxor Pay') : null;

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
          <CloseButton onClick={onClose}>
            <X size={18} />
          </CloseButton>

          {/* MODE 1: SELECTOR */}
          {mode === 'select' && (
            <>
              <Title>QR Operations</Title>
              <Subtitle>Choose whether you want to create a QR charge to receive money or read a QR payment code to send.</Subtitle>

              <OptionButton onClick={() => setMode('receive')}>
                <IconWrapper>
                  <QrCode size={28} />
                </IconWrapper>
                <OptionTextWrapper>
                  <OptionTitle>Create a QR charge</OptionTitle>
                  <OptionDesc>Show your QR to receive direct payments or links</OptionDesc>
                </OptionTextWrapper>
              </OptionButton>

              <OptionButton onClick={() => setMode('scan')}>
                <IconWrapper>
                  <Camera size={28} />
                </IconWrapper>
                <OptionTextWrapper>
                  <OptionTitle>Read a QR code</OptionTitle>
                  <OptionDesc>Scan charge codes to pay instantly</OptionDesc>
                </OptionTextWrapper>
              </OptionButton>
            </>
          )}

          {/* MODE 2: RECEIVE / COBRO */}
          {mode === 'receive' && (
            <>
              <BackNav onClick={() => setMode('select')}>
                <ArrowLeft size={16} /> Back
              </BackNav>
              
              <Title>Create QR Charge</Title>
              <Subtitle>Show this QR code to accept direct deposits to your configured address.</Subtitle>

              {merchantWallet && receiveQrUrl ? (
                <>
                  <QrContainer>
                    <QRCodeSVG 
                      value={receiveQrUrl} 
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  </QrContainer>

                  <AddressLabel>Your Deposit Address</AddressLabel>
                  <Address>{merchantWallet}</Address>
                </>
              ) : (
                <div style={{ marginBottom: '32px', color: '#F87171', textAlign: 'center' }}>
                  No configured address found. Add it in Settings.
                </div>
              )}

              <div style={{ width: '100%' }}>
                <ActionButton type="button" $variant="primary" onClick={handleCreateLink}>
                  Create Payment Link
                </ActionButton>
                <ActionButton type="button" $variant="secondary" onClick={() => setMode('select')}>
                  Cancel
                </ActionButton>
              </div>
            </>
          )}

          {/* MODE 3: SCAN / LEER PAGOS */}
          {mode === 'scan' && (
            <>
              <BackNav onClick={() => setMode('select')}>
                <ArrowLeft size={16} /> Back
              </BackNav>

              <Title>Scanning Payment QR</Title>
              <Subtitle>Align the Luxor Pay or Solana Pay QR code within the frame to pay.</Subtitle>

              <QrCameraScanner
                enabled={isOpen && mode === 'scan'}
                onDetect={handleScannedResult}
              />

              <ActionButton type="button" $variant="secondary" onClick={() => setMode('select')}>
                Cancel
              </ActionButton>
            </>
          )}

        </ModalContent>
      </Overlay>
    </AnimatePresence>
  );
}

"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/navigation';
import { buildOpenAmountQrUrl } from '@/lib/solana-pay-url';
import { Copy, Check, HandCoins } from 'lucide-react';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantWallet: string | null;
  title?: string;
  subtitle?: string;
  showCreateLinkButton?: boolean;
  onAskForPayment?: () => void;
  qrValue?: string;
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
`;

const Title = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0 0 8px 0;
  text-align: center;
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 32px 0;
  text-align: center;
  line-height: 1.5;
`;

const QrContainer = styled.div`
  background: #FFFFFF;
  padding: 24px;
  border-radius: 32px;
  width: fit-content;
  margin: 0 auto 32px auto;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AddressLabel = styled.span`
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #E2E8F0;
  margin-bottom: 8px;
  text-align: center;
`;

const AddressWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 32px;
`;

const Address = styled.span`
  font-family: monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

const CopyButton = styled.button<{ $copied?: boolean }>`
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

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 14px;
  border-radius: 9999px;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:focus-visible {
    outline: 2px solid #E2E8F0;
    outline-offset: 2px;
  }

  ${({ $variant = 'primary' }) =>
    $variant === 'primary' &&
    `
    background: #FFFFFF;
    color: #000000;
    &:hover {
      background: #10B981;
      color: #FFFFFF;
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

export function ReceiveModal({
  isOpen,
  onClose,
  merchantWallet,
  title = 'Receive Funds',
  subtitle = 'Show this QR code to accept direct payments.',
  showCreateLinkButton = true,
  onAskForPayment,
  qrValue,
}: ReceiveModalProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const solanaPayUri = qrValue ?? (merchantWallet ? buildOpenAmountQrUrl(merchantWallet, title) : null);

  const handleCopy = () => {
    if (!merchantWallet) return;
    navigator.clipboard.writeText(merchantWallet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCreateLink = () => {
    onClose();
    router.push('/payment-portal/links');
  };

  const handleAskForPayment = () => {
    onClose();
    onAskForPayment?.();
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
          exit={{ opacity: 0, scale: 0.95, y: 0 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
        >
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>

          {merchantWallet && solanaPayUri ? (
            <>
              <QrContainer>
                <QRCodeSVG 
                  value={solanaPayUri} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </QrContainer>

              <AddressLabel>YOUR DEPOSIT ADDRESS</AddressLabel>
              <AddressWrapper>
                <Address>{merchantWallet}</Address>
                <CopyButton
                  type="button"
                  $copied={copied}
                  onClick={handleCopy}
                  title={copied ? 'Copied!' : 'Copy address'}
                  aria-label="Copy deposit address"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </CopyButton>
              </AddressWrapper>
            </>
          ) : (
            <div style={{ marginBottom: '32px', color: '#F87171' }}>
              No active wallet found. Please configure your wallet in settings first.
            </div>
          )}

          <ButtonGroup>
            {showCreateLinkButton && (
              <Button type="button" $variant="primary" onClick={handleCreateLink}>
                Create Payment Link
              </Button>
            )}
            <Button type="button" $variant="primary" onClick={handleAskForPayment}>
              <HandCoins size={18} style={{ marginRight: '8px', flexShrink: 0 }} />
              Ask for a Payment
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

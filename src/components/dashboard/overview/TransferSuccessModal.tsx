"use client";

import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Transfer } from '@/lib/transfers-api';
import { ExternalLink, CheckCircle } from 'lucide-react';

interface TransferSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  transferData: Transfer | null;
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
  max-width: 500px;
  padding: 40px;
  position: relative;
  text-align: center;
`;

const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(96, 165, 250, 0.1);
  color: #60A5FA;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px auto;
  
  svg {
    width: 40px;
    height: 40px;
  }
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

const DetailsBox = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 24px;
  text-align: left;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DetailRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #60A5FA;
  text-transform: uppercase;
`;

const DetailValue = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  color: #FFFFFF;
  word-break: break-all;
`;

const Button = styled.button`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 14px 24px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  background: #FFFFFF;
  color: #000000;
  width: 100%;
  transition: all 0.2s;

  &:hover {
    background: #2563EB;
    color: #FFFFFF;
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

export function TransferSuccessModal({ isOpen, onClose, transferData }: TransferSuccessModalProps) {
  if (!isOpen || !transferData) return null;

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
          <IconContainer>
            <CheckCircle />
          </IconContainer>
          <Title>Transfer Successful</Title>
          <Subtitle>Your funds have been sent to the network.</Subtitle>

          <DetailsBox>
            <DetailRow>
              <DetailLabel>AMOUNT</DetailLabel>
              <DetailValue>{transferData.amount} {transferData.symbol || 'SOL'}</DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>RECIPIENT</DetailLabel>
              <DetailValue>
                {transferData.toNickname ? `${transferData.toNickname} (${transferData.toWallet})` : transferData.toWallet}
              </DetailValue>
            </DetailRow>

            {transferData.reference && (
              <DetailRow>
                <DetailLabel>REFERENCE</DetailLabel>
                <DetailValue>{transferData.reference}</DetailValue>
              </DetailRow>
            )}

            {transferData.signature && (
              <DetailRow>
                <DetailLabel>SIGNATURE</DetailLabel>
                <DetailValue className="flex items-center gap-2">
                  {transferData.signature.slice(0, 8)}...{transferData.signature.slice(-8)}
                  <a 
                    href={`https://explorer.solana.com/tx/${transferData.signature}?cluster=devnet`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-blue-400 hover:text-white transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                </DetailValue>
              </DetailRow>
            )}
          </DetailsBox>

          <Button onClick={onClose}>
            Done
          </Button>
        </ModalContent>
      </Overlay>
    </AnimatePresence>
  );
}

'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X, ArrowRight } from 'lucide-react';
import { useOnrampSocket } from '@/context/OnrampSocketContext';

/* ─── Animations ────────────────────────────────────────────────────────── */

const scaleIn = keyframes`
  from { transform: scale(0.6); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
`;

/* ─── Styled Components ─────────────────────────────────────────────────── */

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 110;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const GlassCard = styled(motion.div)<{ $result: 'success' | 'failed' }>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid
    ${({ $result }) => ($result === 'success' ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)')};
  backdrop-filter: blur(40px);
  border-radius: 40px;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.65);
  padding: 2.5rem;
  width: 100%;
  max-width: 440px;
  position: relative;
  overflow: hidden;
  text-align: center;

  @media (min-width: 768px) {
    padding: 3rem;
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle at center,
      ${({ $result }) => ($result === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)')}
      0%,
      transparent 65%
    );
    pointer-events: none;
    z-index: 0;
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  z-index: 10;
  padding: 0.4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.15);
  }

  &:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
  }
`;

const IconRing = styled.div<{ $result: 'success' | 'failed' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  background: ${({ $result }) => ($result === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)')};
  border: 1px solid
    ${({ $result }) => ($result === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)')};
  color: ${({ $result }) => ($result === 'success' ? '#22c55e' : '#ef4444')};
  animation: ${scaleIn} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: 0.15s;
`;

const Eyebrow = styled.span<{ $result: 'success' | 'failed' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: ${({ $result }) => ($result === 'success' ? '#22c55e' : '#ef4444')};
  display: block;
  margin-bottom: 0.6rem;
`;

const Title = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 36px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #ffffff;
  margin-bottom: 0.75rem;
  line-height: 1.1;

  @media (min-width: 768px) {
    font-size: 44px;
  }
`;

const Description = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.65;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    font-size: 15px;
  }
`;

const ButtonBase = styled.button`
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  padding: 0.9rem 2rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease-in-out;
  width: 100%;
  cursor: pointer;
  background: #FFFFFF;
  color: #000000;
  border: none;

  &:hover {
    background: #2563EB;
    color: #FFFFFF;
  }

  &:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
  }
`;

/* ─── Component ─────────────────────────────────────────────────────────── */

export function OnrampResultModal() {
  const { onrampResult, onrampPayload, dismissOnrampResult } = useOnrampSocket();

  const isOpen = onrampResult !== null;

  const formattedAmount =
    onrampPayload?.amount && onrampPayload?.currency
      ? `${onrampPayload.amount} ${onrampPayload.currency.toUpperCase()}`
      : 'funds';

  return (
    <AnimatePresence>
      {isOpen && onrampResult && (
        <Overlay
          key="onramp-result-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <GlassCard
            $result={onrampResult}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.65 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="onramp-result-title"
          >
            <CloseButton onClick={dismissOnrampResult} aria-label="Close" type="button">
              <X size={18} />
            </CloseButton>

            <Content>
              <IconRing $result={onrampResult}>
                {onrampResult === 'success' ? <CheckCircle2 size={38} /> : <XCircle size={38} />}
              </IconRing>

              <Eyebrow $result={onrampResult}>
                {onrampResult === 'success' ? 'Top-Up Success' : 'Top-Up Failed'}
              </Eyebrow>

              <Title id="onramp-result-title">
                {onrampResult === 'success' ? 'Deposit Confirmed' : 'Purchase Declined'}
              </Title>

              <Description>
                {onrampResult === 'success'
                  ? `Stripe successfully processed your purchase of ${formattedAmount}. The cryptocurrency has been delivered directly to your Solana wallet address on-chain.`
                  : 'Stripe was unable to complete the transaction. Your payment method has not been charged. Please check your payment details or try another card.'}
              </Description>

              <ButtonBase onClick={dismissOnrampResult} type="button">
                Done <ArrowRight size={16} />
              </ButtonBase>
            </Content>
          </GlassCard>
        </Overlay>
      )}
    </AnimatePresence>
  );
}

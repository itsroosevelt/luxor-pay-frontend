'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useOnrampSocket } from '@/context/OnrampSocketContext';

/* ─── Animations ────────────────────────────────────────────────────────── */

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;

/* ─── Styled Components ─────────────────────────────────────────────────── */

const BannerWrapper = styled(motion.div)`
  position: fixed;
  top: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 90;
  pointer-events: none;
  display: flex;
  justify-content: center;
`;

const Pill = styled.div`
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1.25rem;
  background: rgba(10, 10, 10, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 9999px;
  backdrop-filter: blur(24px);
  box-shadow: 0 8px 32px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);

  &::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 9999px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(16, 185, 129, 0.1));
    pointer-events: none;
  }
`;

const SpinnerIcon = styled(Loader2)`
  color: #60a5fa;
  flex-shrink: 0;
  animation: ${spin} 1s linear infinite;
`;

const PulsingDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #60a5fa;
  flex-shrink: 0;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const LabelText = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.01em;
  white-space: nowrap;

  @media (min-width: 768px) {
    font-size: 14px;
  }
`;

const SubText = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;

  @media (min-width: 768px) {
    font-size: 12px;
  }
`;

const Divider = styled.span`
  width: 1px;
  height: 14px;
  background: rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
`;

/* ─── Helper status text mapping ────────────────────────────────────────── */

function getStatusInfo(status: string | null) {
  switch (status) {
    case 'requires_payment':
      return {
        label: 'Awaiting payment on Stripe…',
        sub: 'Please complete checkout in the tab',
      };
    case 'initialized':
      return {
        label: 'Stripe session active…',
        sub: 'Ready to complete payment',
      };
    case 'fulfillment_processing':
      return {
        label: 'Processing top-up…',
        sub: 'Delivering SOL to your wallet on-chain',
      };
    default:
      return {
        label: 'Purchase in progress…',
        sub: 'Awaiting Stripe webhook confirmation',
      };
  }
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function OnrampProgressBanner() {
  const { onrampActive, onrampPayload } = useOnrampSocket();

  const { label, sub } = getStatusInfo(onrampPayload?.status ?? null);

  return (
    <AnimatePresence>
      {onrampActive && (
        <BannerWrapper
          key="onramp-banner"
          initial={{ opacity: 0, y: -20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.94 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
          role="status"
          aria-live="polite"
          aria-label="Fiat-to-crypto top-up in progress"
        >
          <Pill>
            <PulsingDot />
            <SpinnerIcon size={14} />
            <LabelText>{label}</LabelText>
            <Divider />
            <SubText>{sub}</SubText>
          </Pill>
        </BannerWrapper>
      )}
    </AnimatePresence>
  );
}

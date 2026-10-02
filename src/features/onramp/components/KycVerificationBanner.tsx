'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useKycSocket } from '@/features/onramp/context/KycSocketContext';

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
  /* ensure pointer events only over the pill, not the whole viewport */
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

  /* Subtle blue glow */
  &::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 9999px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(37, 99, 235, 0.2));
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

/* ─── Component ─────────────────────────────────────────────────────────── */

export function KycVerificationBanner() {
  const { verificationActive, kycPayload } = useKycSocket();

  const isProcessing = kycPayload?.status === 'processing';
  const label = isProcessing
    ? 'Reviewing your documents…'
    : 'Identity verification in progress…';
  const sub = isProcessing ? 'This may take a few minutes' : 'Awaiting Stripe confirmation';

  return (
    <AnimatePresence>
      {verificationActive && (
        <BannerWrapper
          key="kyc-banner"
          initial={{ opacity: 0, y: -20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.94 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
          role="status"
          aria-live="polite"
          aria-label="KYC verification in progress"
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

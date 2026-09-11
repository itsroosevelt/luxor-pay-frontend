'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useKycSocket } from '@/context/KycSocketContext';
import type { KycVerificationResult } from '@/context/KycSocketContext';

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

const GlassCard = styled(motion.div)<{ $result: KycVerificationResult }>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid
    ${({ $result }) =>
      $result === 'success'
        ? 'rgba(34, 197, 94, 0.35)'
        : $result === 'failed'
        ? 'rgba(239, 68, 68, 0.35)'
        : 'rgba(234, 179, 8, 0.35)'};
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
      ${({ $result }) =>
        $result === 'success'
          ? 'rgba(34, 197, 94, 0.15)'
          : $result === 'failed'
          ? 'rgba(239, 68, 68, 0.15)'
          : 'rgba(234, 179, 8, 0.12)'}
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

const IconRing = styled.div<{ $result: KycVerificationResult }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  background: ${({ $result }) =>
    $result === 'success'
      ? 'rgba(34, 197, 94, 0.12)'
      : $result === 'failed'
      ? 'rgba(239, 68, 68, 0.12)'
      : 'rgba(234, 179, 8, 0.12)'};
  border: 1px solid
    ${({ $result }) =>
      $result === 'success'
        ? 'rgba(34, 197, 94, 0.3)'
        : $result === 'failed'
        ? 'rgba(239, 68, 68, 0.3)'
        : 'rgba(234, 179, 8, 0.3)'};
  color: ${({ $result }) =>
    $result === 'success' ? '#22c55e' : $result === 'failed' ? '#ef4444' : '#eab308'};
  animation: ${scaleIn} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: 0.15s;
`;

const Eyebrow = styled.span<{ $result: KycVerificationResult }>`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: ${({ $result }) =>
    $result === 'success' ? '#22c55e' : $result === 'failed' ? '#ef4444' : '#eab308'};
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

const ButtonBase = styled.button<{ $variant: 'primary' | 'secondary' }>`
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

  &:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
  }

  ${({ $variant }) =>
    $variant === 'primary' &&
    `
    background: #FFFFFF;
    color: #000000;
    border: none;
    margin-bottom: 0.75rem;

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
    color: rgba(255,255,255,0.6);
    border: 1px solid rgba(255, 255, 255, 0.15);

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #FFFFFF;
    }
  `}
`;

/* ─── Config per result ──────────────────────────────────────────────────── */

const CONFIG: Record<
  NonNullable<KycVerificationResult>,
  { eyebrow: string; title: string; description: string; icon: React.ReactNode }
> = {
  success: {
    eyebrow: 'Verification Complete',
    title: 'Identity Verified',
    description:
      'Your identity has been successfully verified. All premium features — including fiat top-ups, crypto conversions, and the full liquidity engine — are now unlocked.',
    icon: <CheckCircle2 size={38} />,
  },
  failed: {
    eyebrow: 'Verification Failed',
    title: 'Could Not Verify',
    description:
      'We were unable to confirm your identity with the submitted documents. Please ensure your document is valid, legible, and not expired, then try again.',
    icon: <XCircle size={38} />,
  },
  canceled: {
    eyebrow: 'Verification Canceled',
    title: 'Process Canceled',
    description:
      'The verification session was canceled. You can restart the process at any time from your account settings.',
    icon: <AlertTriangle size={38} />,
  },
};

/* ─── Component ─────────────────────────────────────────────────────────── */

export function KycResultModal() {
  const router = useRouter();
  const { kycResult, dismissResult } = useKycSocket();

  const isOpen = kycResult !== null;
  const cfg = kycResult ? CONFIG[kycResult] : null;

  return (
    <AnimatePresence>
      {isOpen && cfg && (
        <Overlay
          key="kyc-result-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <GlassCard
            $result={kycResult}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.65 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="kyc-result-title"
          >
            <CloseButton onClick={dismissResult} aria-label="Close" type="button">
              <X size={18} />
            </CloseButton>

            <Content>
              <IconRing $result={kycResult}>{cfg.icon}</IconRing>

              <Eyebrow $result={kycResult}>{cfg.eyebrow}</Eyebrow>
              <Title id="kyc-result-title">{cfg.title}</Title>
              <Description>{cfg.description}</Description>

              {kycResult === 'success' && (
                <ButtonBase
                  $variant="primary"
                  onClick={() => {
                    dismissResult();
                    router.push('/dashboard');
                  }}
                  type="button"
                >
                  Go to Dashboard <ArrowRight size={16} />
                </ButtonBase>
              )}

              {(kycResult === 'failed' || kycResult === 'canceled') && (
                <>
                  <ButtonBase
                    $variant="primary"
                    onClick={() => {
                      dismissResult();
                      router.push('/dashboard/settings?tab=kyc');
                    }}
                    type="button"
                  >
                    Try Again <ArrowRight size={16} />
                  </ButtonBase>
                  <ButtonBase $variant="secondary" onClick={dismissResult} type="button">
                    Maybe Later
                  </ButtonBase>
                </>
              )}
            </Content>
          </GlassCard>
        </Overlay>
      )}
    </AnimatePresence>
  );
}

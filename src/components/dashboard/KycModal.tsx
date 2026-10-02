'use client';

import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  X,
  CreditCard,
  Fingerprint,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useMerchant } from '@/context/MerchantContext';
import { useKycInit } from '@/hooks/useKycInit';
import { useKycSocket } from '@/context/KycSocketContext';

/* ─── Styled Components ─────────────────────────────────────────────────── */

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const GlassCard = styled(motion.div)`
  background: #0A0A0A;
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(40px);
  border-radius: 40px;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.9);
  padding: 2.5rem;
  width: 100%;
  max-width: 500px;
  position: relative;
  overflow: hidden;
  text-align: center;

  @media (min-width: 768px) {
    padding: 3rem;
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

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
  margin: 0 auto 1.25rem;
`;

const Eyebrow = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  display: block;
  margin-bottom: 0.75rem;
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

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  margin-bottom: 1.75rem;

  @media (min-width: 768px) {
    font-size: 15px;
  }
`;

const RequirementSection = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 20px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  text-align: left;
`;

const SectionLabel = styled.p`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 0.75rem;
`;

const RequirementList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const RequirementItem = styled.li`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 0.6rem;

  @media (min-width: 768px) {
    font-size: 14px;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 0.75rem 0;
`;

const ErrorBanner = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: rgba(255, 120, 120, 0.95);
  text-align: left;
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${({ $variant }) =>
    $variant === 'primary' &&
    `
    background: #FFFFFF;
    color: #000000;
    border: none;
    margin-bottom: 0.75rem;

    &:hover:not(:disabled) {
      background: #EDEDED;
      color: #000000;
      box-shadow: none;
    }
  `}

  ${({ $variant }) =>
    $variant === 'secondary' &&
    `
    background: transparent;
    color: rgba(255,255,255,0.6);
    border: 1px solid rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(12px);

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.08);
      color: #FFFFFF;
    }
  `}
`;

const SpinnerIcon = styled(Loader2)`
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
`;

/* ─── Props ─────────────────────────────────────────────────────────────── */

interface KycModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function KycModal({ isOpen, onClose }: KycModalProps) {
  const { profile } = useMerchant();
  const { isLoading, isError, errorMessage, initKyc } = useKycInit();
  const { joinKycRoom } = useKycSocket();

  const handleStartVerification = async () => {
    if (!profile?.id) return;
    const result = await initKyc(profile.id);
    if (result?.url) {
      joinKycRoom(profile.id);
      window.open(result.url, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          key="kyc-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <GlassCard
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', bounce: 0.35, duration: 0.7 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="kyc-modal-title"
          >
            <CloseButton onClick={onClose} aria-label="Close modal" type="button">
              <X size={18} />
            </CloseButton>

            <Content>
              <IconContainer>
                <ShieldCheck size={30} />
              </IconContainer>

              <Eyebrow>Identity Verification Required</Eyebrow>
              <Title id="kyc-modal-title">Verify Your Identity</Title>

              <Subtitle>
                To access fiat top-ups, crypto-to-fiat conversions, and premium liquidity
                features, your identity must be verified. The process takes about 2 minutes.
              </Subtitle>

              {/* Documents section */}
              <RequirementSection>
                <SectionLabel>
                  <CreditCard size={10} style={{ display: 'inline', marginRight: '0.4rem' }} />
                  Accepted Identity Documents
                </SectionLabel>
                <RequirementList>
                  <RequirementItem>
                    <CheckCircle2 size={14} color="#E2E8F0" style={{ flexShrink: 0 }} />
                    Passport (any country)
                  </RequirementItem>
                  <RequirementItem>
                    <CheckCircle2 size={14} color="#E2E8F0" style={{ flexShrink: 0 }} />
                    Government-issued driving licence
                  </RequirementItem>
                  <RequirementItem>
                    <CheckCircle2 size={14} color="#E2E8F0" style={{ flexShrink: 0 }} />
                    National identity card / ID document
                  </RequirementItem>
                </RequirementList>

                <Divider />

                <SectionLabel>
                  <Fingerprint size={10} style={{ display: 'inline', marginRight: '0.4rem' }} />
                  Liveness Proof
                </SectionLabel>
                <RequirementList>
                  <RequirementItem>
                    <CheckCircle2 size={14} color="#E2E8F0" style={{ flexShrink: 0 }} />
                    A short selfie video or photo will be captured via your camera to confirm you are the document holder
                  </RequirementItem>
                </RequirementList>
              </RequirementSection>

              {/* Error state */}
              {isError && (
                <ErrorBanner role="alert">
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  {errorMessage ?? 'Unable to start verification. Please try again.'}
                </ErrorBanner>
              )}

              <ButtonBase
                $variant="primary"
                onClick={handleStartVerification}
                disabled={isLoading}
                aria-busy={isLoading}
                aria-disabled={isLoading}
                type="button"
              >
                {isLoading ? (
                  <>
                    <SpinnerIcon size={16} />
                    Initialising&hellip;
                  </>
                ) : (
                  'Start Verification'
                )}
              </ButtonBase>

              <ButtonBase $variant="secondary" onClick={onClose} disabled={isLoading} type="button">
                Maybe Later
              </ButtonBase>
            </Content>
          </GlassCard>
        </Overlay>
      )}
    </AnimatePresence>
  );
}

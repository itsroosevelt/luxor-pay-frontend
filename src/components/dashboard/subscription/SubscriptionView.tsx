'use client';

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, Check, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import { SubscriptionPlan } from '@/hooks/useSubscription';
import { toast } from 'sonner';

interface SubscriptionViewProps {
  subscription: SubscriptionPlan | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRefetch?: () => void;
}

const spin = keyframes`to { transform: rotate(360deg); }`;

const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 28px;
  width: 100%;
  max-width: 860px;
  padding: 68px 40px 64px 40px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 24px 20px 64px 20px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 26px;
  }
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  line-height: 1.5;
`;

/* ─────────────────────────── Sections (Unboxed / Fluid) ─────────────────────────── */

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 24px;
`;

const TopMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PlanBadge = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 4px 14px;
  border-radius: 9999px;
`;

const StatusTag = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 3px 10px;
  border-radius: 9999px;
  text-transform: capitalize;
`;

const MaintenanceTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.01em;
`;

const MaintenanceBody = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin: 0;
  max-width: 680px;
`;

const AccountRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 18px;
  margin-top: 4px;
`;

const AccountLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const AccountValueGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AccountAddress = styled.span`
  font-family: monospace;
  font-size: 13px;
  color: #ffffff;
  letter-spacing: -0.02em;
`;

const CopyButton = styled.button`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  padding: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
  }
`;

/* ─────────────────────────── Features Section ─────────────────────────── */

const FeaturesTitle = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  background: transparent;
  border: none;
`;

const CheckWrapper = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
  margin-top: 1px;
`;

const FeatureText = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.45;
`;

/* ─────────────────────────── States ─────────────────────────── */

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  gap: 16px;
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 24px;
`;

function truncateAddress(addr: string): string {
  if (!addr) return '';
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export function SubscriptionView({
  subscription,
  isLoading,
  isError,
  errorMessage,
  onRefetch,
}: SubscriptionViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Account address copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Container
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
    >
      <PageHeader>
        <Title>Subscription</Title>
        <Subtitle>Platform plan details and included enterprise features.</Subtitle>
      </PageHeader>

      {isLoading ? (
        <LoadingContainer>
          <Spinner aria-busy="true" />
          <Subtitle>Loading subscription info...</Subtitle>
        </LoadingContainer>
      ) : isError ? (
        <ErrorContainer>
          <AlertTriangle size={32} style={{ color: 'rgba(255,255,255,0.6)' }} />
          <Title style={{ fontSize: '20px' }}>Unable to load subscription</Title>
          <Subtitle>{errorMessage || 'An error occurred while fetching details.'}</Subtitle>
          {onRefetch && (
            <button
              onClick={onRefetch}
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                padding: '8px 20px',
                borderRadius: '9999px',
                border: 'none',
                background: '#FFFFFF',
                color: '#000000',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={14} /> Retry
            </button>
          )}
        </ErrorContainer>
      ) : subscription ? (
        <>
          {/* Main Maintenance / Status Section */}
          <ContentSection>
            <TopMetaRow>
              <PlanBadge>{subscription.planName}</PlanBadge>
              <StatusTag>{subscription.statusTag}</StatusTag>
            </TopMetaRow>

            <MaintenanceTitle>{subscription.maintenanceTitle}</MaintenanceTitle>
            <MaintenanceBody>{subscription.maintenanceMessage}</MaintenanceBody>

            <AccountRow>
              <AccountLabel>Account</AccountLabel>
              <AccountValueGroup>
                <AccountAddress>{truncateAddress(subscription.accountAddress)}</AccountAddress>
                <CopyButton
                  onClick={() => handleCopy(subscription.accountAddress)}
                  title="Copy account address"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </CopyButton>
              </AccountValueGroup>
            </AccountRow>
          </ContentSection>

          {/* Features Section */}
          <ContentSection>
            <FeaturesTitle>Features</FeaturesTitle>
            <FeaturesGrid>
              {subscription.features.map((feature) => (
                <FeatureItem key={feature.id}>
                  <CheckWrapper>
                    <CheckCircle2 size={13} />
                  </CheckWrapper>
                  <FeatureText>{feature.title}</FeatureText>
                </FeatureItem>
              ))}
            </FeaturesGrid>
          </ContentSection>
        </>
      ) : null}
    </Container>
  );
}

'use client';

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, Check, RefreshCw, AlertTriangle, Sparkles, Check as CheckIcon } from 'lucide-react';
import { SubscriptionPlan, PlanOption } from '@/hooks/useSubscription';
import { toast } from 'sonner';

interface SubscriptionViewProps {
  subscription: SubscriptionPlan | null;
  activePlanId?: 'starter' | 'pro' | 'enterprise';
  availablePlans?: PlanOption[];
  onSelectPlan?: (planId: 'starter' | 'pro' | 'enterprise') => void;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRefetch?: () => void;
}

const spin = keyframes`to { transform: rotate(360deg); }`;

const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 36px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px 80px 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 24px 16px 60px 16px;
    gap: 28px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 34px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 28px;
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

/* ─────────────────────────── Image 2 Card Layout ─────────────────────────── */

const ActiveSubscriptionStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 620px;
  margin: 0 auto;
`;

const CardBox = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.09);
  backdrop-filter: blur(40px);
  border-radius: 20px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.5);

  @media (max-width: 640px) {
    padding: 20px;
  }
`;

const TopMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PlanBadge = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
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
`;

const MaintenanceTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.01em;

  @media (max-width: 640px) {
    font-size: 20px;
  }
`;

const MaintenanceBody = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 13.5px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.6;
  margin: 0;
`;

const AccountRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 16px;
  margin-top: 4px;
`;

const AccountLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.45);
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
  letter-spacing: -0.01em;
`;

const CopyButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.6);
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.12);
  }
`;

/* ─────────────────────────── Features Card (Image 2) ─────────────────────────── */

const FeaturesTitle = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  margin: 0 0 6px 0;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 12px 20px;

  @media (min-width: 580px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const FeatureItem = styled.div<{ $isHighlighted?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: ${({ $isHighlighted }) => ($isHighlighted ? '12px 14px' : '4px 0')};
  background: ${({ $isHighlighted }) => ($isHighlighted ? 'rgba(255, 255, 255, 0.04)' : 'transparent')};
  border: ${({ $isHighlighted }) => ($isHighlighted ? '1px solid rgba(255, 255, 255, 0.08)' : 'none')};
  border-radius: ${({ $isHighlighted }) => ($isHighlighted ? '12px' : '0')};
  grid-column: ${({ $isHighlighted }) => ($isHighlighted ? '1 / -1' : 'auto')};

  @media (min-width: 580px) {
    grid-column: ${({ $isHighlighted }) => ($isHighlighted ? '1 / 2' : 'auto')};
  }
`;

const CheckWrapper = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
  margin-top: 1px;
`;

const FeatureText = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 13.5px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.4;
`;

/* ─────────────────────────── Plan Selector Cards ─────────────────────────── */

const SelectorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 32px;
`;

const SectionHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
`;

const SectionTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const PlanTierCard = styled.div<{ $isActive?: boolean; $isPopular?: boolean }>`
  background: ${({ $isActive }) => ($isActive ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)')};
  border: 1px solid ${({ $isActive }) => ($isActive ? '#60A5FA' : 'rgba(255, 255, 255, 0.08)')};
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ $isActive }) => ($isActive ? '#60A5FA' : 'rgba(255, 255, 255, 0.2)')};
    background: rgba(255, 255, 255, 0.04);
  }
`;

const PopularRibbon = styled.span`
  position: absolute;
  top: -12px;
  right: 20px;
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #ffffff;
  background: linear-gradient(135deg, #60A5FA, #2563EB);
  padding: 3px 10px;
  border-radius: 9999px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
`;

const PlanName = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
`;

const PriceVal = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 600;
  color: #ffffff;
`;

const PricePeriod = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`;

const PlanDescription = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 8px 0 0 0;
  line-height: 1.5;
`;

const SelectPlanBtn = styled.button<{ $isActive?: boolean }>`
  width: 100%;
  border-radius: 9999px;
  padding: 10px;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  ${({ $isActive }) =>
    $isActive
      ? `
    background: rgba(96, 165, 250, 0.15);
    color: #60A5FA;
    border: 1px solid rgba(96, 165, 250, 0.3);
    cursor: default;
  `
      : `
    background: #FFFFFF;
    color: #000000;
    border: none;

    &:hover {
      background: #EDEDED;
      transform: translateY(-1px);
    }
  `}
`;

/* ─────────────────────────── Loading / Error ─────────────────────────── */

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
  border-radius: 20px;
`;

function truncateAddress(addr: string): string {
  if (!addr) return '';
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export function SubscriptionView({
  subscription,
  activePlanId = 'pro',
  availablePlans = [],
  onSelectPlan,
  isLoading,
  isError,
  errorMessage,
  onRefetch,
}: SubscriptionViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Account address copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlanSelect = (planId: 'starter' | 'pro' | 'enterprise') => {
    if (onSelectPlan) {
      onSelectPlan(planId);
      const planName = planId === 'starter' ? 'Starter' : planId === 'pro' ? 'Pro' : 'Enterprise';
      toast.success(`Subscribed to ${planName} plan`);
    }
  };

  return (
    <Container
      initial={{ opacity: 0, y: 25 }}
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
          {/* Active Contracted Subscription Stack (Image 2 Format) */}
          <ActiveSubscriptionStack>
            {/* Card 1: Maintenance / Plan Header & Account */}
            <CardBox>
              <TopMetaRow>
                <PlanBadge>{subscription.planName}</PlanBadge>
                <StatusTag>{subscription.statusTag}</StatusTag>
              </TopMetaRow>

              <MaintenanceTitle>{subscription.maintenanceTitle}</MaintenanceTitle>
              <MaintenanceBody>{subscription.maintenanceMessage}</MaintenanceBody>

              <AccountRow>
                <AccountLabel>ACCOUNT</AccountLabel>
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
            </CardBox>

            {/* Card 2: Features Grid (Image 2 Format) */}
            <CardBox>
              <FeaturesTitle>Features</FeaturesTitle>
              <FeaturesGrid>
                {subscription.features.map((feature) => {
                  const isHighlighted = feature.id === 'extension' || feature.title.includes('browser extension');
                  return (
                    <FeatureItem key={feature.id} $isHighlighted={isHighlighted}>
                      <CheckWrapper>
                        <CheckCircle2 size={13} />
                      </CheckWrapper>
                      <FeatureText>{feature.title}</FeatureText>
                    </FeatureItem>
                  );
                })}
              </FeaturesGrid>
            </CardBox>
          </ActiveSubscriptionStack>

          {/* Plan Selector Grid */}
          {availablePlans && availablePlans.length > 0 && (
            <SelectorSection>
              <SectionHeaderRow>
                <SectionTitle>Available Subscription Plans</SectionTitle>
                <Subtitle>Select or upgrade your contracted plan anytime.</Subtitle>
              </SectionHeaderRow>

              <PlansGrid>
                {availablePlans.map((plan) => {
                  const isActive = plan.id === activePlanId;
                  return (
                    <PlanTierCard key={plan.id} $isActive={isActive} $isPopular={plan.isPopular}>
                      {plan.isPopular && <PopularRibbon>Popular</PopularRibbon>}

                      <div>
                        <PlanName>{plan.name}</PlanName>
                        <PriceRow>
                          <PriceVal>${plan.price}</PriceVal>
                          <PricePeriod>{plan.billingPeriod}</PricePeriod>
                        </PriceRow>
                        <PlanDescription>{plan.description}</PlanDescription>
                      </div>

                      <SelectPlanBtn
                        $isActive={isActive}
                        onClick={() => handlePlanSelect(plan.id)}
                      >
                        {isActive ? (
                          <>
                            <CheckIcon size={14} /> Current Plan
                          </>
                        ) : (
                          `Select ${plan.name}`
                        )}
                      </SelectPlanBtn>
                    </PlanTierCard>
                  );
                })}
              </PlansGrid>
            </SelectorSection>
          )}
        </>
      ) : null}
    </Container>
  );
}

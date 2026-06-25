"use client";

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { isOpenAmountLink } from '@/lib/payment-link-utils';
import { getPaymentLink } from '@/lib/payments-api';
import { PaymentLink } from '@luxor/contracts';
import { ArrowLeft, Monitor, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const PageContainer = styled(motion.div)`
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 8px 16px;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
`;

const ToggleContainer = styled.div`
  display: flex;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 4px;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  background: ${({ $active }) => ($active ? '#FFFFFF' : 'transparent')};
  color: ${({ $active }) => ($active ? '#000000' : 'rgba(255,255,255,0.6)')};
  border: none;
  border-radius: 9999px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${({ $active }) => ($active ? '#000000' : '#FFFFFF')};
  }
`;

const PreviewWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  min-height: 60vh;
  padding: 24px 0;
`;

const DeviceFrame = styled(motion.div)<{ $mode: 'desktop' | 'mobile' }>`
  width: ${({ $mode }) => ($mode === 'mobile' ? '375px' : '100%')};
  max-width: ${({ $mode }) => ($mode === 'mobile' ? '375px' : '480px')};
  ${({ $mode }) =>
    $mode === 'mobile' &&
  `
    border: 12px solid #222;
    border-radius: 40px;
    overflow: hidden;
    background: #000000;
    min-height: 700px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    box-shadow: 0 32px 64px -16px rgba(0,0,0,0.8);
  `}
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
`;

const CheckoutCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  text-align: center;
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.8);
`;

const ProductName = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 500;
  color: #FFFFFF;
  margin-bottom: 32px;
`;

const AmountText = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 56px;
  font-weight: 500;
  letter-spacing: -2px;
  background: linear-gradient(to right, #60A5FA, #2563EB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
`;

const CurrencyText = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 40px;
`;

const OpenAmountInput = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -1px;
  text-align: center;
  width: 100%;
  max-width: 240px;
  margin: 0 auto 8px auto;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.3);
`;

const MockButton = styled.div`
  background: #FFFFFF;
  color: #000000;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 16px 32px;
  border-radius: 9999px;
  width: 100%;
  text-align: center;
`;

const Eyebrow = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #60A5FA;
  margin-bottom: 8px;
`;

const ZelleForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
  margin: 24px 0;
  width: 100%;
`;

const ZelleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    border-bottom: none;
  }
`;

const ZelleCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
`;

const ZelleLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
`;

const ZelleValue = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(96, 165, 250, 0.3);
  border-radius: 50%;
  border-top-color: #60A5FA;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default function PreviewPaymentLinkPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    async function fetchLink() {
      try {
        const data = await getPaymentLink(id);
        setLink(data);
      } catch (error) {
        toast.error('Failed to load payment link details');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchLink();
    }
  }, [id]);

  if (loading) {
    return (
      <PageContainer style={{ justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <LoadingSpinner />
      </PageContainer>
    );
  }

  if (!link) {
    return (
      <PageContainer>
        <Header>
          <BackButton onClick={() => router.back()}>
            <ArrowLeft size={16} /> Back to Links
          </BackButton>
        </Header>
        <div style={{ textAlign: 'center', marginTop: '100px', color: 'rgba(255,255,255,0.5)' }}>
          Payment link not found.
        </div>
      </PageContainer>
    );
  }

  const previewUrl = `/pay/link/${link.id}`;

  const dateObj = link ? new Date(link.createdAt) : null;
  const formattedDate = dateObj
    ? dateObj.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <PageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
    >
      <Header>
        <TitleArea>
          <BackButton onClick={() => router.back()}>
            <ArrowLeft size={16} /> Back
          </BackButton>
          <Title>Link Preview</Title>
        </TitleArea>
        <ToggleContainer>
          <ToggleButton 
            $active={mode === 'desktop'} 
            onClick={() => setMode('desktop')}
          >
            <Monitor size={16} /> Desktop
          </ToggleButton>
          <ToggleButton 
            $active={mode === 'mobile'} 
            onClick={() => setMode('mobile')}
          >
            <Smartphone size={16} /> Mobile
          </ToggleButton>
        </ToggleContainer>
      </Header>

      <PreviewWrapper>
        <AnimatePresence mode="wait">
          <DeviceFrame
            key={mode}
            $mode={mode}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          >
            <CheckoutCard>
              <Eyebrow>Payment Request</Eyebrow>
              <ProductName>{link.name}</ProductName>

              {isOpenAmountLink(link) ? (
                <>
                  <OpenAmountInput>0.00</OpenAmountInput>
                  <CurrencyText>{link.currency}</CurrencyText>
                </>
              ) : (
                <>
                  <AmountText>{link.amount}</AmountText>
                  <CurrencyText>{link.currency}</CurrencyText>
                </>
              )}

              <ZelleForm style={{ marginTop: '24px', marginBottom: '24px' }}>
                {link.businessName && (
                  <ZelleRow>
                    <ZelleCol>
                      <ZelleLabel>Sender</ZelleLabel>
                      <ZelleValue style={{ fontSize: '14px', color: '#60A5FA' }}>{link.businessName}</ZelleValue>
                    </ZelleCol>
                  </ZelleRow>
                )}

                <ZelleRow>
                  <ZelleCol>
                    <ZelleLabel>Purpose</ZelleLabel>
                    <ZelleValue style={{ fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.8)' }}>
                      {link.name}
                    </ZelleValue>
                  </ZelleCol>
                </ZelleRow>

                <ZelleRow>
                  <ZelleCol>
                    <ZelleLabel>Date Sent</ZelleLabel>
                    <ZelleValue>{formattedDate}</ZelleValue>
                  </ZelleCol>
                </ZelleRow>
              </ZelleForm>

              <Link href={previewUrl} target="_blank" style={{ width: '100%', textDecoration: 'none', display: 'block' }}>
                <MockButton style={{ cursor: 'pointer' }}>Pay Now</MockButton>
              </Link>
            </CheckoutCard>
          </DeviceFrame>
        </AnimatePresence>
      </PreviewWrapper>
    </PageContainer>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { getPaymentLink } from '@/lib/payments-api';
import { PaymentLink } from '@luxor/contracts';
import { ArrowLeft, Monitor, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

const PageContainer = styled(motion.div)`
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 40px;
    gap: 32px;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
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

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 32px;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 4px;
  width: 100%;
  
  @media (min-width: 768px) {
    width: auto;
  }
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  background: ${({ $active }) => ($active ? '#FFFFFF' : 'transparent')};
  color: ${({ $active }) => ($active ? '#000000' : 'rgba(255,255,255,0.6)')};
  border: none;
  border-radius: 9999px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;

  &:hover {
    color: ${({ $active }) => ($active ? '#000000' : '#FFFFFF')};
  }
  
  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 3fr;
    gap: 32px;
  }
`;

const MetaCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(40px);
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: fit-content;
  box-shadow: 0 16px 32px -8px rgba(0,0,0,0.4);

  @media (min-width: 768px) {
    padding: 32px;
    border-radius: 40px;
    box-shadow: 0 32px 64px -16px rgba(0,0,0,0.6);
  }
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MetaLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #60A5FA;
`;

const MetaValue = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  word-break: break-all;

  @media (min-width: 768px) {
    font-size: 15px;
  }
`;

const AmountValue = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 36px;
  font-weight: 500;
  letter-spacing: -1px;
  background: linear-gradient(to right, #60A5FA, #2563EB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (min-width: 768px) {
    font-size: 48px;
  }
`;

const PreviewArea = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 24px;
  min-height: 400px;
  position: relative;

  @media (min-width: 768px) {
    padding: 40px;
    border-radius: 40px;
    min-height: 600px;
  }
`;

const MockContainer = styled(motion.div)<{ $mode: 'desktop' | 'mobile' }>`
  width: 100%;
  max-width: ${({ $mode }) => ($mode === 'mobile' ? '375px' : '500px')};
  min-height: ${({ $mode }) => ($mode === 'mobile' ? '600px' : '400px')};
  border: ${({ $mode }) => ($mode === 'mobile' ? '8px solid #222' : '1px solid rgba(255,255,255,0.1)')};
  border-radius: ${({ $mode }) => ($mode === 'mobile' ? '32px' : '24px')};
  overflow: hidden;
  box-shadow: 0 16px 32px -8px rgba(0,0,0,0.6);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  background: #0A0A0A;
  display: flex;
  flex-direction: column;
  padding: ${({ $mode }) => ($mode === 'mobile' ? '32px 20px' : '40px 32px')};
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  @media (min-width: 768px) {
    border: ${({ $mode }) => ($mode === 'mobile' ? '12px solid #222' : '1px solid rgba(255,255,255,0.1)')};
    border-radius: ${({ $mode }) => ($mode === 'mobile' ? '40px' : '24px')};
    box-shadow: 0 32px 64px -16px rgba(0,0,0,0.8);
    min-height: ${({ $mode }) => ($mode === 'mobile' ? '812px' : '600px')};
    padding: ${({ $mode }) => ($mode === 'mobile' ? '40px 24px' : '48px 40px')};
  }
`;

const MockBusiness = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #60A5FA;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 8px;

  @media (min-width: 768px) {
    font-size: 14px;
  }
`;

const MockProduct = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  color: #FFFFFF;
  margin-bottom: 24px;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 32px;
    margin-bottom: 40px;
  }
`;

const MockAmount = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 48px;
  font-weight: 500;
  letter-spacing: -2px;
  background: linear-gradient(to right, #60A5FA, #2563EB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 4px;

  @media (min-width: 768px) {
    font-size: 64px;
    margin-bottom: 8px;
  }
`;

const MockCurrency = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 40px;

  @media (min-width: 768px) {
    font-size: 20px;
    margin-bottom: 60px;
  }
`;

const MockButton = styled.div`
  background: #FFFFFF;
  color: #000000;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  padding: 14px 24px;
  border-radius: 9999px;
  width: 100%;
  text-align: center;
  margin-top: auto;
  opacity: 0.8;
  box-sizing: border-box;

  @media (min-width: 768px) {
    font-size: 16px;
    padding: 16px 32px;
  }
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
  const [mode, setMode] = useState<'desktop' | 'mobile'>('mobile');

  // En dispositivos móviles, forzamos la vista a móvil.
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setMode('mobile');
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

      <ContentGrid>
        <MetaCard>
          <MetaItem>
            <MetaLabel>Product / Service</MetaLabel>
            <MetaValue>{link.name}</MetaValue>
          </MetaItem>
          
          <MetaItem>
            <MetaLabel>Business Name</MetaLabel>
            <MetaValue>{link.businessName || 'N/A'}</MetaValue>
          </MetaItem>

          <MetaItem>
            <MetaLabel>Amount</MetaLabel>
            <AmountValue>
              {link.amount} {link.currency}
            </AmountValue>
          </MetaItem>

          <MetaItem>
            <MetaLabel>Target Merchant Wallet</MetaLabel>
            <MetaValue style={{ fontFamily: 'monospace', fontSize: '12px' }}>
              {link.merchantWallet}
            </MetaValue>
          </MetaItem>

          <MetaItem>
            <MetaLabel>Created At</MetaLabel>
            <MetaValue>
              {new Date(link.createdAt).toLocaleString()}
            </MetaValue>
          </MetaItem>
        </MetaCard>

        <PreviewArea>
          <AnimatePresence mode="wait">
            <MockContainer
              key={mode}
              $mode={mode}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            >
              <MockBusiness>{link.businessName || 'Merchant Name'}</MockBusiness>
              <MockProduct>{link.name}</MockProduct>
              <MockAmount>{link.amount}</MockAmount>
              <MockCurrency>{link.currency}</MockCurrency>
              
              <MockButton>Pay Now</MockButton>
            </MockContainer>
          </AnimatePresence>
        </PreviewArea>
      </ContentGrid>
    </PageContainer>
  );
}

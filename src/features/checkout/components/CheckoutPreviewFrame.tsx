'use client';

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

import { Lock, Globe } from 'lucide-react';

interface CheckoutPreviewFrameProps {
  mode: 'mobile' | 'desktop';
  children: React.ReactNode;
}

// Main container for the preview area
const FrameWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 500px;
  position: relative;
  overflow: hidden;
`;

// Desktop frame mockup
const DesktopContainer = styled(motion.div)`
  width: 100%;
  max-width: 900px;
  height: 600px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DesktopHeader = styled.div`
  height: 40px;
  background: #F3F4F6;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: relative;
`;

const WindowButtons = styled.div`
  display: flex;
  gap: 6px;
  width: 120px;
  flex-shrink: 0;
`;

const DotButton = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  opacity: 0.8;
`;

const AddressBar = styled.div`
  flex: 1;
  max-width: 320px;
  height: 24px;
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  font-family: sans-serif;
  font-size: 11px;
  color: #4B5563;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  gap: 4px;
`;

const DomainText = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #6B7280;
  width: 120px;
  justify-content: flex-end;
  font-family: 'Montserrat', sans-serif;
  flex-shrink: 0;
`;

const DesktopContent = styled.div`
  flex: 1;
  overflow-y: auto;
  background: #FFFFFF;
  position: relative;
`;

// Mobile device mockup (iPhone-like)
const PhoneContainer = styled(motion.div)`
  width: 340px;
  height: 600px;
  background: #FFFFFF;
  border: 10px solid #202028;
  border-radius: 40px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

const PhoneNotch = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 22px;
  background: #202028;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  z-index: 10;
`;

const PhoneContent = styled.div`
  flex: 1;
  overflow-y: auto;
  background: #FFFFFF;
  padding-top: 22px; /* space for notch */
  position: relative;
`;

export const CheckoutPreviewFrame: React.FC<CheckoutPreviewFrameProps> = ({ mode, children }) => {
  if (mode === 'mobile') {
    return (
      <FrameWrapper>
        <PhoneContainer
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <PhoneNotch />
          <PhoneContent>{children}</PhoneContent>
        </PhoneContainer>
      </FrameWrapper>
    );
  }

  return (
    <FrameWrapper>
      <DesktopContainer
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <DesktopHeader>
          <WindowButtons>
            <DotButton $color="#FF5F56" />
            <DotButton $color="#FFBD2E" />
            <DotButton $color="#27C93F" />
          </WindowButtons>
          <AddressBar>
            <Lock size={10} className="text-green-600 shrink-0" />
            buy.stripe.com
          </AddressBar>
          <DomainText>
            <Globe size={11} className="text-zinc-400 shrink-0" />
            Utiliza tu dominio
          </DomainText>
        </DesktopHeader>
        <DesktopContent>{children}</DesktopContent>
      </DesktopContainer>
    </FrameWrapper>
  );
};

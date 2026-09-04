'use client';

import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, BookOpen, MessageSquare, Twitter, Mail } from 'lucide-react';
import { toast } from 'sonner';

export interface SupportCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- Styled Components ---

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 200;
`;

const DrawerContainer = styled(motion.aside)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 420px;
  background: #0E0F14;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 201;
  display: flex;
  flex-direction: column;
  box-shadow: -20px 0 50px rgba(0, 0, 0, 0.8);
  overflow-y: auto;
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const DrawerTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #FFFFFF;
  letter-spacing: -0.01em;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #FFFFFF;
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const DrawerBody = styled.div`
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const SectionLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
`;

const CardsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SupportCard = styled.a`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.16);
    transform: translateY(-1px);

    .arrow-icon {
      transform: translateX(4px);
      color: #60A5FA;
    }
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const CardSubtitle = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
`;

const CardMainRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const CardTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #FFFFFF;
`;

const CardTitle = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #FFFFFF;
`;

const IconWrapper = styled.div`
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
`;

// --- Custom Discord SVG Icon ---
function DiscordIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

// --- Custom X / Twitter SVG Icon ---
function XTwitterIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function SupportCenterDrawer({ isOpen, onClose }: SupportCenterDrawerProps) {
  const handleOpenTicket = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = 'mailto:support@luxorpay.app?subject=Support%20Request%20-%20Luxor%20Pay';
    toast.success('Opening support email client');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Backdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <DrawerContainer
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
          >
            {/* Header */}
            <DrawerHeader>
              <DrawerTitle>Support Center</DrawerTitle>
              <CloseButton type="button" onClick={onClose} aria-label="Close support center">
                <X size={16} />
              </CloseButton>
            </DrawerHeader>

            {/* Content Body */}
            <DrawerBody>
              {/* Section 1: Resources */}
              <Section>
                <SectionLabel>Resources</SectionLabel>
                <CardsStack>
                  {/* Discord Community */}
                  <SupportCard
                    href="https://discord.gg/luxorpay"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CardSubtitle>Join our Discord Community</CardSubtitle>
                    <CardMainRow>
                      <CardTitleGroup>
                        <IconWrapper>
                          <DiscordIcon size={18} />
                        </IconWrapper>
                        <CardTitle>Community</CardTitle>
                      </CardTitleGroup>
                      <ArrowRight size={16} className="arrow-icon text-gray-400 transition-transform" />
                    </CardMainRow>
                  </SupportCard>

                  {/* Follow on Twitter */}
                  <SupportCard
                    href="https://x.com/luxorpay"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CardSubtitle>Follow us on Twitter</CardSubtitle>
                    <CardMainRow>
                      <CardTitleGroup>
                        <IconWrapper>
                          <XTwitterIcon size={16} />
                        </IconWrapper>
                        <CardTitle>Twitter</CardTitle>
                      </CardTitleGroup>
                      <ArrowRight size={16} className="arrow-icon text-gray-400 transition-transform" />
                    </CardMainRow>
                  </SupportCard>

                  {/* Documentation */}
                  <SupportCard
                    href="https://docs.luxorpay.app"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CardSubtitle>Learn more about Luxor Pay</CardSubtitle>
                    <CardMainRow>
                      <CardTitleGroup>
                        <IconWrapper>
                          <BookOpen size={18} />
                        </IconWrapper>
                        <CardTitle>Documentation</CardTitle>
                      </CardTitleGroup>
                      <ArrowRight size={16} className="arrow-icon text-gray-400 transition-transform" />
                    </CardMainRow>
                  </SupportCard>
                </CardsStack>
              </Section>

              {/* Section 2: Support */}
              <Section>
                <SectionLabel>Support</SectionLabel>
                <CardsStack>
                  {/* Create a support ticket */}
                  <SupportCard href="mailto:support@luxorpay.app" onClick={handleOpenTicket}>
                    <CardSubtitle>Create a support ticket</CardSubtitle>
                    <CardMainRow>
                      <CardTitleGroup>
                        <IconWrapper>
                          <Mail size={18} />
                        </IconWrapper>
                        <CardTitle>Open Ticket</CardTitle>
                      </CardTitleGroup>
                      <ArrowRight size={16} className="arrow-icon text-gray-400 transition-transform" />
                    </CardMainRow>
                  </SupportCard>
                </CardsStack>
              </Section>
            </DrawerBody>
          </DrawerContainer>
        </>
      )}
    </AnimatePresence>
  );
}

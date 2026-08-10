"use client";

import styled from "styled-components";
import { motion } from "framer-motion";

const TermsContainer = styled.main`
  min-height: 100vh;
  background-color: #0a0a0a;
  color: #ededed;
  font-family: "Montserrat", sans-serif;
  padding: 80px 24px;
  display: flex;
  justify-content: center;
  position: relative;
  overflow: hidden;

  /* Subtle background glow */
  &::before {
    content: "";
    position: absolute;
    top: -20%;
    left: -10%;
    width: 600px;
    height: 600px;
    background: rgba(37, 99, 235, 0.15);
    filter: blur(120px);
    border-radius: 50%;
    z-index: 0;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -20%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: rgba(249, 115, 22, 0.08);
    filter: blur(120px);
    border-radius: 50%;
    z-index: 0;
  }
`;

const ContentWrapper = styled(motion.div)`
  max-width: 800px;
  width: 100%;
  z-index: 1;
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 64px;
`;

const Eyebrow = styled.span`
  font-family: "Outfit", sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #60a5fa;
  display: block;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-family: "Outfit", sans-serif;
  font-size: 48px;
  font-weight: 500;
  letter-spacing: -1.5px;
  color: #ffffff;
  margin: 0 0 24px 0;
  line-height: 1.1;

  @media (min-width: 1024px) {
    font-size: 60px;
  }
`;

const Subtitle = styled.p`
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;

  @media (min-width: 1024px) {
    font-size: 16px;
  }
`;

const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40px);
  border-radius: 40px;
  padding: 40px;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.6);
  margin-bottom: 40px;

  @media (min-width: 768px) {
    padding: 64px;
  }
`;

const SectionTitle = styled.h2`
  font-family: "Outfit", sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #ffffff;
  margin: 0 0 24px 0;

  @media (min-width: 1024px) {
    font-size: 40px;
  }
`;

const SectionSubtitle = styled.h3`
  font-family: "Outfit", sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: #ffffff;
  margin: 32px 0 16px 0;
  text-transform: uppercase;
`;

const Paragraph = styled.p`
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.8;
  margin: 0 0 24px 0;

  @media (min-width: 1024px) {
    font-size: 16px;
  }
`;

const HighlightText = styled.span`
  background: linear-gradient(to right, #60a5fa, #2563eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 500;
`;

const List = styled.ul`
  margin: 0 0 24px 0;
  padding-left: 20px;
  color: rgba(255, 255, 255, 0.8);
`;

const ListItem = styled.li`
  font-size: 15px;
  font-weight: 300;
  line-height: 1.8;
  margin-bottom: 12px;

  @media (min-width: 1024px) {
    font-size: 16px;
  }
`;

export const TermsView = () => {
  return (
    <TermsContainer>
      <ContentWrapper
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
      >
        <HeaderSection>
          <Eyebrow>Legal Framework</Eyebrow>
          <Title>Terms & Conditions</Title>
          <Subtitle>
            Governing the use of Luxor Pay's financial infrastructure. By accessing our ecosystem, you agree to these foundational rules designed for abundance and security.
          </Subtitle>
        </HeaderSection>

        <GlassCard>
          <SectionTitle>Ecosystem Participation</SectionTitle>
          <Paragraph>
            Welcome to Luxor Pay. Our platform provides advanced financial <HighlightText>infrastructure</HighlightText> designed to power a robust on-chain economy. By utilizing our services, you engage with our <HighlightText>liquidity engine</HighlightText> and agree to comply with all applicable regulations.
          </Paragraph>

          <SectionSubtitle>
            Utility Token Usage
          </SectionSubtitle>
          <Paragraph>
            The Luxor utility token ($LXR) serves as the core mechanism for accessing premium features within our ecosystem. It is intended strictly for utility within the Luxor network and does not represent an investment contract, equity, or a promise of future value.
          </Paragraph>

          <SectionSubtitle>Account Security & Sovereignty</SectionSubtitle>
          <Paragraph>
            As a participant, you maintain sovereignty over your digital assets. You are solely responsible for the security of your private keys and credentials. Luxor Pay cannot recover funds lost due to compromised on-chain wallets or user negligence.
          </Paragraph>
        </GlassCard>

        <GlassCard>
          <SectionTitle>Operational Guidelines</SectionTitle>
          <Paragraph>
            To ensure the health and sustainability of the Luxor ecosystem, all users must adhere to strict operational guidelines. Malicious activities, market manipulation, or attempts to exploit our infrastructure will result in immediate termination of access.
          </Paragraph>

          <List>
            <ListItem>
              <strong>Compliance:</strong> Users must comply with all local laws and regulations regarding digital assets and financial transactions.
            </ListItem>
            <ListItem>
              <strong>On-Chain Interactions:</strong> Transactions executed via our smart contracts are final and immutable. Luxor Pay cannot reverse or modify on-chain state.
            </ListItem>
            <ListItem>
              <strong>Service Availability:</strong> While we strive for maximum uptime, our infrastructure may undergo maintenance. We do not guarantee uninterrupted access to the liquidity engine.
            </ListItem>
          </List>
        </GlassCard>

        <GlassCard>
          <SectionTitle>Liability & Disclaimers</SectionTitle>
          <Paragraph>
            Luxor Pay provides its infrastructure on an "as is" and "as available" basis. We disclaim all warranties, express or implied, regarding the performance, reliability, or accuracy of our services.
          </Paragraph>
          <Paragraph>
            By participating in our vision for financial abundance, you acknowledge the inherent risks associated with blockchain technology and digital assets. Luxor Pay shall not be held liable for any indirect, incidental, or consequential damages arising from your use of the ecosystem.
          </Paragraph>
          <Paragraph>
            <em>
              Last Updated: August 2026. These terms may evolve as we expand our ecosystem and deploy new on-chain primitives.
            </em>
          </Paragraph>
        </GlassCard>
      </ContentWrapper>
    </TermsContainer>
  );
};

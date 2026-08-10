"use client";

import styled from "styled-components";
import { motion } from "framer-motion";

const PrivacyContainer = styled.main`
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

export const PrivacyView = () => {
  return (
    <PrivacyContainer>
      <ContentWrapper
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
      >
        <HeaderSection>
          <Eyebrow>Trust & Transparency</Eyebrow>
          <Title>Privacy Architecture</Title>
          <Subtitle>
            At Luxor Pay, we build financial infrastructure engineered for
            abundance. Protecting the ecosystem while driving our on-chain
            liquidity engine requires uncompromising standards for data
            sovereignty and global compliance.
          </Subtitle>
        </HeaderSection>

        <GlassCard>
          <SectionTitle>Global Data Sovereignty</SectionTitle>
          <Paragraph>
            Our commitment to privacy extends beyond borders. As a foundational
            pillar of the Luxor Pay ecosystem, we deploy cryptographic
            safeguards to ensure your interaction with our{" "}
            <HighlightText>liquidity engine</HighlightText> remains secure. This
            document governs how we collect, store, and utilize data across our
            decentralized and centralized infrastructure.
          </Paragraph>

          <SectionSubtitle>
            US & International Compliance (GDPR & CCPA)
          </SectionSubtitle>
          <Paragraph>
            We operate in strict adherence to the General Data Protection
            Regulation (GDPR) for our European users, and the California
            Consumer Privacy Act (CCPA) for US residents. You possess the
            sovereign right to access, rectify, or securely erase your personal
            data from our systems at any time, subject to essential on-chain
            record retention requirements.
          </Paragraph>

          <SectionSubtitle>The CLOUD Act Context</SectionSubtitle>
          <Paragraph>
            In alignment with the US Clarifying Lawful Overseas Use of Data
            (CLOUD) Act and related jurisdictional frameworks, Luxor Pay
            maintains a compliant posture when responding to valid legal
            requests. Our architecture is designed to balance user privacy with
            essential legal obligations, ensuring that any data disclosure is
            heavily scrutinized and strictly limited to lawfully mandated
            scopes.
          </Paragraph>
        </GlassCard>

        <GlassCard>
          <SectionTitle>On-Chain Transparency</SectionTitle>
          <Paragraph>
            Interactions with the Luxor Pay infrastructure inherently involve
            blockchain technology. By participating in our ecosystem and
            utilizing our utility token, you acknowledge that on-chain
            data—including public wallet addresses and transaction hashes—is
            immutable and publicly visible.
          </Paragraph>

          <List>
            <ListItem>
              <strong>Cryptographic Proofs:</strong> While transactional logic
              is transparent, we minimize the linkage of your off-chain identity
              to your on-chain footprint whenever possible.
            </ListItem>
            <ListItem>
              <strong>Data Minimization:</strong> We only collect the minimal
              off-chain data necessary to power our ecosystem, conduct KYC/AML
              procedures, and provide seamless fiat-to-crypto gateways.
            </ListItem>
            <ListItem>
              <strong>Infrastructure Resilience:</strong> All off-chain personal
              data is encrypted at rest and in transit, utilizing
              state-of-the-art cipher suites to protect against unauthorized
              access.
            </ListItem>
          </List>
        </GlassCard>

        <GlassCard>
          <SectionTitle>Your Privacy Rights</SectionTitle>
          <Paragraph>
            As a participant in our vision for financial abundance, you maintain
            control over your data. You hold the right to request a
            comprehensive export of your off-chain profile and restrict certain
            processing activities. For any privacy-related inquiries or to
            exercise your rights, our compliance team can be reached through our
            secure portal.
          </Paragraph>
          <Paragraph>
            <em>
              Last Updated: August 2026. This architecture may evolve as we
              expand our ecosystem and adapt to new regulatory landscapes.
            </em>
          </Paragraph>
        </GlassCard>
      </ContentWrapper>
    </PrivacyContainer>
  );
};

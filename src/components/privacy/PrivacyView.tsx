"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText, Server } from "lucide-react";

const PrivacyContainer = styled.main`
  min-height: 100vh;
  background-color: #000000;
  color: #ededed;
  font-family: "Montserrat", sans-serif;
  padding: 120px 24px 80px 24px;
  display: flex;
  justify-content: center;
  position: relative;
  overflow: hidden;

  /* Subtle background glows */
  &::before {
    content: "";
    position: absolute;
    top: -15%;
    left: -10%;
    width: 700px;
    height: 700px;
    background: rgba(37, 99, 235, 0.18);
    filter: blur(140px);
    border-radius: 50%;
    z-index: 0;
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -15%;
    right: -10%;
    width: 700px;
    height: 700px;
    background: rgba(249, 115, 22, 0.1);
    filter: blur(140px);
    border-radius: 50%;
    z-index: 0;
    pointer-events: none;
  }
`;

const ContentWrapper = styled(motion.div)`
  max-width: 900px;
  width: 100%;
  z-index: 1;
`;

const BackNav = styled.div`
  margin-bottom: 40px;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: "Outfit", sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(96, 165, 250, 0.4);
    transform: translateX(-2px);
  }

  &:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
  }
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
  font-size: 44px;
  font-weight: 500;
  letter-spacing: -1.5px;
  color: #ffffff;
  margin: 0 0 20px 0;
  line-height: 1.15;

  @media (min-width: 768px) {
    font-size: 60px;
  }
`;

const Subtitle = styled.p`
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  max-width: 680px;
  margin: 0 auto;

  @media (min-width: 1024px) {
    font-size: 16px;
  }
`;

const LastUpdated = styled.div`
  display: inline-block;
  margin-top: 20px;
  padding: 6px 16px;
  border-radius: 9999px;
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.2);
  font-family: monospace;
  font-size: 12px;
  color: #60a5fa;
`;

const GlassCard = styled.div`
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: none;
  border-radius: 0;
  padding: 32px 0;
  box-shadow: none;
  margin-bottom: 32px;

  @media (min-width: 768px) {
    padding: 40px 0;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const IconWrapper = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(37, 99, 235, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60a5fa;
  flex-shrink: 0;
`;

const SectionTitle = styled.h2`
  font-family: "Outfit", sans-serif;
  font-size: 26px;
  font-weight: 500;
  letter-spacing: -1px;
  color: #ffffff;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 32px;
  }
`;

const SectionSubtitle = styled.h3`
  font-family: "Outfit", sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #ffffff;
  margin: 28px 0 14px 0;
  text-transform: uppercase;
`;

const Paragraph = styled.p`
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.8;
  margin: 0 0 20px 0;

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

const CodeTag = styled.code`
  font-family: monospace;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 8px;
  border-radius: 6px;
  color: #60a5fa;
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

  strong {
    color: #ffffff;
    font-weight: 500;
  }
`;

const CalloutBox = styled.div`
  background: rgba(37, 99, 235, 0.08);
  border-left: 3px solid #2563eb;
  padding: 20px 24px;
  border-radius: 0 16px 16px 0;
  margin: 24px 0;

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.9);
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
        <BackNav>
          <BackButton href="/">
            <ArrowLeft size={16} /> Back to Home
          </BackButton>
        </BackNav>

        <HeaderSection>
          <Eyebrow>Trust, Security & Global Compliance</Eyebrow>
          <Title>Global Privacy Architecture</Title>
          <Subtitle>
            Sterling is committed to data sovereignty, user privacy, and global regulatory compliance across non-custodial Web3 financial infrastructure and fiat gateway integrations.
          </Subtitle>
          <LastUpdated>Effective Date: August 24, 2026 | Version 2.4</LastUpdated>
        </HeaderSection>

        {/* Executive Summary */}
        <GlassCard>
          <CardHeader>
            <IconWrapper>
              <ShieldCheck size={22} />
            </IconWrapper>
            <SectionTitle>1. Executive Privacy Architecture</SectionTitle>
          </CardHeader>
          <Paragraph>
            Sterling ("we", "us", or "our") operates a global decentralized payment infrastructure and merchant Web3 gateway. This Global Privacy Architecture explains how personal information, technical telemetry, and transactional metadata are processed when you interact with our web applications, developer APIs, payment links, and integrated fiat-to-crypto gateways (including third-party partners such as <HighlightText>MoonPay</HighlightText>).
          </Paragraph>
          <CalloutBox>
            <p>
              <strong>Core Privacy Guarantee:</strong> Sterling is built on non-custodial Web3 architecture. We do not store, control, or possess access to your private cryptographic keys, wallet seed phrases, or unencrypted financial credentials. You maintain full self-sovereignty over your digital assets at all times.
            </p>
          </CalloutBox>
        </GlassCard>

        {/* Non-Custodial Architecture & Data Collection */}
        <GlassCard>
          <CardHeader>
            <IconWrapper>
              <Lock size={22} />
            </IconWrapper>
            <SectionTitle>2. Information We Collect</SectionTitle>
          </CardHeader>
          <Paragraph>
            We adhere strictly to the principle of <strong>Data Minimization</strong> under international regulations. The data collected depends on how you interact with the Sterling infrastructure:
          </Paragraph>

          <SectionSubtitle>A. Public On-Chain Information</SectionSubtitle>
          <Paragraph>
            When executing transactions on the Solana blockchain through our interface, the following data is broadcast to the public blockchain network:
          </Paragraph>
          <List>
            <ListItem>
              <strong>Public Wallet Addresses:</strong> Cryptographic public keys (e.g., <CodeTag>Solana Base58 addresses</CodeTag>) used to initiate or receive token payments.
            </ListItem>
            <ListItem>
              <strong>On-Chain Metadata:</strong> Transaction signatures, timestamp, token amounts (SOL, USDC, STR, EURC), smart contract interactions, and program instructions.
            </ListItem>
          </List>

          <SectionSubtitle>B. Merchant & Platform Profile Data</SectionSubtitle>
          <Paragraph>
            For registered merchants utilizing our point-of-sale (POS) and web checkout APIs:
          </Paragraph>
          <List>
            <ListItem>
              <strong>Account Identity:</strong> Business name, email address, store domain, and tax identification (where mandated by local regulatory frameworks).
            </ListItem>
            <ListItem>
              <strong>Authentication Telemetry:</strong> Firebase Auth tokens, IP addresses, browser user-agent, session identifiers, and device security metrics.
            </ListItem>
          </List>

          <SectionSubtitle>C. Third-Party Fiat On/Off-Ramp Data (MoonPay & Gateway Partners)</SectionSubtitle>
          <Paragraph>
            Sterling integrates with regulated Virtual Asset Service Providers (VASPs) and licensed payment processors, including <HighlightText>MoonPay Ltd</HighlightText>, to facilitate fiat-to-crypto card processing, bank transfers, and local payout solutions.
          </Paragraph>
          <List>
            <ListItem>
              <strong>KYC / Identity Verification:</strong> Know Your Customer (KYC), Know Your Business (KYB), Anti-Money Laundering (AML), and Identity Verification data (such as passports, government IDs, facial biometric verification, and proof of address) are collected and processed <strong>directly by MoonPay</strong> in accordance with MoonPay's Privacy Policy.
            </ListItem>
            <ListItem>
              <strong>Payment Card & Banking Data:</strong> Credit card numbers, CVVs, and bank account details are handled exclusively by PCI-DSS Level 1 compliant processors (MoonPay, Stripe). Sterling never receives, processes, or stores raw payment card numbers.
            </ListItem>
          </List>
        </GlassCard>

        {/* Legal Basis & GDPR / CCPA Compliance */}
        <GlassCard>
          <CardHeader>
            <IconWrapper>
              <Eye size={22} />
            </IconWrapper>
            <SectionTitle>3. Global Regulatory Frameworks (GDPR, CCPA & CLOUD Act)</SectionTitle>
          </CardHeader>
          <Paragraph>
            Luxor Pay maintains strict legal compliance across major international privacy jurisdictions:
          </Paragraph>

          <SectionSubtitle>European Union & UK GDPR (Articles 6 & 13)</SectionSubtitle>
          <Paragraph>
            We process personal data under the following legal bases:
          </Paragraph>
          <List>
            <ListItem>
              <strong>Contractual Performance:</strong> To provide merchant payment link generation, transaction routing, and POS interface functionality.
            </ListItem>
            <ListItem>
              <strong>Legal Compliance:</strong> To adhere to international Anti-Money Laundering (AML), Counter-Financing of Terrorism (CFT), and sanction screening mandates (OFAC, EU Sanctions).
            </ListItem>
            <ListItem>
              <strong>Legitimate Interests:</strong> To detect fraud, prevent malicious network exploitation, optimize application performance, and maintain platform security.
            </ListItem>
          </List>

          <SectionSubtitle>California Consumer Privacy Act (CCPA / CPRA)</SectionSubtitle>
          <Paragraph>
            California residents possess specific rights regarding their personal information:
          </Paragraph>
          <List>
            <ListItem>
              <strong>Right to Know & Access:</strong> Request disclosure of personal information collected over the preceding 12 months.
            </ListItem>
            <ListItem>
              <strong>Right to Delete:</strong> Request deletion of off-chain personal records held in our databases.
            </ListItem>
            <ListItem>
              <strong>No Sale of Personal Information:</strong> Sterling <strong>does not sell, rent, or trade</strong> personal user data or merchant metadata to third-party data brokers or advertisers.
            </ListItem>
          </List>

          <SectionSubtitle>US CLOUD Act & International Law Enforcement Requests</SectionSubtitle>
          <Paragraph>
            In compliance with the US Clarifying Lawful Overseas Use of Data (CLOUD) Act and mutual legal assistance treaties (MLAT), Sterling evaluates all valid subpoenas, court orders, and law enforcement requests. Data disclosures are heavily vetted by legal counsel and strictly restricted to lawfully mandated parameters.
          </Paragraph>
        </GlassCard>

        {/* On-Chain Immutability & Data Retention */}
        <GlassCard>
          <CardHeader>
            <IconWrapper>
              <Server size={22} />
            </IconWrapper>
            <SectionTitle>4. Blockchain Immutability & Data Retention</SectionTitle>
          </CardHeader>
          <Paragraph>
            It is important for all users of decentralized financial infrastructure to understand the inherent nature of blockchain technology:
          </Paragraph>
          <CalloutBox>
            <p>
              <strong>Public Ledger Notice:</strong> Transactions broadcast to the Solana network are immutable, public, and permanently stored on decentralized validator nodes across the globe. Neither Sterling nor any third party possesses the technical ability to modify, erase, or mask data recorded on-chain.
            </p>
          </CalloutBox>
          <Paragraph>
            Off-chain data (such as merchant account settings and transactional logs) is retained for the minimal duration necessary to satisfy tax accounting laws, regulatory compliance mandates, and fraud prevention protocols (typically up to 5 to 7 years in accordance with global financial record retention standards).
          </Paragraph>
        </GlassCard>

        {/* Security & Contact */}
        <GlassCard>
          <CardHeader>
            <IconWrapper>
              <FileText size={22} />
            </IconWrapper>
            <SectionTitle>5. Cryptographic Security & Privacy Enquiries</SectionTitle>
          </CardHeader>
          <Paragraph>
            Sterling implements military-grade AES-256 encryption for all data at rest and TLS 1.3 protocol for all transit channels. Our web infrastructure undergoes continuous automated security assessments and third-party code audits.
          </Paragraph>
          <Paragraph>
            If you have questions regarding this Privacy Architecture, wish to exercise your data subject rights (GDPR/CCPA), or submit a formal compliance request, please contact our Legal & Privacy Office:
          </Paragraph>
          <List>
            <ListItem>
              <strong>Data Protection Officer (DPO):</strong> <CodeTag>privacy@sterlingpay.app</CodeTag>
            </ListItem>
            <ListItem>
              <strong>Legal & Compliance Desk:</strong> <CodeTag>legal@sterlingpay.app</CodeTag>
            </ListItem>
            <ListItem>
              <strong>Official Ecosystem Portal:</strong> <a href="https://sterlingpay.app" target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa" }}>https://sterlingpay.app</a>
            </ListItem>
          </List>
        </GlassCard>
      </ContentWrapper>
    </PrivacyContainer>
  );
};

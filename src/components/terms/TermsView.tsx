"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Scale, AlertTriangle, Cpu, ShieldAlert, FileCheck, RefreshCw } from "lucide-react";

const TermsContainer = styled.main`
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
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(40px);
  border-radius: 32px;
  padding: 32px;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.6);
  margin-bottom: 32px;

  @media (min-width: 768px) {
    padding: 56px;
    border-radius: 40px;
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

const WarningBox = styled.div`
  background: rgba(249, 115, 22, 0.08);
  border-left: 3px solid #f97316;
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

export const TermsView = () => {
  return (
    <TermsContainer>
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
          <Eyebrow>Master Service Agreement & Legal Terms</Eyebrow>
          <Title>Terms of Service & Protocol Rules</Title>
          <Subtitle>
            Legal master agreement governing the use of Luxor Pay non-custodial payment infrastructure, developer SDKs, POS software, and integrated fiat gateways.
          </Subtitle>
          <LastUpdated>Effective Date: August 24, 2026 | Version 3.1</LastUpdated>
        </HeaderSection>

        {/* 1. Acceptance & Non-Custodial Architecture Disclaimer */}
        <GlassCard>
          <CardHeader>
            <IconWrapper>
              <Scale size={22} />
            </IconWrapper>
            <SectionTitle>1. Acceptance of Terms & Non-Custodial Architecture</SectionTitle>
          </CardHeader>
          <Paragraph>
            These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "Merchant", or "Developer") and Luxor Pay ("Luxor", "we", "our"). By accessing our platform, utilizing our software APIs, creating Web3 payment links, or connecting a decentralized wallet, you explicitly agree to be bound by these Terms.
          </Paragraph>
          <CalloutBox>
            <p>
              <strong>NON-CUSTODIAL INFRASTRUCTURE NOTICE:</strong> Luxor Pay is a software technology provider. We are NOT a bank, custodial depositary, money transmitter, custodian, or financial exchange. Luxor Pay does not custody, store, hold, or possess control over user private keys, secret seed phrases, or digital assets. All blockchain transfers occur peer-to-peer directly between self-hosted Web3 wallets on the Solana blockchain.
            </p>
          </CalloutBox>
        </GlassCard>

        {/* 2. Third-Party Fiat Gateways (MoonPay Integration) */}
        <GlassCard>
          <CardHeader>
            <IconWrapper>
              <RefreshCw size={22} />
            </IconWrapper>
            <SectionTitle>2. Third-Party Fiat On/Off-Ramp Services (MoonPay)</SectionTitle>
          </CardHeader>
          <Paragraph>
            Luxor Pay integrates software interfaces and widgets provided by licensed third-party financial service providers, including <HighlightText>MoonPay Ltd</HighlightText> ("On-Ramp Partners"), to enable users and merchants to purchase digital assets or cash out using credit cards, debit cards, Apple Pay, Google Pay, or bank transfers.
          </Paragraph>
          <List>
            <ListItem>
              <strong>Independent Service Provider:</strong> Fiat-to-crypto and crypto-to-fiat transactions initiated through integrated widgets are executed solely by MoonPay. Your relationship regarding fiat payments, identity verification (KYC/AML), bank payouts, and card processing is governed directly by <a href="https://www.moonpay.com/legal/terms_of_use" target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa" }}>MoonPay Terms of Use</a> and Privacy Policy.
            </ListItem>
            <ListItem>
              <strong>No Custody or Intermediary Liability:</strong> Luxor Pay does not process, hold, or convert fiat currency. We disclaim all liability arising from delays, declined transactions, chargebacks, identity checks, or regulatory holds executed by MoonPay or payment card networks.
            </ListItem>
          </List>
        </GlassCard>

        {/* 3. Merchant Services & On-Chain Settlement */}
        <GlassCard>
          <CardHeader>
            <IconWrapper>
              <Cpu size={22} />
            </IconWrapper>
            <SectionTitle>3. Merchant Services & On-Chain Finality</SectionTitle>
          </CardHeader>
          <Paragraph>
            Luxor Pay empowers merchants to generate dynamic Web3 payment links, point-of-sale (POS) QR codes, and integrated checkout buttons for digital commerce:
          </Paragraph>
          <List>
            <ListItem>
              <strong>On-Chain Transaction Finality:</strong> All cryptocurrency transfers executed via the Solana blockchain (including SOL, USDC, LXR, and EURC) are permanent, irreversible, and unalterable. Once broadcasted and confirmed on-chain, transactions cannot be cancelled, reversed, or refunded by Luxor Pay.
            </ListItem>
            <ListItem>
              <strong>No Chargeback Mechanism On-Chain:</strong> Unlike traditional credit card networks, native Web3 transactions do not feature chargeback mechanisms. Merchants are responsible for managing their own dispute resolution, customer refunds, and return policies directly with buyers.
            </ListItem>
            <ListItem>
              <strong>Network Transaction Fees (Gas):</strong> Users initiating blockchain transactions are required to pay native network execution fees ("gas fees" paid in SOL) directly to decentralized Solana network validators. Luxor Pay does not collect or set network gas fees.
            </ListItem>
          </List>
        </GlassCard>

        {/* 4. Blockchain Risk Disclosures */}
        <GlassCard>
          <CardHeader>
            <IconWrapper>
              <AlertTriangle size={22} />
            </IconWrapper>
            <SectionTitle>4. Cryptographic Asset & Protocol Risk Disclosures</SectionTitle>
          </CardHeader>
          <Paragraph>
            By utilizing Web3 financial infrastructure, you explicitly acknowledge and accept the inherent technological and economic risks:
          </Paragraph>
          <WarningBox>
            <p>
              <strong>Risk Warning:</strong> Digital asset prices exhibit extreme market volatility. Token valuations (including SOL and SPL tokens) may fluctuate rapidly. Luxor Pay does not provide financial, investment, legal, or tax advice. You are solely responsible for evaluating the legal and tax implications of receiving digital assets in your jurisdiction.
            </p>
          </WarningBox>
          <List>
            <ListItem>
              <strong>Wallet Security Responsibility:</strong> You are 100% responsible for maintaining the physical and digital security of your Web3 wallet (e.g. Phantom, Solflare). Luxor Pay cannot assist in recovering lost private keys or funds sent to incorrect recipient addresses.
            </ListItem>
            <ListItem>
              <strong>Decentralized Network Outages:</strong> Luxor Pay is not responsible for transaction failures caused by Solana network congestion, validator downtime, RPC node latency, or third-party wallet software bugs.
            </ListItem>
          </List>
        </GlassCard>

        {/* 5. Prohibited Activities & Compliance */}
        <GlassCard>
          <CardHeader>
            <IconWrapper>
              <ShieldAlert size={22} />
            </IconWrapper>
            <SectionTitle>5. Prohibited Activities & AML / OFAC Compliance</SectionTitle>
          </CardHeader>
          <Paragraph>
            You agree not to utilize Luxor Pay infrastructure for any unlawful or prohibited activities. We enforce strict compliance monitoring in accordance with global Anti-Money Laundering (AML) standards:
          </Paragraph>
          <List>
            <ListItem>
              <strong>Sanctions Compliance:</strong> You warrant that you are not located in, under the control of, or a national or resident of any OFAC-sanctioned jurisdiction (e.g., Iran, North Korea, Syria, Cuba, Crimea region) or listed on Specially Designated Nationals (SDN) lists.
            </ListItem>
            <ListItem>
              <strong>Illegal Activities:</strong> Prohibited uses include terrorism financing, money laundering, sale of illegal drugs or weapons, counterfeit goods, fraudulent pyramid schemes, unauthorized gambling, or extortion.
            </ListItem>
            <ListItem>
              <strong>Malicious Exploitation:</strong> Attempts to compromise our web applications, execute denial-of-service (DDoS) attacks, inject malicious smart contracts, or reverse-engineer API credentials will result in immediate termination of service access.
            </ListItem>
          </List>
        </GlassCard>

        {/* 6. Utility Token Disclaimer & Intellectual Property */}
        <GlassCard>
          <CardHeader>
            <IconWrapper>
              <FileCheck size={22} />
            </IconWrapper>
            <SectionTitle>6. Utility Token ($LXR) Disclaimer & Governance</SectionTitle>
          </CardHeader>
          <Paragraph>
            The Luxor utility token (<HighlightText>$LXR</HighlightText>) is engineered strictly as a utility and governance asset designed to power operational features within the Luxor Pay ecosystem (such as tier-based fee discounts, governance voting, and protocol features).
          </Paragraph>
          <Paragraph>
            $LXR is <strong>not</strong> an investment contract, security, debenture, unit in a collective investment scheme, or regulated financial derivative in any jurisdiction. Holding $LXR does not grant equity ownership, dividend rights, or guaranteed financial returns.
          </Paragraph>
        </GlassCard>

        {/* 7. Limitation of Liability & Governing Law */}
        <GlassCard>
          <CardHeader>
            <IconWrapper>
              <Scale size={22} />
            </IconWrapper>
            <SectionTitle>7. Limitation of Liability & Binding Arbitration</SectionTitle>
          </CardHeader>
          <Paragraph>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, LUXOR PAY, ITS DIRECTORS, EMPLOYEES, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, USE, GOODWILL, OR DIGITAL ASSETS ARISING OUT OF YOUR USE OF THE INFRASTRUCTURE.
          </Paragraph>
          <Paragraph>
            These Terms shall be governed by and construed in accordance with international commercial law principles. Any dispute arising out of or relating to these Terms or the protocol shall be settled by binding confidential arbitration under international arbitration rules.
          </Paragraph>
          <Paragraph>
            <em>
              For legal service of process or formal protocol communications, contact our legal desk: <CodeTag>legal@luxorpay.app</CodeTag>
            </em>
          </Paragraph>
        </GlassCard>
      </ContentWrapper>
    </TermsContainer>
  );
};

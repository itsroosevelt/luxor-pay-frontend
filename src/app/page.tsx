'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import styled from 'styled-components';
import { HeroBackground } from '@/components/HeroBackground';
import {
  Body,
  ButtonLink,
  Eyebrow,
  GlassCard,
  GradientText,
  H1,
  H3,
} from '@/components/ui';
import { theme } from '@/styles/theme';

const Page = styled.div`
  min-height: 100vh;
  background: ${theme.colors.backgroundAlt};
  color: ${theme.colors.white};
`;

const Nav = styled.nav`
  position: fixed;
  top: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  z-index: 50;
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const Logo = styled.div`
  font-family: ${theme.fonts.heading};
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
`;

const NavLinks = styled.div`
  display: none;
  gap: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);

  @media (min-width: ${theme.breakpoints.md}) {
    display: flex;
  }

  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.15s ease;

    &:hover {
      color: ${theme.colors.white};
    }

    &:focus-visible {
      outline: ${theme.focus.outline};
      outline-offset: ${theme.focus.outlineOffset};
    }
  }
`;

const NavActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const HeroSection = styled.section`
  position: relative;
  isolation: isolate;
  padding: 10rem 1rem 8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 100vh;
  overflow: hidden;
  background: ${theme.colors.backgroundAlt};
`;

const HeroGlow = styled.div`
  pointer-events: none;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  height: min(800px, 100vw);
  width: min(800px, 100vw);
  transform: translate(-50%, -50%);
  border-radius: 9999px;
  background: ${theme.colors.glowBlue};
  filter: blur(120px);
  mix-blend-mode: screen;
`;

const HeroContentBase = styled.div`
  position: relative;
  z-index: 10;
  max-width: 56rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const HeroContent = motion.create(HeroContentBase);

const HeroTitle = styled(H1)`
  max-width: 48rem;
`;

const HeroBody = styled(Body)`
  max-width: 42rem;
`;

const HeroActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}) {
    flex-direction: row;
    width: auto;
  }
`;

const FeaturesSection = styled.section`
  position: relative;
  padding: 6rem 1rem;
  background: ${theme.colors.backgroundAlt};
`;

const FeatureGridBase = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  max-width: 72rem;
  margin: 0 auto;
  width: 100%;
  text-align: left;

  @media (min-width: ${theme.breakpoints.md}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FeatureGrid = motion.create(FeatureGridBase);

const FeatureCard = styled(GlassCard)`
  padding: 2rem;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const FeatureTitle = styled(H3)`
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
`;

const FeatureDescription = styled(Body)`
  font-size: 0.875rem;
`;

const motionProps = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring' as const, bounce: 0.4, duration: 0.8 },
};

const features = [
  {
    title: 'Instant Settlements',
    desc: 'No more waiting for days. Receive funds instantly in your wallet with Solana\'s blazing speed.',
  },
  {
    title: 'Hardware Ready',
    desc: 'Connect our POS terminals out-of-the-box. Support for QR displays and NFC crypto cards.',
  },
  {
    title: 'Zero Setup Fees',
    desc: 'Start generating links instantly. Only pay network fees and minimal processing fees.',
  },
];

export default function LandingPage() {
  return (
    <Page>
      <Nav>
        <Logo>
          Luxor <GradientText>Pay</GradientText>
        </Logo>
        <NavLinks>
          <Link href="#features">Features</Link>
          <Link href="#developers">Developers</Link>
          <Link href="#pricing">Pricing</Link>
        </NavLinks>
        <NavActions>
          <ButtonLink as={Link} href="/login" $variant="secondary">
            Login
          </ButtonLink>
          <ButtonLink as={Link} href="/login?register=true" $variant="primary">
            Get Started
          </ButtonLink>
        </NavActions>
      </Nav>

      <main>
        <HeroSection>
          <HeroBackground />
          <HeroGlow />

          <HeroContent {...motionProps}>
            <Eyebrow>Solana infrastructure</Eyebrow>
            <HeroTitle>
              The Next-Generation <br />
              <GradientText>Solana Payment Gateway</GradientText>
            </HeroTitle>
            <HeroBody>
              Accept Solana payments instantly. Create customizable payment links, manage
              transactions, and integrate hardware POS terminals from a single unified dashboard.
            </HeroBody>

            <HeroActions>
              <ButtonLink as={Link} href="/login?register=true" $variant="primary">
                Start Accepting Payments
              </ButtonLink>
              <ButtonLink as={Link} href="#features" $variant="secondary">
                Explore Features
              </ButtonLink>
            </HeroActions>
          </HeroContent>
        </HeroSection>

        <FeaturesSection id="features">
          <FeatureGrid
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
          >
            {features.map((feature) => (
              <FeatureCard key={feature.title}>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.desc}</FeatureDescription>
              </FeatureCard>
            ))}
          </FeatureGrid>
        </FeaturesSection>
      </main>
    </Page>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle, RefreshCw, Coins, ShieldAlert } from "lucide-react";
import { WalletBalanceData } from "@/lib/solana-api";

// --- Global Fonts Injection (Outfit & Montserrat) ---
const FontStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500&family=Outfit:wght@400;500;700&display=swap');
`;

// --- Styled Components ---

const CardContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(40px);
  border-radius: 24px;
  box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.5);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
  overflow: hidden;

  @media (min-width: 768px) {
    border-radius: 40px;
    box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.6);
    padding: 24px 32px;
    gap: 24px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at top right, rgba(37, 99, 235, 0.12), transparent 40%);
    pointer-events: none;
    z-index: 0;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  @media (min-width: 768px) {
    font-size: 24px;
    font-weight: 500;
    letter-spacing: -0.5px;
    color: #FFFFFF;
    text-transform: none;
    gap: 12px;
  }
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  border-radius: 9999px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    color: #60A5FA;
    background: rgba(96, 165, 250, 0.1);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @media (min-width: 768px) {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #60A5FA;
    &:hover:not(:disabled) {
      background: rgba(37, 99, 235, 0.2);
      color: #FFFFFF;
    }
  }
`;

const BalanceLabel = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.12em;

  @media (min-width: 768px) {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 8px 0;
    letter-spacing: 0.1em;
  }
`;

const PrimaryBalance = styled.div`
  font-family: monospace;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(to right, #60A5FA, #2563EB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.1;

  @media (min-width: 768px) {
    font-size: 48px;
    letter-spacing: -1px;
    line-height: 1;
  }
`;

const TokenList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;

  @media (min-width: 768px) {
    gap: 12px;
    margin-top: 16px;
  }
`;

const TokenRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.04);

  @media (min-width: 768px) {
    padding: 12px 16px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (min-width: 768px) {
    gap: 12px;
  }
`;

const TokenIconCircle = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(37, 99, 235, 0.15));
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 9px;
  color: #60A5FA;

  @media (min-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 12px;
    background: linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(37, 99, 235, 0.2));
  }
`;

const TokenSymbol = styled.span`
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: rgba(237, 237, 237, 0.85);

  @media (min-width: 768px) {
    font-size: 16px;
    color: #EDEDED;
  }
`;

const TokenAmount = styled.span`
  font-family: monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);

  @media (min-width: 768px) {
    font-size: 16px;
    color: #FFFFFF;
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 20px;
  color: #FCA5A5;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const SkeletonBox = styled.div<{ $width?: string; $height?: string; $borderRadius?: string }>`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '24px'};
  border-radius: ${({ $borderRadius }) => $borderRadius || '8px'};
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.1) 25%, rgba(96, 165, 250, 0.2) 50%, rgba(37, 99, 235, 0.1) 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 2s infinite;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const KycAlertBanner = styled(motion.div)`
  background: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 16px;
  padding: 16px;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  font-family: 'Montserrat', sans-serif;
  box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center, rgba(37, 99, 235, 0.1) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  @media (min-width: 768px) {
    border-radius: 24px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    margin-top: 24px;
  }
`;

const KycInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  z-index: 1;
`;

const AlertTitle = styled.h4`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0 0 4px 0;
`;

const AlertDesc = styled.p`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.4;
`;

const VerifyButton = styled.button`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #000000;
  background: #FFFFFF;
  border: none;
  border-radius: 9999px;
  padding: 8px 18px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease-in-out;
  align-self: flex-start;
  position: relative;
  z-index: 1;

  &:hover {
    background: #2563EB;
    color: #FFFFFF;
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  @media (min-width: 768px) {
    align-self: center;
    font-size: 14px;
    padding: 10px 22px;
  }
`;

// --- Interfaces ---

interface WalletBalanceViewProps {
  data: WalletBalanceData | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  isKycVerified: boolean;
  onVerifyClick: () => void;
}

// --- Component ---

export function WalletBalanceView({
  data,
  isLoading,
  isError,
  errorMessage,
  refetch,
  isPrivacyMode,
  togglePrivacyMode,
  isKycVerified,
  onVerifyClick,
}: WalletBalanceViewProps) {
  // Prevent hydration mismatch for privacy mode
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatBalance = (amount: string) => {
    if (!mounted) return amount;
    return isPrivacyMode ? "••••••••" : amount;
  };

  const animationProps = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring" as const, bounce: 0.4, duration: 0.8 },
  };

  return (
    <>
      <FontStyles />
      <CardContainer {...animationProps}>
        <ContentWrapper>
          <HeaderRow>
            <Title>
              <Coins size={14} className="text-blue-400" style={{ opacity: 0.7 }} />
              Wallet Balance
            </Title>
            <ControlsContainer>
              <IconButton
                onClick={togglePrivacyMode}
                aria-label={isPrivacyMode ? "Show balance" : "Hide balance"}
                title="Toggle Privacy Mode"
              >
                {isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
              </IconButton>
              <IconButton
                onClick={refetch}
                disabled={isLoading}
                aria-label="Refresh balance"
                title="Refresh balance"
                aria-busy={isLoading}
              >
                <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
              </IconButton>
            </ControlsContainer>
          </HeaderRow>

          <div style={{ marginTop: '14px' }}>
            <BalanceLabel>Total Solana</BalanceLabel>
            {isLoading ? (
              <SkeletonBox $width="160px" $height="32px" $borderRadius="8px" />
            ) : isError ? (
              <ErrorContainer>
                <AlertCircle size={20} />
                <span>{errorMessage || "Unable to load balance."}</span>
              </ErrorContainer>
            ) : (
              <PrimaryBalance>
                {formatBalance(data?.solBalance || "0.00")} SOL
              </PrimaryBalance>
            )}
          </div>

          {!isLoading && !isError && data?.tokens && data.tokens.length > 0 && (
            <TokenList>
              <BalanceLabel style={{ marginTop: '16px' }}>Tokens</BalanceLabel>
              {data.tokens.map((token, index) => {
                const symbol = token.symbol || "SPL";
                return (
                  <TokenRow key={token.mint + index}>
                    <TokenInfo>
                      <TokenIconCircle>
                        {symbol.slice(0, 2).toUpperCase()}
                      </TokenIconCircle>
                      <TokenSymbol>{symbol}</TokenSymbol>
                    </TokenInfo>
                    <TokenAmount>{formatBalance(token.uiAmount)}</TokenAmount>
                  </TokenRow>
                );
              })}
            </TokenList>
          )}

          {isLoading && (
            <TokenList>
              <BalanceLabel style={{ marginTop: '8px' }}>Tokens</BalanceLabel>
              <SkeletonBox $height="36px" $borderRadius="10px" />
              <SkeletonBox $height="36px" $borderRadius="10px" />
            </TokenList>
          )}
        </ContentWrapper>
      </CardContainer>

      {!isKycVerified && (
        <KycAlertBanner
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
        >
          <KycInfo>
            <ShieldAlert size={20} className="text-blue-400" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <AlertTitle>Verify your identity to unlock all features</AlertTitle>
              <AlertDesc>
                Get access to top up your wallet with fiat money, convert crypto to fiat money, and more.
              </AlertDesc>
            </div>
          </KycInfo>
          <VerifyButton onClick={onVerifyClick} type="button">
            Start Verification
          </VerifyButton>
        </KycAlertBanner>
      )}
    </>
  );
}

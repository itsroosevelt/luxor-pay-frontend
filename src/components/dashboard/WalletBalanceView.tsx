"use client";

import React, { useEffect, useState } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle, RefreshCw, Coins, ArrowUp, ArrowDown, ArrowLeftRight, ShieldAlert } from "lucide-react";
import { WalletBalanceData } from "@/lib/solana-api";

const FontStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500&family=Outfit:wght@400;500;700&display=swap');
`;

const CardContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(40px);
  border-radius: 24px;
  box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.5);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  overflow: hidden;
  height: 100%;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at top right, rgba(37, 99, 235, 0.12), transparent 45%);
    pointer-events: none;
    z-index: 0;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60A5FA;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(37, 99, 235, 0.25);
    color: #FFFFFF;
    border-color: rgba(96, 165, 250, 0.3);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const BalanceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const BalanceLabel = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
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
    font-size: 32px;
  }
`;

const ActionButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
`;

const ActionButton = styled.button`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #000000;
  background: #FFFFFF;
  border: none;
  border-radius: 9999px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #2563EB;
    color: #FFFFFF;
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const TokenList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-t: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 12px;
`;

const TokenRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TokenIconCircle = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(37, 99, 235, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 10px;
  color: #60A5FA;
`;

const TokenSymbol = styled.span`
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: #EDEDED;
`;

const TokenAmount = styled.span`
  font-family: monospace;
  font-size: 13px;
  color: #FFFFFF;
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 14px;
  color: #FCA5A5;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
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

const KycAlertBanner = styled(motion.div)`
  background: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 16px;
  padding: 12px 16px;
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const KycInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

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
  onSendClick?: () => void;
  onDepositClick?: () => void;
  onTradeClick?: () => void;
  merchantWallet?: string | null;
}

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
  onSendClick,
  onDepositClick,
  onTradeClick,
}: WalletBalanceViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatBalance = (amount: string) => {
    if (!mounted) return amount;
    return isPrivacyMode ? "••••••••" : amount;
  };

  return (
    <>
      <FontStyles />
      <CardContainer
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
      >
        <ContentWrapper>
          <HeaderRow>
            <Title>
              <Coins size={18} className="text-blue-400 opacity-80" />
              <span>Wallet Balance</span>
            </Title>
            <ControlsContainer>
              <IconButton
                onClick={togglePrivacyMode}
                aria-label={isPrivacyMode ? "Show balance" : "Hide balance"}
                title="Toggle Privacy Mode"
              >
                {isPrivacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
              </IconButton>
              <IconButton
                onClick={refetch}
                disabled={isLoading}
                aria-label="Refresh balance"
                title="Refresh balance"
                aria-busy={isLoading}
              >
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              </IconButton>
            </ControlsContainer>
          </HeaderRow>

          <BalanceSection>
            <BalanceLabel>Total Solana</BalanceLabel>
            {isLoading ? (
              <SkeletonBox $width="180px" $height="36px" $borderRadius="10px" />
            ) : isError ? (
              <ErrorContainer>
                <AlertCircle size={18} />
                <span>{errorMessage || "Unable to load balance."}</span>
              </ErrorContainer>
            ) : (
              <PrimaryBalance>
                {formatBalance(data?.solBalance || "0.00")} SOL
              </PrimaryBalance>
            )}
          </BalanceSection>

          {/* Action Buttons */}
          <ActionButtonsGrid>
            <ActionButton type="button" onClick={onSendClick}>
              <ArrowUp size={14} />
              <span>Send</span>
            </ActionButton>
            <ActionButton type="button" onClick={onDepositClick}>
              <ArrowDown size={14} />
              <span>Deposit</span>
            </ActionButton>
            <ActionButton type="button" onClick={onTradeClick}>
              <ArrowLeftRight size={14} />
              <span>Trade</span>
            </ActionButton>
          </ActionButtonsGrid>

          {/* Tokens section */}
          {!isLoading && !isError && data?.tokens && data.tokens.length > 0 && (
            <TokenList>
              <BalanceLabel>Tokens</BalanceLabel>
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
              <BalanceLabel>Tokens</BalanceLabel>
              <SkeletonBox $height="36px" $borderRadius="10px" />
            </TokenList>
          )}
        </ContentWrapper>
      </CardContainer>

      {!isKycVerified && (
        <KycAlertBanner
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <KycInfo>
            <ShieldAlert size={18} className="text-blue-400 shrink-0" />
            <div>
              <h4 className="font-['Outfit',sans-serif] font-medium text-white text-xs">
                Verify your identity to unlock all features
              </h4>
              <p className="font-['Montserrat',sans-serif] text-[11px] text-gray-400">
                Get access to top up your wallet with fiat money and more.
              </p>
            </div>
          </KycInfo>
          <ActionButton
            type="button"
            onClick={onVerifyClick}
            style={{ width: 'auto', padding: '6px 14px', fontSize: '12px' }}
          >
            Start Verification
          </ActionButton>
        </KycAlertBanner>
      )}
    </>
  );
}

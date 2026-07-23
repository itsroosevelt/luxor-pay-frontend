"use client";

import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle, RefreshCw, Coins, ArrowUp, ArrowDown, ArrowLeftRight, ShieldAlert } from "lucide-react";
import { WalletBalanceData } from "@/lib/solana-api";
import { GlassCard, ButtonBase, EyebrowBadge } from "@/components/shared/DesignSystem";

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  gap: 8px;
`;

const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60A5FA;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(37, 99, 235, 0.25);
    color: #FFFFFF;
    border-color: rgba(96, 165, 250, 0.4);
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
  gap: 6px;
`;

const BalanceLabel = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const PrimaryBalance = styled.div`
  font-family: monospace;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(to right, #60A5FA, #2563EB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.1;

  @media (min-width: 768px) {
    font-size: 38px;
  }
`;

const ActionButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
`;

const TokenList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 16px;
`;

const TokenRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`;

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TokenIconCircle = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.25), rgba(37, 99, 235, 0.25));
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 11px;
  color: #60A5FA;
  border: 1px solid rgba(96, 165, 250, 0.3);
`;

const TokenSymbol = styled.span`
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #EDEDED;
`;

const TokenAmount = styled.span`
  font-family: monospace;
  font-size: 14px;
  color: #FFFFFF;
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 16px;
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
  border-radius: ${({ $borderRadius }) => $borderRadius || '12px'};
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.1) 25%, rgba(96, 165, 250, 0.2) 50%, rgba(37, 99, 235, 0.1) 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 2s infinite;
`;

const KycAlertBanner = styled(motion.div)`
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.25);
  border-radius: 24px;
  padding: 16px 20px;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  gap: 12px;
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
      <GlassCard
        $variant="hero"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
      >
        <ContentWrapper>
          <HeaderRow>
            <div>
              <EyebrowBadge>On-Chain Treasury</EyebrowBadge>
              <Title>
                <Coins size={18} className="text-blue-400 opacity-90" />
                <span>Wallet Balance</span>
              </Title>
            </div>
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
              <SkeletonBox $width="200px" $height="42px" $borderRadius="12px" />
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
            <ButtonBase type="button" $variant="primary" onClick={onSendClick}>
              <ArrowUp size={15} />
              <span>Send</span>
            </ButtonBase>
            <ButtonBase type="button" $variant="glass" onClick={onDepositClick}>
              <ArrowDown size={15} />
              <span>Deposit</span>
            </ButtonBase>
            <ButtonBase type="button" $variant="secondary" onClick={onTradeClick}>
              <ArrowLeftRight size={15} />
              <span>Trade</span>
            </ButtonBase>
          </ActionButtonsGrid>

          {/* Tokens section */}
          {!isLoading && !isError && data?.tokens && data.tokens.length > 0 && (
            <TokenList>
              <BalanceLabel>SPL Utility Tokens</BalanceLabel>
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
              <BalanceLabel>SPL Utility Tokens</BalanceLabel>
              <SkeletonBox $height="40px" $borderRadius="16px" />
            </TokenList>
          )}
        </ContentWrapper>
      </GlassCard>

      {!isKycVerified && (
        <KycAlertBanner
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
        >
          <KycInfo>
            <ShieldAlert size={20} className="text-blue-400 shrink-0" />
            <div>
              <h4 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 500, color: "#FFFFFF", fontSize: "14px", margin: 0 }}>
                Verify your identity to unlock all features
              </h4>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                Get access to top up your wallet with fiat money and expand ecosystem liquidity.
              </p>
            </div>
          </KycInfo>
          <ButtonBase
            type="button"
            $variant="primary"
            onClick={onVerifyClick}
            style={{ padding: "8px 18px", fontSize: "13px" }}
          >
            Start Verification
          </ButtonBase>
        </KycAlertBanner>
      )}
    </>
  );
}

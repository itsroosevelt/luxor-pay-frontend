"use client";

import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  Coins,
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
  ShieldAlert,
} from "lucide-react";
import { WalletBalanceData } from "@/features/wallet/api/solana-api";
import { GlassCard, ButtonBase, EyebrowBadge } from "@/components/ui/DesignSystem";
import { TokenIcon } from "@/components/ui/VectorTokenIcon";

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
  font-size: 15px;
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
  background: var(--lx-fill, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--lx-border, rgba(255, 255, 255, 0.08));
  border-radius: 9999px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--lx-text-muted, #8A8F9E);
  cursor: pointer;
  transition: background-color 0.16s ease, color 0.16s ease, border-color 0.16s ease;

  &:hover:not(:disabled) {
    background: var(--lx-fill-hover, rgba(255, 255, 255, 0.1));
    color: var(--lx-text, #F1F5F9);
    border-color: var(--lx-border-hover, rgba(255, 255, 255, 0.18));
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--lx-ring, 0 0 0 3px rgba(255, 255, 255, 0.14));
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
  font-size: 10px;
  font-weight: 700;
  color: var(--lx-text-dim, #5C616F);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.4em;
`;

const PrimaryBalance = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--lx-text, #F1F5F9);
  line-height: 1.1;

  @media (min-width: 768px) {
    font-size: 32px;
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
  border-top: 1px solid var(--lx-border, rgba(255, 255, 255, 0.08));
  padding-top: 16px;
  gap: 4px;
`;

const TokenRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 12px;
  background: transparent;
  border-radius: var(--lx-radius-sm, 8px);
  border: none;
  transition: background-color 0.16s ease;

  & + & {
    border-top: 1px solid var(--lx-border, rgba(255, 255, 255, 0.06));
  }

  &:hover {
    background: var(--lx-fill, rgba(255, 255, 255, 0.04));
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
  background: var(--lx-fill, rgba(255, 255, 255, 0.06));
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 10px;
  letter-spacing: 0.02em;
  color: var(--lx-text-muted, #8A8F9E);
  border: 1px solid var(--lx-border, rgba(255, 255, 255, 0.08));
`;

const TokenSymbol = styled.span`
  font-family: 'Inter', 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: var(--lx-text, #F1F5F9);
`;

const TokenAmount = styled.span`
  font-family: 'Inter', 'Outfit', sans-serif;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  color: var(--lx-text, #F1F5F9);
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
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.04) 25%, rgba(255, 255, 255, 0.09) 50%, rgba(255, 255, 255, 0.04) 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 2s infinite;
`;

const KycAlertBanner = styled(motion.div)`
  background: var(--lx-surface, #17181E);
  border: 1px solid var(--lx-border, rgba(255, 255, 255, 0.08));
  border-radius: var(--lx-radius, 12px);
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
  totalUsdBalance?: number;
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
  totalUsdBalance,
}: WalletBalanceViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatBalance = (amount: string) => {
    if (!mounted) return amount;
    return isPrivacyMode ? "••••••••" : amount;
  };

  const formattedUsdTotal = totalUsdBalance != null && totalUsdBalance > 0
    ? `$${totalUsdBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
    : null;

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
              {isLoading ? (
                <SkeletonBox $width="150px" $height="24px" $borderRadius="6px" />
              ) : (
                <Title>
                  <Coins size={18} className="opacity-80" style={{ color: "var(--lx-text-muted)" }} />
                  <span>Wallet Balance</span>
                </Title>
              )}
            </div>
            <ControlsContainer>
              {isLoading ? (
                <>
                  <SkeletonBox $width="36px" $height="36px" $borderRadius="9999px" />
                  <SkeletonBox $width="36px" $height="36px" $borderRadius="9999px" />
                </>
              ) : (
                <>
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
                </>
              )}
            </ControlsContainer>
          </HeaderRow>

          <BalanceSection>
            {isLoading ? (
              <SkeletonBox $width="200px" $height="42px" $borderRadius="12px" />
            ) : isError ? (
              <ErrorContainer>
                <AlertCircle size={18} />
                <span>{errorMessage || "Unable to load balance."}</span>
              </ErrorContainer>
            ) : (
              <div>
                <PrimaryBalance>
                  {formattedUsdTotal
                    ? formatBalance(formattedUsdTotal)
                    : `${formatBalance(data?.solBalance || "0.00")} SOL`}
                </PrimaryBalance>
                {formattedUsdTotal && (
                  <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.5)', marginTop: 4, fontFamily: 'Montserrat, sans-serif' }}>
                    {isPrivacyMode ? '••••••' : `${data?.solBalance || '0.00'} SOL · Main Wallet`}
                  </div>
                )}
              </div>
            )}
          </BalanceSection>

          {/* Action Buttons */}
          <ActionButtonsGrid>
            {isLoading ? (
              <>
                <SkeletonBox $height="44px" $borderRadius="9999px" />
                <SkeletonBox $height="44px" $borderRadius="9999px" />
                <SkeletonBox $height="44px" $borderRadius="9999px" />
              </>
            ) : (
              <>
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
              </>
            )}
          </ActionButtonsGrid>

          {/* Tokens section */}
          {!isLoading && !isError && data?.tokens && data.tokens.length > 0 && (
            <TokenList>
              {data.tokens.map((token, index) => {
                const symbol = token.symbol || "SPL";
                const num = Number(token.uiAmount) || 0;
                const formatted = num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                return (
                  <TokenRow key={token.mint + index}>
                    <TokenInfo>
                      <TokenIcon symbol={symbol} size={26} />
                      <TokenSymbol>{symbol}</TokenSymbol>
                    </TokenInfo>
                    <TokenAmount>{formatBalance(formatted)}</TokenAmount>
                  </TokenRow>
                );
              })}
            </TokenList>
          )}

          {isLoading && (
            <TokenList>
              <SkeletonBox $width="120px" $height="12px" $borderRadius="4px" style={{ marginBottom: '4px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <SkeletonBox $height="50px" $borderRadius="16px" />
                <SkeletonBox $height="50px" $borderRadius="16px" />
              </div>
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
            <ShieldAlert size={20} className="shrink-0" style={{ color: "var(--lx-text-muted)" }} />
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

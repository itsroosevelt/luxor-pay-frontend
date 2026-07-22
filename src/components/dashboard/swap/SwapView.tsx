"use client";

import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { WalletBalanceData } from "@/lib/solana-api";
import { QuoteResponse } from "@/lib/swap-api";
import { ArrowUpDown, AlertTriangle } from "lucide-react";

const ViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 460px; /* Reduced from 600px for a more compact design */
  margin: 0 auto;
  padding: 16px;
  font-family: 'Montserrat', sans-serif;
`;

const GlassCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(40px);
  border-radius: 32px;
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.6);
  padding: 24px; /* Reduced from 32px */
  display: flex;
  flex-direction: column;
  gap: 20px; /* Reduced from 24px */
`;

const BalancesContainer = styled(GlassCard)`
  flex-direction: row;
  justify-content: space-between;
  padding: 16px 20px; /* Reduced from 24px 32px */
  border-radius: 24px;
  align-items: center;
`;

const BalanceColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const BalanceLabel = styled.p`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #60A5FA;
  margin: 0;
`;

const BalanceValue = styled.p`
  font-family: monospace;
  font-size: 16px; /* Reduced from 20px */
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const MaxButton = styled.button`
  position: absolute;
  right: 94px; /* Sat cleanly to the left of the token pill */
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.3);
  color: #60A5FA;
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(96, 165, 250, 0.2);
    color: #FFFFFF;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 12px 160px 12px 16px; /* Generous right padding to prevent any text overlaps */
  color: #FFFFFF;
  font-family: monospace;
  font-size: 18px; /* Reduced from 24px */
  outline: none;
  transition: border-color 0.2s;

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  /* Hide HTML5 spin-buttons */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type=number] {
    -moz-appearance: textfield;
  }
`;

const TokenSelect = styled.select`
  position: absolute;
  right: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 9999px; /* Pill Shape (Rule 3) */
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  padding: 6px 30px 6px 14px; /* Space for custom chevron */
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='3 4.5 6 7.5 9 4.5'/></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
  }

  option {
    background: #0A0A0A;
    color: #FFFFFF;
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
  }
`;

const ToggleButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 50%;
  width: 36px; /* Reduced from 44px */
  height: 36px; /* Reduced from 44px */
  color: #60A5FA;
  cursor: pointer;
  transition: all 0.2s;
  margin: -14px auto; /* Overlaps nicely */
  z-index: 10;
  position: relative;

  &:hover {
    background: rgba(37, 99, 235, 0.2);
    color: #FFFFFF;
    transform: scale(1.05);
  }
  
  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const InputCurrency = styled.span`
  position: absolute;
  right: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 9999px; /* Matches selector pill shape */
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  padding: 6px 14px;
  display: inline-flex;
  align-items: center;
  pointer-events: none;
`;

const ButtonBase = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  border-radius: 9999px;
  padding: 14px 28px; /* Reduced padding */
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  ${({ $variant }) => $variant === 'primary' && `
    background: #FFFFFF; 
    color: #000000; 
    border: none;
    &:hover:not(:disabled) { 
      background: #2563EB; 
      color: #FFFFFF; 
    }
  `}

  ${({ $variant }) => $variant === 'secondary' && `
    background: transparent; 
    color: #60A5FA; 
    border: 1px solid rgba(255, 255, 255, 0.2); 
    backdrop-filter: blur(12px);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.05);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const QuoteResult = styled(motion.div)`
  background: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const QuoteRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);

  strong {
    color: #FFFFFF;
    font-family: monospace;
  }
`;

const ErrorText = styled.p`
  color: #F87171;
  font-size: 13px;
  margin: 0;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #60A5FA;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled(GlassCard)`
  width: 90%;
  max-width: 400px;
  padding: 32px;
  gap: 24px;
`;

export interface TokenOption {
  mint: string;
  symbol: string;
}

export interface SwapViewProps {
  balanceData: WalletBalanceData | null;
  isBalanceLoading: boolean;
  amount: string;
  onAmountChange: (val: string) => void;
  quoteData: QuoteResponse | null;
  isQuoting: boolean;
  isExecuting: boolean;
  onStartQuote: () => void;
  onSwapExecute: () => void;
  error: string | null;
  showQuoteChangeWarning: boolean;
  onConfirmQuoteChange: () => void;
  onCancelQuoteChange: () => void;
  
  // Catalog / output token selection
  catalogTokens: TokenOption[];
  outputMint: string;
  onOutputMintChange: (mint: string) => void;
  
  // Direction toggle
  swapDirection: 'sol-to-token' | 'token-to-sol';
  onToggleDirection: () => void;
}

const standardMotion = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring" as const, bounce: 0.4, duration: 0.8 }
};

export function SwapView({
  balanceData,
  isBalanceLoading,
  amount,
  onAmountChange,
  quoteData,
  isQuoting,
  isExecuting,
  onStartQuote,
  onSwapExecute,
  error,
  showQuoteChangeWarning,
  onConfirmQuoteChange,
  onCancelQuoteChange,
  catalogTokens,
  outputMint,
  onOutputMintChange,
  swapDirection,
  onToggleDirection
}: SwapViewProps) {

  const formatBalance = (amount: string) => {
    return parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  };

  const outputTokenSymbol = catalogTokens.find(t => t.mint === outputMint)?.symbol || 'Unknown';
  
  // Find balance matching either the symbol or mint
  const outputTokenBalanceInfo = balanceData?.tokens.find(
    t => t.mint === outputMint || t.symbol === outputTokenSymbol
  );
  const outputTokenBalance = outputTokenBalanceInfo?.uiAmount || '0.00';
  
  const isSolToToken = swapDirection === 'sol-to-token';
  const payBalance = isSolToToken ? balanceData?.solBalance : outputTokenBalance;
  
  const payBalanceNumber = parseFloat(payBalance || '0');
  const amountNumber = parseFloat(amount || '0');
  const isInsufficientBalance = amountNumber > payBalanceNumber;

  const getOutAmountFormatted = () => {
    if (!quoteData) return '';
    const rawOut = parseInt(quoteData.outAmount);
    if (isNaN(rawOut)) return '';
    let decimals = 9; // SOL
    if (isSolToToken) {
       decimals = outputTokenBalanceInfo?.decimals || 9;
    }
    return (rawOut / Math.pow(10, decimals)).toFixed(4);
  };

  return (
    <ViewContainer>
      {/* Head title has been deleted from this page body since it is already rendered in the parent page header */}
      <BalancesContainer {...standardMotion} style={{ flexWrap: 'wrap', gap: '16px' }}>
        <BalanceColumn>
          <BalanceLabel>SOL Balance</BalanceLabel>
          <BalanceValue>
            {isBalanceLoading ? '---' : formatBalance(balanceData?.solBalance || '0.00')} SOL
          </BalanceValue>
        </BalanceColumn>
        {balanceData?.tokens?.map(token => (
          <BalanceColumn key={token.mint}>
            <BalanceLabel>{token.symbol || 'Unknown'} Balance</BalanceLabel>
            <BalanceValue>
              {formatBalance(token.uiAmount || '0.00')} {token.symbol || 'Unknown'}
            </BalanceValue>
          </BalanceColumn>
        ))}
      </BalancesContainer>

      <GlassCard {...standardMotion}>
        <InputGroup>
          <Label>YOU PAY</Label>
          <InputWrapper>
            <StyledInput 
              type="number" 
              placeholder="0.00" 
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              disabled={isQuoting || isExecuting}
              min="0"
            />
            {payBalance && parseFloat(payBalance) > 0 && (
              <MaxButton 
                onClick={() => onAmountChange(payBalance)}
                disabled={isQuoting || isExecuting}
              >
                MAX
              </MaxButton>
            )}
            {isSolToToken ? (
              <InputCurrency>SOL</InputCurrency>
            ) : (
              <TokenSelect 
                value={outputMint} 
                onChange={e => onOutputMintChange(e.target.value)}
                disabled={isQuoting || isExecuting || catalogTokens.length === 0}
              >
                {catalogTokens.map(t => (
                  <option key={t.mint} value={t.mint}>{t.symbol}</option>
                ))}
              </TokenSelect>
            )}
          </InputWrapper>
        </InputGroup>

        <ToggleButton onClick={onToggleDirection} type="button" aria-label="Toggle Swap Direction">
          <ArrowUpDown size={16} />
        </ToggleButton>

        <InputGroup>
          <Label>YOU RECEIVE (ESTIMATED)</Label>
          <InputWrapper>
            <StyledInput 
              type="text" 
              placeholder="0.00" 
              value={getOutAmountFormatted()}
              disabled
              readOnly
            />
            {!isSolToToken ? (
              <InputCurrency>SOL</InputCurrency>
            ) : (
              <TokenSelect 
                value={outputMint} 
                onChange={e => onOutputMintChange(e.target.value)}
                disabled={isQuoting || isExecuting || catalogTokens.length === 0}
              >
                {catalogTokens.map(t => (
                  <option key={t.mint} value={t.mint}>{t.symbol}</option>
                ))}
              </TokenSelect>
            )}
          </InputWrapper>
        </InputGroup>

        <AnimatePresence>
          {quoteData && (
            <QuoteResult
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <QuoteRow>
                <span>Price Impact</span>
                <span style={{ color: parseFloat(quoteData.priceImpactPct) > 1 ? '#F97316' : '#FFFFFF' }}>
                  {parseFloat(quoteData.priceImpactPct).toFixed(2)}%
                </span>
              </QuoteRow>
              <QuoteRow>
                <span>Slippage Tolerance</span>
                <span>{(quoteData.slippageBps / 100).toFixed(2)}%</span>
              </QuoteRow>
            </QuoteResult>
          )}
        </AnimatePresence>

        {error && <ErrorText>{error}</ErrorText>}
        {isInsufficientBalance && <ErrorText>Insufficient {isSolToToken ? 'SOL' : outputTokenSymbol} balance.</ErrorText>}

        {!quoteData ? (
          <ButtonBase 
            $variant="primary" 
            onClick={onStartQuote}
            disabled={!amount || isQuoting || amountNumber <= 0 || !outputMint || isInsufficientBalance}
            aria-busy={isQuoting}
          >
            {isQuoting ? <LoadingSpinner /> : 'Start Quote'}
          </ButtonBase>
        ) : (
          <ButtonBase 
            $variant="primary" 
            onClick={onSwapExecute}
            disabled={isExecuting}
            aria-busy={isExecuting}
          >
            {isExecuting ? <LoadingSpinner /> : 'Execute Swap'}
          </ButtonBase>
        )}

      </GlassCard>

      <AnimatePresence>
        {showQuoteChangeWarning && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#F97316' }}>
                <AlertTriangle size={28} />
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', margin: 0 }}>Quote Changed</h2>
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '15px', lineHeight: 1.6 }}>
                The amount you will receive has changed since your last quote due to market conditions. 
                Do you still want to proceed with the swap?
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <ButtonBase $variant="secondary" style={{ flex: 1 }} onClick={onCancelQuoteChange}>
                  Cancel
                </ButtonBase>
                <ButtonBase $variant="primary" style={{ flex: 1 }} onClick={onConfirmQuoteChange}>
                  Confirm Swap
                </ButtonBase>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

    </ViewContainer>
  );
}

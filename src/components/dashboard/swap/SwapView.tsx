"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { WalletBalanceData } from "@/lib/solana-api";
import { QuoteResponse } from "@/lib/swap-api";
import { ArrowUpDown, AlertTriangle, ChevronDown, Info } from "lucide-react";
import { TradingChart } from "./TradingChart";

const ViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  font-family: 'Montserrat', sans-serif;
`;

const ModeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 12px;
`;

const ModeTabs = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const ModeTab = styled.button<{ $active?: boolean }>`
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  background: none;
  border: none;
  color: ${({ $active }) => ($active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)')};
  cursor: pointer;
  position: relative;
  padding-bottom: 8px;
  transition: color 0.16s ease;

  ${({ $active }) =>
    $active &&
    `
    &::after {
      content: '';
      position: absolute;
      bottom: -13px;
      left: 0;
      right: 0;
      height: 2px;
      background: #FFFFFF;
      border-radius: 9999px;
    }
  `}

  &:hover {
    color: #FFFFFF;
  }
`;

const StepsBadge = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 6px;

  strong {
    color: #FFFFFF;
  }
`;

const TradeCard = styled(motion.div)`
  background: transparent;
  border: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const AccountSelectorGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label`
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
`;

const SelectBox = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: rgba(255, 255, 255, 0.25);
  }
`;

const SectionBox = styled.div`
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AmountInputRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const BigInput = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 600;
  color: #FFFFFF;

  &::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const SubValueRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
`;

const TokenSelectPill = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  padding: 6px 14px;
  cursor: pointer;

  select {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
  }

  option {
    background: #0A0A0A;
    color: #FFFFFF;
  }
`;

const MaxBtn = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  cursor: pointer;
  transition: all 0.16s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const LimitPriceBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LimitPriceInputRow = styled.div`
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CurrencyBadge = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const MarketRateBtn = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const InvertButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -10px auto;
  z-index: 5;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: scale(1.05);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  background: #FFFFFF;
  color: #000000;
  border: none;
  border-radius: 9999px;
  padding: 14px;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;

  &:hover:not(:disabled) {
    background: #EDEDED;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
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
  catalogTokens: TokenOption[];
  outputMint: string;
  onOutputMintChange: (mint: string) => void;
  swapDirection: 'sol-to-token' | 'token-to-sol';
  onToggleDirection: () => void;
}

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
  const [tradeMode, setTradeMode] = useState<'limit' | 'swap' | 'dca'>('limit');
  const [limitPrice, setLimitPrice] = useState('168.420000');
  const [expiry, setExpiry] = useState('never');

  const outputTokenSymbol = catalogTokens.find(t => t.mint === outputMint)?.symbol || 'USDC';
  const isSolToToken = swapDirection === 'sol-to-token';

  const solBalance = balanceData?.solBalance || '107.47';
  const tokenBalance = balanceData?.tokens.find(t => t.mint === outputMint)?.uiAmount || '0.00';
  const activeSellBalance = isSolToToken ? solBalance : tokenBalance;

  const estimatedUsd = (parseFloat(amount || '0') * 168.42).toFixed(2);

  return (
    <ViewContainer>
      {/* Mode Header Tabs */}
      <ModeHeader>
        <ModeTabs>
          <ModeTab $active={tradeMode === 'limit'} onClick={() => setTradeMode('limit')}>
            Limit Order
          </ModeTab>
          <ModeTab $active={tradeMode === 'swap'} onClick={() => setTradeMode('swap')}>
            Swap
          </ModeTab>
          <ModeTab $active={tradeMode === 'dca'} onClick={() => setTradeMode('dca')}>
            DCA
          </ModeTab>
        </ModeTabs>
        <StepsBadge>
          Steps <strong>1/2</strong>
        </StepsBadge>
      </ModeHeader>

      {/* Main Grid: Form + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <TradeCard>
            {/* Account Selector */}
            <AccountSelectorGroup>
              <FieldLabel>Choose Account</FieldLabel>
              <SelectBox>
                <span>GENESYS <span className="text-white/40 text-xs ml-1">$45,250.00</span></span>
                <ChevronDown size={16} className="text-white/50" />
              </SelectBox>
            </AccountSelectorGroup>

            {/* Sell Box */}
            <SectionBox>
              <SectionHeader>
                <FieldLabel>Sell</FieldLabel>
              </SectionHeader>

              <AmountInputRow>
                <BigInput
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => onAmountChange(e.target.value)}
                />
                <TokenSelectPill>
                  <span className="font-semibold text-sm text-white">{isSolToToken ? 'SOL' : outputTokenSymbol}</span>
                  <ChevronDown size={14} className="text-white/60" />
                  <select
                    value={isSolToToken ? 'SOL' : outputMint}
                    onChange={(e) => {
                      if (e.target.value === 'SOL' && !isSolToToken) {
                        onToggleDirection();
                      } else {
                        onOutputMintChange(e.target.value);
                      }
                    }}
                  >
                    <option value="SOL">SOL</option>
                    {catalogTokens.map(t => (
                      <option key={t.mint} value={t.mint}>{t.symbol}</option>
                    ))}
                  </select>
                </TokenSelectPill>
              </AmountInputRow>

              <SubValueRow>
                <span>~${estimatedUsd}</span>
                <div className="flex items-center gap-1.5">
                  <span>{activeSellBalance}</span>
                  <MaxBtn onClick={() => onAmountChange(activeSellBalance)}>MAX</MaxBtn>
                </div>
              </SubValueRow>
            </SectionBox>

            {/* Limit Price (Shown in Limit Mode) */}
            {tradeMode === 'limit' && (
              <LimitPriceBox>
                <div className="flex justify-between items-center px-1">
                  <FieldLabel>Limit price</FieldLabel>
                  <MarketRateBtn onClick={() => setLimitPrice('168.42')}>Market rate</MarketRateBtn>
                </div>
                <LimitPriceInputRow>
                  <BigInput
                    type="text"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    style={{ fontSize: '20px' }}
                  />
                  <CurrencyBadge>USDC</CurrencyBadge>
                </LimitPriceInputRow>
              </LimitPriceBox>
            )}

            {/* Expiry Selector (Shown in Limit Mode) */}
            {tradeMode === 'limit' && (
              <AccountSelectorGroup>
                <FieldLabel>Expiry</FieldLabel>
                <SelectBox className="relative">
                  <span className="capitalize">{expiry}</span>
                  <ChevronDown size={16} className="text-white/50" />
                  <select
                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  >
                    <option value="never">Never</option>
                    <option value="1 day">1 Day</option>
                    <option value="7 days">7 Days</option>
                    <option value="30 days">30 Days</option>
                  </select>
                </SelectBox>
                <p className="flex items-start gap-1.5 text-[11px] text-white/40 mt-1 leading-snug">
                  <Info size={13} className="shrink-0 mt-0.5" />
                  Expiry time countdown starts upon initiation of the transaction, not execution.
                </p>
              </AccountSelectorGroup>
            )}

            {/* Direction Invert Button */}
            <InvertButton type="button" onClick={onToggleDirection}>
              <ArrowUpDown size={16} />
            </InvertButton>

            {/* Buy Box */}
            <SectionBox>
              <SectionHeader>
                <FieldLabel>Buy</FieldLabel>
              </SectionHeader>

              <AmountInputRow>
                <BigInput
                  type="text"
                  placeholder="0"
                  value={amount ? (parseFloat(amount) * (parseFloat(limitPrice) || 168.42)).toFixed(2) : '0'}
                  readOnly
                />
                <TokenSelectPill>
                  <span className="font-semibold text-sm text-white">{!isSolToToken ? 'SOL' : outputTokenSymbol}</span>
                  <ChevronDown size={14} className="text-white/60" />
                  <select
                    value={!isSolToToken ? 'SOL' : outputMint}
                    onChange={(e) => {
                      if (e.target.value !== 'SOL') {
                        onOutputMintChange(e.target.value);
                      }
                    }}
                  >
                    {catalogTokens.map(t => (
                      <option key={t.mint} value={t.mint}>{t.symbol}</option>
                    ))}
                    <option value="SOL">SOL</option>
                  </select>
                </TokenSelectPill>
              </AmountInputRow>

              <SubValueRow>
                <span>~${estimatedUsd}</span>
              </SubValueRow>
            </SectionBox>

            {error && <p className="text-xs text-red-400 m-0">{error}</p>}

            {/* Action Submit Button */}
            <SubmitButton
              onClick={tradeMode === 'swap' ? (!quoteData ? onStartQuote : onSwapExecute) : onStartQuote}
              disabled={isQuoting || isExecuting}
            >
              {isQuoting || isExecuting ? 'Processing…' : 'Next'}
            </SubmitButton>
          </TradeCard>
        </div>

        {/* Right Chart & History (7 Cols) */}
        <div className="lg:col-span-7">
          <TradingChart />
        </div>
      </div>
    </ViewContainer>
  );
}

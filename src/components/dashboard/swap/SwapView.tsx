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
  flex-wrap: wrap;
  gap: 12px;
`;

const ModeTabs = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
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
  width: 100%;
`;

const AccountSelectorGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
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
  width: 100%;
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
  width: 100%;
`;

const BigInput = styled.input`
  flex: 1;
  min-width: 0;
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 600;
  color: #FFFFFF;

  @media (min-width: 640px) {
    font-size: 32px;
  }

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
  flex-shrink: 0;

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

  // DCA State
  const [dcaEveryVal, setDcaEveryVal] = useState('1');
  const [dcaUnit, setDcaUnit] = useState('Minute');
  const [dcaOverVal, setDcaOverVal] = useState('2');
  const [dcaMinPrice, setDcaMinPrice] = useState('');
  const [dcaMaxPrice, setDcaMaxPrice] = useState('');

  const sanitizeNumericInput = (val: string) => {
    let cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
    }
    return cleaned;
  };

  const handleKeyDownNoInvalidChars = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const outputTokenSymbol = catalogTokens.find(t => t.mint === outputMint)?.symbol || 'USDC';
  const isSolToToken = swapDirection === 'sol-to-token';

  const solBalance = balanceData?.solBalance || '107.47';
  const tokenBalance = balanceData?.tokens.find(t => t.mint === outputMint)?.uiAmount || '0.00';
  const activeSellBalance = isSolToToken ? solBalance : tokenBalance;

  const numAmount = parseFloat(amount) || 0;
  const price = parseFloat(limitPrice) || 168.42;

  const calculatedBuyAmount = isSolToToken
    ? numAmount > 0 ? (numAmount * price).toFixed(2) : '0'
    : numAmount > 0 && price > 0 ? (numAmount / price).toFixed(4) : '0';

  const estimatedSellUsd = isSolToToken
    ? (numAmount * price).toFixed(2)
    : numAmount.toFixed(2);

  const estimatedBuyUsd = isSolToToken
    ? (numAmount * price).toFixed(2)
    : (parseFloat(calculatedBuyAmount) * price).toFixed(2);

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
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={amount}
                  onKeyDown={handleKeyDownNoInvalidChars}
                  onChange={(e) => onAmountChange(sanitizeNumericInput(e.target.value))}
                />
                <TokenSelectPill>
                  <span className="font-semibold text-sm text-white">{isSolToToken ? 'SOL' : outputTokenSymbol}</span>
                  <ChevronDown size={14} className="text-white/60" />
                  <select
                    value={isSolToToken ? 'SOL' : outputMint}
                    onChange={(e) => {
                      if (e.target.value === 'SOL') {
                        if (!isSolToToken) onToggleDirection();
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
                <span>~${estimatedSellUsd}</span>
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
                  <MarketRateBtn onClick={() => setLimitPrice('168.420000')}>Market rate</MarketRateBtn>
                </div>
                <LimitPriceInputRow>
                  <BigInput
                    type="text"
                    inputMode="decimal"
                    value={limitPrice}
                    onKeyDown={handleKeyDownNoInvalidChars}
                    onChange={(e) => setLimitPrice(sanitizeNumericInput(e.target.value))}
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

            {/* DCA Mode Controls */}
            {tradeMode === 'dca' && (
              <>
                {/* Every & Over Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1 w-full">
                  {/* Every */}
                  <div className="flex flex-col gap-1.5 min-w-0 w-full">
                    <FieldLabel>Every</FieldLabel>
                    <div className="flex items-center gap-2 border-b border-white/10 pb-1 min-w-0 w-full">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={dcaEveryVal}
                        onKeyDown={handleKeyDownNoInvalidChars}
                        onChange={(e) => setDcaEveryVal(sanitizeNumericInput(e.target.value))}
                        className="w-10 shrink-0 bg-transparent border-none outline-none font-['Outfit'] text-2xl font-semibold text-white"
                      />
                      <div className="relative flex-1 min-w-0 flex items-center justify-between bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-medium cursor-pointer">
                        <span className="truncate">{dcaUnit}</span>
                        <ChevronDown size={14} className="text-white/50 shrink-0 ml-1" />
                        <select
                          className="absolute inset-0 opacity-0 cursor-pointer w-full"
                          value={dcaUnit}
                          onChange={(e) => setDcaUnit(e.target.value)}
                        >
                          <option value="Minute">Minute</option>
                          <option value="Hour">Hour</option>
                          <option value="Day">Day</option>
                          <option value="Week">Week</option>
                          <option value="Month">Month</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Over */}
                  <div className="flex flex-col gap-1.5 min-w-0 w-full">
                    <FieldLabel>Over</FieldLabel>
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1 min-w-0 w-full">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={dcaOverVal}
                        onKeyDown={handleKeyDownNoInvalidChars}
                        onChange={(e) => setDcaOverVal(sanitizeNumericInput(e.target.value))}
                        className="w-12 shrink-0 bg-transparent border-none outline-none font-['Outfit'] text-2xl font-semibold text-white"
                      />
                      <span className="text-white text-sm font-medium truncate shrink-0">Orders</span>
                    </div>
                  </div>
                </div>

                {/* Price range (optional) */}
                <div className="flex flex-col gap-2 pt-2 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs w-full">
                    <FieldLabel className="shrink-0">Price range (optional)</FieldLabel>
                    <span className="text-white/40 text-[11px] font-mono truncate">
                      Rate: {price.toFixed(6)} USDC per SOL
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 w-full">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Min price"
                      value={dcaMinPrice}
                      onKeyDown={handleKeyDownNoInvalidChars}
                      onChange={(e) => setDcaMinPrice(sanitizeNumericInput(e.target.value))}
                      className="min-w-0 flex-1 w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs text-white outline-none focus:border-white/25 transition-colors"
                    />
                    <span className="text-white/40 font-bold shrink-0">-</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Max price"
                      value={dcaMaxPrice}
                      onKeyDown={handleKeyDownNoInvalidChars}
                      onChange={(e) => setDcaMaxPrice(sanitizeNumericInput(e.target.value))}
                      className="min-w-0 flex-1 w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs text-white outline-none focus:border-white/25 transition-colors"
                    />
                  </div>
                  <p className="flex items-start gap-1.5 text-[11px] text-white/40 mt-1 leading-snug">
                    <Info size={13} className="shrink-0 mt-0.5 text-white/50" />
                    DCA will only execute when the market price is within your min/max range.
                  </p>
                </div>
              </>
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
                  value={calculatedBuyAmount}
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
                    {isSolToToken ? (
                      catalogTokens.map(t => (
                        <option key={t.mint} value={t.mint}>{t.symbol}</option>
                      ))
                    ) : (
                      <option value="SOL">SOL</option>
                    )}
                  </select>
                </TokenSelectPill>
              </AmountInputRow>

              <SubValueRow>
                <span>~${estimatedBuyUsd}</span>
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

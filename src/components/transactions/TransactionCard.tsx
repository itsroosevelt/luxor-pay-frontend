"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, ChevronDown, ChevronUp, Copy, ExternalLink, Check, CheckCircle2, CircleDot, Clock } from "lucide-react";
import { Transfer } from "@/lib/transfers-api";
import { useTokenRegistry } from '@/context/TokenRegistryContext';

const COLOR_SENT = "#EF4444";
const COLOR_RECEIVED = "#10B981";

const ItemContainer = styled(motion.div)<{ $type: 'sent' | 'received' }>`
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-left: 3px solid ${({ $type }) => ($type === 'sent' ? COLOR_SENT : COLOR_RECEIVED)};
  backdrop-filter: blur(20px);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 20px -8px rgba(0, 0, 0, 0.4);

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.12);
    border-left-color: ${({ $type }) => ($type === 'sent' ? COLOR_SENT : COLOR_RECEIVED)};
    box-shadow: 0 20px 40px -16px rgba(0, 0, 0, 0.6);
  }
`;

const MainRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  gap: 16px;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const PartyAndDate = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PartyTitle = styled.span`
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 15px;
  color: #FFFFFF;
`;

const DateSubtitle = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  display: flex;
  align-items: center;
  gap: 5px;
`;

const AmountAndStatus = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
`;

const IconBadge = styled.div<{ $type: 'sent' | 'received' }>`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $type }) => 
    $type === 'sent' 
      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(185, 28, 28, 0.15))' 
      : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))'};
  color: ${({ $type }) => 
    $type === 'sent' ? COLOR_SENT : COLOR_RECEIVED};
  border: 1px solid ${({ $type }) => 
    $type === 'sent' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'};
  flex-shrink: 0;
  box-shadow: ${({ $type }) =>
    $type === 'sent' ? '0 0 12px rgba(239, 68, 68, 0.1)' : '0 0 12px rgba(16, 185, 129, 0.1)'};
`;

const TokenCircle = styled.span<{ $symbol?: string }>`
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: ${({ $symbol }) =>
    $symbol === 'SOL'
      ? 'linear-gradient(135deg, #14F195, #9945FF)'
      : $symbol === 'USDC'
      ? 'linear-gradient(135deg, #2775CA, #1E508F)'
      : $symbol === 'USDT'
      ? 'linear-gradient(135deg, #26A17B, #1A6C52)'
      : 'linear-gradient(135deg, #60A5FA, #2563EB)'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-size: 8px;
  font-weight: 700;
  color: #FFFFFF;
  flex-shrink: 0;
`;

const ValueAmount = styled.span`
  font-family: monospace;
  font-size: 15px;
  font-weight: 600;
  color: #FFFFFF; /* Muted color to match white/gray premium styling */
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatusPill = styled.div<{ $status: string }>`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 3px 10px;
  border-radius: 9999px; /* Pill Shape (Rule 3) */
  display: inline-flex;
  align-items: center;
  text-transform: uppercase;

  ${({ $status }) => {
    if ($status === 'CONFIRMED' || $status === 'EXECUTED') {
      return `
        background: rgba(16, 185, 129, 0.1);
        color: #34D399;
        border: 1px solid rgba(16, 185, 129, 0.2);
      `;
    }
    if ($status === 'FAILED') {
      return `
        background: rgba(239, 68, 68, 0.1);
        color: #FCA5A5;
        border: 1px solid rgba(239, 68, 68, 0.2);
      `;
    }
    return `
      background: rgba(59, 130, 246, 0.1);
      color: #60A5FA;
      border: 1px solid rgba(59, 130, 246, 0.2);
    `;
  }}
`;

const ExpandIconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const ExpandedDrawer = styled(motion.div)`
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.2);
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  backdrop-filter: blur(10px);

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const DrawerPanel = styled.div`
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.03);
`;

const PanelTitle = styled.h4`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  gap: 12px;
`;

const DetailKey = styled.span`
  font-family: 'Montserrat', sans-serif;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
`;

const DetailVal = styled.span`
  font-family: monospace;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 6px;
  word-break: break-all;
`;

const LinkButton = styled.a`
  color: #60A5FA;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const DrawerButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
`;

const DrawerButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 18px;
  border-radius: 9999px; /* Circular Rule 3 requirement */
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  background: ${({ $variant }) => ($variant === 'primary' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.03)')};
  color: ${({ $variant }) => ($variant === 'primary' ? '#000000' : '#FFFFFF')};
  border: ${({ $variant }) => ($variant === 'secondary' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none')};

  &:hover {
    background: ${({ $variant }) => ($variant === 'primary' ? '#2563EB' : 'rgba(255, 255, 255, 0.1)')};
    color: #FFFFFF;
  }
  
  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const ProgressGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 640px) {
    grid-template-columns: 1.4fr 1fr;
  }
`;

const TimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TimelineStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const TimelineDot = styled.div<{ $status?: string }>`
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: ${({ $status }) => ($status === 'done' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.08)')};
  color: ${({ $status }) => ($status === 'done' ? '#34D399' : 'rgba(255, 255, 255, 0.4)')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
`;

const TimelineInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TimelineText = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #FFFFFF;
`;

const TimelineSub = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
`;

const SignersBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-left: 1px solid rgba(255, 255, 255, 0.06);
  padding-left: 16px;
`;

const SignerTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
`;

const SignerItem = styled.div`
  font-family: monospace;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 4px;
`;

function TokenIconGraphic({ symbol }: { symbol: string }) {
  const upper = symbol.toUpperCase();
  if (upper === 'SOL') {
    return (
      <TokenCircle $symbol="SOL" className="notranslate" translate="no">
        <svg width="10" height="10" viewBox="0 0 397 311" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="#FFF"/>
          <path d="M64.6 3.8C67 1.4 70.3 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="#FFF"/>
          <path d="M333.3 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.7c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="#FFF"/>
        </svg>
      </TokenCircle>
    );
  }
  if (upper === 'USDC') {
    return (
      <TokenCircle $symbol="USDC" className="notranslate" translate="no">
        $
      </TokenCircle>
    );
  }
  if (upper === 'USDT') {
    return (
      <TokenCircle $symbol="USDT" className="notranslate" translate="no">
        ₮
      </TokenCircle>
    );
  }
  return (
    <TokenCircle $symbol={upper} className="notranslate" translate="no">
      {upper.slice(0, 2)}
    </TokenCircle>
  );
}

interface TransactionCardProps {
  transfer: Transfer;
  merchantWallet: string | null;
  onClick: () => void;
  index: number;
}

export function TransactionCard({ transfer, merchantWallet, onClick, index }: TransactionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const isSent = merchantWallet ? transfer.fromWallet === merchantWallet : false;
  const type = isSent ? 'sent' : 'received';
  const { getTokenSymbol } = useTokenRegistry();
  const symbol = (getTokenSymbol(transfer.mint) || transfer.symbol || 'SOL').toUpperCase();

  const dateObj = new Date(transfer.createdAt);
  
  // Date and Time formatting (e.g. "Jul 7, 11:53 PM")
  const dateFormatted = dateObj.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
  const timeFormatted = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateLabel = `${dateFormatted}, ${timeFormatted}`;

  const fullDateFormatted = dateObj.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const fromAddress = transfer.fromWallet || "";
  const toAddress = transfer.toWallet || "";
  const partyLabel = isSent ? 'To: ' : 'From: ';
  const partyName = isSent 
    ? (transfer.toNickname || (toAddress ? `${toAddress.slice(0, 4)}...${toAddress.slice(-4)}` : "External Wallet"))
    : (fromAddress ? `${fromAddress.slice(0, 4)}...${fromAddress.slice(-4)}` : "External Wallet");

  const statusDisplay = transfer.status === 'CONFIRMED' ? 'Confirmed' : transfer.status;
  const solscanUrl = transfer.signature 
    ? `https://solscan.io/tx/${transfer.signature}` 
    : `https://solscan.io/account/${merchantWallet || ''}`;

  const copyText = (e: React.MouseEvent, text: string, keyName: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  return (
    <ItemContainer
      $type={type}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.012 }}
      transition={{ type: "spring", bounce: 0.25, duration: 0.45, delay: index * 0.02 }}
    >
      <MainRow onClick={handleToggleExpand}>
        <LeftSection>
          <IconBadge $type={type}>
            {type === 'sent' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
          </IconBadge>
          <PartyAndDate>
            <PartyTitle>
              {partyLabel}<strong className="notranslate font-medium text-white/90" translate="no">{partyName}</strong>
            </PartyTitle>
            <DateSubtitle>
              <Clock size={11} className="opacity-40" />
              <span>{dateLabel}</span>
            </DateSubtitle>
          </PartyAndDate>
        </LeftSection>

        <RightSection>
          <AmountAndStatus>
            <ValueAmount className="notranslate" translate="no">
              {type === 'sent' ? '-' : '+'}{transfer.amount}
              <TokenIconGraphic symbol={symbol} />
            </ValueAmount>
            <StatusPill $status={transfer.status}>
              {statusDisplay}
            </StatusPill>
          </AmountAndStatus>

          <ExpandIconButton
            type="button"
            onClick={handleToggleExpand}
            title={isExpanded ? "Collapse details" : "Expand details"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </ExpandIconButton>
        </RightSection>
      </MainRow>

      <AnimatePresence>
        {isExpanded && (
          <ExpandedDrawer
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Rich Info Panel with ALL transaction details */}
            <DrawerPanel>
              <PanelTitle>Info</PanelTitle>

              <DetailRow>
                <DetailKey>Author / Party</DetailKey>
                <DetailVal className="notranslate" translate="no">{partyName}</DetailVal>
              </DetailRow>

              <DetailRow>
                <DetailKey>From Address</DetailKey>
                <DetailVal className="notranslate" translate="no">
                  <span>{fromAddress ? `${fromAddress.slice(0, 6)}...${fromAddress.slice(-6)}` : 'N/A'}</span>
                  {fromAddress && (
                    <button
                      type="button"
                      onClick={(e) => copyText(e, fromAddress, 'from')}
                      className="p-1 text-gray-500 hover:text-white transition-colors"
                      title="Copy From Address"
                    >
                      {copiedKey === 'from' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    </button>
                  )}
                </DetailVal>
              </DetailRow>

              <DetailRow>
                <DetailKey>To Address</DetailKey>
                <DetailVal className="notranslate" translate="no">
                  <span>{toAddress ? `${toAddress.slice(0, 6)}...${toAddress.slice(-6)}` : 'N/A'}</span>
                  {toAddress && (
                    <button
                      type="button"
                      onClick={(e) => copyText(e, toAddress, 'to')}
                      className="p-1 text-gray-500 hover:text-white transition-colors"
                      title="Copy To Address"
                    >
                      {copiedKey === 'to' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    </button>
                  )}
                </DetailVal>
              </DetailRow>

              {transfer.reference && (
                <DetailRow>
                  <DetailKey>Reference ID</DetailKey>
                  <DetailVal className="notranslate" translate="no">
                    <span>{transfer.reference.length <= 32 ? transfer.reference : `${transfer.reference.slice(0, 24)}...`}</span>
                    <button
                      type="button"
                      onClick={(e) => copyText(e, transfer.reference!, 'ref')}
                      className="p-1 text-gray-500 hover:text-white transition-colors"
                      title="Copy Reference ID"
                    >
                      {copiedKey === 'ref' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    </button>
                  </DetailVal>
                </DetailRow>
              )}

              <DetailRow>
                <DetailKey>Account</DetailKey>
                <DetailVal>Merchant Main Account</DetailVal>
              </DetailRow>

              <DetailRow>
                <DetailKey>Created on</DetailKey>
                <DetailVal>{fullDateFormatted}</DetailVal>
              </DetailRow>

              <DetailRow>
                <DetailKey>Executed on</DetailKey>
                <DetailVal>{fullDateFormatted}</DetailVal>
              </DetailRow>

              <DetailRow>
                <DetailKey>Transaction Hash</DetailKey>
                <DetailVal>
                  <LinkButton href={solscanUrl} target="_blank" rel="noopener noreferrer" className="notranslate" translate="no">
                    <span>{transfer.signature ? `${transfer.signature.slice(0, 6)}...${transfer.signature.slice(-6)}` : 'Solscan'}</span>
                    <ExternalLink size={12} />
                  </LinkButton>
                  {transfer.signature && (
                    <button
                      type="button"
                      onClick={(e) => copyText(e, transfer.signature!, 'sig')}
                      className="p-1 text-gray-500 hover:text-white transition-colors"
                      title="Copy transaction signature"
                    >
                      {copiedKey === 'sig' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    </button>
                  )}
                </DetailVal>
              </DetailRow>

              <DrawerButtonGroup>
                <DrawerButton type="button" $variant="primary" onClick={onClick}>
                  See details
                </DrawerButton>
                <DrawerButton type="button" $variant="secondary">
                  Reclaim rent
                </DrawerButton>
              </DrawerButtonGroup>
            </DrawerPanel>

            {/* Progress Panel with Signers */}
            <DrawerPanel>
              <PanelTitle>Progress</PanelTitle>

              <ProgressGrid>
                <TimelineContainer>
                  <TimelineStep>
                    <TimelineDot $status="done">
                      <CheckCircle2 size={12} />
                    </TimelineDot>
                    <TimelineInfo>
                      <TimelineText>Transaction created</TimelineText>
                      <TimelineSub>{fullDateFormatted}</TimelineSub>
                    </TimelineInfo>
                  </TimelineStep>

                  <TimelineStep>
                    <TimelineDot $status="done">
                      <CircleDot size={12} />
                    </TimelineDot>
                    <TimelineInfo>
                      <TimelineText>Confirmed on Solana</TimelineText>
                      <TimelineSub>1/1 signatures approved</TimelineSub>
                    </TimelineInfo>
                  </TimelineStep>

                  <TimelineStep>
                    <TimelineDot $status="done">
                      <CheckCircle2 size={12} />
                    </TimelineDot>
                    <TimelineInfo>
                      <TimelineText>Executed</TimelineText>
                      <TimelineSub>{fullDateFormatted}</TimelineSub>
                    </TimelineInfo>
                  </TimelineStep>
                </TimelineContainer>

                <SignersBox>
                  <SignerTitle>
                    <span>Confirmed</span>
                    <strong className="text-green-400">1</strong>
                  </SignerTitle>

                  {fromAddress && (
                    <SignerItem className="notranslate" translate="no">
                      <span className="text-gray-500">From:</span> {fromAddress.slice(0, 4)}...{fromAddress.slice(-4)}
                    </SignerItem>
                  )}
                  {toAddress && (
                    <SignerItem className="notranslate" translate="no">
                      <span className="text-gray-500">To:</span> {toAddress.slice(0, 4)}...{toAddress.slice(-4)}
                    </SignerItem>
                  )}

                  <SignerTitle style={{ marginTop: '8px' }}>
                    <span>Rejected</span>
                    <span>0</span>
                  </SignerTitle>
                </SignersBox>
              </ProgressGrid>
            </DrawerPanel>
          </ExpandedDrawer>
        )}
      </AnimatePresence>
    </ItemContainer>
  );
}

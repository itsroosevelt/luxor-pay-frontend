"use client";

import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { Transfer } from "@/lib/transfers-api";
import { getTokenSymbol } from "@/lib/token-registry";

const CardWrapper = styled(motion.div)<{ $type: 'sent' | 'received' }>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.5);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${({ $type }: { $type: 'sent' | 'received' }) => 
      $type === 'sent' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)'};
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconCircle = styled.div<{ $type: 'sent' | 'received' }>`
  width: 48px;
  height: 48px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $type }) => 
    $type === 'sent' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'};
  color: ${({ $type }) => 
    $type === 'sent' ? '#EF4444' : '#10B981'};
`;

const DetailColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NicknameText = styled.span`
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: #EDEDED;
`;

const DateText = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const AmountText = styled.span<{ $type: 'sent' | 'received' }>`
  font-family: monospace;
  font-size: 18px;
  font-weight: 700;
  color: ${({ $type }) => ($type === 'sent' ? '#EDEDED' : '#10B981')};
`;

const StatusBadge = styled.span<{ $status: string }>`
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 9999px;
  background: ${({ $status }) => 
    $status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.1)' : 
    $status === 'FAILED' ? 'rgba(239, 68, 68, 0.1)' : 
    'rgba(245, 158, 11, 0.1)'};
  color: ${({ $status }) => 
    $status === 'CONFIRMED' ? '#10B981' : 
    $status === 'FAILED' ? '#EF4444' : 
    '#F59E0B'};
`;

interface TransactionCardProps {
  transfer: Transfer;
  merchantWallet: string | null;
  onClick: () => void;
  index: number;
}

export function TransactionCard({ transfer, merchantWallet, onClick, index }: TransactionCardProps) {
  const isSent = merchantWallet ? transfer.fromWallet === merchantWallet : false;
  const type = isSent ? 'sent' : 'received';
  const symbol = getTokenSymbol(transfer.mint) || transfer.symbol || 'SOL';
  
  // Format Date
  const dateObj = new Date(transfer.createdAt);
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });

  // Nickname logic: if sent, show toNickname or toWallet. If received, we only have fromWallet.
  let partyName = "Unknown";
  if (isSent) {
    partyName = transfer.toNickname || `${transfer.toWallet.slice(0,4)}...${transfer.toWallet.slice(-4)}`;
  } else {
    partyName = `${transfer.fromWallet.slice(0,4)}...${transfer.fromWallet.slice(-4)}`;
  }

  const animationProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring" as const, bounce: 0.3, duration: 0.5, delay: index * 0.05 },
  };

  return (
    <CardWrapper $type={type} onClick={onClick} {...animationProps}>
      <LeftSection>
        <IconCircle $type={type}>
          {type === 'sent' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
        </IconCircle>
        <DetailColumn>
          <NicknameText>{isSent ? `To: ${partyName}` : `From: ${partyName}`}</NicknameText>
          <DateText>
            <Clock size={12} />
            {formattedDate}
          </DateText>
        </DetailColumn>
      </LeftSection>
      <RightSection>
        <AmountText $type={type}>
          {type === 'sent' ? '-' : '+'}{transfer.amount} {symbol}
        </AmountText>
        <StatusBadge $status={transfer.status}>{transfer.status}</StatusBadge>
      </RightSection>
    </CardWrapper>
  );
}

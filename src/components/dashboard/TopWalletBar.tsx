"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Wallet, AlertTriangle, Check, Copy } from "lucide-react";

const Container = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  @media (min-width: 768px) {
    gap: 12px;
  }
`;

const BadgeBase = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #EDEDED;
  transition: all 0.2s ease;

  @media (min-width: 768px) {
    padding: 8px 16px;
    font-size: 13px;
  }
`;

const StatusBadge = styled(BadgeBase)`
  color: rgba(255, 255, 255, 0.7);
`;

const GreenDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: #22C55E;
  box-shadow: 0 0 8px #22C55E;
  display: inline-block;
`;

const BalanceBadge = styled(BadgeBase)<{ $isLow?: boolean }>`
  background: ${({ $isLow }) => ($isLow ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.05)')};
  border-color: ${({ $isLow }) => ($isLow ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.12)')};
  color: #FFFFFF;
`;

const WalletBadge = styled(BadgeBase)`
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(96, 165, 250, 0.3);
    color: #60A5FA;
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const AddressText = styled.span`
  font-family: monospace;
  letter-spacing: -0.2px;
`;

interface TopWalletBarProps {
  merchantWallet?: string | null;
  solBalance?: string | null;
  isLoading?: boolean;
}

export function TopWalletBar({ merchantWallet, solBalance, isLoading }: TopWalletBarProps) {
  const [copied, setCopied] = useState(false);

  const truncatedAddress = merchantWallet
    ? `${merchantWallet.slice(0, 4)}...${merchantWallet.slice(-4)}`
    : null;

  const numBalance = solBalance ? parseFloat(solBalance) : 0;
  // Threshold for low SOL gas fees warning (e.g. less than 0.005 SOL)
  const isLowBalance = numBalance < 0.005;

  const handleCopy = () => {
    if (!merchantWallet) return;
    navigator.clipboard.writeText(merchantWallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Container
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <StatusBadge>
        <span>Network Status</span>
        <GreenDot />
      </StatusBadge>

      <BalanceBadge
        $isLow={isLowBalance}
        title={isLowBalance ? "Bajo saldo de SOL para comisiones de red" : "Balance de SOL disponible"}
      >
        <span style={{ fontWeight: 600, color: '#60A5FA' }}>≡</span>
        <span>{isLoading ? "..." : `${solBalance || "0.00"} SOL`}</span>
        {isLowBalance && <AlertTriangle size={14} className="text-amber-400" />}
      </BalanceBadge>

      {truncatedAddress ? (
        <WalletBadge
          onClick={handleCopy}
          role="button"
          tabIndex={0}
          title={merchantWallet || undefined}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleCopy();
          }}
        >
          <Wallet size={14} />
          <AddressText>{truncatedAddress}</AddressText>
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} className="opacity-40" />}
        </WalletBadge>
      ) : (
        <WalletBadge style={{ opacity: 0.6 }}>
          <Wallet size={14} />
          <span>No wallet set</span>
        </WalletBadge>
      )}
    </Container>
  );
}

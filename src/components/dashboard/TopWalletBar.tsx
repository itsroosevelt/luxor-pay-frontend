"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Wallet, Check, Copy, QrCode, ArrowUp } from "lucide-react";

const Container = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  @media (min-width: 768px) {
    gap: 10px;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  @media (min-width: 768px) {
    padding: 7px 16px;
    font-size: 13px;
  }

  ${({ $variant }) =>
    $variant === 'primary' &&
    `
    background: #FFFFFF;
    color: #000000;
    border: 1px solid #FFFFFF;
    &:hover:not(:disabled) {
      background: #EDEDED;
      border-color: #EDEDED;
      color: #000000;
      box-shadow: 0 0 16px rgba(255, 255, 255, 0.2);
    }
  `}

  ${({ $variant }) =>
    $variant === 'secondary' &&
    `
    background: rgba(255, 255, 255, 0.05);
    color: #EDEDED;
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(12px);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.3);
      color: #FFFFFF;
    }
  `}

  &:focus-visible {
    outline: 2px solid #FFFFFF;
    outline-offset: 2px;
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
    padding: 7px 16px;
    font-size: 13px;
  }
`;

const WalletBadge = styled(BadgeBase)`
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.3);
    color: #E2E8F0;
  }

  &:focus-visible {
    outline: 2px solid #FFFFFF;
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
  onQrClick?: () => void;
  onSendClick?: () => void;
}

export function TopWalletBar({ merchantWallet, onQrClick, onSendClick }: TopWalletBarProps) {
  const [copied, setCopied] = useState(false);

  const truncatedAddress = merchantWallet
    ? `${merchantWallet.slice(0, 4)}...${merchantWallet.slice(-4)}`
    : null;

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
      {onQrClick && (
        <ActionButton $variant="primary" onClick={onQrClick} title="QR Pay / Charge">
          <QrCode size={14} />
          <span>QR Pay / Charge</span>
        </ActionButton>
      )}

      {onSendClick && (
        <ActionButton $variant="secondary" onClick={onSendClick} title="Send funds">
          <ArrowUp size={14} />
          <span>Send</span>
        </ActionButton>
      )}

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


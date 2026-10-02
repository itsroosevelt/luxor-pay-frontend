import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Wallet, Check, Copy, QrCode, ArrowUp, LogOut } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useMerchant } from "@/features/merchant/context/MerchantContext";

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
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const ConnectButton = styled(ActionButton)`
  background: rgba(255, 255, 255, 0.05);
  color: #EDEDED;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);

  &:hover:not(:disabled) {
    background: rgba(37, 99, 235, 0.2);
    border-color: #60A5FA;
    color: #FFFFFF;
    box-shadow: 0 0 16px rgba(96, 165, 250, 0.25);
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
  const { profile } = useMerchant();
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const activeWallet = React.useMemo(() => {
    if (connected && publicKey) return publicKey.toBase58();
    if (merchantWallet) return merchantWallet;
    if (profile?.merchantWallet) return profile.merchantWallet;
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('sterling_merchant_profile');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.merchantWallet) return parsed.merchantWallet;
        }
      } catch (e) {
        /* ignore */
      }
    }
    return null;
  }, [connected, publicKey, merchantWallet, profile?.merchantWallet]);

  const truncatedAddress = activeWallet
    ? `${activeWallet.slice(0, 4)}...${activeWallet.slice(-4)}`
    : null;

  const handleCopy = () => {
    if (!activeWallet) return;
    navigator.clipboard.writeText(activeWallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnectClick = () => {
    setVisible(true);
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

      {connected && activeWallet ? (
        <WalletBadge
          onClick={handleCopy}
          role="button"
          tabIndex={0}
          title={`Connected: ${activeWallet} (Click to copy)`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleCopy();
          }}
        >
          <Wallet size={14} />
          <AddressText>{truncatedAddress}</AddressText>
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} className="opacity-40" />}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              disconnect();
            }}
            title="Disconnect Wallet"
            className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
          >
            <LogOut size={12} />
          </button>
        </WalletBadge>
      ) : (
        <ConnectButton
          onClick={handleConnectClick}
          title="Connect Solana Wallet (Phantom, Solflare, etc.)"
        >
          <Wallet size={14} />
          <span>Connect</span>
        </ConnectButton>
      )}
    </Container>
  );
}


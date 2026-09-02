"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { CreditCard, ArrowRight } from "lucide-react";
import { OnrampModal } from "./OnrampModal";

// ─── Trigger Button ───────────────────────────────────────────────────────────
const TriggerWrapper = styled(motion.div)`
  margin-top: 12px;
  width: 100%;

  @media (min-width: 768px) {
    margin-top: 16px;
  }
`;

const FundButton = styled(motion.button)`
  width: 100%;
  padding: 10px 18px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.4);

  &:hover {
    border-color: rgba(255, 255, 255, 0.22);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.6);
  }

  &:focus-visible {
    outline: 2px solid #E2E8F0;
    outline-offset: 2px;
  }
`;

const ButtonIconCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #FFFFFF;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  flex: 1;
`;

const ButtonLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
  line-height: 1.2;
`;

const ButtonSub = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
`;

const ArrowIconCircle = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
  transition: all 0.2s ease;

  ${FundButton}:hover & {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    color: #FFFFFF;
    transform: translateX(2px);
  }
`;

// ─── Props ────────────────────────────────────────────────────────────────────
interface FundWalletButtonProps {
  merchantWallet?: string | null;
  onTrigger?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function FundWalletButton({ merchantWallet, onTrigger }: FundWalletButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <TriggerWrapper
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.6, delay: 0.1 }}
      >
        <FundButton
          id="fund-wallet-btn"
          type="button"
          onClick={() => {
            setIsModalOpen(true);
            if (onTrigger) onTrigger();
          }}
          whileTap={{ scale: 0.98 }}
          aria-label="Fund wallet with fiat money"
        >
          <ButtonIconCircle>
            <CreditCard size={18} />
          </ButtonIconCircle>
          <TextContainer>
            <ButtonLabel>Top up Wallet</ButtonLabel>
            <ButtonSub>Buy SOL instantly · Card, Bank</ButtonSub>
          </TextContainer>
          <ArrowIconCircle>
            <ArrowRight size={14} />
          </ArrowIconCircle>
        </FundButton>
      </TriggerWrapper>

      <OnrampModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        merchantWallet={merchantWallet}
      />
    </>
  );
}


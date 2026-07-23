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
  border: 1px solid rgba(96, 165, 250, 0.35);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.18), rgba(15, 23, 42, 0.75));
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px -4px rgba(37, 99, 235, 0.25);

  &:hover {
    border-color: rgba(96, 165, 250, 0.7);
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.28), rgba(30, 58, 138, 0.85));
    box-shadow: 0 8px 28px -4px rgba(37, 99, 235, 0.45);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const ButtonIconCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #2563EB, #60A5FA);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #FFFFFF;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
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
  color: rgba(255, 255, 255, 0.65);
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
  color: #60A5FA;
  flex-shrink: 0;
  transition: all 0.2s ease;

  ${FundButton}:hover & {
    background: rgba(96, 165, 250, 0.2);
    border-color: rgba(96, 165, 250, 0.4);
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


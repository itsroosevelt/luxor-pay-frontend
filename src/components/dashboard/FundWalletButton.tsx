"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Banknote, ArrowRight } from "lucide-react";
import { OnrampModal } from "./OnrampModal";

// ─── Trigger Button ───────────────────────────────────────────────────────────
const TriggerWrapper = styled(motion.div)`
  margin-top: 12px;

  @media (min-width: 768px) {
    margin-top: 16px;
  }
`;

const FundButton = styled(motion.button)`
  width: 100%;
  height: 52px;
  border-radius: 9999px;
  border: 1px solid rgba(96, 165, 250, 0.25);
  background: rgba(37, 99, 235, 0.08);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(96, 165, 250, 0.06), rgba(37, 99, 235, 0.06));
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  &:hover {
    border-color: rgba(96, 165, 250, 0.5);
    box-shadow: 0 4px 24px -4px rgba(37, 99, 235, 0.3);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const ButtonIconCircle = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(37, 99, 235, 0.2));
  border: 1px solid rgba(96, 165, 250, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ButtonLabel = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #EDEDED;
  flex: 1;
  text-align: left;
`;

const ButtonSub = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.35);
`;

// ─── Props ────────────────────────────────────────────────────────────────────
interface FundWalletButtonProps {
  merchantWallet?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function FundWalletButton({ merchantWallet }: FundWalletButtonProps) {
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
          onClick={() => setIsModalOpen(true)}
          whileTap={{ scale: 0.98 }}
          aria-label="Fund wallet with fiat money"
        >
          <ButtonIconCircle>
            <Banknote size={14} color="#60A5FA" />
          </ButtonIconCircle>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <ButtonLabel>Top up Wallet</ButtonLabel>
            <br />
            <ButtonSub>Buy SOL instantly · Card, Bank</ButtonSub>
          </div>
          <ArrowRight size={16} color="rgba(96,165,250,0.6)" />
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

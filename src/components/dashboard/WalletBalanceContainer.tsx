"use client";

import React from "react";
import styled from "styled-components";
import { WalletBalanceView } from "./WalletBalanceView";
import { FundWalletButton } from "./FundWalletButton";

import { DashboardExtraPanelsContainer } from "./overview/DashboardExtraPanelsContainer";
import { useGetBalance } from "@/hooks/useGetBalance";
import { useMerchant } from "@/context/MerchantContext";

const OuterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
`;
const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;
const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

interface WalletBalanceContainerProps {
  merchantWallet?: string | null;
  onSendClick?: () => void;
  onDepositClick?: () => void;
  onTradeClick?: () => void;
}

export function WalletBalanceContainer({
  merchantWallet,
  onSendClick,
  onDepositClick,
  onTradeClick,
}: WalletBalanceContainerProps) {
  const { profile, setIsKycModalOpen } = useMerchant();
  const {
    data,
    isLoading,
    isError,
    errorMessage,
    refetch,
    isPrivacyMode,
    togglePrivacyMode,
  } = useGetBalance(merchantWallet);

  if (!merchantWallet) {
    return null;
  }

  const isKycVerified = profile?.kyc ?? false;

  return (
    <OuterWrapper>
      <GridContainer>
        <LeftColumn>
          <WalletBalanceView
            data={data}
            isLoading={isLoading}
            isError={isError}
            errorMessage={errorMessage}
            refetch={refetch}
            isPrivacyMode={isPrivacyMode}
            togglePrivacyMode={togglePrivacyMode}
            isKycVerified={isKycVerified}
            onVerifyClick={() => setIsKycModalOpen(true)}
            onSendClick={onSendClick}
            onDepositClick={onDepositClick || (() => setIsKycModalOpen(true))}
            onTradeClick={onTradeClick}
            merchantWallet={merchantWallet}
          />
          {isKycVerified && merchantWallet && (
            <FundWalletButton merchantWallet={merchantWallet} />
          )}
        </LeftColumn>
      </GridContainer>

      {/* Interactive limit orders, flows and stake panels */}
      <DashboardExtraPanelsContainer />
    </OuterWrapper>
  );
}

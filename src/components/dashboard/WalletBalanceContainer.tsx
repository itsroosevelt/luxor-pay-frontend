"use client";

import React from "react";
import styled from "styled-components";
import { WalletBalanceView } from "./WalletBalanceView";

import { OverviewChart } from "./overview/OverviewChart";
import { AccountsTable } from "./overview/AccountsTable";
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
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  width: 100%;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    align-items: stretch;
  }
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
        {/* Left Column: Compact Balance Card + Top up Wallet Button */}
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

        </LeftColumn>

        {/* Right Column: Statistics Chart Box */}
        <OverviewChart />
      </GridContainer>

      {/* Accounts / Coins / NFTs Assets Table directly underneath */}
      <AccountsTable
        onSendClick={onSendClick}
        onTradeClick={onTradeClick}
        merchantWallet={merchantWallet}
        solBalance={data?.solBalance}
        balanceData={data}
      />

      {/* Interactive limit orders, flows and stake panels */}
      <DashboardExtraPanelsContainer />
    </OuterWrapper>
  );
}

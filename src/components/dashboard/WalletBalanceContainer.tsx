"use client";

import React, { useMemo } from "react";
import styled from "styled-components";
import { WalletBalanceView } from "./WalletBalanceView";
import { FundWalletButton } from "./FundWalletButton";

import { DashboardExtraPanelsContainer } from "./overview/DashboardExtraPanelsContainer";
import { useGetBalance } from "@/hooks/useGetBalance";
import { useTreasury } from "@/hooks/useTreasury";
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
  /** Render the Limit-Order / Inflows / Stake / Managed-Assets panels. Default true. */
  showExtraPanels?: boolean;
}

export function WalletBalanceContainer({
  merchantWallet,
  onSendClick,
  onDepositClick,
  onTradeClick,
  showExtraPanels = true,
}: WalletBalanceContainerProps) {
  const { profile, setIsKycModalOpen } = useMerchant();
  const activeWallet = merchantWallet || profile?.merchantWallet || null;
  const {
    data,
    isLoading,
    isError,
    errorMessage,
    refetch,
    isPrivacyMode,
    togglePrivacyMode,
  } = useGetBalance(activeWallet);

  const { vaults } = useTreasury();

  const totalUsdBalance = useMemo(() => {
    if (vaults && vaults.length > 0) {
      return vaults.reduce((acc, v) => acc + (v.usdValue ?? 0), 0);
    }
    const solVal = Number(data?.solBalance || 0) * 168.42;
    const tokenVal = (data?.tokens || []).reduce((acc, t) => acc + (t.usdValue ?? Number(t.uiAmount || 0)), 0);
    return solVal + tokenVal;
  }, [vaults, data]);

  if (!activeWallet) {
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
            merchantWallet={activeWallet}
            totalUsdBalance={totalUsdBalance}
          />
          {isKycVerified && activeWallet && (
            <FundWalletButton merchantWallet={activeWallet} />
          )}
        </LeftColumn>
      </GridContainer>

      {/* Interactive limit orders, flows and stake panels */}
      {showExtraPanels && <DashboardExtraPanelsContainer />}
    </OuterWrapper>
  );
}

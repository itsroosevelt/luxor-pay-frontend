"use client";

import React from "react";
import { WalletBalanceView } from "./WalletBalanceView";
import { useGetBalance } from "@/hooks/useGetBalance";
import { useMerchant } from "@/context/MerchantContext";

interface WalletBalanceContainerProps {
  merchantWallet?: string | null;
}

export function WalletBalanceContainer({ merchantWallet }: WalletBalanceContainerProps) {
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
    />
  );
}

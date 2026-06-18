"use client";

import React from "react";
import { WalletBalanceView } from "./WalletBalanceView";
import { useGetBalance } from "@/hooks/useGetBalance";

interface WalletBalanceContainerProps {
  merchantWallet?: string | null;
}

export function WalletBalanceContainer({ merchantWallet }: WalletBalanceContainerProps) {
  const {
    data,
    isLoading,
    isError,
    errorMessage,
    refetch,
    isPrivacyMode,
    togglePrivacyMode,
  } = useGetBalance(merchantWallet);

  // If there's no merchant wallet configured, we might not want to render the balance section at all,
  // or we render it in an empty state. Since the dashboard already shows a warning alert if !hasWallet,
  // we can safely just return null or an empty state here when there is no wallet.
  if (!merchantWallet) {
    return null;
  }

  return (
    <WalletBalanceView
      data={data}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      refetch={refetch}
      isPrivacyMode={isPrivacyMode}
      togglePrivacyMode={togglePrivacyMode}
    />
  );
}

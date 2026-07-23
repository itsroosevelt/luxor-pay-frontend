"use client";

import React from "react";
import { useGetTransfers } from "@/hooks/useGetTransfers";
import { TransactionsView } from "./TransactionsView";
import { Transfer } from "@/lib/transfers-api";

interface TransactionsContainerProps {
  merchantWallet: string | null;
  onTransferClick?: () => void;
}

export function TransactionsContainer({ merchantWallet, onTransferClick }: TransactionsContainerProps) {
  const {
    data,
    isLoading,
    isError,
    errorMessage,
    refetch,
    offset,
    limit,
    status,
    setOffset,
    setLimit,
    setStatus,
  } = useGetTransfers(5);

  const handleNextPage = () => {
    setOffset(offset + limit);
  };

  const handlePrevPage = () => {
    setOffset(Math.max(0, offset - limit));
  };

  const handleSetStatus = (newStatus: string | undefined) => {
    setStatus(newStatus);
    setOffset(0);
  };

  const handleSetLimit = (newLimit: number) => {
    setLimit(newLimit);
    setOffset(0);
  };

  const handleSelectTransaction = (_transfer: Transfer) => {
    // Modal removed per user request: details open directly via View on Explorer button
  };

  return (
    <TransactionsView
      data={data}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      merchantWallet={merchantWallet}
      offset={offset}
      limit={limit}
      status={status}
      onNextPage={handleNextPage}
      onPrevPage={handlePrevPage}
      onSelectTransaction={handleSelectTransaction}
      onSetLimit={handleSetLimit}
      onSetStatus={handleSetStatus}
      onRefresh={refetch}
      onTransferClick={onTransferClick}
    />
  );
}


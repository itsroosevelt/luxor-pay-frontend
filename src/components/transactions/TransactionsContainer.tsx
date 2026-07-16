"use client";

import React, { useState } from "react";
import { useGetTransfers } from "@/hooks/useGetTransfers";
import { TransactionsView } from "./TransactionsView";
import { TransactionDetailModal } from "./TransactionDetailModal";
import { Transfer } from "@/lib/transfers-api";


interface TransactionsContainerProps {
  merchantWallet: string | null;
}

export function TransactionsContainer({ merchantWallet }: TransactionsContainerProps) {
  const {
    data,
    isLoading,
    isError,
    errorMessage,
    offset,
    limit,
    status,
    setOffset,
    setLimit,
    setStatus,
  } = useGetTransfers(5);

  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);

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

  const handleSelectTransaction = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
  };

  const handleCloseModal = () => {
    setSelectedTransfer(null);
  };

  return (
    <>
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
      />


      <TransactionDetailModal
        transfer={selectedTransfer}
        merchantWallet={merchantWallet}
        onClose={handleCloseModal}
      />
    </>
  );
}

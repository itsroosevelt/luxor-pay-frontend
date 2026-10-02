"use client";

import React from 'react';
import { Transfer } from '@/features/transfers/api/transfers-api';
import { PaymentSuccessModal } from '@/features/payments/components/PaymentSuccessModal';

interface TransferSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  transferData: Transfer | null;
}

export function TransferSuccessModal({ isOpen, onClose, transferData }: TransferSuccessModalProps) {
  if (!transferData) return null;

  return (
    <PaymentSuccessModal
      isOpen={isOpen}
      onClose={onClose}
      data={{
        amount: transferData.amount,
        symbol: transferData.symbol || 'SOL',
        toWallet: transferData.toWallet,
        toNickname: transferData.toNickname,
        signature: transferData.signature,
        reference: transferData.reference,
      }}
    />
  );
}

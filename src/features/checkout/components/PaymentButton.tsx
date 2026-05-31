'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ArrowRight } from 'lucide-react';

export function PaymentButton({ onPay, disabled }: { onPay: () => void; disabled?: boolean }) {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="flex justify-center">
        <WalletMultiButton className="!bg-primary !rounded-xl !h-12 !w-full !flex !justify-center !text-black !font-bold" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onPay}
      disabled={disabled}
      className="w-full h-12 solana-gradient rounded-xl font-bold text-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      Pay with connected wallet <ArrowRight size={18} />
    </button>
  );
}

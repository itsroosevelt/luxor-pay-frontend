'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ArrowRight } from 'lucide-react';

export function PaymentButton({
  onPay,
  disabled,
  variant = 'gradient',
}: {
  onPay: () => void;
  disabled?: boolean;
  variant?: 'gradient' | 'white';
}) {
  const { connected } = useWallet();
  const walletBtnClass =
    variant === 'white'
      ? '!bg-white !rounded-xl !h-12 !w-full !flex !justify-center !text-black !font-bold hover:!bg-gray-100'
      : '!bg-primary !rounded-xl !h-12 !w-full !flex !justify-center !text-black !font-bold';

  if (!connected) {
    return (
      <div className="flex justify-center w-full">
        <WalletMultiButton className={walletBtnClass} />
      </div>
    );
  }

  const payClass =
    variant === 'white'
      ? 'w-full h-12 bg-white rounded-xl font-bold text-black flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-50'
      : 'w-full h-12 solana-gradient rounded-xl font-bold text-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50';

  return (
    <button
      type="button"
      onClick={onPay}
      disabled={disabled}
      className={payClass}
    >
      Pay with connected wallet <ArrowRight size={18} />
    </button>
  );
}

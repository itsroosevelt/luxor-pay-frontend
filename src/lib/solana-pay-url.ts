import type { Currency } from '@luxor/contracts';
import { SOLANA_NETWORK } from '@/web3/config/network';

const USDC_MINT: Record<string, string> = {
  'mainnet-beta': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  devnet: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  testnet: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
};

function getUsdcMint(): string {
  return USDC_MINT[SOLANA_NETWORK] ?? USDC_MINT['mainnet-beta'];
}

export function buildSolanaPayUrl(params: {
  recipient: string;
  amount: number;
  currency: Currency;
  label?: string;
  message?: string;
}): string {
  const { recipient, amount, currency, label, message } = params;
  const url = new URL(`solana:${recipient.trim()}`);
  url.searchParams.set('amount', String(amount));

  if (currency === 'USDC') {
    url.searchParams.set('spl-token', getUsdcMint());
  }

  const trimmedLabel = label?.trim();
  if (trimmedLabel) {
    url.searchParams.set('label', trimmedLabel);
  }

  const trimmedMessage = message?.trim() ?? trimmedLabel;
  if (trimmedMessage) {
    url.searchParams.set('message', trimmedMessage);
  }

  return url.toString();
}

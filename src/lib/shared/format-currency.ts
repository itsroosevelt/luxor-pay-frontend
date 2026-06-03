import type { Currency } from '@luxor/contracts';

export const SUPPORTED_CURRENCIES: Currency[] = ['SOL', 'USDC'];

export function formatCurrencyAmount(amount: number, currency: Currency): string {
  const decimals = currency === 'SOL' ? 4 : 2;
  return `${amount.toFixed(decimals)} ${currency}`;
}

export function currencyLabel(currency: Currency): string {
  return currency === 'SOL' ? 'Solana (SOL)' : 'USD Coin (USDC)';
}

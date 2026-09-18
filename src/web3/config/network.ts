export const SOLANA_NETWORK =
  process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'mainnet-beta';

export const STERLING_ENV = process.env.NEXT_PUBLIC_STERLING_ENV ?? process.env.NEXT_PUBLIC_LUXOR_ENV ?? 'production';
export const LUXOR_ENV = STERLING_ENV;

export function getExplorerTxUrl(signature: string): string {
  if (STERLING_ENV === 'development') {
    return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
  }

  const cluster = SOLANA_NETWORK === 'mainnet-beta' ? '' : `?cluster=${SOLANA_NETWORK}`;
  return `https://explorer.solana.com/tx/${signature}${cluster}`;
}

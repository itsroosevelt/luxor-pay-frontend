export const SOLANA_NETWORK =
  process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'mainnet-beta';

export const LUXOR_ENV = process.env.NEXT_PUBLIC_LUXOR_ENV ?? 'production';

export function getExplorerTxUrl(signature: string): string {
  if (LUXOR_ENV === 'development') {
    return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
  }

  const cluster = SOLANA_NETWORK === 'mainnet-beta' ? '' : `?cluster=${SOLANA_NETWORK}`;
  return `https://explorer.solana.com/tx/${signature}${cluster}`;
}

import { apiUrl } from '@/lib/api-client';

export interface TokenBalance {
  mint: string;
  symbol: string | null;
  uiAmount: string;
  rawAmount: string;
  decimals: number;
  tokenAccount: string;
}

export interface WalletBalanceData {
  publicKey: string;
  solBalance: string;
  lamports: string;
  tokens: TokenBalance[];
  fetchedAt: string;
}

export async function getWalletBalance(
  token: string,
  publicKey: string
): Promise<WalletBalanceData> {
  const url = new URL(apiUrl('/solana/balance'));
  url.searchParams.append('publicKey', publicKey);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(
      json.message?.[0] || json.message || json.error || 'Failed to fetch wallet balance'
    );
  }

  return json.data as WalletBalanceData;
}

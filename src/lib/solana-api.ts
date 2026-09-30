import { Connection, PublicKey } from '@solana/web3.js';
import { apiUrl } from '@/lib/api-client';

export interface TokenBalance {
  mint: string;
  symbol: string;
  name?: string | null;
  uiAmount: string;
  rawAmount: string;
  decimals: number;
  tokenAccount: string;
  usdValue?: number | null;
}

export interface WalletBalanceData {
  publicKey: string;
  solBalance: string;
  lamports: string;
  tokens: TokenBalance[];
  fetchedAt: string;
}

const KNOWN_TOKENS: Record<string, { symbol: string; name: string; decimals: number; priceUsd: number }> = {
  'So11111111111111111111111111111111111111112': { symbol: 'SOL', name: 'Solana', decimals: 9, priceUsd: 168.42 },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', name: 'USD Coin', decimals: 6, priceUsd: 1.0 },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', name: 'Tether USD', decimals: 6, priceUsd: 1.0 },
  '3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE': { symbol: 'STR', name: 'Sterling Token', decimals: 9, priceUsd: 0.0731 },
};

export async function fetchOnChainWalletBalance(publicKeyStr: string): Promise<WalletBalanceData> {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta';
  const rpcUrl =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
    (network === 'devnet' ? 'https://api.devnet.solana.com' : 'https://api.mainnet-beta.solana.com');

  try {
    const connection = new Connection(rpcUrl, 'confirmed');
    const pubkey = new PublicKey(publicKeyStr);

    const [lamports, tokenAccounts] = await Promise.all([
      connection.getBalance(pubkey),
      connection.getParsedTokenAccountsByOwner(pubkey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      }),
    ]);

    const solBalance = (lamports / 1e9).toString();
    const tokens: TokenBalance[] = [];

    for (const item of tokenAccounts.value) {
      const info = item.account.data.parsed.info;
      const mint = info.mint;
      const amount = info.tokenAmount;
      const uiAmt = Number(amount.uiAmount || 0);
      if (uiAmt > 0) {
        const known = KNOWN_TOKENS[mint];
        tokens.push({
          mint,
          symbol: known?.symbol || mint.slice(0, 4) + '…',
          name: known?.name || 'Token',
          uiAmount: amount.uiAmountString || String(amount.uiAmount),
          rawAmount: amount.amount,
          decimals: amount.decimals,
          tokenAccount: item.pubkey.toBase58(),
          usdValue: known ? uiAmt * known.priceUsd : null,
        });
      }
    }

    return {
      publicKey: publicKeyStr,
      solBalance,
      lamports: String(lamports),
      tokens,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('On-chain RPC fetch failed for pubkey:', publicKeyStr, err);
    return {
      publicKey: publicKeyStr,
      solBalance: '0.00',
      lamports: '0',
      tokens: [],
      fetchedAt: new Date().toISOString(),
    };
  }
}

export async function getWalletBalance(
  token: string,
  publicKey: string
): Promise<WalletBalanceData> {
  try {
    const url = new URL(apiUrl('/solana/balance'));
    url.searchParams.append('publicKey', publicKey);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const json = await res.json();

    if (res.ok && json.data) {
      return json.data as WalletBalanceData;
    }
  } catch {
    // If backend endpoint is unavailable or unauthenticated, fall back to direct Solana RPC
  }

  return await fetchOnChainWalletBalance(publicKey);
}

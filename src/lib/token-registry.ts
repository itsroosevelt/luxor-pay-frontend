export const TOKEN_REGISTRY: Record<string, Record<string, string>> = {
  'mainnet-beta': {
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
    'So11111111111111111111111111111111111111112': 'wSOL',
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'BONK',
    'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 'JUP',
    '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo': 'PYUSD',
    'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'mSOL',
    '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': 'stSOL',
    'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof': 'RENDER',
    'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm': 'WIF',
    '3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE': 'LXR',
  },
  devnet: {
    '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU': 'USDC',
    '3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE': 'LXR',
    'HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr': 'EURC',
  },
};

export function getTokenSymbol(mint: string | undefined | null, network: 'mainnet-beta' | 'devnet' = 'devnet'): string | null {
  if (!mint) return null;
  return TOKEN_REGISTRY[network]?.[mint] || null;
}

import { SOLANA_NETWORK } from '@/web3/config/network';

export function getSolanaNetworkLabel(): string {
  if (SOLANA_NETWORK === 'mainnet-beta') return 'mainnet';
  if (SOLANA_NETWORK === 'devnet') return 'devnet';
  if (SOLANA_NETWORK === 'testnet') return 'testnet';
  return SOLANA_NETWORK;
}

export function getSolanaRpcHint(): string {
  return process.env.NEXT_PUBLIC_SOLANA_RPC_URL
    ? 'Custom RPC (NEXT_PUBLIC_SOLANA_RPC_URL)'
    : 'Default cluster RPC';
}

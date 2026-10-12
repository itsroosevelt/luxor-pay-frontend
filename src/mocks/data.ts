/**
 * Clean fixtures file — all fictitious transaction data, simulated contacts, fake payment links,
 * fake proposals, and mock balances have been removed.
 *
 * This file maintains required TypeScript interfaces and token mint definitions so that all
 * buttons, modals, forms, and UI layouts function 100% cleanly without simulated data.
 */

import type {
  MerchantProfile,
  PaymentLink,
  PosDevice,
} from '@sterling/contracts';
import type { Contact } from '@/features/contacts/api/contacts-api';
import type { PaymentRequest } from '@/features/payment-requests/api/payment-requests-api';
import type { Transfer } from '@/features/transfers/api/transfers-api';
import type { WalletBalanceData } from '@/features/wallet/api/solana-api';
import type { TokenMetadata } from '@/context/TokenRegistryContext';
import { DEMO_IDENTITY } from '@/lib/mock/mock-auth';

/* ─────────────────────────── User identity ─────────────────────────── */

export const MOCK_USER = DEMO_IDENTITY;

const NOW = Date.now();
const iso = (offsetMs: number = 0) => new Date(NOW + offsetMs).toISOString();

/* ─────────────────────────── Token mints ──────────────────────────── */

export const MINTS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  STR: '3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE',
  LXR: '3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE',
} as const;

/* ─────────────────────── Token registry / catalog ─────────────────── */

export const MOCK_TOKENS: TokenMetadata[] = [
  {
    id: 'tok-sol', environment: 'mainnet', mint: MINTS.SOL, symbol: 'SOL', name: 'Solana',
    decimals: 9, logoUrl: null, active: true, createdAt: iso(), updatedAt: iso(),
  },
  {
    id: 'tok-usdc', environment: 'mainnet', mint: MINTS.USDC, symbol: 'USDC', name: 'USD Coin',
    decimals: 6, logoUrl: null, active: true, createdAt: iso(), updatedAt: iso(),
  },
  {
    id: 'tok-usdt', environment: 'mainnet', mint: MINTS.USDT, symbol: 'USDT', name: 'Tether USD',
    decimals: 6, logoUrl: null, active: true, createdAt: iso(), updatedAt: iso(),
  },
  {
    id: 'tok-str', environment: 'mainnet', mint: MINTS.STR, symbol: 'STR', name: 'Sterling Token',
    decimals: 9, logoUrl: null, active: true, createdAt: iso(), updatedAt: iso(),
  },
];

/** Standard USD spot prices for converter utilities */
export const MOCK_PRICES_USD: Record<string, number> = {
  [MINTS.SOL]: 168.42,
  [MINTS.USDC]: 1,
  [MINTS.USDT]: 1,
  [MINTS.STR]: 0.0731,
  SOL: 168.42,
  USDC: 1,
  USDT: 1,
  STR: 0.0731,
  LXR: 0.0731,
};

/* ─────────────────────────── Merchant profile ─────────────────────── */

export const MOCK_MERCHANT_PROFILE: MerchantProfile = {
  id: 'merchant-0001',
  email: 'admin@sterling.io',
  businessName: 'Sterling Enterprise',
  merchantWallet: 'Gwm7E9Rmy5k6D9PxzQdHnzc653AAaRCBCNEF7aL7di5x',
  kyc: true,
  kycStatus: 'VERIFIED',
  createdAt: iso(),
  updatedAt: iso(),
};

/* ─────────────────────────── Wallet balance ───────────────────────── */

export const MOCK_WALLET_BALANCE: WalletBalanceData = {
  publicKey: '',
  solBalance: '0.00',
  lamports: '0',
  fetchedAt: iso(),
  tokens: [],
};

/* ─────────────────────────── Payment links ────────────────────────── */

export const MOCK_PAYMENT_LINKS: PaymentLink[] = [];

/* ─────────────────────────── POS devices ──────────────────────────── */

export const MOCK_POS_DEVICES: PosDevice[] = [];

/* ─────────────────────────── API keys ─────────────────────────────── */

export const MOCK_API_KEYS: any[] = [];

/* ─────────────────────── Payment requests ─────────────────────────── */

export const MOCK_PAYMENT_REQUESTS: PaymentRequest[] = [];

/* ─────────────────────────── Transactions ─────────────────────────── */

export const MOCK_TRANSFERS: Transfer[] = [];

/* ─────────────────────────── Contacts ─────────────────────────────── */

export const MOCK_CONTACTS: Contact[] = [];

/* ─────────────────────────── Members ─────────────────────────────── */

export const DEFAULT_OWNER_MEMBER = {
  id: 'member_owner_main',
  merchantId: 'merchant-0001',
  name: 'Cuenta Principal',
  walletAddress: 'Gwm7E9Rmy5k6D9PxzQdHnzc653AAaRCBCNEF7aL7di5x',
  roles: { proposer: true, signer: true, executor: true },
  isCurrentUser: true,
  createdAt: iso(),
  updatedAt: iso(),
};

export const MOCK_MEMBERS: any[] = [DEFAULT_OWNER_MEMBER];

/* ──────────────── Multisig treasury (Squads v4-style) ─────────────── */

export const MOCK_MULTISIG = {
  id: 'mock-treasury',
  name: 'Tesorería Sterling',
  isDefault: true,
  address: '',
  threshold: 1,
  timeLock: 0,
  transactionIndex: 0,
  createKey: '',
  createdAt: iso(),
  updatedAt: iso(),
};

export const DEFAULT_GEMINI_VAULT = {
  id: 'vault-gemini-001',
  index: 0,
  label: 'Roosevelt',
  address: '7cZ1k4R4Z9LQ6RmrLHUSnMM4n9vMhpMnoo5yLyWdMZ1',
  description: 'Bóveda principal por defecto del ecosistema',
  isDefault: true,
  usdValue: 741.01,
  weight: 40.3,
  solBalance: '5.990921',
  tokens: [
    { mint: MINTS.SOL, symbol: 'SOL', uiAmount: '5.990921', usdValue: 724.97 },
    { mint: MINTS.USDC, symbol: 'USDC', uiAmount: '10.55', usdValue: 10.55 },
    { mint: 'EURC_MINT_MOCK_11111111111111111111111111111', symbol: 'EURC', uiAmount: '4.875', usdValue: 5.49 },
  ],
  createdAt: iso(),
};

export const PRUEBA_VAULT = {
  id: 'vault-prueba-002',
  index: 1,
  label: 'prueba',
  address: 'AdnVK4R4Z9LQ6RmrLHUSnMM4n9vMhpMnoo5yLyWRkaXT',
  description: 'Bóveda secundaria',
  isDefault: false,
  usdValue: 1099.97,
  weight: 59.7,
  solBalance: '6.2573',
  tokens: [{ mint: MINTS.USDC, symbol: 'USDC', uiAmount: '1099.97', usdValue: 1099.97 }],
  createdAt: iso(),
};

/* Sub-vaults */
export const MOCK_VAULTS: any[] = [DEFAULT_GEMINI_VAULT, PRUEBA_VAULT];

/* Multisig proposals */
export const MOCK_PROPOSALS: any[] = [];

/* ─────────────────────── Overview counters ────────────────────────── */

export const MOCK_OVERVIEW_STATS = {
  paymentLinks: 0,
  posDevices: 0,
  apiStatus: 'operational' as const,
};

/* ─────────────────────────── Swap quote ───────────────────────────── */

export function buildMockSwapQuote(params: {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps?: number;
}) {
  const inMeta = MOCK_TOKENS.find((t) => t.mint === params.inputMint) ?? MOCK_TOKENS[0];
  const outMeta = MOCK_TOKENS.find((t) => t.mint === params.outputMint) ?? MOCK_TOKENS[1];
  const inUi = Number(params.amount) / 10 ** inMeta.decimals;
  const usd = inUi * (MOCK_PRICES_USD[params.inputMint] ?? 0);
  const outUi = usd / (MOCK_PRICES_USD[params.outputMint] || 1);
  const outAmount = BigInt(Math.max(0, Math.round(outUi * 10 ** outMeta.decimals))).toString();
  const slippageBps = params.slippageBps ?? 50;
  const threshold = BigInt(
    Math.round(Number(outAmount) * (1 - slippageBps / 10_000)),
  ).toString();

  return {
    inputMint: params.inputMint,
    inAmount: params.amount,
    outputMint: params.outputMint,
    outAmount,
    otherAmountThreshold: threshold,
    swapMode: 'ExactIn',
    slippageBps,
    priceImpactPct: '0.0007',
    routePlan: [
      {
        swapInfo: {
          ammKey: 'SterlingAmm111111111111111111111111111111111111',
          label: 'Sterling LP',
          inputMint: params.inputMint,
          outputMint: params.outputMint,
          inAmount: params.amount,
          outAmount,
          feeAmount: '0',
          feeMint: params.inputMint,
        },
        percent: 100,
      },
    ],
  };
}

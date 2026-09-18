/**
 * Local fixtures that feed every section of the platform while running in
 * Mock Mode (`NEXT_PUBLIC_USE_MOCK_DATA=true`).
 *
 * These objects mirror the shapes returned by `luxor-pay-be-solana` so the
 * visual components render exactly as they would against the live API.
 * Nothing here is imported unless Mock Mode is on.
 */

import type {
  MerchantProfile,
  PaymentLink,
  PosDevice,
} from '@sterling/contracts';
import type { Contact } from '@/lib/contacts-api';
import type { PaymentRequest } from '@/lib/payment-requests-api';
import type { Transfer } from '@/lib/transfers-api';
import type { WalletBalanceData } from '@/lib/solana-api';
import type { TokenMetadata } from '@/context/TokenRegistryContext';
import { DEMO_IDENTITY } from '@/lib/mock/mock-auth';

/* ─────────────────────────── Demo session ─────────────────────────── */

/** `{ name, wallet, status, ... }` for the simulated authenticated user. */
export const MOCK_USER = DEMO_IDENTITY;

const NOW = Date.UTC(2026, 8, 2, 15, 0, 0); // 2026-09-02T15:00:00Z — stable clock
const iso = (offsetMs: number) => new Date(NOW + offsetMs).toISOString();
const DAY = 86_400_000;
const HOUR = 3_600_000;

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
    id: 'tok-sol', environment: 'mock', mint: MINTS.SOL, symbol: 'SOL', name: 'Solana',
    decimals: 9, logoUrl: null, active: true, createdAt: iso(-90 * DAY), updatedAt: iso(-DAY),
  },
  {
    id: 'tok-usdc', environment: 'mock', mint: MINTS.USDC, symbol: 'USDC', name: 'USD Coin',
    decimals: 6, logoUrl: null, active: true, createdAt: iso(-90 * DAY), updatedAt: iso(-DAY),
  },
  {
    id: 'tok-usdt', environment: 'mock', mint: MINTS.USDT, symbol: 'USDT', name: 'Tether USD',
    decimals: 6, logoUrl: null, active: true, createdAt: iso(-90 * DAY), updatedAt: iso(-DAY),
  },
  {
    id: 'tok-str', environment: 'mock', mint: MINTS.STR, symbol: 'STR', name: 'Sterling Token',
    decimals: 9, logoUrl: null, active: true, createdAt: iso(-90 * DAY), updatedAt: iso(-DAY),
  },
];

/** Simulated USD spot prices used by the Swap screen and price hooks. */
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
  id: 'mock-merchant-0001',
  email: MOCK_USER.email,
  businessName: 'Demo Coffee Co.',
  merchantWallet: MOCK_USER.wallet,
  solanaToken: MINTS.USDC,
  kyc: true,
  kycStatus: 'VERIFIED',
  createdAt: iso(-120 * DAY),
  updatedAt: iso(-2 * DAY),
};

/* ─────────────────────────── Wallet balance ───────────────────────── */

export const MOCK_WALLET_BALANCE: WalletBalanceData = {
  publicKey: MOCK_USER.wallet,
  solBalance: '107.47',
  lamports: '107470000000',
  fetchedAt: iso(0),
  tokens: [
    {
      mint: MINTS.USDC, symbol: 'USDC', uiAmount: '45250.00', rawAmount: '45250000000',
      decimals: 6, tokenAccount: 'GwZ9mockUSDCataMockAcct1111111111111111111',
    },
    {
      mint: MINTS.USDT, symbol: 'USDT', uiAmount: '13575.00', rawAmount: '13575000000',
      decimals: 6, tokenAccount: 'GwZ9mockUSDTataMockAcct2222222222222222222',
    },
    {
      mint: MINTS.STR, symbol: 'STR', uiAmount: '185704.5', rawAmount: '185704500000000',
      decimals: 9, tokenAccount: 'GwZ9mockSTRataMockAcct33333333333333333333',
    },
  ],
};

/* ─────────────────────────── Payment links ────────────────────────── */

export const MOCK_PAYMENT_LINKS: PaymentLink[] = [
  {
    id: 'lnk_9f2a10', merchantId: MOCK_MERCHANT_PROFILE.id!, name: 'Espresso subscription',
    businessName: 'Demo Coffee Co.', amount: 25, currency: 'USDC',
    merchantWallet: MOCK_USER.wallet, active: true, createdAt: iso(-14 * DAY),
  },
  {
    id: 'lnk_7c81be', merchantId: MOCK_MERCHANT_PROFILE.id!, name: 'Merch bundle',
    businessName: 'Demo Coffee Co.', amount: 60, currency: 'USDC',
    merchantWallet: MOCK_USER.wallet, active: true, createdAt: iso(-9 * DAY),
  },
  {
    id: 'lnk_2db4c7', merchantId: MOCK_MERCHANT_PROFILE.id!, name: 'Event ticket — launch night',
    businessName: 'Demo Coffee Co.', amount: 1.5, currency: 'SOL',
    merchantWallet: MOCK_USER.wallet, active: false, createdAt: iso(-30 * DAY),
  },
  {
    id: 'lnk_5aa093', merchantId: MOCK_MERCHANT_PROFILE.id!, name: 'Donation / tip jar',
    businessName: 'Demo Coffee Co.', amount: 5, currency: 'USDC',
    merchantWallet: MOCK_USER.wallet, active: true, createdAt: iso(-3 * DAY),
  },
];

/* ─────────────────────────── POS devices ──────────────────────────── */

export const MOCK_POS_DEVICES: PosDevice[] = [
  {
    id: 'pos_01', merchantId: MOCK_MERCHANT_PROFILE.id!, name: 'Main Till - Downtown Flagship',
    posId: 'POS-SOL-9910', active: true, createdAt: iso(-45 * DAY), lastSeenAt: iso(-2 * HOUR),
  },
  {
    id: 'pos_02', merchantId: MOCK_MERCHANT_PROFILE.id!, name: 'Mobile Register #02',
    posId: 'POS-SOL-4412', active: true, createdAt: iso(-40 * DAY), lastSeenAt: iso(-1 * DAY),
  },
  {
    id: 'pos_03', merchantId: MOCK_MERCHANT_PROFILE.id!, name: 'Drive-Thru POS Terminal',
    posId: 'POS-SOL-1105', active: true, createdAt: iso(-35 * DAY), lastSeenAt: iso(-5 * HOUR),
  },
  {
    id: 'pos_04', merchantId: MOCK_MERCHANT_PROFILE.id!, name: 'Self-Checkout Kiosk #04',
    posId: 'POS-SOL-7740', active: false, createdAt: iso(-60 * DAY), lastSeenAt: iso(-2 * DAY),
  },
];

/* ─────────────────────────── API keys ─────────────────────────────── */

export const MOCK_API_KEYS = [
  { id: 'key_live_01', merchantId: MOCK_MERCHANT_PROFILE.id!, name: 'Production server', keyPrefix: 'lx_live_9f2a', createdAt: iso(-60 * DAY), lastUsedAt: iso(-3 * HOUR) },
  { id: 'key_test_01', merchantId: MOCK_MERCHANT_PROFILE.id!, name: 'Local development', keyPrefix: 'lx_test_1b7c', createdAt: iso(-20 * DAY), lastUsedAt: iso(-6 * DAY) },
];

/* ─────────────────────── Payment requests ─────────────────────────── */

const baseRequest = {
  merchantId: MOCK_MERCHANT_PROFILE.id!,
  requesterWallet: MOCK_USER.wallet,
  assetMint: MINTS.USDC,
  businessName: 'Demo Coffee Co.',
  targetNotificationType: 'EMAIL' as const,
};

export const MOCK_PAYMENT_REQUESTS: PaymentRequest[] = [
  {
    ...baseRequest, id: 'preq_1001', amount: '120.00', payerWallet: 'B6r2Ck9mockPayerWalletAAA1111111111111111111',
    targetNotification: 'sophia.martinez@techsol.io', reference: 'Invoice #1024', numericalReference: 1024,
    status: 'PAID', createdAt: iso(-6 * DAY), updatedAt: iso(-5 * DAY), lastNotificationDate: iso(-6 * DAY),
  },
  {
    ...baseRequest, id: 'preq_1002', amount: '45.50', payerWallet: 'C7s3Dl0mockPayerWalletBBB2222222222222222222',
    targetNotification: 'alex.wright@solanaventures.org', reference: 'Catering deposit', numericalReference: 1025,
    status: 'PENDING', createdAt: iso(-2 * DAY), updatedAt: iso(-2 * DAY),
    expirationDate: iso(5 * DAY), lastNotificationDate: iso(-1 * DAY),
  },
  {
    ...baseRequest, id: 'preq_1003', amount: '9.99', payerWallet: 'D8t4Em1mockPayerWalletCCC3333333333333333333',
    targetNotification: 'carlos.rodriguez@latampay.com', reference: 'Workshop seat', numericalReference: 1026,
    status: 'PENDING', createdAt: iso(-12 * HOUR), updatedAt: iso(-12 * HOUR), expirationDate: iso(2 * DAY),
  },
  {
    ...baseRequest, id: 'preq_1004', amount: '300.00', payerWallet: 'E9u5Fn2mockPayerWalletDDD4444444444444444444',
    targetNotification: 'elena.vance@solanapay.io', reference: 'Equipment rental', numericalReference: 1027,
    status: 'CANCELLED', createdAt: iso(-20 * DAY), updatedAt: iso(-18 * DAY),
  },
  {
    ...baseRequest, id: 'preq_1005', amount: '15.00', payerWallet: 'F0v6Go3mockPayerWalletEEE5555555555555555555',
    targetNotification: 'erin@example.com', reference: 'Late fee', numericalReference: 1028,
    status: 'EXPIRED', createdAt: iso(-15 * DAY), updatedAt: iso(-8 * DAY), expirationDate: iso(-8 * DAY),
  },
];

/* ─────────────────────────── Transactions ─────────────────────────── */

const sig = (n: number) =>
  `${n}xMockS0LaNaTxSignature${'z'.repeat(24)}${String(n).padStart(4, '0')}MockDemoOnly`;

export const MOCK_TRANSFERS: Transfer[] = [
  {
    id: 'txf_5001', merchantId: MOCK_MERCHANT_PROFILE.id!, fromWallet: 'B6r2Ck9mockPayerWalletAAA1111111111111111111',
    toWallet: MOCK_USER.wallet, reference: 'Invoice #1024', toNickname: 'Sophia Martinez', mint: MINTS.USDC, symbol: 'USDC',
    decimals: 6, amount: '120.00', rawAmount: '120000000', signature: sig(1), status: 'confirmed',
    errorMessage: null, createdAt: iso(-5 * DAY), confirmedAt: iso(-5 * DAY + 4000),
  },
  {
    id: 'txf_5002', merchantId: MOCK_MERCHANT_PROFILE.id!, fromWallet: MOCK_USER.wallet,
    toWallet: 'H2x8Iq5mockVendorWalletGGG7777777777777777777', reference: 'Bean supplier payout',
    toNickname: 'Green Highlands', mint: MINTS.USDC, symbol: 'USDC', decimals: 6, amount: '640.00',
    rawAmount: '640000000', signature: sig(2), status: 'confirmed', errorMessage: null,
    createdAt: iso(-4 * DAY), confirmedAt: iso(-4 * DAY + 3800),
  },
  {
    id: 'txf_5003', merchantId: MOCK_MERCHANT_PROFILE.id!, fromWallet: 'C7s3Dl0mockPayerWalletBBB2222222222222222222',
    toWallet: MOCK_USER.wallet, reference: 'POS sale — counter', toNickname: 'Alexander Wright', mint: MINTS.SOL, symbol: 'SOL',
    decimals: 9, amount: '0.75', rawAmount: '750000000', signature: sig(3), status: 'confirmed',
    errorMessage: null, createdAt: iso(-2 * DAY), confirmedAt: iso(-2 * DAY + 2200),
  },
  {
    id: 'txf_5004', merchantId: MOCK_MERCHANT_PROFILE.id!, fromWallet: MOCK_USER.wallet,
    toWallet: 'J4z0Ks7mockPayrollWalletHHH8888888888888888888', reference: 'Staff payroll',
    toNickname: 'Payroll Account', mint: MINTS.USDC, symbol: 'USDC', decimals: 6, amount: '1200.00',
    rawAmount: '1200000000', signature: null, status: 'pending', errorMessage: null,
    createdAt: iso(-6 * HOUR), confirmedAt: null,
  },
  {
    id: 'txf_5005', merchantId: MOCK_MERCHANT_PROFILE.id!, fromWallet: MOCK_USER.wallet,
    toWallet: 'K5a1Lt8mockRefundWalletIII9999999999999999999', reference: 'Refund — order #4471',
    toNickname: null, mint: MINTS.USDC, symbol: 'USDC', decimals: 6, amount: '18.00',
    rawAmount: '18000000', signature: null, status: 'failed', errorMessage: 'Insufficient SOL for network fee',
    createdAt: iso(-30 * HOUR), confirmedAt: null,
  },
  {
    id: 'txf_5006', merchantId: MOCK_MERCHANT_PROFILE.id!, fromWallet: 'D8t4Em1mockPayerWalletCCC3333333333333333333',
    toWallet: MOCK_USER.wallet, reference: 'Tip jar', toNickname: 'Carlos Rodriguez', mint: MINTS.USDC, symbol: 'USDC',
    decimals: 6, amount: '5.00', rawAmount: '5000000', signature: sig(6), status: 'confirmed',
    errorMessage: null, createdAt: iso(-8 * DAY), confirmedAt: iso(-8 * DAY + 1900),
  },
];

/* ─────────────────────────── Contacts ─────────────────────────────── */

export const MOCK_CONTACTS: Contact[] = [
  {
    id: 'ctc_01', merchantId: MOCK_MERCHANT_PROFILE.id!, nickname: 'Sophia Martinez',
    walletAddress: 'B6r2Ck9mockPayerWalletAAA1111111111111111111', telephone: '+1 555 0192',
    email: 'sophia.martinez@techsol.io', mint: MINTS.USDC, symbol: 'USDC', notes: 'Lead Integration Partner & Developer',
    isFavorite: true, createdAt: iso(-50 * DAY), updatedAt: iso(-4 * DAY),
  },
  {
    id: 'ctc_02', merchantId: MOCK_MERCHANT_PROFILE.id!, nickname: 'Alexander Wright',
    walletAddress: 'C7s3Dl0mockPayerWalletBBB2222222222222222222', telephone: '+1 555 0148',
    email: 'alex.wright@solanaventures.org', mint: MINTS.USDC, symbol: 'USDC', notes: 'Ecosystem Partner & Strategy Advisor',
    isFavorite: true, createdAt: iso(-48 * DAY), updatedAt: iso(-2 * DAY),
  },
  {
    id: 'ctc_03', merchantId: MOCK_MERCHANT_PROFILE.id!, nickname: 'Carlos Rodriguez',
    walletAddress: 'D8t4Em1mockPayerWalletCCC3333333333333333333', telephone: '+1 555 0177',
    email: 'carlos.rodriguez@latampay.com', mint: MINTS.STR, symbol: 'STR', notes: 'Regional Merchant Operations Client',
    isFavorite: false, createdAt: iso(-22 * DAY), updatedAt: iso(-6 * DAY),
  },
  {
    id: 'ctc_04', merchantId: MOCK_MERCHANT_PROFILE.id!, nickname: 'Elena Vance',
    walletAddress: 'E9u5Fn2mockPayerWalletDDD4444444444444444444', telephone: '+1 555 0134',
    email: 'elena.vance@solanapay.io', mint: MINTS.USDC, symbol: 'USDC', notes: 'Commercial Vendor & POS Client',
    isFavorite: true, createdAt: iso(-15 * DAY), updatedAt: iso(-1 * DAY),
  },
];

/* ─────────────────────────── Members ─────────────────────────────── */
/**
 * Multisig members mapped to the SRS role matrix (Squads v4 reference):
 *   admin    — añade/remueve miembros y modifica el umbral
 *   signer   — vota propuestas; cuenta para el umbral M-de-N
 *   proposer — puede iniciar propuestas de transacción
 *   auditor  — solo lectura (balances, bóvedas, historial), sin claves de firma
 */

export const MOCK_MEMBERS = [
  {
    id: 'mem_01',
    merchantId: MOCK_MERCHANT_PROFILE.id!,
    name: 'Julio Romero',
    walletAddress: 'HSVNd7Qm4rP2xKb9Tf3wYcJ8sLzA1eR6tYuVe4XoPqN',
    roles: { admin: true, signer: true, proposer: true, auditor: false },
    isCurrentUser: true,
    createdAt: iso(-60 * DAY),
    updatedAt: iso(-2 * DAY),
  },
  {
    id: 'mem_02',
    merchantId: MOCK_MERCHANT_PROFILE.id!,
    name: 'Mariana Solís',
    walletAddress: 'B42ExkQ9mLp7yTn3wZcVb8sHy2aR6tYuIoP1dGfS47x',
    roles: { admin: false, signer: true, proposer: true, auditor: false },
    isCurrentUser: false,
    createdAt: iso(-50 * DAY),
    updatedAt: iso(-2 * DAY),
  },
  {
    id: 'mem_03',
    merchantId: MOCK_MERCHANT_PROFILE.id!,
    name: 'Diego Fuentes',
    walletAddress: '7jTgWm2Kq9Lp4xNb8yZcVdHy3sA1eR6tYuIoP5MrNt',
    roles: { admin: true, signer: true, proposer: true, auditor: false },
    isCurrentUser: false,
    createdAt: iso(-40 * DAY),
    updatedAt: iso(-2 * DAY),
  },
  {
    id: 'mem_04',
    merchantId: MOCK_MERCHANT_PROFILE.id!,
    name: 'Contabilidad · Auditoría',
    walletAddress: '2B7bYk9Qm3Lp8xNc4yZwVdHy1sA6eR2tYuIoPfVXfg',
    roles: { admin: false, signer: false, proposer: false, auditor: true },
    isCurrentUser: false,
    createdAt: iso(-30 * DAY),
    updatedAt: iso(-2 * DAY),
  },
  {
    id: 'mem_05',
    merchantId: MOCK_MERCHANT_PROFILE.id!,
    name: 'Tesorería · Bot de nómina',
    walletAddress: 'AGBMxk2Qp9Lm7yTn4wZcVb8sHy3aR1eR6tYuIoPpJ8f',
    roles: { admin: false, signer: false, proposer: true, auditor: false },
    isCurrentUser: false,
    createdAt: iso(-20 * DAY),
    updatedAt: iso(-2 * DAY),
  },
];

/* ──────────────── Multisig treasury (Squads v4-style) ─────────────── */
/**
 * The enterprise wrapper over a Squads v4 program account. `transactionIndex`
 * is the on-chain proposal counter; the next proposal takes index + 1.
 */
export const MOCK_MULTISIG = {
  address: 'Mu1tiSigJ4kPq2Nf7Xr9wDcVbHy3sZ8aQ1eR6tYuIoP',
  threshold: 2,
  timeLock: 0,
  transactionIndex: 7,
  createKey: 'CrTeKy8mLp3xNb7yZcVdHy2sA1eR6tYuIoP4wQ9nMz',
  createdAt: iso(-60 * DAY),
  updatedAt: iso(-2 * DAY),
};

/* Sub-vaults — Vault PDAs derived from the multisig, one per business purpose. */
export const MOCK_VAULTS = [
  {
    id: 'vault_0',
    index: 0,
    label: 'GENESYS',
    address: 'HQ8ejRe7mLp2xNb9yZcVdHy3sA1eR6tYuIoP4wQ9ejRe',
    description: 'Main Genesis account',
    isDefault: true,
    usdValue: 45250.00,
    weight: 50,
    solBalance: '268.6700',
    tokens: [
      { mint: MINTS.SOL, symbol: 'SOL', uiAmount: '268.67' },
      { mint: MINTS.USDC, symbol: 'USDC', uiAmount: '20000.00' },
    ],
    createdAt: iso(-60 * DAY),
  },
  {
    id: 'vault_1',
    index: 1,
    label: '10 % Fundation Vault',
    address: 'FR6m9mLp3xNb7yZcVdHy2sA1eR6tYuIoP4wQ9h5JG',
    description: 'Foundation reserve allocation',
    isDefault: false,
    usdValue: 18100.00,
    weight: 20,
    solBalance: '107.4700',
    tokens: [
      { mint: MINTS.USDC, symbol: 'USDC', uiAmount: '18100.00' },
    ],
    createdAt: iso(-52 * DAY),
  },
  {
    id: 'vault_2',
    index: 2,
    label: '20 % Main Holding (Vesting)',
    address: 'BQEP7mLp3xNb7yZcVdHy2sA1eR6tYuIoP4wQ9JCqc',
    description: 'Vesting main holding vault',
    isDefault: false,
    usdValue: 13575.00,
    weight: 15,
    solBalance: '80.6000',
    tokens: [
      { mint: MINTS.STR, symbol: 'STR', uiAmount: '185700.00' },
    ],
    createdAt: iso(-40 * DAY),
  },
  {
    id: 'vault_3',
    index: 3,
    label: '5 % Main Holding (Líquido)',
    address: 'CziG9mLp3xNb7yZcVdHy2sA1eR6tYuIoP4wQ9ZCVs',
    description: 'Liquid main holdings',
    isDefault: false,
    usdValue: 9050.00,
    weight: 10,
    solBalance: '53.7300',
    tokens: [
      { mint: MINTS.USDC, symbol: 'USDC', uiAmount: '9050.00' },
    ],
    createdAt: iso(-30 * DAY),
  },
  {
    id: 'vault_4',
    index: 4,
    label: '10 % Operations Fund',
    address: 'HoYv7mLp3xNb7yZcVdHy2sA1eR6tYuIoP4wQ9DHYf',
    description: 'Operational expenses fund',
    isDefault: false,
    usdValue: 4525.00,
    weight: 5,
    solBalance: '26.8600',
    tokens: [
      { mint: MINTS.USDC, symbol: 'USDC', uiAmount: '4525.00' },
    ],
    createdAt: iso(-20 * DAY),
  },
];


/* ─────────────── Multisig proposals (transaction lifecycle) ───────── */
/**
 * Proposal statuses mirror the Squads flow:
 *   draft     — creada, aún sin abrir a votación
 *   active    — abierta; los firmantes votan (approvals / rejections)
 *   approved  — alcanzó el umbral; lista para ejecutarse
 *   executed  — ejecutada on-chain (tiene `executedSig`)
 *   rejected  — rechazada por mayoría
 *   cancelled — retirada por quien la creó o un admin
 * `approvals` / `rejections` guardan ids de miembro.
 */
export const MOCK_PROPOSALS = [
  {
    id: 'prop_1007',
    index: 7,
    type: 'transfer' as const,
    title: 'Vendor Payout — Green Highlands',
    vaultId: 'vault_1',
    vaultLabel: 'Operating Vault',
    amount: '640.00',
    mint: MINTS.USDC,
    symbol: 'USDC',
    destination: 'H2x8Iq5mockVendorWalletGGG7777777777777777777',
    destinationLabel: 'Green Highlands',
    memo: 'Coffee invoice — net 15',
    status: 'active' as const,
    threshold: 2,
    approvals: ['mem_02'],
    rejections: [],
    createdBy: 'mem_05',
    createdByName: 'Treasury · Payroll Bot',
    createdAt: iso(-6 * HOUR),
    updatedAt: iso(-2 * HOUR),
    executedAt: null as string | null,
    executedSig: null as string | null,
  },
  {
    id: 'prop_1006',
    index: 6,
    type: 'transfer' as const,
    title: 'Bi-weekly Team Payroll',
    vaultId: 'vault_1',
    vaultLabel: 'Operating Vault',
    amount: '1200.00',
    mint: MINTS.USDC,
    symbol: 'USDC',
    destination: 'J4z0Ks7mockPayrollWalletHHH8888888888888888888',
    destinationLabel: 'Payroll',
    memo: 'Cycle 2026-09 · 1st half',
    status: 'approved' as const,
    threshold: 2,
    approvals: ['mem_01', 'mem_03'],
    rejections: [],
    createdBy: 'mem_05',
    createdByName: 'Treasury · Payroll Bot',
    createdAt: iso(-30 * HOUR),
    updatedAt: iso(-20 * HOUR),
    executedAt: null,
    executedSig: null,
  },
  {
    id: 'prop_1005',
    index: 5,
    type: 'swap' as const,
    title: 'Swap 5 SOL → USDC (Reserves)',
    vaultId: 'vault_2',
    vaultLabel: 'Token Reserves Vault',
    amount: '5.00',
    mint: MINTS.SOL,
    symbol: 'SOL',
    destination: '',
    destinationLabel: 'Jupiter · Mock Route',
    memo: 'Reserves rebalance',
    status: 'draft' as const,
    threshold: 2,
    approvals: [],
    rejections: [],
    createdBy: 'mem_01',
    createdByName: 'Julio Romero',
    createdAt: iso(-2 * HOUR),
    updatedAt: iso(-2 * HOUR),
    executedAt: null,
    executedSig: null,
  },
  {
    id: 'prop_1004',
    index: 4,
    type: 'transfer' as const,
    title: 'Customer Refund — Order #4471',
    vaultId: 'vault_0',
    vaultLabel: 'POS Collections Vault',
    amount: '18.00',
    mint: MINTS.USDC,
    symbol: 'USDC',
    destination: 'K5a1Lt8mockRefundWalletIII9999999999999999999',
    destinationLabel: '',
    memo: 'Order cancelled by customer',
    status: 'executed' as const,
    threshold: 2,
    approvals: ['mem_01', 'mem_02'],
    rejections: [],
    createdBy: 'mem_02',
    createdByName: 'Mariana Solís',
    createdAt: iso(-4 * DAY),
    updatedAt: iso(-4 * DAY + 3 * HOUR),
    executedAt: iso(-4 * DAY + 3 * HOUR),
    executedSig: sig(4),
  },
  {
    id: 'prop_1003',
    index: 3,
    type: 'config' as const,
    title: 'Subir el umbral de firmas a 3 de 3',
    vaultId: '',
    vaultLabel: 'Configuración del multisig',
    amount: '',
    mint: '',
    symbol: '',
    destination: '',
    destinationLabel: '',
    memo: 'Propuesta de endurecer la política de firmas',
    status: 'rejected' as const,
    threshold: 2,
    approvals: ['mem_03'],
    rejections: ['mem_01', 'mem_02'],
    createdBy: 'mem_03',
    createdByName: 'Diego Fuentes',
    createdAt: iso(-9 * DAY),
    updatedAt: iso(-8 * DAY),
    executedAt: null,
    executedSig: null,
  },
];

/* ─────────────────────── Overview counters ────────────────────────── */

export const MOCK_OVERVIEW_STATS = {
  paymentLinks: MOCK_PAYMENT_LINKS.length,
  posDevices: MOCK_POS_DEVICES.length,
  apiStatus: 'operational' as const,
};

/* ─────────────────────────── Swap quote ───────────────────────────── */

/** Builds a Jupiter-style quote from the simulated price table. */
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
          ammKey: 'MockAmm1111111111111111111111111111111111111',
          label: 'Sterling Mock LP',
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

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
} from '@luxor/contracts';
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
    id: 'tok-lxr', environment: 'mock', mint: MINTS.LXR, symbol: 'LXR', name: 'Luxor Token',
    decimals: 9, logoUrl: null, active: true, createdAt: iso(-90 * DAY), updatedAt: iso(-DAY),
  },
];

/** Simulated USD spot prices used by the Swap screen and price hooks. */
export const MOCK_PRICES_USD: Record<string, number> = {
  [MINTS.SOL]: 168.42,
  [MINTS.USDC]: 1,
  [MINTS.USDT]: 1,
  [MINTS.LXR]: 0.0731,
  SOL: 168.42,
  USDC: 1,
  USDT: 1,
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
  solBalance: '12.4185',
  lamports: '12418500000',
  fetchedAt: iso(0),
  tokens: [
    {
      mint: MINTS.USDC, symbol: 'USDC', uiAmount: '4820.55', rawAmount: '4820550000',
      decimals: 6, tokenAccount: 'GwZ9mockUSDCataMockAcct1111111111111111111',
    },
    {
      mint: MINTS.USDT, symbol: 'USDT', uiAmount: '1500.00', rawAmount: '1500000000',
      decimals: 6, tokenAccount: 'GwZ9mockUSDTataMockAcct2222222222222222222',
    },
    {
      mint: MINTS.LXR, symbol: 'LXR', uiAmount: '250000.0', rawAmount: '250000000000000',
      decimals: 9, tokenAccount: 'GwZ9mockLXRataMockAcct33333333333333333333',
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
    id: 'pos_01', merchantId: MOCK_MERCHANT_PROFILE.id!, name: 'Front counter — iPad',
    posId: 'LUX-POS-0001', active: true, createdAt: iso(-45 * DAY), lastSeenAt: iso(-2 * HOUR),
  },
  {
    id: 'pos_02', merchantId: MOCK_MERCHANT_PROFILE.id!, name: 'Mobile terminal — kiosk',
    posId: 'LUX-POS-0002', active: true, createdAt: iso(-40 * DAY), lastSeenAt: iso(-1 * DAY),
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
    targetNotification: 'alice@example.com', reference: 'Invoice #1024', numericalReference: 1024,
    status: 'PAID', createdAt: iso(-6 * DAY), updatedAt: iso(-5 * DAY), lastNotificationDate: iso(-6 * DAY),
  },
  {
    ...baseRequest, id: 'preq_1002', amount: '45.50', payerWallet: 'C7s3Dl0mockPayerWalletBBB2222222222222222222',
    targetNotification: 'bob@example.com', reference: 'Catering deposit', numericalReference: 1025,
    status: 'PENDING', createdAt: iso(-2 * DAY), updatedAt: iso(-2 * DAY),
    expirationDate: iso(5 * DAY), lastNotificationDate: iso(-1 * DAY),
  },
  {
    ...baseRequest, id: 'preq_1003', amount: '9.99', payerWallet: 'D8t4Em1mockPayerWalletCCC3333333333333333333',
    targetNotification: 'carol@example.com', reference: 'Workshop seat', numericalReference: 1026,
    status: 'PENDING', createdAt: iso(-12 * HOUR), updatedAt: iso(-12 * HOUR), expirationDate: iso(2 * DAY),
  },
  {
    ...baseRequest, id: 'preq_1004', amount: '300.00', payerWallet: 'E9u5Fn2mockPayerWalletDDD4444444444444444444',
    targetNotification: 'dave@example.com', reference: 'Equipment rental', numericalReference: 1027,
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
    toWallet: MOCK_USER.wallet, reference: 'Invoice #1024', toNickname: null, mint: MINTS.USDC, symbol: 'USDC',
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
    toWallet: MOCK_USER.wallet, reference: 'POS sale — counter', toNickname: null, mint: MINTS.SOL, symbol: 'SOL',
    decimals: 9, amount: '0.75', rawAmount: '750000000', signature: sig(3), status: 'confirmed',
    errorMessage: null, createdAt: iso(-2 * DAY), confirmedAt: iso(-2 * DAY + 2200),
  },
  {
    id: 'txf_5004', merchantId: MOCK_MERCHANT_PROFILE.id!, fromWallet: MOCK_USER.wallet,
    toWallet: 'J4z0Ks7mockPayrollWalletHHH8888888888888888888', reference: 'Staff payroll',
    toNickname: 'Payroll', mint: MINTS.USDC, symbol: 'USDC', decimals: 6, amount: '1200.00',
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
    id: 'txf_5006', merchantId: MOCK_MERCHANT_PROFILE.id!, fromWallet: 'L6b2Mu9mockCustomerWalletJJJ0000000000000000000',
    toWallet: MOCK_USER.wallet, reference: 'Tip jar', toNickname: null, mint: MINTS.USDC, symbol: 'USDC',
    decimals: 6, amount: '5.00', rawAmount: '5000000', signature: sig(6), status: 'confirmed',
    errorMessage: null, createdAt: iso(-8 * DAY), confirmedAt: iso(-8 * DAY + 1900),
  },
];

/* ─────────────────────────── Contacts ─────────────────────────────── */

export const MOCK_CONTACTS: Contact[] = [
  {
    id: 'ctc_01', merchantId: MOCK_MERCHANT_PROFILE.id!, nickname: 'Green Highlands',
    walletAddress: 'H2x8Iq5mockVendorWalletGGG7777777777777777777', telephone: '+1 555 0100',
    email: 'ap@greenhighlands.coffee', mint: MINTS.USDC, symbol: 'USDC', notes: 'Bean supplier — net 15',
    isFavorite: true, createdAt: iso(-50 * DAY), updatedAt: iso(-4 * DAY),
  },
  {
    id: 'ctc_02', merchantId: MOCK_MERCHANT_PROFILE.id!, nickname: 'Payroll',
    walletAddress: 'J4z0Ks7mockPayrollWalletHHH8888888888888888888', telephone: '',
    email: 'payroll@democoffee.co', mint: MINTS.USDC, symbol: 'USDC', notes: 'Bi-weekly run',
    isFavorite: true, createdAt: iso(-48 * DAY), updatedAt: iso(-2 * DAY),
  },
  {
    id: 'ctc_03', merchantId: MOCK_MERCHANT_PROFILE.id!, nickname: 'Alice (wholesale)',
    walletAddress: 'B6r2Ck9mockPayerWalletAAA1111111111111111111', telephone: '+1 555 0142',
    email: 'alice@example.com', mint: MINTS.SOL, symbol: 'SOL', notes: '',
    isFavorite: false, createdAt: iso(-22 * DAY), updatedAt: iso(-6 * DAY),
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
    label: 'Bóveda POS Cobros',
    address: 'PoS1CobRosVau1tXbT7yqLpN2mKdRf8sWzA3eH9jUvBc',
    description: 'Entradas de pagos de clientes (POS y payment links).',
    isDefault: true,
    usdValue: 13_128.4,
    solBalance: '9.2000',
    tokens: [
      { mint: MINTS.USDC, symbol: 'USDC', uiAmount: '11578.00' },
      { mint: MINTS.USDT, symbol: 'USDT', uiAmount: '0.00' },
    ],
    createdAt: iso(-60 * DAY),
  },
  {
    id: 'vault_1',
    index: 1,
    label: 'Bóveda Operativa',
    address: 'OpeRaTiVaVau1t9kMzXbT3yqLpN7mKdRf2sWzA8eH1jU',
    description: 'Pagos de nómina y proveedores.',
    isDefault: false,
    usdValue: 4_040.55,
    solBalance: '3.2185',
    tokens: [
      { mint: MINTS.USDC, symbol: 'USDC', uiAmount: '2500.00' },
      { mint: MINTS.USDT, symbol: 'USDT', uiAmount: '1500.00' },
    ],
    createdAt: iso(-52 * DAY),
  },
  {
    id: 'vault_2',
    index: 2,
    label: 'Bóveda Token Reserves',
    address: 'ReSeRvEsVau1tK7mLp2xNb9yZcVdHy3sA1eR6tYuIoP',
    description: 'Liquidez del token LXR y reservas de tesorería.',
    isDefault: false,
    usdValue: 18_275.0,
    solBalance: '0.0000',
    tokens: [{ mint: MINTS.LXR, symbol: 'LXR', uiAmount: '250000.0' }],
    createdAt: iso(-40 * DAY),
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
    title: 'Pago a proveedor — Green Highlands',
    vaultId: 'vault_1',
    vaultLabel: 'Bóveda Operativa',
    amount: '640.00',
    mint: MINTS.USDC,
    symbol: 'USDC',
    destination: 'H2x8Iq5mockVendorWalletGGG7777777777777777777',
    destinationLabel: 'Green Highlands',
    memo: 'Factura de café — net 15',
    status: 'active' as const,
    threshold: 2,
    approvals: ['mem_02'],
    rejections: [],
    createdBy: 'mem_05',
    createdByName: 'Tesorería · Bot de nómina',
    createdAt: iso(-6 * HOUR),
    updatedAt: iso(-2 * HOUR),
    executedAt: null as string | null,
    executedSig: null as string | null,
  },
  {
    id: 'prop_1006',
    index: 6,
    type: 'transfer' as const,
    title: 'Nómina quincenal del equipo',
    vaultId: 'vault_1',
    vaultLabel: 'Bóveda Operativa',
    amount: '1200.00',
    mint: MINTS.USDC,
    symbol: 'USDC',
    destination: 'J4z0Ks7mockPayrollWalletHHH8888888888888888888',
    destinationLabel: 'Payroll',
    memo: 'Ciclo 2026-09 · primera quincena',
    status: 'approved' as const,
    threshold: 2,
    approvals: ['mem_01', 'mem_03'],
    rejections: [],
    createdBy: 'mem_05',
    createdByName: 'Tesorería · Bot de nómina',
    createdAt: iso(-30 * HOUR),
    updatedAt: iso(-20 * HOUR),
    executedAt: null,
    executedSig: null,
  },
  {
    id: 'prop_1005',
    index: 5,
    type: 'swap' as const,
    title: 'Convertir 5 SOL → USDC (reservas)',
    vaultId: 'vault_2',
    vaultLabel: 'Bóveda Token Reserves',
    amount: '5.00',
    mint: MINTS.SOL,
    symbol: 'SOL',
    destination: '',
    destinationLabel: 'Jupiter · ruta mock',
    memo: 'Rebalanceo de reservas',
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
    title: 'Reembolso a cliente — pedido #4471',
    vaultId: 'vault_0',
    vaultLabel: 'Bóveda POS Cobros',
    amount: '18.00',
    mint: MINTS.USDC,
    symbol: 'USDC',
    destination: 'K5a1Lt8mockRefundWalletIII9999999999999999999',
    destinationLabel: '',
    memo: 'Pedido cancelado por el cliente',
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
          label: 'Luxor Mock LP',
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

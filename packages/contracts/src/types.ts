// GENERATED from luxor-payment-service/src/shared/types — run `npm run sync:contracts`, do not edit.
/** Token symbol from the token registry (e.g. 'SOL', 'USDC', 'STR'). */
export type Currency = string;

/** Currencies a Solana Pay payment order can be created in. */
export type SolanaPayCurrency = 'SOL' | 'USDC';

export interface MerchantProfile {
  id?: string;
  email: string;
  businessName?: string;
  merchantWallet?: string;
  kyc?: boolean;
  kycStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentLink {
  id: string;
  merchantId: string;
  name: string;
  businessName: string;
  amount: number;
  currency: Currency;
  merchantWallet: string;
  active: boolean;
  createdAt: string;
}

export interface ApiKeyRecord {
  id: string;
  merchantId: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface PosDevice {
  id: string;
  merchantId: string;
  name: string;
  posId: string;
  active: boolean;
  createdAt: string;
  lastSeenAt?: string;
}

export type PaymentStatus = 'pending' | 'confirmed' | 'expired' | 'failed';

export interface PaymentOrder {
  reference: string;
  merchantId: string;
  amount: number;
  currency: Currency;
  recipient: string;
  status: PaymentStatus;
  label?: string;
  message?: string;
  linkId?: string;
  signature?: string;
  solanaPayUrl?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
}

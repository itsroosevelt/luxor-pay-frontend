export type Currency = 'SOL' | 'USDC';

export interface MerchantProfile {
  email: string;
  businessName?: string;
  merchantWallet?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentLink {
  id: string;
  merchantId: string;
  name: string;
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

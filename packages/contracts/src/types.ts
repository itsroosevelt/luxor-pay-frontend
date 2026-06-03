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
  collectEmail?: boolean;
  successMessage?: string;
  redirectUrl?: string;
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

export type CustomerType = 'guest' | 'registered';

export interface Customer {
  id: string;
  merchantId: string;
  name: string;
  email?: string;
  walletAddress?: string;
  preferredToken?: Currency;
  countryCode?: string;
  type: CustomerType;
  createdAt: string;
  lastPaymentAt?: string;
  paymentCount?: number;
}

export interface ProductCatalogItem {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  price: number;
  currency: Currency;
  active: boolean;
  createdAt: string;
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

export interface WebhookEndpoint {
  id: string;
  merchantId: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

export type BillingSubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export interface BillingSubscription {
  id: string;
  customerId: string;
  customerName?: string;
  amount: number;
  currency: Currency;
  interval: 'month' | 'year';
  status: BillingSubscriptionStatus;
  walletAddress?: string;
  createdAt: string;
}

export type BillingInvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

export interface BillingInvoice {
  id: string;
  customerId: string;
  amount: number;
  currency: Currency;
  status: BillingInvoiceStatus;
  dueDate?: string;
  paidAt?: string;
  onChainSignature?: string;
  createdAt: string;
}

export interface DisputeRecord {
  id: string;
  paymentReference: string;
  amount: number;
  currency: Currency;
  status: 'needs_response' | 'under_review' | 'won' | 'lost';
  reason?: string;
  createdAt: string;
}

export interface RadarRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  action: 'block' | 'review' | 'allow';
}

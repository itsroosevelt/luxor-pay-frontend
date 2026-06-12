import type { Currency, Customer, PaymentLink, ProductCatalogItem } from '@luxor/contracts';
import { getIdToken } from '@/lib/auth-client';
import { isFrontendOnly } from '@/lib/frontend-only';
import {
  buildLocalMerchantProfile,
  loadLocalMerchantProfile,
  saveLocalMerchantProfile,
} from '@/lib/merchant-local';
import {
  ensureMerchantProfile as ensureMerchantApi,
  getMerchantProfile as getMerchantApi,
  updateMerchantProfile as updateMerchantApi,
  type UpdateMerchantDto,
} from '@/lib/merchants-api';
import {
  createPaymentLink as createPaymentLinkApi,
  fetchPaymentLinkById,
  listPaymentLinks as listPaymentLinksApi,
} from '@/lib/payments-api';

export type PaymentLinkInput = {
  name: string;
  amount: number;
  currency: Currency;
  active?: boolean;
  collectEmail?: boolean;
  successMessage?: string;
  redirectUrl?: string;
};

async function requireToken(): Promise<string> {
  const token = await getIdToken();
  if (!token) throw new Error('Not authenticated');
  return token;
}

const NOT_AVAILABLE = 'This feature is not available on the Solana backend yet.';

export async function ensureMerchantProfile(merchantId: string, email: string) {
  if (isFrontendOnly()) {
    const profile =
      loadLocalMerchantProfile(merchantId) ?? buildLocalMerchantProfile(email, merchantId);
    saveLocalMerchantProfile(merchantId, profile);
    return profile;
  }
  const token = await requireToken();
  const outcome = await ensureMerchantApi(token, email, { merchantId });
  return outcome.profile;
}

export async function getMerchantProfile(merchantId: string) {
  if (isFrontendOnly()) {
    return loadLocalMerchantProfile(merchantId);
  }
  const token = await requireToken();
  const profile = await getMerchantApi(token);
  if (profile) {
    saveLocalMerchantProfile(merchantId, profile);
    return profile;
  }
  return loadLocalMerchantProfile(merchantId);
}

export async function updateMerchantProfile(merchantId: string, data: UpdateMerchantDto) {
  const token = await requireToken();
  return updateMerchantApi(token, data, { merchantId });
}

export async function listPaymentLinks(_merchantId: string) {
  const token = await requireToken();
  return listPaymentLinksApi(token);
}

export async function createPaymentLink(_merchantId: string, input: PaymentLinkInput) {
  const token = await requireToken();
  return createPaymentLinkApi(token, {
    name: input.name,
    amount: input.amount,
    currency: input.currency,
  });
}

export async function updatePaymentLink(
  _merchantId: string,
  _linkId: string,
  _input: Partial<PaymentLinkInput>
): Promise<PaymentLink> {
  throw new Error('Payment link updates are not supported by the API yet.');
}

export async function getPaymentLinkById(linkId: string) {
  const token = await getIdToken();
  return fetchPaymentLinkById(linkId, token ?? undefined);
}

export async function getPaymentLink(_merchantId: string, linkId: string) {
  const token = await requireToken();
  return fetchPaymentLinkById(linkId, token);
}

export async function listProducts(_merchantId: string): Promise<ProductCatalogItem[]> {
  return [];
}

export async function createProduct(
  _merchantId: string,
  _input: {
    name: string;
    description?: string;
    price: number;
    currency: Currency;
    active?: boolean;
  }
): Promise<ProductCatalogItem> {
  throw new Error(NOT_AVAILABLE);
}

export async function getProduct(
  _merchantId: string,
  _productId: string
): Promise<ProductCatalogItem | null> {
  return null;
}

export async function updateProduct(
  _merchantId: string,
  _productId: string,
  _data: Partial<ProductCatalogItem>
): Promise<ProductCatalogItem> {
  throw new Error(NOT_AVAILABLE);
}

export async function listCustomers(_merchantId: string): Promise<Customer[]> {
  return [];
}

export async function createCustomer(
  _merchantId: string,
  _input: {
    name: string;
    email?: string;
    walletAddress?: string;
    preferredToken?: Currency;
    countryCode?: string;
    type?: Customer['type'];
  }
): Promise<Customer> {
  throw new Error(NOT_AVAILABLE);
}

export async function getCustomer(
  _merchantId: string,
  _customerId: string
): Promise<Customer | null> {
  return null;
}

export async function updateCustomer(
  _merchantId: string,
  _customerId: string,
  _data: Partial<Customer>
): Promise<Customer> {
  throw new Error(NOT_AVAILABLE);
}

export async function listPosDevices(_merchantId: string) {
  throw new Error('Use payments-api listPosDevices instead.');
}

export async function createPosDevice(_merchantId: string, _input: { name: string; posId: string }) {
  throw new Error('Use payments-api createPosDevice instead.');
}

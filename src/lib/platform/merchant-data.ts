import type { Currency, Customer, MerchantProfile, PaymentLink, ProductCatalogItem } from '@luxor/contracts';
import { getIdToken } from '@/lib/auth-client';
import { isFrontendOnly } from '@/lib/frontend-only';
import { dispatchMerchantProfileUpdated } from '@/lib/merchant-profile-events';
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
import {
  createLocalPaymentLink,
  duplicateLocalPaymentLink,
  findLocalPaymentLinkById,
  findLocalPaymentLinkBySlug,
  listLocalPaymentLinks,
  updateLocalPaymentLink,
} from '@/lib/payment-links-local';
import {
  createLocalProduct,
  findLocalProductById,
  listLocalProducts,
  updateLocalProduct,
} from '@/lib/products-local';
import {
  createLocalCustomer,
  getLocalCustomer,
  listLocalCustomers,
  updateLocalCustomer,
} from '@/lib/customers-local';
import { listCheckoutPaymentRecords } from '@/lib/checkout-payments-local';

function mapPaymentLinkError(error: unknown): Error {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('merchant wallet') || msg.includes('configure merchant')) {
      return new Error('MERCHANT_WALLET_REQUIRED');
    }
    return error;
  }
  return new Error('Payment link request failed');
}

export type PaymentLinkInput = {
  name: string;
  amount: number;
  currency: Currency;
  active?: boolean;
  collectEmail?: boolean;
  collectName?: boolean;
  collectCompany?: boolean;
  collectAddress?: boolean;
  collectPhone?: boolean;
  collectTaxes?: boolean;
  taxCode?: string;
  taxIncluded?: boolean;
  taxRate?: number;
  quantity?: number;
  allowQuantityAdjustment?: boolean;
  limitPayments?: boolean;
  successMessage?: string;
  redirectUrl?: string;
};

async function requireToken(): Promise<string> {
  const token = await getIdToken();
  if (!token) throw new Error('Not authenticated');
  return token;
}

/** Keep a locally saved wallet when the API profile omits or clears it. */
function mergeMerchantProfile(
  remote: MerchantProfile,
  local: MerchantProfile | null
): MerchantProfile {
  if (!local) return remote;
  const remoteWallet = remote.merchantWallet?.trim() ?? '';
  const localWallet = local.merchantWallet?.trim() ?? '';
  if (!remoteWallet && localWallet) {
    return { ...remote, merchantWallet: localWallet };
  }
  return remote;
}

const NOT_AVAILABLE = 'This feature is not available on the Solana backend yet.';

export async function ensureMerchantProfile(merchantId: string, email: string) {
  if (isFrontendOnly()) {
    const profile =
      loadLocalMerchantProfile(merchantId) ?? buildLocalMerchantProfile(email, merchantId);
    saveLocalMerchantProfile(merchantId, profile);
    return profile;
  }

  const local = loadLocalMerchantProfile(merchantId);
  try {
    const token = await requireToken();
    const outcome = await ensureMerchantApi(token, email, { merchantId });
    const merged = mergeMerchantProfile(outcome.profile, local);
    saveLocalMerchantProfile(merchantId, merged);
    return merged;
  } catch {
    return local ?? buildLocalMerchantProfile(email, merchantId);
  }
}

export async function getMerchantProfile(merchantId: string) {
  const local = loadLocalMerchantProfile(merchantId);

  if (isFrontendOnly()) {
    return local;
  }

  try {
    const token = await requireToken();
    const profile = await getMerchantApi(token);
    if (profile) {
      const merged = mergeMerchantProfile(profile, local);
      saveLocalMerchantProfile(merchantId, merged);
      return merged;
    }
  } catch {
    // Token or network not ready — fall back to the last saved local profile.
  }

  return local;
}

export async function updateMerchantProfile(merchantId: string, data: UpdateMerchantDto) {
  let profile: Awaited<ReturnType<typeof updateMerchantApi>>;
  if (isFrontendOnly()) {
    profile = await updateMerchantApi('', data, { merchantId });
  } else {
    const token = await requireToken();
    profile = await updateMerchantApi(token, data, { merchantId });
  }
  dispatchMerchantProfileUpdated();
  return profile;
}

export async function listPaymentLinks(merchantId: string) {
  if (isFrontendOnly()) {
    return listLocalPaymentLinks(merchantId);
  }
  const token = await requireToken();
  return listPaymentLinksApi(token);
}

export async function createPaymentLink(merchantId: string, input: PaymentLinkInput) {
  if (isFrontendOnly()) {
    return createLocalPaymentLink(merchantId, input);
  }
  const token = await requireToken();
  try {
    return await createPaymentLinkApi(token, {
      name: input.name,
      amount: input.amount,
      currency: input.currency,
    });
  } catch (error) {
    throw mapPaymentLinkError(error);
  }
}

export async function updatePaymentLink(
  merchantId: string,
  linkId: string,
  input: Partial<PaymentLinkInput>
): Promise<PaymentLink> {
  if (isFrontendOnly()) {
    return updateLocalPaymentLink(merchantId, linkId, input);
  }
  throw new Error('Payment link updates are not supported by the API yet.');
}

export async function duplicatePaymentLink(
  merchantId: string,
  linkId: string
): Promise<PaymentLink> {
  if (isFrontendOnly()) {
    return duplicateLocalPaymentLink(merchantId, linkId);
  }
  throw new Error('Payment link duplication is not supported by the API yet.');
}

export async function getPaymentLinkById(linkId: string) {
  if (isFrontendOnly()) {
    const link = findLocalPaymentLinkById(linkId);
    if (!link || !link.active) throw new Error('Payment link not found');
    return link;
  }
  const token = await getIdToken();
  return fetchPaymentLinkById(linkId, token ?? undefined);
}

export async function getPaymentLinkBySlug(slug: string) {
  if (isFrontendOnly()) {
    const link = findLocalPaymentLinkBySlug(slug);
    if (!link || !link.active) throw new Error('Payment link not found');
    return link;
  }
  const token = await getIdToken();
  return fetchPaymentLinkById(slug, token ?? undefined);
}

export async function getPaymentLink(merchantId: string, linkId: string) {
  if (isFrontendOnly()) {
    const link = findLocalPaymentLinkById(linkId);
    if (!link || link.merchantId !== merchantId) throw new Error('Payment link not found');
    return link;
  }
  const token = await requireToken();
  return fetchPaymentLinkById(linkId, token);
}

export async function listProducts(merchantId: string): Promise<ProductCatalogItem[]> {
  if (isFrontendOnly()) {
    return listLocalProducts(merchantId);
  }
  return [];
}

export async function createProduct(
  merchantId: string,
  input: {
    name: string;
    description?: string;
    price: number;
    currency: Currency;
    active?: boolean;
  }
): Promise<ProductCatalogItem> {
  if (isFrontendOnly()) {
    return createLocalProduct(merchantId, input);
  }
  throw new Error(NOT_AVAILABLE);
}

export async function getProduct(
  merchantId: string,
  productId: string
): Promise<ProductCatalogItem | null> {
  if (isFrontendOnly()) {
    return findLocalProductById(merchantId, productId);
  }
  return null;
}

export async function updateProduct(
  merchantId: string,
  productId: string,
  data: Partial<ProductCatalogItem>
): Promise<ProductCatalogItem> {
  if (isFrontendOnly()) {
    return updateLocalProduct(merchantId, productId, data);
  }
  throw new Error(NOT_AVAILABLE);
}

export async function listCustomers(merchantId: string): Promise<Customer[]> {
  if (isFrontendOnly()) {
    return listLocalCustomers(merchantId, listCheckoutPaymentRecords(merchantId));
  }
  return [];
}

export async function createCustomer(
  merchantId: string,
  input: {
    name: string;
    email?: string;
    walletAddress?: string;
    preferredToken?: Currency;
    countryCode?: string;
    type?: Customer['type'];
  }
): Promise<Customer> {
  if (isFrontendOnly()) {
    return createLocalCustomer(merchantId, input);
  }
  throw new Error(NOT_AVAILABLE);
}

export async function getCustomer(
  merchantId: string,
  customerId: string
): Promise<Customer | null> {
  if (isFrontendOnly()) {
    return getLocalCustomer(merchantId, customerId, listCheckoutPaymentRecords(merchantId));
  }
  return null;
}

export async function updateCustomer(
  merchantId: string,
  customerId: string,
  data: Partial<Customer>
): Promise<Customer> {
  if (isFrontendOnly()) {
    return updateLocalCustomer(merchantId, customerId, data);
  }
  throw new Error(NOT_AVAILABLE);
}

export async function listPosDevices(_merchantId: string) {
  throw new Error('Use payments-api listPosDevices instead.');
}

export async function createPosDevice(_merchantId: string, _input: { name: string; posId: string }) {
  throw new Error('Use payments-api createPosDevice instead.');
}

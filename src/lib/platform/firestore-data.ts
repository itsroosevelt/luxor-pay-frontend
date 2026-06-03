import {
  ensureLocalMerchantProfile,
  getLocalMerchantProfile,
  updateLocalMerchantProfile,
} from '@/lib/local-merchant-store';
import {
  createLocalPaymentLink,
  getLocalPaymentLink,
  getLocalPaymentLinkById,
  listLocalPaymentLinks,
  updateLocalPaymentLink,
  type PaymentLinkInput,
} from '@/lib/local-links-store';
import {
  createLocalProduct,
  getLocalProduct,
  listLocalProducts,
  updateLocalProduct,
} from '@/lib/local-products-store';
import {
  createLocalCustomer,
  getLocalCustomer,
  listLocalCustomers,
  updateLocalCustomer,
} from '@/lib/local-customers-store';
import {
  createLocalPosDevice,
  listLocalPosDevices,
} from '@/lib/local-pos-store';

export type { PaymentLinkInput };

export async function ensureMerchantProfile(merchantId: string, email: string) {
  return ensureLocalMerchantProfile(merchantId, email);
}

export async function updateMerchantProfile(
  merchantId: string,
  data: Parameters<typeof updateLocalMerchantProfile>[1]
) {
  updateLocalMerchantProfile(merchantId, data);
}

export async function getMerchantProfile(merchantId: string) {
  return getLocalMerchantProfile(merchantId);
}

export async function listPaymentLinks(merchantId: string) {
  return listLocalPaymentLinks(merchantId);
}

export async function createPaymentLink(merchantId: string, input: PaymentLinkInput) {
  return createLocalPaymentLink(merchantId, input);
}

export async function updatePaymentLink(
  merchantId: string,
  linkId: string,
  input: Partial<PaymentLinkInput>
) {
  return updateLocalPaymentLink(merchantId, linkId, input);
}

export async function getPaymentLinkById(linkId: string) {
  return getLocalPaymentLinkById(linkId);
}

export async function getPaymentLink(merchantId: string, linkId: string) {
  return getLocalPaymentLink(merchantId, linkId);
}

export async function getProduct(merchantId: string, productId: string) {
  return getLocalProduct(merchantId, productId);
}

export async function updateProduct(
  merchantId: string,
  productId: string,
  data: Parameters<typeof updateLocalProduct>[2]
) {
  return updateLocalProduct(merchantId, productId, data);
}

export async function listPosDevices(merchantId: string) {
  return listLocalPosDevices(merchantId);
}

export async function createPosDevice(
  merchantId: string,
  input: Parameters<typeof createLocalPosDevice>[1]
) {
  return createLocalPosDevice(merchantId, input);
}

export async function listCustomers(merchantId: string) {
  return listLocalCustomers(merchantId);
}

export async function getCustomer(merchantId: string, customerId: string) {
  return getLocalCustomer(merchantId, customerId);
}

export async function updateCustomer(
  merchantId: string,
  customerId: string,
  data: Parameters<typeof updateLocalCustomer>[2]
) {
  return updateLocalCustomer(merchantId, customerId, data);
}

export async function createCustomer(
  merchantId: string,
  input: Parameters<typeof createLocalCustomer>[1]
) {
  return createLocalCustomer(merchantId, input);
}

export async function listProducts(merchantId: string) {
  return listLocalProducts(merchantId);
}

export async function createProduct(
  merchantId: string,
  input: Parameters<typeof createLocalProduct>[1]
) {
  return createLocalProduct(merchantId, input);
}

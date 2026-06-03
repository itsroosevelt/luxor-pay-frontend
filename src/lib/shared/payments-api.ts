import { getPaymentLinkById } from '@/lib/firestore-data';
import { getCurrentMerchantId } from '@/lib/frontend-only';
import {
  createLocalPaymentFromLink,
  getLocalPayment,
  listLocalPayments,
  verifyLocalPayment,
} from '@/lib/local-payments-store';
import type { PaymentOrder } from '@luxor/contracts';

export async function createPaymentFromLink(linkId: string): Promise<PaymentOrder> {
  const link = await getPaymentLinkById(linkId);
  if (!link) throw new Error('Payment link not found or inactive');
  return createLocalPaymentFromLink(link);
}

export async function fetchPayment(reference: string): Promise<PaymentOrder> {
  const order = getLocalPayment(reference);
  if (!order) throw new Error('Payment not found');
  return order;
}

export async function verifyPayment(reference: string): Promise<{
  data: PaymentOrder;
  confirmed: boolean;
  signature?: string;
}> {
  return verifyLocalPayment(reference);
}

export async function listPayments(_token: string): Promise<PaymentOrder[]> {
  const merchantId = getCurrentMerchantId();
  if (!merchantId) return [];
  return listLocalPayments(merchantId);
}

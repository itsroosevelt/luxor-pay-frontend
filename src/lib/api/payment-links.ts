import { apiGet, apiPost, type ApiResult } from '@/lib/api/http';
import { getCurrentMerchantId, isFrontendOnly } from '@/lib/frontend-only';
import {
  createLocalPaymentLink,
  listLocalPaymentLinks,
  type LocalPaymentLinkInput,
} from '@/lib/payment-links-local';
import type { Currency, PaymentLink } from '@luxor/contracts';

export async function fetchPaymentLinksApi(): Promise<ApiResult<PaymentLink[]>> {
  if (isFrontendOnly()) {
    const merchantId = getCurrentMerchantId();
    if (!merchantId) {
      return { ok: false, error: 'Not authenticated', status: 401 };
    }
    return { ok: true, data: listLocalPaymentLinks(merchantId), status: 200 };
  }
  return apiGet<PaymentLink[]>('/payment-links');
}

export async function fetchPaymentLinkByIdApi(id: string): Promise<ApiResult<PaymentLink>> {
  if (isFrontendOnly()) {
    const merchantId = getCurrentMerchantId();
    if (!merchantId) {
      return { ok: false, error: 'Not authenticated', status: 401 };
    }
    const links = listLocalPaymentLinks(merchantId);
    const link = links.find((l) => l.id === id);
    if (!link) {
      return { ok: false, error: 'Payment link not found', status: 404 };
    }
    return { ok: true, data: link, status: 200 };
  }
  return apiGet<PaymentLink>(`/payment-links/${id}`);
}

export async function createPaymentLinkApi(
  input: LocalPaymentLinkInput
): Promise<ApiResult<PaymentLink>> {
  if (isFrontendOnly()) {
    const merchantId = getCurrentMerchantId();
    if (!merchantId) {
      return { ok: false, error: 'Not authenticated', status: 401 };
    }
    try {
      return { ok: true, data: createLocalPaymentLink(merchantId, input), status: 201 };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create link';
      return { ok: false, error: message, status: 400 };
    }
  }
  return apiPost<PaymentLink>('/payment-links', {
    name: input.name,
    amount: input.amount,
    currency: input.currency,
  });
}

export type { LocalPaymentLinkInput as CreatePaymentLinkInput, Currency };

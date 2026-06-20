import { apiGet, apiPost, type ApiResult } from '@/lib/api/http';
import { getCurrentMerchantId, isFrontendOnly } from '@/lib/frontend-only';
import {
  createLocalPaymentLink,
  listLocalPaymentLinks,
  type LocalPaymentLinkInput,
} from '@/lib/payment-links-local';
import type { Currency, PaymentLink } from '@luxor/contracts';

function isLinkDeleted(linkId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const deletedStr = localStorage.getItem('luxor_local_deleted_links');
    if (deletedStr) {
      const deletedIds = JSON.parse(deletedStr);
      return Array.isArray(deletedIds) && deletedIds.includes(linkId);
    }
  } catch (e) {
    console.error('Error checking deleted links', e);
  }
  return false;
}

export async function fetchPaymentLinksApi(): Promise<ApiResult<PaymentLink[]>> {
  let result: ApiResult<PaymentLink[]>;
  if (isFrontendOnly()) {
    const merchantId = getCurrentMerchantId();
    if (!merchantId) {
      return { ok: false, error: 'Not authenticated', status: 401 };
    }
    result = { ok: true, data: listLocalPaymentLinks(merchantId), status: 200 };
  } else {
    result = await apiGet<PaymentLink[]>('/payment-links');
  }

  if (result.ok && result.data) {
    result.data = result.data.filter((link) => !isLinkDeleted(link.id));
  }
  return result;
}

export async function fetchPaymentLinkByIdApi(id: string): Promise<ApiResult<PaymentLink>> {
  if (isLinkDeleted(id)) {
    return { ok: false, error: 'Payment link deleted', status: 404 };
  }
  if (isFrontendOnly()) {
    const merchantId = getCurrentMerchantId();
    if (!merchantId) {
      return { ok: false, error: 'Not authenticated', status: 401 };
    }
    const links = listLocalPaymentLinks(merchantId);
    const link = links.find((l) => l.id === id);
    if (!link || isLinkDeleted(link.id)) {
      return { ok: false, error: 'Payment link not found', status: 404 };
    }
    return { ok: true, data: link, status: 200 };
  }
  const result = await apiGet<PaymentLink>(`/payment-links/${id}`);
  if (result.ok && result.data && isLinkDeleted(result.data.id)) {
    return { ok: false, error: 'Payment link deleted', status: 404 };
  }
  return result;
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

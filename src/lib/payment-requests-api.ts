import { apiUrl } from './api-client';

export type NotificationType = 'EMAIL' | 'PHONE' | 'PUSH' | 'NONE';

export interface CreatePaymentRequestPayload {
  requesterWallet: string;
  targetNotificationType: NotificationType;
  targetNotification?: string;
  amount: string;
  assetMint: string;
  reference?: string;
  payerWallet: string;
  businessName?: string;
  numericalReference?: number;
  expirationDate?: string;
}

export interface PaymentRequest {
  id: string;
  merchantId: string;
  requesterWallet: string;
  targetNotificationType: NotificationType;
  targetNotification?: string;
  amount: string;
  assetMint: string;
  payerWallet: string;
  reference?: string;
  businessName?: string;
  numericalReference?: number;
  lastNotificationDate?: string;
  expirationDate?: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequestResponse {
  success: boolean;
  data: PaymentRequest;
}

export async function createPaymentRequest(
  token: string,
  payload: CreatePaymentRequestPayload,
): Promise<CreatePaymentRequestResponse> {
  const response = await fetch(apiUrl('/payment-requests'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create payment request');
  }

  return response.json();
}

export type PaymentRequestPerspective = 'requester' | 'payer';

export interface ListPaymentRequestsResponse {
  perspective: PaymentRequestPerspective;
  data: PaymentRequest[];
}

export async function listPaymentRequests(
  token: string,
  perspective: PaymentRequestPerspective,
  walletAddress: string,
): Promise<ListPaymentRequestsResponse> {
  const params = new URLSearchParams({ perspective, walletAddress });
  const response = await fetch(apiUrl(`/payment-requests?${params}`), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch payment requests');
  }

  return response.json();
}

export async function resendPaymentRequestNotification(
  token: string,
  id: string,
): Promise<{ success: boolean }> {
  const response = await fetch(apiUrl(`/payment-requests/${id}/notify`), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to resend notification');
  }

  return response.json();
}

export type UpdatePaymentRequestAction = 'CANCEL' | 'EXTEND';

export interface UpdatePaymentRequestPayload {
  /** Pass 'CANCEL' to hard-cancel. Mutually exclusive with expirationDate. */
  action?: UpdatePaymentRequestAction;
  /** ISO-8601 future date to extend the expiration. Mutually exclusive with action='CANCEL'. */
  expirationDate?: string;
}

export async function updatePaymentRequest(
  token: string,
  id: string,
  payload: UpdatePaymentRequestPayload,
): Promise<{ success: boolean; data: PaymentRequest }> {
  const response = await fetch(apiUrl(`/payment-requests/${id}/cancel`), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = Array.isArray(errorData.message)
      ? errorData.message.join(', ')
      : errorData.message || 'Failed to update payment request';
    throw new Error(msg);
  }

  return response.json();
}

/** @deprecated Use updatePaymentRequest({ action: 'CANCEL' }) instead. */
export async function cancelPaymentRequest(
  token: string,
  id: string,
): Promise<{ success: boolean }> {
  return updatePaymentRequest(token, id, { action: 'CANCEL' });
}

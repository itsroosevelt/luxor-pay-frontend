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

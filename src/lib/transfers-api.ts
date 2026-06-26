import { apiUrl } from '@/lib/api-client';

export interface Transfer {
  id: string;
  merchantId: string;
  fromWallet: string;
  toWallet: string;
  reference: string | null;
  toNickname: string | null;
  mint: string;
  symbol: string | null;
  decimals: number;
  amount: string;
  rawAmount: string;
  signature: string | null;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  confirmedAt: string | null;
}

export interface TransfersResponse {
  data: Transfer[];
  total: number;
  totalPages: number;
}

export async function getTransfers(
  token: string,
  offset: number = 0,
  limit: number = 10,
  status?: string
): Promise<TransfersResponse> {
  const url = new URL(apiUrl('/transfers'));
  url.searchParams.append('offset', offset.toString());
  url.searchParams.append('limit', limit.toString());
  if (status) {
    url.searchParams.append('status', status);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(
      json.message?.[0] || json.message || json.error || 'Failed to fetch transfers'
    );
  }

  return json as TransfersResponse;
}

export interface SendTransferPayload {
  toWallet: string;
  amount: string;
  mint?: string | null;
  toNickname?: string | null;
  reference?: string;
  transactionTypeId?: 'Regular' | 'Request' | 'TopUp';
  paymentRequestId?: string;
}

export async function sendTransfer(token: string, payload: SendTransferPayload): Promise<{ data: Transfer }> {
  const response = await fetch(apiUrl('/transfers/send'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!response.ok) {
    let errorMessage = 'Failed to process transfer';
    if (Array.isArray(json.message)) {
      errorMessage = json.message.join(', ');
    } else if (json.message) {
      errorMessage = json.message;
    } else if (json.error) {
      errorMessage = json.error;
    }
    throw new Error(errorMessage);
  }

  return json as { data: Transfer };
}

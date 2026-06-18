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

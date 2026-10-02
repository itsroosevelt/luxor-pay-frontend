import { bearerAuth } from '@/lib/auth-client';
import { apiUrl } from '@/lib/api-client';

export interface QuoteRequest {
  inputMint: string;
  outputMint: string;
  amount: string; // in lamports
  slippageBps?: number;
}

export interface QuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: any[];
}

export interface ExecuteSwapRequest {
  quoteResponse: QuoteResponse;
}

export interface ExecuteSwapResponse {
  txid: string;
}

export async function getSwapQuote(request: QuoteRequest
): Promise<QuoteResponse> {
  const url = new URL(apiUrl('/swap/quote'));
  url.searchParams.append('inputMint', request.inputMint);
  url.searchParams.append('outputMint', request.outputMint);
  url.searchParams.append('amount', request.amount);
  if (request.slippageBps) {
    url.searchParams.append('slippageBps', request.slippageBps.toString());
  }

  const res = await fetch(url.toString(), {
    headers: {
      ...(await bearerAuth()),
      'Content-Type': 'application/json',
    },
  });

  const json = await res.json();

  if (!res.ok) {
    const errorMsg =
      (Array.isArray(json?.message) ? json.message[0] : json?.message) ||
      json?.error ||
      'Failed to fetch swap quote';
    throw new Error(errorMsg);
  }

  return json as QuoteResponse;
}

export async function executeSwap(request: ExecuteSwapRequest
): Promise<ExecuteSwapResponse> {
  const url = apiUrl('/swap/execute');
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...(await bearerAuth()),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const json = await res.json();

  if (!res.ok) {
    const errorMsg =
      (Array.isArray(json?.message) ? json.message[0] : json?.message) ||
      json?.error ||
      'Failed to execute swap';
    throw new Error(errorMsg);
  }

  return json as ExecuteSwapResponse;
}

/**
 * Mock request router.
 *
 * Maps a backend REST path (already stripped of the `/api/backend` proxy
 * prefix) + method + parsed body to a canned response sourced from
 * `./data.ts`. Returns `undefined` when no rule matches so the caller can
 * fall through to the real network (used for asset/font requests etc.).
 *
 * Only reached while `IS_MOCK_MODE` is true — see `@/lib/mock/mock-fetch`.
 */

import {
  MOCK_MERCHANT_PROFILE,
  MOCK_PAYMENT_LINKS,
  MOCK_POS_DEVICES,
  MOCK_API_KEYS,
  MOCK_CONTACTS,
  MOCK_PAYMENT_REQUESTS,
  MOCK_TRANSFERS,
  MOCK_WALLET_BALANCE,
  MOCK_TOKENS,
  MOCK_PRICES_USD,
  MOCK_USER,
  MINTS,
  buildMockSwapQuote,
} from './data';
import type { PaymentRequest } from '@/lib/payment-requests-api';
import type { Transfer } from '@/lib/transfers-api';
import type { Contact } from '@/lib/contacts-api';

export interface MockResult {
  status: number;
  /** JSON-serialisable body. Ignored when `rawBody` is set. */
  body?: unknown;
  /** Raw string body (e.g. a tiny PDF) with an explicit content type. */
  rawBody?: string;
  contentType?: string;
}

type Json = Record<string, unknown>;

const ok = (body: unknown): MockResult => ({ status: 200, body });
const created = (body: unknown): MockResult => ({ status: 201, body });

/* In-memory mutable copies so create/update/delete feel real for a session. */
const links = [...MOCK_PAYMENT_LINKS];
const devices = [...MOCK_POS_DEVICES];
const apiKeys = [...MOCK_API_KEYS];
let contacts: Contact[] = [...MOCK_CONTACTS];
let requests: PaymentRequest[] = [...MOCK_PAYMENT_REQUESTS];
let transfers: Transfer[] = [...MOCK_TRANSFERS];

const nowIso = () => new Date().toISOString();
const rid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 8)}`;
const mockSig = () => `${Math.random().toString(36).slice(2)}MockDemoTxSig${'x'.repeat(20)}`;

function symbolForMint(mint?: string | null): string {
  return MOCK_TOKENS.find((t) => t.mint === mint)?.symbol ?? 'USDC';
}
function decimalsForMint(mint?: string | null): number {
  return MOCK_TOKENS.find((t) => t.mint === mint)?.decimals ?? 6;
}

/**
 * @param method  Upper-case HTTP verb.
 * @param path    Path without host or `/api/backend` prefix, no query string.
 * @param search  URLSearchParams parsed from the request URL.
 * @param body    Parsed JSON request body, or undefined.
 */
export function resolveMock(
  method: string,
  path: string,
  search: URLSearchParams,
  body: Json | undefined,
): MockResult | undefined {
  const p = path.replace(/\/+$/, '') || '/';

  /* ───────────────── Merchant profile ───────────────── */
  if (p === '/merchants/me' && method === 'GET') return ok(MOCK_MERCHANT_PROFILE);
  if (p === '/merchants' && method === 'POST') {
    return created({ ...MOCK_MERCHANT_PROFILE, ...(body ?? {}) });
  }
  if (p === '/merchants/me' && method === 'PATCH') {
    Object.assign(MOCK_MERCHANT_PROFILE, body ?? {}, { updatedAt: nowIso() });
    return ok(MOCK_MERCHANT_PROFILE);
  }
  if (p.startsWith('/merchants/wallet/') && method === 'GET') {
    return ok({
      businessName: MOCK_MERCHANT_PROFILE.businessName,
      merchantWallet: MOCK_MERCHANT_PROFILE.merchantWallet,
    });
  }

  /* ───────────────── Payment links ───────────────── */
  if (p === '/payment-links' && method === 'GET') return ok({ data: links });
  if (p === '/payment-links' && method === 'POST') {
    const link = {
      id: rid('lnk'),
      merchantId: MOCK_MERCHANT_PROFILE.id ?? 'mock-merchant-0001',
      name: String(body?.name ?? 'New link'),
      businessName: String(body?.businessName ?? MOCK_MERCHANT_PROFILE.businessName ?? ''),
      amount: Number(body?.amount ?? 0),
      currency: String(body?.currency ?? 'USDC'),
      merchantWallet: MOCK_USER.wallet,
      active: true,
      createdAt: nowIso(),
    };
    links.unshift(link as (typeof links)[number]);
    return created({ data: link });
  }
  if (p.startsWith('/payment-links/') && method === 'GET') {
    const id = p.split('/')[2];
    const link = links.find((l) => l.id === id) ?? links[0];
    return ok({ data: link });
  }

  /* ───────────────── POS devices ───────────────── */
  if (p === '/pos/devices' && method === 'GET') return ok({ data: devices });
  if (p === '/pos/devices' && method === 'POST') {
    const device = {
      id: rid('pos'),
      merchantId: MOCK_MERCHANT_PROFILE.id ?? 'mock-merchant-0001',
      name: String(body?.name ?? 'New device'),
      posId: String(body?.posId ?? rid('LUX-POS')),
      active: true,
      createdAt: nowIso(),
    };
    devices.unshift(device as (typeof devices)[number]);
    return created({ data: device });
  }

  /* ───────────────── API keys (admin) ───────────────── */
  if (p === '/api/v1/api-keys' && method === 'GET') return ok({ data: apiKeys });
  if (p === '/api/v1/api-keys' && method === 'POST') {
    const prefix = `lx_test_${Math.random().toString(36).slice(2, 6)}`;
    const record = {
      id: rid('key'),
      merchantId: MOCK_MERCHANT_PROFILE.id ?? 'mock-merchant-0001',
      name: String(body?.name ?? 'New key'),
      keyPrefix: prefix,
      createdAt: nowIso(),
      lastUsedAt: nowIso(),
    };
    apiKeys.unshift(record);
    return created({ data: apiKeys, secret: `${prefix}_${Math.random().toString(36).slice(2)}MOCKSECRET` });
  }
  if (p.startsWith('/api/v1/api-keys/') && method === 'DELETE') {
    const id = p.split('/').pop();
    const i = apiKeys.findIndex((k) => k.id === id);
    if (i >= 0) apiKeys.splice(i, 1);
    return ok({ success: true });
  }

  /* ───────────────── Contacts ───────────────── */
  if (p === '/contacts' && method === 'GET') return ok({ data: contacts, total: contacts.length });
  if (p === '/contacts' && method === 'POST') {
    const contact: Contact = {
      id: rid('ctc'),
      merchantId: MOCK_MERCHANT_PROFILE.id!,
      nickname: String(body?.nickname ?? 'New contact'),
      walletAddress: String(body?.walletAddress ?? ''),
      telephone: String(body?.telephone ?? ''),
      email: String(body?.email ?? ''),
      mint: String(body?.mint ?? MINTS.USDC),
      symbol: symbolForMint(body?.mint as string | undefined),
      notes: String(body?.notes ?? ''),
      isFavorite: Boolean(body?.isFavorite ?? false),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    contacts = [contact, ...contacts];
    return created({ data: contact });
  }
  if (p.startsWith('/contacts/') && method === 'PATCH') {
    const id = p.split('/')[2];
    contacts = contacts.map((c) =>
      c.id === id
        ? ({
            ...c,
            ...(body ?? {}),
            symbol: body?.mint ? symbolForMint(body.mint as string) : c.symbol,
            updatedAt: nowIso(),
          } as Contact)
        : c,
    );
    return ok(contacts.find((c) => c.id === id) ?? {});
  }
  if (p.startsWith('/contacts/') && method === 'DELETE') {
    const id = p.split('/')[2];
    contacts = contacts.filter((c) => c.id !== id);
    return ok({ success: true });
  }

  /* ───────────────── Payment requests ───────────────── */
  if (p === '/payment-requests' && method === 'GET') {
    const perspective = (search.get('perspective') as 'requester' | 'payer') ?? 'requester';
    return ok({ perspective, data: requests });
  }
  if (p === '/payment-requests' && method === 'POST') {
    const req: PaymentRequest = {
      id: rid('preq'),
      merchantId: MOCK_MERCHANT_PROFILE.id!,
      requesterWallet: String(body?.requesterWallet ?? MOCK_USER.wallet),
      targetNotificationType: (body?.targetNotificationType as PaymentRequest['targetNotificationType']) ?? 'NONE',
      targetNotification: body?.targetNotification as string | undefined,
      amount: String(body?.amount ?? '0'),
      assetMint: String(body?.assetMint ?? MINTS.USDC),
      payerWallet: String(body?.payerWallet ?? ''),
      reference: body?.reference as string | undefined,
      businessName: (body?.businessName as string | undefined) ?? MOCK_MERCHANT_PROFILE.businessName,
      numericalReference: body?.numericalReference as number | undefined,
      expirationDate: body?.expirationDate as string | undefined,
      status: 'PENDING',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    requests = [req, ...requests];
    return created({ success: true, data: req });
  }
  if (/^\/payment-requests\/[^/]+\/resend$/.test(p) && method === 'POST') {
    return ok({ success: true });
  }
  if (/^\/payment-requests\/[^/]+\/cancel$/.test(p) && method === 'PATCH') {
    const id = p.split('/')[2];
    const action = body?.action;
    requests = requests.map((r) => {
      if (r.id !== id) return r;
      if (action === 'CANCEL') return { ...r, status: 'CANCELLED', updatedAt: nowIso() };
      return { ...r, expirationDate: (body?.expirationDate as string) ?? r.expirationDate, updatedAt: nowIso() };
    });
    return ok({ success: true, data: requests.find((r) => r.id === id) });
  }

  /* ───────────────── Transfers / transactions ───────────────── */
  if (p === '/transfers' && method === 'GET') {
    const offset = Number(search.get('offset') ?? 0);
    const limit = Number(search.get('limit') ?? 10);
    const status = search.get('status') ?? undefined;
    const filtered = status ? transfers.filter((t) => t.status === status) : transfers;
    const page = filtered.slice(offset, offset + limit);
    return ok({ data: page, total: filtered.length, totalPages: Math.max(1, Math.ceil(filtered.length / limit)) });
  }
  if (p === '/transfers/send' && method === 'POST') {
    const mint = (body?.mint as string | undefined) ?? MINTS.USDC;
    const transfer: Transfer = {
      id: rid('txf'),
      merchantId: MOCK_MERCHANT_PROFILE.id!,
      fromWallet: MOCK_USER.wallet,
      toWallet: String(body?.toWallet ?? ''),
      reference: (body?.reference as string) ?? null,
      toNickname: (body?.toNickname as string) ?? null,
      mint,
      symbol: symbolForMint(mint),
      decimals: decimalsForMint(mint),
      amount: String(body?.amount ?? '0'),
      rawAmount: String(Math.round(Number(body?.amount ?? 0) * 10 ** decimalsForMint(mint))),
      signature: mockSig(),
      status: 'confirmed',
      errorMessage: null,
      createdAt: nowIso(),
      confirmedAt: nowIso(),
    };
    transfers = [transfer, ...transfers];
    return created({ data: transfer });
  }
  if (p === '/transfers/statement-pdf-multi' && method === 'GET') {
    // Minimal but valid single-page PDF so the viewer renders something.
    const pdf =
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
      '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 120]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n' +
      '4 0 obj<</Length 68>>stream\nBT /F1 14 Tf 20 70 Td (Luxor Pay - Mock Statement) Tj ET\nendstream endobj\n' +
      '5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n' +
      'trailer<</Root 1 0 R>>\n%%EOF';
    return { status: 200, rawBody: pdf, contentType: 'application/pdf' };
  }

  /* ───────────────── Solana balance ───────────────── */
  if (p === '/solana/balance' && method === 'GET') {
    return ok({ data: { ...MOCK_WALLET_BALANCE, publicKey: search.get('publicKey') ?? MOCK_USER.wallet } });
  }

  /* ───────────────── Swap ───────────────── */
  if (p === '/swap/quote' && method === 'GET') {
    return ok(
      buildMockSwapQuote({
        inputMint: search.get('inputMint') ?? MINTS.SOL,
        outputMint: search.get('outputMint') ?? MINTS.USDC,
        amount: search.get('amount') ?? '0',
        slippageBps: search.get('slippageBps') ? Number(search.get('slippageBps')) : undefined,
      }),
    );
  }
  if (p === '/swap/execute' && method === 'POST') {
    return ok({ txid: mockSig() });
  }

  /* ───────────────── Token catalog ───────────────── */
  if (p === '/tokens' && method === 'GET') return ok(MOCK_TOKENS);

  /* ───────────────── Public checkout (pay/*) ───────────────── */
  if (p.startsWith('/payments/') && p !== '/payments/verify' && p !== '/payments/create' && method === 'GET') {
    const reference = p.split('/')[2];
    return ok({
      data: {
        reference, merchantId: MOCK_MERCHANT_PROFILE.id ?? 'mock-merchant-0001', amount: 25, currency: 'USDC',
        recipient: MOCK_USER.wallet, status: 'pending', createdAt: nowIso(), updatedAt: nowIso(),
      },
    });
  }
  if (p === '/payments/verify' && method === 'POST') {
    return ok({ data: { reference: body?.reference, status: 'confirmed', updatedAt: nowIso() }, confirmed: true, signature: mockSig() });
  }
  if (p === '/payments/create' && method === 'POST') {
    return created({ data: { reference: rid('pay'), status: 'pending', amount: 25, currency: 'USDC', recipient: MOCK_USER.wallet, createdAt: nowIso(), updatedAt: nowIso() } });
  }

  /* ───────────────── KYC / Onramp (Stripe) ───────────────── */
  if (p === '/stripe/kyc/init' && method === 'POST') {
    return ok({ data: { url: 'https://example.com/mock-kyc', sessionId: rid('kyc') } });
  }
  if (p === '/onramp/create-session' && method === 'POST') {
    return ok({ data: { sessionId: rid('onr'), clientSecret: 'mock_secret', url: 'https://example.com/mock-onramp' } });
  }

  return undefined;
}

/* ───────────────── External providers (non-backend) ───────────────── */

/** Jupiter price API — `https://api.jup.ag/price/v3?ids=<mint>`. */
export function resolveExternalMock(url: URL): MockResult | undefined {
  if (url.hostname.endsWith('jup.ag')) {
    const ids = (url.searchParams.get('ids') ?? '').split(',').filter(Boolean);
    const out: Record<string, { usdPrice: number }> = {};
    for (const id of ids) {
      const price = MOCK_PRICES_USD[id];
      if (price != null) out[id] = { usdPrice: price };
    }
    return ok(out);
  }
  return undefined;
}

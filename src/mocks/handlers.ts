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
  MOCK_MEMBERS,
  MOCK_MULTISIG,
  MOCK_VAULTS,
  MOCK_PROPOSALS,
  MOCK_PAYMENT_REQUESTS,
  MOCK_TRANSFERS,
  MOCK_WALLET_BALANCE,
  MOCK_TOKENS,
  MOCK_PRICES_USD,
  MOCK_USER,
  MINTS,
  buildMockSwapQuote,
} from './data';
import type { PaymentRequest } from '@/features/payment-requests/api/payment-requests-api';
import type { Transfer } from '@/features/transfers/api/transfers-api';
import type { Contact } from '@/features/contacts/api/contacts-api';
import type { Member } from '@/features/treasury/api/members-api';
import type { MultisigConfig, Vault } from '@/features/treasury/api/treasury-api';
import type { Proposal } from '@/features/treasury/api/proposals-api';
import { getActiveTreasuryId } from '@/lib/active-treasury';

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
const notFound = (msg: string): MockResult => ({ status: 404, body: { message: msg } });

/* In-memory mutable copies so create/update/delete feel real for a session. */
const links = [...MOCK_PAYMENT_LINKS];
const devices = [...MOCK_POS_DEVICES];
const apiKeys = [...MOCK_API_KEYS];
let contacts: Contact[] = [...MOCK_CONTACTS];
let members: Member[] = [...(MOCK_MEMBERS as Member[])];
let requests: PaymentRequest[] = [...MOCK_PAYMENT_REQUESTS];
let transfers: Transfer[] = [...MOCK_TRANSFERS];
let multisig: MultisigConfig = { ...MOCK_MULTISIG };
let vaults: Vault[] = MOCK_VAULTS.map((v) => ({ ...v, tokens: [...v.tokens] }));
let proposals: Proposal[] = MOCK_PROPOSALS.map((p) => ({
  ...p,
  approvals: [...p.approvals],
  rejections: [...p.rejections],
})) as Proposal[];

/** The signed-in user's own multisig membership (mock: whoever has isCurrentUser). */
const currentMemberId = () => members.find((m) => m.isCurrentUser)?.id ?? members[0]?.id ?? 'mem_01';
const vaultLabelFor = (id: string) => vaults.find((v) => v.id === id)?.label ?? 'Bóveda';

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
    const link = links.find((l) => l.id === id) ?? null;
    return ok({ data: link });
  }
  if (p.startsWith('/payment-links/') && (method === 'PUT' || method === 'PATCH')) {
    const id = p.split('/')[2];
    const index = links.findIndex((l) => l.id === id);
    if (index !== -1) {
      links[index] = {
        ...links[index],
        ...(body?.name ? { name: String(body.name) } : {}),
        ...(body?.businessName ? { businessName: String(body.businessName) } : {}),
        ...(body?.amount !== undefined ? { amount: Number(body.amount) } : {}),
        ...(body?.currency ? { currency: String(body.currency) } : {}),
      };
      return ok({ data: links[index] });
    }
    return ok({ data: null });
  }
  if (p.startsWith('/payment-links/') && method === 'DELETE') {
    const id = p.split('/')[2];
    const index = links.findIndex((l) => l.id === id);
    if (index !== -1) {
      links.splice(index, 1);
    }
    return ok({ success: true });
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

  /* ───────────────── Members ───────────────── */
  if (p === '/members' && method === 'GET') return ok({ data: members, total: members.length });
  if (p === '/members' && method === 'POST') {
    const r = (body?.roles as Partial<Member['roles']>) ?? {};
    const newMember: Member = {
      id: rid('mem'),
      merchantId: MOCK_MERCHANT_PROFILE.id!,
      name: String(body?.name ?? 'Nuevo miembro'),
      walletAddress: String(body?.walletAddress ?? ''),
      roles: {
        signer: Boolean(r.signer ?? true),
        proposer: Boolean(r.proposer ?? true),
        executor: Boolean(r.executor ?? true),
      },
      isCurrentUser: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    members = [...members, newMember];
    return created({ data: newMember });
  }
  if (p.startsWith('/members/') && method === 'PATCH') {
    const id = p.split('/')[2];
    members = members.map((m) =>
      m.id === id
        ? {
            ...m,
            ...(body?.name ? { name: String(body.name) } : {}),
            ...(body?.walletAddress ? { walletAddress: String(body.walletAddress) } : {}),
            roles: { ...m.roles, ...((body?.roles as Partial<Member['roles']>) ?? {}) },
            updatedAt: nowIso(),
          }
        : m,
    );
    return ok({ data: members.find((m) => m.id === id) });
  }
  if (p.startsWith('/members/') && method === 'DELETE') {
    const id = p.split('/')[2];
    members = members.filter((m) => m.id !== id);
    return ok({ success: true });
  }

  /* ───────────────── Multisig config (Squads v4-style) ───────────────── */
  const activeTreasuryId = getActiveTreasuryId();
  const allTreasuries: MultisigConfig[] = [
    {
      id: 'default-sterling-treasury',
      name: 'Sterling Treasury',
      address: '',
      threshold: 1,
      timeLock: 0,
      transactionIndex: 0,
      createKey: '',
      createdAt: nowIso(),
      updatedAt: nowIso(),
      onChain: false,
      memberCount: 1,
      isDefault: true,
    },
  ];

  if (p === '/multisig/treasuries' && method === 'GET') {
    const signerCount = members.filter((m) => m.roles?.signer).length || 1;
    return ok({ data: [{ ...multisig, memberCount: signerCount }] });
  }
  if (p === '/multisig' && method === 'GET') {
    const signerCount = members.filter((m) => m.roles?.signer).length || 1;
    return ok({ data: { ...multisig, memberCount: signerCount } });
  }
  if (p === '/multisig' && method === 'PATCH') {
    const next = Number(body?.threshold);
    const signerCount = members.filter((m) => m.roles?.signer).length || 1;
    if (Number.isFinite(next) && next >= 1 && next <= signerCount) {
      multisig = { ...multisig, threshold: Math.round(next), updatedAt: nowIso() };
    }
    return ok({ data: { ...multisig, memberCount: signerCount } });
  }

  /* ───────────────── Vaults (sub-bóvedas / Vault PDAs) ───────────────── */
  if (p === '/vaults/balance-history' && method === 'GET') {
    const range = search.get('range') ?? '1W';
    const count = range === '1Y' ? 12 : range === '1M' ? 15 : 7;
    const stepMs = range === '1Y' ? 30 * 86_400_000 : range === '1M' ? 2 * 86_400_000 : 86_400_000;
    const total = vaults.reduce((acc, v) => acc + (v.usdValue ?? 0), 0);
    const points = Array.from({ length: count }, (_, i) => ({
      t: new Date(Date.now() - (count - 1 - i) * stepMs).toISOString(),
      usd: Math.round(total * (0.8 + 0.2 * (i / Math.max(1, count - 1))) * 100) / 100,
    }));
    return ok({ data: { range, points, truncated: false } });
  }
  if (p === '/vaults' && method === 'GET') {
    return ok({ data: vaults });
  }
  if (p === '/vaults' && method === 'POST') {
    const index = vaults.length;
    const vault: Vault = {
      id: rid('vault'),
      index,
      label: String(body?.label ?? `Bóveda ${index}`),
      address: `Vau1t${Math.random().toString(36).slice(2, 10)}${'x'.repeat(30)}`.slice(0, 44),
      description: String(body?.description ?? ''),
      isDefault: false,
      usdValue: 0,
      solBalance: '0.0000',
      tokens: [],
      createdAt: nowIso(),
    };
    vaults = [...vaults, vault];
    return created({ data: vault });
  }
  if (p.startsWith('/vaults/') && method === 'PATCH') {
    const id = p.split('/vaults/')[1];
    const target = vaults.find((v) => v.id === id);
    if (target) {
      if (body?.label) target.label = String(body.label);
      if (typeof body?.targetWeight === 'number') target.targetWeight = body.targetWeight;
      return ok({ data: target });
    }
    return notFound('Vault no encontrada');
  }
  if (p.startsWith('/vaults/') && method === 'DELETE') {
    const id = p.split('/vaults/')[1];
    vaults = vaults.filter((v) => v.id !== id);
    return ok({ success: true });
  }

  /* ───────────────── Proposals (create → vote → execute) ───────────────── */
  if (p === '/proposals' && method === 'GET') {
    const status = search.get('status');
    const list = status ? proposals.filter((pr) => pr.status === status) : proposals;
    const sorted = [...list].sort((a, b) => b.index - a.index);
    return ok({ data: sorted });
  }
  if (p === '/proposals' && method === 'POST') {
    multisig = { ...multisig, transactionIndex: multisig.transactionIndex + 1 };
    const me = members.find((m) => m.id === currentMemberId());
    const type = (body?.type as Proposal['type']) ?? 'transfer';
    const mint = String(body?.mint ?? MINTS.USDC);
    const proposal: Proposal = {
      id: rid('prop'),
      index: multisig.transactionIndex,
      type,
      title: String(body?.title ?? 'Nueva propuesta'),
      vaultId: String(body?.vaultId ?? vaults[0]?.id ?? ''),
      vaultLabel: type === 'config' ? 'Configuración del multisig' : vaultLabelFor(String(body?.vaultId ?? '')),
      amount: String(body?.amount ?? ''),
      mint,
      symbol: symbolForMint(mint),
      destination: String(body?.destination ?? ''),
      destinationLabel: String(body?.destinationLabel ?? ''),
      memo: String(body?.memo ?? ''),
      status: 'active',
      threshold: multisig.threshold,
      approvals: [],
      rejections: [],
      createdBy: me?.id ?? currentMemberId(),
      createdByName: me?.name ?? 'Tú',
      createdAt: nowIso(),
      updatedAt: nowIso(),
      executedAt: null,
      executedSig: null,
    };
    proposals = [proposal, ...proposals];
    return created({ data: proposal });
  }

  const propMatch = p.match(/^\/proposals\/([^/]+)\/(approve|reject|execute|cancel|activate)$/);
  if (propMatch && method === 'POST') {
    const [, id, action] = propMatch;
    const meId = currentMemberId();
    proposals = proposals.map((pr) => {
      if (pr.id !== id) return pr;
      const approvals = pr.approvals.filter((x) => x !== meId);
      const rejections = pr.rejections.filter((x) => x !== meId);
      if (action === 'activate') {
        return { ...pr, status: 'active', updatedAt: nowIso() };
      }
      if (action === 'cancel') {
        return { ...pr, status: 'cancelled', updatedAt: nowIso() };
      }
      if (action === 'approve') {
        approvals.push(meId);
        const status = approvals.length >= pr.threshold ? 'approved' : 'active';
        return { ...pr, approvals, rejections, status, updatedAt: nowIso() };
      }
      if (action === 'reject') {
        rejections.push(meId);
        const signerCount = members.filter((m) => m.roles.signer).length;
        const status = rejections.length > signerCount - pr.threshold ? 'rejected' : pr.status;
        return { ...pr, approvals, rejections, status, updatedAt: nowIso() };
      }
      if (action === 'execute') {
        const now = nowIso();
        const executedSig = mockSig();
        // Executed transfers show up in the transaction history.
        if (pr.type === 'transfer' && pr.destination) {
          transfers = [
            {
              id: rid('txf'),
              merchantId: MOCK_MERCHANT_PROFILE.id!,
              fromWallet: MOCK_USER.wallet,
              toWallet: pr.destination,
              reference: pr.title,
              toNickname: pr.destinationLabel || null,
              mint: pr.mint,
              symbol: pr.symbol,
              decimals: decimalsForMint(pr.mint),
              amount: pr.amount,
              rawAmount: String(Math.round(Number(pr.amount || 0) * 10 ** decimalsForMint(pr.mint))),
              signature: executedSig,
              status: 'confirmed',
              errorMessage: null,
              createdAt: now,
              confirmedAt: now,
            },
            ...transfers,
          ];
        }
        return { ...pr, status: 'executed', executedAt: now, executedSig, updatedAt: now };
      }
      return pr;
    });
    return ok({ data: proposals.find((pr) => pr.id === id) });
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
      '4 0 obj<</Length 70>>stream\nBT /F1 14 Tf 20 70 Td (Sterling Pay - Mock Statement) Tj ET\nendstream endobj\n' +
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
    return ok({ success: true, url: 'mock', client_secret: 'mock_secret' });
  }
  if (p === '/onramp/create-session' && method === 'POST') {
    return ok({ data: { sessionId: rid('onr'), clientSecret: 'mock_secret', url: 'https://example.com/mock-onramp' } });
  }
  if (p === '/moonpay/sell-url' && method === 'POST') {
    return ok({ url: 'https://example.com/mock-offramp' });
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

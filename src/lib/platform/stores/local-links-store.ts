import { generateId } from '@luxor/contracts';
import type { Currency, PaymentLink } from '@luxor/contracts';
import { getLocalMerchantProfile } from '@/lib/local-merchant-store';
import { readJson, writeJson } from '@/lib/local-storage-utils';

const LINKS_PREFIX = 'luxor-payment-links:';
const LINK_REF_PREFIX = 'luxor-payment-link-ref:';

export type PaymentLinkInput = {
  name: string;
  amount: number;
  currency: Currency;
  active?: boolean;
  collectEmail?: boolean;
  successMessage?: string;
  redirectUrl?: string;
};

function linksKey(merchantId: string): string {
  return `${LINKS_PREFIX}${merchantId}`;
}

function linkRefKey(linkId: string): string {
  return `${LINK_REF_PREFIX}${linkId}`;
}

function readMerchantLinks(merchantId: string): PaymentLink[] {
  return readJson<PaymentLink[]>(linksKey(merchantId), []);
}

function persistLink(link: PaymentLink): PaymentLink {
  const links = readMerchantLinks(link.merchantId);
  const idx = links.findIndex((l) => l.id === link.id);
  const next = idx >= 0 ? links.map((l, i) => (i === idx ? link : l)) : [link, ...links];
  writeJson(linksKey(link.merchantId), next);
  writeJson(linkRefKey(link.id), link);
  return link;
}

export function listLocalPaymentLinks(merchantId: string): PaymentLink[] {
  return readMerchantLinks(merchantId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getLocalPaymentLinkById(linkId: string): PaymentLink | null {
  const link = readJson<PaymentLink | null>(linkRefKey(linkId), null);
  if (!link || !link.active) return null;
  return link;
}

export function getLocalPaymentLink(merchantId: string, linkId: string): PaymentLink | null {
  const link = readJson<PaymentLink | null>(linkRefKey(linkId), null);
  if (!link || link.merchantId !== merchantId) return null;
  return link;
}

export function createLocalPaymentLink(
  merchantId: string,
  input: PaymentLinkInput
): PaymentLink {
  const profile = getLocalMerchantProfile(merchantId);
  if (!profile?.merchantWallet) {
    throw new Error('MERCHANT_WALLET_REQUIRED');
  }

  const id = generateId('lx_');
  const createdAt = new Date().toISOString();
  const link: PaymentLink = {
    id,
    merchantId,
    name: input.name.trim(),
    amount: input.amount,
    currency: input.currency,
    merchantWallet: profile.merchantWallet,
    active: input.active ?? true,
    createdAt,
    collectEmail: input.collectEmail || undefined,
    successMessage: input.successMessage?.trim() || undefined,
    redirectUrl: input.redirectUrl?.trim() || undefined,
  };
  return persistLink(link);
}

export function updateLocalPaymentLink(
  merchantId: string,
  linkId: string,
  input: Partial<PaymentLinkInput>
): PaymentLink {
  const existing = getLocalPaymentLink(merchantId, linkId);
  if (!existing) throw new Error('PAYMENT_LINK_NOT_FOUND');

  const patch: Partial<PaymentLink> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.amount !== undefined) patch.amount = input.amount;
  if (input.currency !== undefined) patch.currency = input.currency;
  if (input.active !== undefined) patch.active = input.active;
  if (input.collectEmail !== undefined) patch.collectEmail = input.collectEmail || undefined;
  if (input.successMessage !== undefined) {
    patch.successMessage = input.successMessage.trim() || undefined;
  }
  if (input.redirectUrl !== undefined) {
    patch.redirectUrl = input.redirectUrl.trim() || undefined;
  }

  return persistLink({ ...existing, ...patch });
}

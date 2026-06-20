import type { Currency, PaymentLink } from '@luxor/contracts';
import { loadLocalMerchantProfile } from '@/lib/merchant-local';
import { generatePaymentLinkSlug } from '@/lib/payment-link-utils';
import {
  assessMerchantQrReadiness,
  resolveMerchantBusinessName,
} from '@/lib/qr-readiness';

const STORAGE_PREFIX = 'luxor_payment_links:';
const PUBLIC_SLUG_PREFIX = 'luxor_public_payment_links_by_slug:';

function publicSlugKey(slug: string): string {
  return `${PUBLIC_SLUG_PREFIX}${slug}`;
}

function savePublicPaymentLinkBySlug(link: PaymentLink): void {
  if (typeof window === 'undefined' || !link.slug) return;
  try {
    localStorage.setItem(publicSlugKey(link.slug), JSON.stringify(link));
  } catch {
    // Quota or private browsing — non-fatal for demo mode.
  }
}

function getPublicPaymentLinkBySlug(slug: string): PaymentLink | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(publicSlugKey(slug));
    if (!raw) return null;
    return JSON.parse(raw) as PaymentLink;
  } catch {
    return null;
  }
}

export type LocalPaymentLinkInput = {
  name: string;
  amount: number;
  currency: Currency;
  active?: boolean;
  collectEmail?: boolean;
  collectName?: boolean;
  collectCompany?: boolean;
  collectAddress?: boolean;
  collectPhone?: boolean;
  collectTaxes?: boolean;
  taxCode?: string;
  taxIncluded?: boolean;
  taxRate?: number;
  quantity?: number;
  allowQuantityAdjustment?: boolean;
  limitPayments?: boolean;
  successMessage?: string;
  redirectUrl?: string;
};

function storageKey(merchantId: string): string {
  return `${STORAGE_PREFIX}${merchantId}`;
}

function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return `lx_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}

function loadLinks(merchantId: string): PaymentLink[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(merchantId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PaymentLink[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLinks(merchantId: string, links: PaymentLink[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey(merchantId), JSON.stringify(links));
  } catch {
    // Quota or private browsing — non-fatal for demo mode.
  }
}

function ensureSlug(link: PaymentLink): PaymentLink {
  if (link.slug) return link;
  return { ...link, slug: generatePaymentLinkSlug() };
}

function persistSlugIfNeeded(merchantId: string, links: PaymentLink[], index: number): PaymentLink {
  const current = links[index];
  if (current.slug) return current;
  const updated = ensureSlug(current);
  links[index] = updated;
  saveLinks(merchantId, links);
  return updated;
}

export function listLocalPaymentLinks(merchantId: string): PaymentLink[] {
  return loadLinks(merchantId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function findLocalPaymentLinkById(linkId: string): PaymentLink | null {
  if (typeof window === 'undefined') return null;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(STORAGE_PREFIX)) continue;
    const merchantId = key.slice(STORAGE_PREFIX.length);
    const links = loadLinks(merchantId);
    const index = links.findIndex((l) => l.id === linkId);
    if (index !== -1) {
      return persistSlugIfNeeded(merchantId, links, index);
    }
  }
  return null;
}

export function findLocalPaymentLinkBySlug(slug: string): PaymentLink | null {
  if (typeof window === 'undefined') return null;

  const fromPublicIndex = getPublicPaymentLinkBySlug(slug);
  if (fromPublicIndex) {
    return fromPublicIndex;
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(STORAGE_PREFIX)) continue;
    const merchantId = key.slice(STORAGE_PREFIX.length);
    const links = loadLinks(merchantId);
    const index = links.findIndex((l) => l.slug === slug || l.id === slug);
    if (index !== -1) {
      const link = persistSlugIfNeeded(merchantId, links, index);
      savePublicPaymentLinkBySlug(link);
      return link;
    }
  }
  return null;
}

export function createLocalPaymentLink(
  merchantId: string,
  input: LocalPaymentLinkInput
): PaymentLink {
  const profile = loadLocalMerchantProfile(merchantId);
  if (!profile?.merchantWallet?.trim()) {
    throw new Error('MERCHANT_WALLET_REQUIRED');
  }

  const merchantWallet = profile.merchantWallet.trim();
  const merchantBusinessName = resolveMerchantBusinessName(profile);
  const qrReadiness = assessMerchantQrReadiness(profile, {
    wallet: merchantWallet,
    businessName: merchantBusinessName,
    requireTaxId: Boolean(input.collectTaxes),
  });

  const link: PaymentLink = {
    id: generateId(),
    slug: generatePaymentLinkSlug(),
    merchantId,
    name: input.name,
    amount: input.amount,
    currency: input.currency,
    merchantWallet,
    merchantBusinessName: merchantBusinessName || undefined,
    qrReady: qrReadiness.ready,
    active: input.active ?? true,
    createdAt: new Date().toISOString(),
    collectEmail: input.collectEmail,
    collectName: input.collectName,
    collectCompany: input.collectCompany,
    collectAddress: input.collectAddress,
    collectPhone: input.collectPhone,
    collectTaxes: input.collectTaxes,
    taxCode: input.taxCode,
    taxIncluded: input.taxIncluded,
    taxRate: input.taxRate,
    quantity: input.quantity ?? 1,
    allowQuantityAdjustment: input.allowQuantityAdjustment,
    limitPayments: input.limitPayments,
    successMessage: input.successMessage,
    redirectUrl: input.redirectUrl,
  };

  const links = loadLinks(merchantId);
  links.unshift(link);
  saveLinks(merchantId, links);
  savePublicPaymentLinkBySlug(link);
  return link;
}

function linkToLocalInput(link: PaymentLink): LocalPaymentLinkInput {
  return {
    name: link.name,
    amount: link.amount,
    currency: link.currency,
    active: link.active,
    collectEmail: link.collectEmail,
    collectName: link.collectName,
    collectCompany: link.collectCompany,
    collectAddress: link.collectAddress,
    collectPhone: link.collectPhone,
    collectTaxes: link.collectTaxes,
    taxCode: link.taxCode,
    taxIncluded: link.taxIncluded,
    taxRate: link.taxRate,
    quantity: link.quantity,
    allowQuantityAdjustment: link.allowQuantityAdjustment,
    limitPayments: link.limitPayments,
    successMessage: link.successMessage,
    redirectUrl: link.redirectUrl,
  };
}

export function duplicateLocalPaymentLink(merchantId: string, linkId: string): PaymentLink {
  const links = loadLinks(merchantId);
  const source = links.find((l) => l.id === linkId);
  if (!source) throw new Error('Payment link not found');

  const input = linkToLocalInput(source);
  input.name = `${source.name} (copia)`;
  return createLocalPaymentLink(merchantId, input);
}

export function updateLocalPaymentLink(
  merchantId: string,
  linkId: string,
  patch: Partial<LocalPaymentLinkInput>
): PaymentLink {
  const links = loadLinks(merchantId);
  const index = links.findIndex((l) => l.id === linkId);
  if (index === -1) throw new Error('Payment link not found');

  const current = links[index];
  const updated: PaymentLink = {
    ...current,
    name: patch.name ?? current.name,
    amount: patch.amount ?? current.amount,
    currency: patch.currency ?? current.currency,
    active: patch.active ?? current.active,
    collectEmail: patch.collectEmail ?? current.collectEmail,
    collectName: patch.collectName ?? current.collectName,
    collectCompany: patch.collectCompany ?? current.collectCompany,
    collectAddress: patch.collectAddress ?? current.collectAddress,
    collectPhone: patch.collectPhone ?? current.collectPhone,
    collectTaxes: patch.collectTaxes ?? current.collectTaxes,
    taxCode: patch.taxCode ?? current.taxCode,
    taxIncluded: patch.taxIncluded ?? current.taxIncluded,
    taxRate: patch.taxRate ?? current.taxRate,
    quantity: patch.quantity ?? current.quantity,
    allowQuantityAdjustment: patch.allowQuantityAdjustment ?? current.allowQuantityAdjustment,
    limitPayments: patch.limitPayments ?? current.limitPayments,
    successMessage: patch.successMessage ?? current.successMessage,
    redirectUrl: patch.redirectUrl ?? current.redirectUrl,
    slug: current.slug ?? generatePaymentLinkSlug(),
  };

  links[index] = updated;
  saveLinks(merchantId, links);
  savePublicPaymentLinkBySlug(updated);
  return updated;
}

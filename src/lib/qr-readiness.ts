import type { MerchantProfile, PaymentLink } from '@luxor/contracts';

export type QrReadinessField = 'wallet' | 'businessName' | 'address' | 'taxId';

export type QrReadinessIssue = {
  field: QrReadinessField;
  message: string;
};

export type QrReadinessOptions = {
  /** Wallet override (e.g. from a saved payment link). */
  wallet?: string;
  /** Display name override when profile is unavailable. */
  businessName?: string;
  /** Require tax ID when the link collects taxes / issues invoices. */
  requireTaxId?: boolean;
  /** Public /pay checkout — do not read merchant empresa from this browser's localStorage. */
  publicCheckout?: boolean;
  /** Merchant profile was complete when the payment link was created. */
  linkQrReady?: boolean;
};

const ISSUE_MESSAGES: Record<QrReadinessField, string> = {
  wallet: 'Configura tu wallet de Solana en Ajustes',
  businessName: 'Completa el nombre de tu empresa en Ajustes',
  address: 'Completa la dirección fiscal en Ajustes',
  taxId: 'Completa el ID fiscal en Ajustes',
};

export function getQrReadinessSettingsHref(field: QrReadinessField): string {
  return '/dashboard/settings';
}

export function resolveMerchantBusinessName(profile: MerchantProfile | null): string {
  if (profile?.businessName?.trim()) return profile.businessName.trim();
  return '';
}

export function resolveMerchantAddress(): string | null {
  return null;
}

export function resolveMerchantTaxId(): string {
  return '';
}

function hasStoredBusinessSettings(): boolean {
  return false;
}

function shouldVerifyInvoicingFields(profile: MerchantProfile | null): boolean {
  return false;
}

export function assessMerchantQrReadiness(
  profile: MerchantProfile | null,
  options: QrReadinessOptions = {}
): { ready: boolean; issues: QrReadinessIssue[] } {
  const issues: QrReadinessIssue[] = [];

  const wallet = (options.wallet ?? profile?.merchantWallet ?? '').trim();
  if (!wallet || wallet.length < 32) {
    issues.push({ field: 'wallet', message: ISSUE_MESSAGES.wallet });
  }

  if (options.publicCheckout && options.linkQrReady && wallet.length >= 32) {
    return { ready: true, issues: [] };
  }

  const businessName = options.businessName?.trim() || resolveMerchantBusinessName(profile);
  if (!businessName) {
    issues.push({ field: 'businessName', message: ISSUE_MESSAGES.businessName });
  }

  if (!options.publicCheckout && shouldVerifyInvoicingFields(profile) && !resolveMerchantAddress()) {
    issues.push({ field: 'address', message: ISSUE_MESSAGES.address });
  }

  if (!options.publicCheckout && options.requireTaxId && !resolveMerchantTaxId()) {
    issues.push({ field: 'taxId', message: ISSUE_MESSAGES.taxId });
  }

  return { ready: issues.length === 0, issues };
}

/** QR readiness for public /pay checkout — uses link snapshot, not merchant localStorage. */
export function assessPublicPaymentLinkQrReadiness(
  link: Pick<PaymentLink, 'merchantWallet' | 'merchantBusinessName' | 'qrReady' | 'collectTaxes'>,
  merchantName: string
): { ready: boolean; issues: QrReadinessIssue[] } {
  return assessMerchantQrReadiness(null, {
    wallet: link.merchantWallet,
    businessName: link.merchantBusinessName ?? merchantName,
    requireTaxId: Boolean(link.collectTaxes),
    publicCheckout: true,
    linkQrReady: link.qrReady,
  });
}

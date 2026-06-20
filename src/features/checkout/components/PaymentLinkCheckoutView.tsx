'use client';

import { useMemo, useState } from 'react';
import type { MerchantProfile, PaymentLink } from '@luxor/contracts';
import {
  CheckoutPaymentMethods,
  type CheckoutPaymentMethod,
} from '@/features/checkout/components/CheckoutPaymentMethods';
import { CheckoutSuccessView } from '@/features/checkout/components/CheckoutSuccessView';
import { StripeCheckoutLayout } from '@/features/checkout/components/CheckoutShell';
import {
  computeCheckoutTotals,
  formatCheckoutAmount,
  paymentLinkToLineItems,
} from '@/lib/payment-link-utils';
import { loadLocalMerchantProfile } from '@/lib/merchant-local';
import { isFrontendOnly } from '@/lib/frontend-only';
import { saveCheckoutPayment } from '@/lib/checkout-payments-local';
import {
  assessMerchantQrReadiness,
  assessPublicPaymentLinkQrReadiness,
} from '@/lib/qr-readiness';
import { buildSolanaPayUrl } from '@/lib/solana-pay-url';
import {
  hasRequiredCheckoutContactFields,
  isCheckoutContactComplete,
} from '@/lib/checkout-contact';
import { cn } from '@/lib/cn';

export function PaymentLinkCheckoutView({
  link,
  merchantName,
  merchantProfile,
  compact,
  preview,
  showSuccess,
  publicCheckout,
}: {
  link: PaymentLink;
  merchantName: string;
  merchantProfile?: MerchantProfile | null;
  compact?: boolean;
  preview?: boolean;
  showSuccess?: boolean;
  /** True on /pay/[slug] — readiness uses link snapshot, not merchant localStorage. */
  publicCheckout?: boolean;
}) {
  const [method, setMethod] = useState<CheckoutPaymentMethod>('wallet');
  const [quantity, setQuantity] = useState(link.quantity ?? 1);
  const [contact, setContact] = useState({
    email: '',
    name: '',
    company: '',
    address: '',
    phone: '',
  });
  const [paid, setPaid] = useState(false);
  const [paying, setPaying] = useState(false);

  const displayMerchantName =
    link.merchantBusinessName?.trim() || merchantName.trim() || 'Comercio';

  const lineItems = useMemo(() => {
    const items = paymentLinkToLineItems(link);
    if (link.allowQuantityAdjustment) {
      return items.map((item) => ({ ...item, quantity }));
    }
    return items;
  }, [link, quantity]);

  const totals = computeCheckoutTotals(lineItems, {
    collectTaxes: link.collectTaxes,
    taxIncluded: link.taxIncluded,
    taxRate: link.taxRate,
  });

  const profile =
    merchantProfile ??
    (link.merchantId !== 'preview' ? loadLocalMerchantProfile(link.merchantId) : null);

  const contactFields = {
    collectEmail: link.collectEmail,
    collectName: link.collectName,
    collectCompany: link.collectCompany,
    collectAddress: link.collectAddress,
    collectPhone: link.collectPhone,
  };

  const contactComplete = isCheckoutContactComplete(contactFields, contact);
  const requiresContact = hasRequiredCheckoutContactFields(contactFields);

  const qrReadiness = publicCheckout
    ? assessPublicPaymentLinkQrReadiness(link, displayMerchantName)
    : assessMerchantQrReadiness(profile, {
        wallet: link.merchantWallet,
        businessName: displayMerchantName,
        requireTaxId: Boolean(link.collectTaxes),
      });

  const payUrl =
    qrReadiness.ready && contactComplete
      ? buildSolanaPayUrl({
          recipient: link.merchantWallet,
          amount: totals.total,
          currency: link.currency,
          label: displayMerchantName,
          message: link.name,
        })
      : '';

  const handleContactChange = (field: string, value: string) => {
    setContact((prev) => ({ ...prev, [field]: value }));
  };

  const completePayment = async (paymentMethod: 'wallet' | 'qr' | 'mock') => {
    if (preview || paying || paid) return;
    if (requiresContact && !contactComplete) return;

    setPaying(true);
    await new Promise((resolve) => window.setTimeout(resolve, 600));

    if (isFrontendOnly() && link.merchantId !== 'preview') {
      const hasPayerData = Object.values(contact).some((v) => v.trim());
      saveCheckoutPayment({
        merchantId: link.merchantId,
        linkId: link.id,
        linkName: link.name,
        amount: totals.total,
        currency: link.currency,
        recipient: link.merchantWallet,
        payer: hasPayerData ? contact : undefined,
        paymentMethod,
      });
    }

    setPaying(false);
    setPaid(true);
  };

  const handleMockPay = () => {
    void completePayment(method === 'qr' ? 'qr' : 'wallet');
  };

  if (paid || showSuccess) {
    return (
      <StripeCheckoutLayout
        merchantName={displayMerchantName}
        lineItems={lineItems}
        currency={link.currency}
        collectTaxes={link.collectTaxes}
        taxIncluded={link.taxIncluded}
        taxRate={link.taxRate}
        compact={compact}
        preview
        payLabel="Pagar"
      >
        <CheckoutSuccessView
          merchantName={displayMerchantName}
          amount={totals.total}
          currency={link.currency}
          successMessage={link.successMessage}
          redirectUrl={preview ? undefined : link.redirectUrl}
          preview={preview}
        />
      </StripeCheckoutLayout>
    );
  }

  return (
    <StripeCheckoutLayout
      merchantName={displayMerchantName}
      lineItems={lineItems}
      currency={link.currency}
      collectTaxes={link.collectTaxes}
      taxIncluded={link.taxIncluded}
      taxRate={link.taxRate}
      contactFields={contactFields}
      contactValues={contact}
      onContactChange={preview ? undefined : handleContactChange}
      compact={compact}
      preview={preview}
      payLabel="Pagar"
    >
      {link.allowQuantityAdjustment ? (
        <div
          className={cn(
            'flex items-center justify-between rounded-xl border border-white/12 bg-white/[0.03] text-sm',
            compact ? 'px-3 py-2 text-xs' : 'px-4 py-2.5'
          )}
        >
          <span className="font-medium text-gray-300">Cantidad</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={preview || quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Reducir cantidad"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-gray-300 transition-colors hover:border-white/25 hover:bg-white/5 disabled:opacity-40"
            >
              −
            </button>
            <span className="min-w-[2rem] text-center tabular-nums font-medium text-white">
              {quantity}
            </span>
            <button
              type="button"
              disabled={preview}
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Aumentar cantidad"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-gray-300 transition-colors hover:border-white/25 hover:bg-white/5 disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>
      ) : null}

      <CheckoutPaymentMethods
        method={method}
        onMethodChange={setMethod}
        payUrl={payUrl}
        preview={preview}
        compact={compact}
        onPay={handleMockPay}
        qrBlockedIssues={qrReadiness.ready ? undefined : qrReadiness.issues}
        qrContactBlocked={requiresContact && !contactComplete}
        payDisabled={requiresContact && !contactComplete}
        hideQrSettingsLink={publicCheckout}
        paying={paying}
      />

      {!preview && method !== 'card' ? (
        <button
          type="button"
          onClick={handleMockPay}
          disabled={(requiresContact && !contactComplete) || paying}
          className={cn(
            'mt-4 w-full rounded-full bg-white font-semibold text-black shadow-sm transition-all hover:bg-gray-100 active:scale-[0.99] disabled:opacity-50',
            compact ? 'py-2.5 text-sm' : 'py-3.5 text-[15px]'
          )}
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {paying ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
              Procesando…
            </span>
          ) : (
            <>Pagar {formatCheckoutAmount(totals.total, link.currency)} {link.currency}</>
          )}
        </button>
      ) : null}
    </StripeCheckoutLayout>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Currency, ProductCatalogItem } from '@luxor/contracts';
import { auth } from '@/lib/firebase';
import { createPaymentLink, listProducts } from '@/lib/merchant-data';
import {
  PaymentLinkEditor,
  defaultPaymentLinkEditorValues,
  editorValuesToPaymentLinkInput,
  type PaymentLinkEditorValues,
} from '@/components/dashboard/PaymentLinkEditor';
import { PaymentLinkCheckoutInfo } from '@/components/dashboard';
import { useMerchantProfile } from '@/hooks/useMerchantProfile';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { toast } from 'sonner';

function parseCurrency(value: string | null): Currency {
  return value === 'SOL' || value === 'USDC' ? value : defaultPaymentLinkEditorValues.currency;
}

export function CreatePaymentLinkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile: merchantProfile, hasWallet, isLoading, authReady } = useMerchantProfile({
    refreshOnFocus: true,
  });
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);

  const merchantDisplayName = merchantProfile?.businessName?.trim() || 'Luxor Pay';

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !authReady) return;
    void listProducts(user.uid)
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [authReady]);

  const initialValues = useMemo((): PaymentLinkEditorValues => {
    const name = searchParams.get('name')?.trim() ?? '';
    const amount = searchParams.get('amount')?.trim() ?? '';
    const currency = parseCurrency(searchParams.get('currency'));
    const productId = searchParams.get('productId')?.trim();

    const fromProduct =
      productId && products.length > 0
        ? products.find((product) => product.id === productId)
        : undefined;

    return {
      ...defaultPaymentLinkEditorValues,
      ...(fromProduct
        ? {
            name: fromProduct.name,
            amount: String(fromProduct.price),
            currency: fromProduct.currency,
          }
        : {}),
      ...(name ? { name } : {}),
      ...(amount ? { amount } : {}),
      currency: fromProduct?.currency ?? currency,
    };
  }, [searchParams, products]);

  const handleSave = async (values: PaymentLinkEditorValues) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('Inicia sesión para crear enlaces de pago');
      return;
    }

    const input = editorValuesToPaymentLinkInput(values);
    if (!input.name || Number.isNaN(input.amount) || input.amount <= 0) {
      toast.error('Ingresa un nombre de producto y un monto válido');
      return;
    }

    if (values.redirectUrl.trim()) {
      try {
        new URL(values.redirectUrl.trim());
      } catch {
        toast.error('Ingresa una URL de redirección válida o déjala vacía');
        return;
      }
    }

    if (!hasWallet) {
      toast.error('Configura tu wallet de Solana en Ajustes y pulsa «Guardar cambios» primero');
      return;
    }

    setSaving(true);
    try {
      const link = await createPaymentLink(user.uid, input);
      toast.success('Enlace de pago creado');
      router.push(`/dashboard/links/${link.id}`);
    } catch (err) {
      if (err instanceof Error && err.message === 'MERCHANT_WALLET_REQUIRED') {
        toast.error('Configura tu wallet de Solana en Ajustes y pulsa «Guardar cambios» primero');
      } else {
        toast.error(getFirestoreErrorMessage(err, 'No se pudo crear el enlace de pago'));
      }
    } finally {
      setSaving(false);
    }
  };

  if (!authReady || isLoading) {
    return (
      <p className="text-sm text-[var(--dash-muted)] py-16 text-center">Cargando editor…</p>
    );
  }

  return (
    <div className="h-dvh min-h-0 flex flex-col">
      {!hasWallet && (
        <div className="shrink-0 px-4 md:px-5 py-3 border-b border-amber-500/30 bg-amber-500/10 text-sm text-amber-100">
          Configura tu wallet de Solana en{' '}
          <Link href="/dashboard/settings/profile" className="underline font-medium">
            Ajustes
          </Link>{' '}
          y pulsa «Guardar cambios» para crear enlaces de pago.
        </div>
      )}
      <div className="shrink-0 px-4 md:px-5 py-3 border-b border-[var(--dash-border)]">
        <PaymentLinkCheckoutInfo variant="create" />
      </div>
      <div className="flex-1 min-h-0">
        <PaymentLinkEditor
          key={`${searchParams.toString()}:${products.length}`}
          mode="create"
          layout="page"
          initialValues={initialValues}
          products={products}
          initialProductId={searchParams.get('productId')}
          merchantName={merchantDisplayName}
          merchantProfile={merchantProfile}
          saving={saving}
          onSave={handleSave}
          onCancel={() => router.push('/dashboard/links')}
        />
      </div>
    </div>
  );
}

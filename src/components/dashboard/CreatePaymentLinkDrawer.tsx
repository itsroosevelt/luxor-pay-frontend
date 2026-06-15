'use client';

import { useEffect, useMemo, useState } from 'react';
import { auth } from '@/lib/firebase';
import { createPaymentLink, listProducts } from '@/lib/merchant-data';
import type { ProductCatalogItem } from '@luxor/contracts';
import {
  PaymentLinkEditor,
  defaultPaymentLinkEditorValues,
  editorValuesToPaymentLinkInput,
  type PaymentLinkEditorValues,
} from './PaymentLinkEditor';
import { SlideOverPanel } from './SlideOverPanel';
import { useMerchantProfile } from '@/hooks/useMerchantProfile';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { toast } from 'sonner';
import type { PaymentLink } from '@luxor/contracts';

export interface CreatePaymentLinkDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated: (link: PaymentLink) => void;
  initialValues?: Partial<PaymentLinkEditorValues>;
}

export function CreatePaymentLinkDrawer({
  open,
  onClose,
  onCreated,
  initialValues,
}: CreatePaymentLinkDrawerProps) {
  const { profile: merchantProfile, hasWallet, isLoading, refetch } = useMerchantProfile({
    refreshOnFocus: true,
  });
  const [saving, setSaving] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);

  const merchantDisplayName = merchantProfile?.businessName?.trim() || 'Luxor Pay';

  const mergedInitial = useMemo(
    (): PaymentLinkEditorValues => ({
      ...defaultPaymentLinkEditorValues,
      ...initialValues,
    }),
    [initialValues]
  );

  useEffect(() => {
    if (!open) return;
    void refetch();
    const user = auth.currentUser;
    if (!user) return;
    void listProducts(user.uid)
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [open, refetch]);

  const handleClose = () => {
    setEditorKey((k) => k + 1);
    onClose();
  };

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
      toast.success('Payment link created');
      setEditorKey((k) => k + 1);
      onCreated(link);
      onClose();
    } catch (err) {
      if (err instanceof Error && err.message === 'MERCHANT_WALLET_REQUIRED') {
        toast.error('Add your Solana wallet in Settings and click Save first');
      } else {
        toast.error(getFirestoreErrorMessage(err, 'Could not create payment link'));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlideOverPanel
      open={open}
      onClose={handleClose}
      title="Create Solana Pay link"
      width="2xl"
      hideHeader
    >
      {isLoading ? (
        <p className="text-sm text-[var(--dash-muted)] p-6">Loading editor…</p>
      ) : (
        <PaymentLinkEditor
          key={editorKey}
          mode="create"
          layout="drawer"
          initialValues={mergedInitial}
          products={products}
          merchantName={merchantDisplayName}
          merchantProfile={merchantProfile}
          saving={saving}
          onSave={handleSave}
          onCancel={handleClose}
        />
      )}
    </SlideOverPanel>
  );
}

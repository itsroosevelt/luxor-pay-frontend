'use client';

import { useEffect, useMemo, useState } from 'react';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { createPaymentLink, getMerchantProfile } from '@/lib/merchant-data';
import {
  PaymentLinkEditor,
  defaultPaymentLinkEditorValues,
  type PaymentLinkEditorValues,
} from './PaymentLinkEditor';
import { SlideOverPanel } from './SlideOverPanel';
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
  const [merchantName, setMerchantName] = useState('Luxor Pay');
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  const mergedInitial = useMemo(
    (): PaymentLinkEditorValues => ({
      ...defaultPaymentLinkEditorValues,
      ...initialValues,
    }),
    [initialValues]
  );

  useEffect(() => {
    if (!open) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setReady(true);
        return;
      }
      try {
        const profile = await getMerchantProfile(user.uid);
        if (profile?.businessName) setMerchantName(profile.businessName);
        setHasWallet(Boolean(profile?.merchantWallet));
      } catch (err) {
        toast.error(getFirestoreErrorMessage(err, 'Could not load merchant profile'));
      } finally {
        setReady(true);
      }
    });
    return () => unsubscribe();
  }, [open]);

  const handleClose = () => {
    setEditorKey((k) => k + 1);
    onClose();
  };

  const handleSave = async (values: PaymentLinkEditorValues) => {
    const user = auth.currentUser;
    if (!user) return;

    const parsed = parseFloat(values.amount);
    if (!values.name.trim() || Number.isNaN(parsed) || parsed <= 0) {
      toast.error('Enter a valid product name and amount');
      return;
    }

    if (hasWallet === false) {
      toast.error('Add your Solana wallet in Settings first');
      return;
    }

    setSaving(true);
    try {
      const link = await createPaymentLink(user.uid, {
        name: values.name.trim(),
        amount: parsed,
        currency: values.currency,
        active: values.active,
        collectEmail: values.collectEmail,
        successMessage: values.successMessage,
        redirectUrl: values.redirectUrl,
      });
      toast.success('Payment link created');
      setEditorKey((k) => k + 1);
      onCreated(link);
      onClose();
    } catch (err) {
      if (err instanceof Error && err.message === 'MERCHANT_WALLET_REQUIRED') {
        toast.error('Add your Solana wallet in Settings first');
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
      {!ready ? (
        <p className="text-sm text-[var(--dash-muted)] p-6">Loading editor…</p>
      ) : (
        <PaymentLinkEditor
          key={editorKey}
          mode="create"
          layout="drawer"
          initialValues={mergedInitial}
          merchantName={merchantName}
          saving={saving}
          submitDisabled={hasWallet === false}
          onSave={handleSave}
          onCancel={handleClose}
        />
      )}
    </SlideOverPanel>
  );
}

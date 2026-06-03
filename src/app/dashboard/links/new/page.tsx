'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { createPaymentLink, getMerchantProfile } from '@/lib/firestore-data';
import type { Currency } from '@luxor/contracts';
import {
  PaymentLinkEditor,
  defaultPaymentLinkEditorValues,
  type PaymentLinkEditorValues,
} from '@/components/dashboard/PaymentLinkEditor';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { toast } from 'sonner';

export default function NewPaymentLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [merchantName, setMerchantName] = useState('Luxor Pay');
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  const initialValues = useMemo((): PaymentLinkEditorValues => {
    const name = searchParams.get('name') ?? '';
    const amount = searchParams.get('amount') ?? '';
    const currencyParam = searchParams.get('currency');
    const currency: Currency =
      currencyParam === 'SOL' || currencyParam === 'USDC' ? currencyParam : 'USDC';
    return {
      ...defaultPaymentLinkEditorValues,
      name,
      amount,
      currency,
    };
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setReady(true);
        return;
      }
      try {
        const profile = await getMerchantProfile(user.uid);
        if (profile?.businessName) setMerchantName(profile.businessName);
        setHasWallet(Boolean(profile?.merchantWallet));
        if (!profile?.merchantWallet) {
          toast.error('Add your Solana wallet in Settings before creating links');
        }
      } catch (err) {
        toast.error(getFirestoreErrorMessage(err, 'Could not load merchant profile'));
      } finally {
        setReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

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
      router.push(`/dashboard/links/${link.id}`);
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

  if (!ready) {
    return (
      <p className="text-sm text-[var(--dash-muted)] py-16 text-center">Loading editor…</p>
    );
  }

  return (
    <PaymentLinkEditor
      mode="create"
      initialValues={initialValues}
      merchantName={merchantName}
      saving={saving}
      onSave={handleSave}
      onCancel={() => router.push('/dashboard/links')}
    />
  );
}

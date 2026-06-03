'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { getMerchantProfile, getPaymentLink, updatePaymentLink } from '@/lib/firestore-data';
import type { PaymentLink } from '@luxor/contracts';
import {
  PaymentLinkEditor,
  paymentLinkToEditorValues,
  type PaymentLinkEditorValues,
} from '@/components/dashboard/PaymentLinkEditor';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { toast } from 'sonner';

export default function EditPaymentLinkPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [merchantName, setMerchantName] = useState('Luxor Pay');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const [l, profile] = await Promise.all([
          getPaymentLink(user.uid, id),
          getMerchantProfile(user.uid),
        ]);
        setLink(l);
        if (profile?.businessName) setMerchantName(profile.businessName);
      } catch (err) {
        toast.error(getFirestoreErrorMessage(err, 'Could not load payment link'));
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [id]);

  const handleSave = async (values: PaymentLinkEditorValues) => {
    const user = auth.currentUser;
    if (!user || !id) return;

    const parsed = parseFloat(values.amount);
    if (!values.name.trim() || Number.isNaN(parsed) || parsed <= 0) {
      toast.error('Enter a valid product name and amount');
      return;
    }

    setSaving(true);
    try {
      await updatePaymentLink(user.uid, id, {
        name: values.name.trim(),
        amount: parsed,
        currency: values.currency,
        active: values.active,
        collectEmail: values.collectEmail,
        successMessage: values.successMessage,
        redirectUrl: values.redirectUrl,
      });
      toast.success('Payment link updated');
      router.push(`/dashboard/links/${id}`);
    } catch (err) {
      if (err instanceof Error && err.message === 'PAYMENT_LINK_NOT_FOUND') {
        toast.error('Payment link not found');
      } else {
        toast.error(getFirestoreErrorMessage(err, 'Could not update payment link'));
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-[var(--dash-muted)] py-16 text-center">Loading editor…</p>
    );
  }

  if (!link) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-[var(--dash-muted)]">Payment link not found</p>
        <button
          type="button"
          onClick={() => router.push('/dashboard/links')}
          className="dash-btn-secondary px-4 py-2 text-sm"
        >
          Back to links
        </button>
      </div>
    );
  }

  return (
    <PaymentLinkEditor
      mode="edit"
      initialValues={paymentLinkToEditorValues(link)}
      merchantName={merchantName}
      saving={saving}
      onSave={handleSave}
      onCancel={() => router.push(`/dashboard/links/${id}`)}
    />
  );
}

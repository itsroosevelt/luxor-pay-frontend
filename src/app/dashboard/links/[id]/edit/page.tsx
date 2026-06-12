'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { getMerchantProfile, getPaymentLink } from '@/lib/firestore-data';
import type { PaymentLink } from '@luxor/contracts';
import {
  PaymentLinkEditor,
  paymentLinkToEditorValues,
} from '@/components/dashboard/PaymentLinkEditor';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { toast } from 'sonner';

export default function EditPaymentLinkPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [merchantName, setMerchantName] = useState('Luxor Pay');
  const [loading, setLoading] = useState(true);

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
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div
        role="status"
        className="mx-4 md:mx-6 mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
      >
        Editing payment links is not supported yet. You can view this link or create a new one.
        The API does not expose an update endpoint at this time.
      </div>
      <PaymentLinkEditor
        mode="edit"
        initialValues={paymentLinkToEditorValues(link)}
        merchantName={merchantName}
        submitDisabled
        onSave={() => {}}
        onCancel={() => router.push(`/dashboard/links/${id}`)}
      />
    </div>
  );
}

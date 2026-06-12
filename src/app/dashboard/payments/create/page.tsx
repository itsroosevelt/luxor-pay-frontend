'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { getMerchantProfile, listCustomers } from '@/lib/merchant-data';
import type { Customer } from '@luxor/contracts';
import {
  PaymentCreateForm,
  type PaymentCreateValues,
} from '@/components/dashboard/PaymentCreateForm';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { toast } from 'sonner';

export default function CreatePaymentPage() {
  const router = useRouter();
  const [merchantName, setMerchantName] = useState('Luxor Pay');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setReady(true);
        return;
      }
      try {
        const [profile, customerList] = await Promise.all([
          getMerchantProfile(user.uid),
          listCustomers(user.uid).catch(() => [] as Customer[]),
        ]);
        if (profile?.businessName) setMerchantName(profile.businessName);
        setCustomers(customerList);
      } catch (err) {
        toast.error(getFirestoreErrorMessage(err, 'Could not load payment editor'));
      } finally {
        setReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = async (values: PaymentCreateValues, { keepOpen }: { keepOpen: boolean }) => {
    if (values.paymentMethod === 'email-link') {
      router.push('/dashboard/links/create');
      return;
    }

    setSaving(true);
    try {
      toast.info('Payment creation — backend integration coming soon');
      if (keepOpen) {
        toast.success('Payment saved — form ready for another entry');
        setFormKey((k) => k + 1);
      } else {
        router.push('/dashboard/transactions');
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
    <PaymentCreateForm
      key={`${merchantName}-${formKey}`}
      merchantName={merchantName}
      customers={customers}
      saving={saving}
      onCreate={handleCreate}
      onCancel={() => router.back()}
    />
  );
}

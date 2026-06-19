'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { getMerchantProfile, listCustomers } from '@/lib/merchant-data';
import type { Customer } from '@luxor/contracts';
import {
  SubscriptionCreateEditor,
  type SubscriptionCreateValues,
} from '@/components/dashboard/SubscriptionCreateEditor';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { toast } from 'sonner';

export default function CreateSubscriptionPage() {
  const router = useRouter();
  const [merchantName, setMerchantName] = useState('Luxor Pay');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

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
        toast.error(getFirestoreErrorMessage(err, 'Could not load subscription editor'));
      } finally {
        setReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (values: SubscriptionCreateValues) => {
    const parsed = parseFloat(values.amount);
    if (!values.customerId || Number.isNaN(parsed) || parsed <= 0) {
      toast.error('Select a customer and enter a valid amount');
      return;
    }
    if (!values.walletAddress.trim()) {
      toast.error('Enter the customer Solana wallet address');
      return;
    }

    setSaving(true);
    try {
      toast.info('Subscription creation — backend integration coming soon');
      router.push('/dashboard/billing/subscriptions');
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
    <SubscriptionCreateEditor
      merchantName={merchantName}
      customers={customers}
      saving={saving}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/dashboard/billing/subscriptions')}
    />
  );
}

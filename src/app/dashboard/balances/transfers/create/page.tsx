'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchant-data';
import { listPayments } from '@/lib/payments-api';
import type { Currency, PaymentOrder } from '@luxor/contracts';
import {
  TransferCreateForm,
  type TransferCreateValues,
} from '@/components/dashboard/TransferCreateForm';
import { computeBalanceSummary } from '@/lib/balance-utils';
import { toast } from 'sonner';

const DISPLAY_CURRENCY: Currency = 'USDC';

export default function CreateTransferPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [destinationWallet, setDestinationWallet] = useState('');
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setReady(true);
        return;
      }
      try {
        const [profile, payments] = await Promise.all([
          getMerchantProfile(user.uid),
          user.getIdToken().then((token) => listPayments(token)).catch(() => [] as PaymentOrder[]),
        ]);
        setDestinationWallet(profile?.merchantWallet ?? '');
        setOrders(payments);
      } catch {
        toast.error('Could not load transfer details');
      } finally {
        setReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const balanceSummary = useMemo(
    () => computeBalanceSummary(orders, DISPLAY_CURRENCY),
    [orders]
  );

  const handleTransfer = async (values: TransferCreateValues) => {
    setSaving(true);
    try {
      toast.info(
        `Transfer of ${values.amount} ${values.currency} — pending backend integration`
      );
      router.push('/dashboard/balances');
    } finally {
      setSaving(false);
    }
  };

  if (!ready) {
    return (
      <p className="text-sm text-[var(--dash-muted)] py-16 text-center">Loading transfer…</p>
    );
  }

  return (
    <TransferCreateForm
      availableBalance={balanceSummary.available}
      displayCurrency={DISPLAY_CURRENCY}
      destinationWallet={destinationWallet}
      saving={saving}
      onTransfer={handleTransfer}
      onCancel={() => router.push('/dashboard/balances')}
    />
  );
}

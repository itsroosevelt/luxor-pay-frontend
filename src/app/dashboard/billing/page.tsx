'use client';

import { useEffect, useState } from 'react';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { fetchBillingOverviewApi } from '@/lib/api/billing';
import { formatCurrencyAmount } from '@/lib/format-currency';
import type { Currency } from '@luxor/contracts';
import {
  EmptyState,
  BillingSectionNav,
  BackendNotice,
  DashboardMetricCard,
} from '@/components/dashboard';
import { SettingsPageHeader } from '@/components/dashboard/settings';
import { FileText, Repeat } from 'lucide-react';

export default function BillingOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [notImplemented, setNotImplemented] = useState(false);
  const [mrr, setMrr] = useState<number | null>(null);
  const [subs, setSubs] = useState<number | null>(null);
  const [currency, setCurrency] = useState<Currency>('USDC');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const result = await fetchBillingOverviewApi();
      if (result.ok && result.data) {
        setMrr(result.data.mrr);
        setSubs(result.data.activeSubscriptions);
        if (result.data.currency === 'SOL' || result.data.currency === 'USDC') {
          setCurrency(result.data.currency);
        }
      } else if (!result.ok) {
        setUnavailable(Boolean(result.unavailable));
        setNotImplemented(Boolean(result.notImplemented));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const hasData = mrr !== null && subs !== null;

  return (
    <>
      <SettingsPageHeader
        title="Billing"
        description="Recurring SOL and USDC subscriptions settled to your Solana merchant wallet."
      />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <BillingSectionNav />
        <BackendNotice unavailable={unavailable} notImplemented={notImplemented} />
        {loading ? (
          <p className="text-sm text-[var(--dash-muted)]">Loading billing overview…</p>
        ) : hasData ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <DashboardMetricCard
              label="Monthly recurring"
              value={formatCurrencyAmount(mrr ?? 0, currency)}
              sublabel="On-chain billing"
              icon={Repeat}
            />
            <DashboardMetricCard
              label="Active subscriptions"
              value={String(subs ?? 0)}
              sublabel="Wallet-billed customers"
              href="/dashboard/billing/subscriptions"
              icon={FileText}
            />
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No billing activity yet"
            description="Create subscriptions or invoices once your backend exposes /api/v1/billing. Until then, use payment links for one-time SOL and USDC checkout."
            action={{ label: 'Payment Links', href: '/dashboard/links' }}
          />
        )}
      </div>
    </>
  );
}

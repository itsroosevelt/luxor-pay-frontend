'use client';

import { useEffect, useMemo, useState } from 'react';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { listPayments } from '@/lib/payments-api';
import type { Currency, PaymentOrder } from '@luxor/contracts';
import { formatCurrencyAmount, SUPPORTED_CURRENCIES } from '@/lib/format-currency';
import {
  PageHeader,
  EmptyState,
  ChartPlaceholder,
  DashboardMetricCard,
} from '@/components/dashboard';
import { BarChart3, Receipt } from 'lucide-react';

function sumByCurrency(orders: PaymentOrder[], currency: Currency) {
  return orders
    .filter((o) => o.status === 'confirmed' && o.currency === currency)
    .reduce((s, o) => s + o.amount, 0);
}

export default function PaymentAnalyticsPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        setOrders(await listPayments(token));
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const confirmed = useMemo(() => orders.filter((o) => o.status === 'confirmed'), [orders]);
  const hasData = confirmed.length > 0;

  return (
    <>
      <PageHeader
        title="Payment analytics"
        description="Volume and success metrics from real on-chain payment orders."
      />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        {loading ? (
          <p className="text-sm text-[var(--dash-muted)]">Loading analytics…</p>
        ) : hasData ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <DashboardMetricCard
                label="Confirmed payments"
                value={String(confirmed.length)}
                sublabel="All time"
                icon={Receipt}
              />
              {SUPPORTED_CURRENCIES.map((c) => (
                <DashboardMetricCard
                  key={c}
                  label={`${c} volume`}
                  value={formatCurrencyAmount(sumByCurrency(orders, c), c)}
                  sublabel="Confirmed only"
                  icon={BarChart3}
                />
              ))}
            </div>
            <ChartPlaceholder label="Volume over time" />
          </>
        ) : (
          <EmptyState
            icon={BarChart3}
            title="No analytics yet"
            description="Confirm at least one SOL or USDC payment to see volume breakdowns. Data comes from your backend — no placeholder rows."
            action={{ label: 'Create payment link', href: '/dashboard/links' }}
          />
        )}
      </div>
    </>
  );
}

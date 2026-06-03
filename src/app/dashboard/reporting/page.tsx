'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { listPayments } from '@/lib/payments-api';
import type { PaymentOrder } from '@luxor/contracts';
import {
  confirmedOrders,
  formatCombinedVolume,
  grossVolumeInPeriod,
  ordersInRange,
  startOfDay,
} from '@/lib/dashboard-metrics';
import {
  PageHeader,
  EmptyState,
  ReportingSectionNav,
  DashboardMetricCard,
} from '@/components/dashboard';
import { BarChart3, Receipt, Wallet, ArrowRightLeft } from 'lucide-react';

function monthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

const QUICK_LINKS = [
  {
    href: '/dashboard/analytics',
    label: 'Payment analytics',
    description: 'Volume trends, success rate, and SOL/USDC mix',
    icon: BarChart3,
  },
  {
    href: '/dashboard/transactions',
    label: 'Transactions',
    description: 'Filter, inspect, and export payment orders',
    icon: Receipt,
  },
  {
    href: '/dashboard/balances',
    label: 'Balances',
    description: 'Available SOL and USDC from confirmed payments',
    icon: Wallet,
  },
] as const;

export default function ReportingPage() {
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

  const { start: monthStart, end: monthEnd } = useMemo(() => monthRange(), []);

  const allTimeVolume = useMemo(() => {
    const confirmed = confirmedOrders(orders);
    return confirmed.reduce((sum, o) => sum + o.amount, 0);
  }, [orders]);

  const monthTxCount = useMemo(
    () => ordersInRange(orders, monthStart, monthEnd).length,
    [orders, monthStart, monthEnd]
  );

  const monthVolume = useMemo(
    () => grossVolumeInPeriod(orders, monthStart, monthEnd),
    [orders, monthStart, monthEnd]
  );

  const monthConfirmed = useMemo(
    () => ordersInRange(orders, monthStart, monthEnd, (o) => o.status === 'confirmed').length,
    [orders, monthStart, monthEnd]
  );

  const hasData = orders.length > 0;

  return (
    <>
      <PageHeader
        title="Reports"
        description="Payment volume, SOL/USDC mix, and on-chain confirmation rates."
      />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <ReportingSectionNav />

        {loading ? (
          <p className="text-sm text-[var(--dash-muted)]">Loading reports…</p>
        ) : hasData ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardMetricCard
                label="Total volume"
                value={`$${formatCombinedVolume(allTimeVolume)}`}
                sublabel="All time · confirmed"
                icon={BarChart3}
              />
              <DashboardMetricCard
                label="Transactions this month"
                value={String(monthTxCount)}
                sublabel={monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                icon={Receipt}
              />
              <DashboardMetricCard
                label="Volume this month"
                value={`$${formatCombinedVolume(monthVolume)}`}
                sublabel={`${monthConfirmed} confirmed`}
                icon={ArrowRightLeft}
              />
              <DashboardMetricCard
                label="All-time payments"
                value={String(confirmedOrders(orders).length)}
                sublabel="Confirmed orders"
                icon={Wallet}
              />
            </div>

            <section className="space-y-3">
              <h2 className="text-sm font-medium text-[var(--dash-text)]">Quick links</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {QUICK_LINKS.map(({ href, label, description, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="dash-card p-5 hover:border-[var(--dash-accent)]/30 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-8 h-8 rounded-md bg-[var(--dash-accent-soft)] flex items-center justify-center text-[var(--dash-accent)]">
                        <Icon size={16} />
                      </div>
                      <ArrowRightLeft
                        size={14}
                        className="text-[var(--dash-muted)] group-hover:text-[var(--dash-accent)] transition-colors mt-1"
                      />
                    </div>
                    <p className="text-sm font-medium text-[var(--dash-text)] mt-3">{label}</p>
                    <p className="text-xs text-[var(--dash-muted)] mt-1">{description}</p>
                  </Link>
                ))}
              </div>
            </section>

            <p className="text-sm text-[var(--dash-muted)]">
              Advanced analytics:{' '}
              <Link href="/dashboard/reporting/sigma" className="text-[var(--dash-accent)]">
                Sigma
              </Link>{' '}
              ·{' '}
              <Link
                href="/dashboard/reporting/revenue-recognition"
                className="text-[var(--dash-accent)]"
              >
                Revenue recognition
              </Link>
            </p>
          </>
        ) : (
          <EmptyState
            icon={BarChart3}
            title="No report data yet"
            description="Complete a SOL or USDC payment to populate volume and transaction counts. Metrics are computed from your stored payment orders."
            action={{ label: 'View transactions', href: '/dashboard/transactions' }}
          />
        )}
      </div>
    </>
  );
}

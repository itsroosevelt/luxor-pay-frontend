'use client';

import { CalendarClock } from 'lucide-react';
import { BackendNotice, EmptyState, PaymentsSectionNav } from '@/components/dashboard';
import { SettingsPageHeader } from '@/components/dashboard/settings';

export default function PaymentPlansPage() {
  return (
    <>
      <SettingsPageHeader
        title="Payments"
        description="Set up recurring on-chain charges and installment plans for your customers."
      />
      <div className="p-6 md:px-8 md:pb-8 w-full space-y-6 pb-12">
        <PaymentsSectionNav />
        <BackendNotice notImplemented />
        <EmptyState
          icon={CalendarClock}
          title="No payment plans yet"
          description="Create installment or recurring billing plans settled in SOL or USDC on Solana. Connect your merchant wallet to get started."
          action={{ label: 'Subscriptions', href: '/dashboard/billing/subscriptions' }}
        />
      </div>
    </>
  );
}

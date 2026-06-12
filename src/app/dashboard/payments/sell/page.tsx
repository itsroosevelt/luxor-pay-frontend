'use client';

import { ShoppingCart } from 'lucide-react';
import { BackendNotice, EmptyState, PaymentsSectionNav } from '@/components/dashboard';
import { SettingsPageHeader } from '@/components/dashboard/settings';

export default function SellPage() {
  return (
    <>
      <SettingsPageHeader
        title="Payments"
        description="Accept in-person or online payments with Terminal, payment links, and Solana Pay checkout."
      />
      <div className="p-6 md:px-8 md:pb-8 w-full space-y-6 pb-12">
        <PaymentsSectionNav />
        <BackendNotice notImplemented />
        <EmptyState
          icon={ShoppingCart}
          title="Sell with Solana Pay"
          description="Use Terminal for in-person QR checkout or payment links for online sales. All settlements go to your merchant wallet on Solana."
          action={{ label: 'Go to Terminal', href: '/dashboard/pos' }}
        />
      </div>
    </>
  );
}

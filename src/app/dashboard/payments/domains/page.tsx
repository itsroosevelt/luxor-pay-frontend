'use client';

import { Globe } from 'lucide-react';
import {
  BackendNotice,
  EmptyState,
  PaymentsSectionNav,
} from '@/components/dashboard';
import { SettingsPageHeader } from '@/components/dashboard/settings';
import { toast } from 'sonner';

export default function PaymentMethodDomainsPage() {
  return (
    <>
      <SettingsPageHeader
        title="Payments"
        description="Register domains where Solana Pay checkout and wallet connection are allowed."
      />
      <div className="p-6 md:px-8 md:pb-8 w-full space-y-6 pb-12">
        <PaymentsSectionNav />
        <BackendNotice notImplemented />

        <div className="dash-card p-5 md:p-6 space-y-3">
          <h2 className="text-sm font-semibold text-[var(--dash-text)]">About payment method domains</h2>
          <p className="text-sm text-[var(--dash-muted)] leading-relaxed">
            Payment method domains tell Luxor Pay which websites may embed Solana Pay checkout, load
            wallet adapters, and display QR payment flows. Add each production and staging origin you
            use for hosted checkout or payment links.
          </p>
        </div>

        <EmptyState
          icon={Globe}
          title="No domains added"
          description="Add a domain to enable Solana Pay checkout on your site. Connect your merchant wallet and configure Solana RPC in Settings before going live."
          action={{
            label: 'Add domain',
            onClick: () => toast.message('Domain registration — coming soon'),
          }}
        />
      </div>
    </>
  );
}

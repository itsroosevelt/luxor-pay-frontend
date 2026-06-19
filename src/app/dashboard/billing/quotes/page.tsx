'use client';

import { FileSignature } from 'lucide-react';
import { BillingSectionNav } from '@/components/dashboard';
import { FeatureStubPage } from '@/components/dashboard/FeatureStubPage';

export default function BillingQuotesPage() {
  return (
    <>
      <div className="px-6 md:px-8 pt-6 md:pt-8 max-w-5xl mx-auto">
        <BillingSectionNav />
      </div>
      <FeatureStubPage
        title="Quotes"
        description="Create proposals and quotes for products or services before invoicing."
        icon={FileSignature}
        action={{ label: 'Invoices', href: '/dashboard/billing/invoices' }}
      />
    </>
  );
}

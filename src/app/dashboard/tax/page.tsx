'use client';

import {
  BackendNotice,
  CatalogFlowCrossLinks,
  CatalogFlowSectionNav,
  EmptyState,
  PageHeader,
} from '@/components/dashboard';
import { Percent } from 'lucide-react';

export default function TaxPage() {
  return (
    <>
      <PageHeader
        title="Tax"
        description="Set default tax rates for your product catalog and payment links. Catalog prices inherit these defaults until you connect per-product overrides."
      />
      <div className="p-6 md:px-8 md:pb-8 max-w-6xl mx-auto space-y-6 pb-12">
        <CatalogFlowSectionNav />
        <BackendNotice notImplemented />
        <EmptyState
          icon={Percent}
          title="Tax settings"
          description="Configure default tax behavior for SOL and USDC charges. Rates flow into the product catalog and checkout links once the backend is connected."
          action={{ label: 'Product catalog', href: '/dashboard/products' }}
        />
        <CatalogFlowCrossLinks excludeHref="/dashboard/tax" title="Continue setup" />
      </div>
    </>
  );
}

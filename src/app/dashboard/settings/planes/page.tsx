'use client';

import { useState } from 'react';
import {
  SettingsPageHeader,
  SettingsTabBar,
  SettingsTable,
  type SettingsTableColumn,
} from '@/components/dashboard/settings';
import {
  CreditCard,
  FileText,
  GitBranch,
  Percent,
  Receipt,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';

const PLANES_TABS = [
  { id: 'planes', label: 'Plans' },
  { id: 'facturas', label: 'Invoice history' },
  { id: 'comisiones', label: 'Fees' },
] as const;

type PlanesTabId = (typeof PLANES_TABS)[number]['id'];

interface PlanService {
  id: string;
  name: string;
  description: string;
  pricing: string;
  pricingNote?: string;
  icon: LucideIcon;
}

const PLAN_SERVICES: PlanService[] = [
  {
    id: 'payments',
    name: 'Payments',
    description:
      'Accept SOL and USDC payments on Solana with on-chain confirmation and direct settlement to your wallet.',
    pricing: '1,4 % + 0,05 USDC',
    pricingNote: 'per successful transaction',
    icon: CreditCard,
  },
  {
    id: 'billing',
    name: 'Billing',
    description:
      'Recurring subscriptions, metered billing, and revenue recovery for your merchant.',
    pricing: '0,5 %',
    pricingNote: 'on billed volume',
    icon: Receipt,
  },
  {
    id: 'invoicing',
    name: 'Invoicing',
    description: 'Invoices with Solana Pay payment links and pending charge tracking.',
    pricing: '0,4 %',
    pricingNote: 'per paid invoice',
    icon: FileText,
  },
  {
    id: 'tax',
    name: 'Tax',
    description:
      'Automatic tax calculation by jurisdiction and integration with tax reports.',
    pricing: '0,5 %',
    pricingNote: 'per taxed transaction',
    icon: Percent,
  },
  {
    id: 'workflows',
    name: 'Workflows',
    description:
      'Automate payment flows, webhooks, and post-transaction actions on the Solana network.',
    pricing: 'Included',
    pricingNote: 'on standard plan',
    icon: GitBranch,
  },
];

interface InvoiceRow {
  id: string;
}

const INVOICE_COLUMNS: SettingsTableColumn<InvoiceRow>[] = [
  { key: 'date', header: 'Date', render: () => null },
  { key: 'amount', header: 'Amount', render: () => null },
  { key: 'status', header: 'Status', render: () => null },
  { key: 'invoice', header: 'Invoice', render: () => null },
];

interface CommissionRow {
  id: string;
}

const COMMISSION_COLUMNS: SettingsTableColumn<CommissionRow>[] = [
  { key: 'product', header: 'Producto', render: () => null },
  { key: 'rate', header: 'Rate', render: () => null },
  { key: 'effective', header: 'Effective from', render: () => null },
];

function PlanServiceRow({ service }: { service: PlanService }) {
  const Icon = service.icon;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-5 border-b border-[var(--dash-border)] last:border-b-0">
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-[var(--dash-accent-soft)] flex items-center justify-center text-[var(--dash-accent)] shrink-0">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--dash-text)]">{service.name}</h3>
          <p className="text-sm text-[var(--dash-muted)] mt-1 leading-relaxed">{service.description}</p>
        </div>
      </div>
      <div className="flex flex-col sm:items-end gap-2 shrink-0 sm:text-right">
        <div>
          <p className="text-sm font-semibold text-[var(--dash-text)]">{service.pricing}</p>
          {service.pricingNote && (
            <p className="text-xs text-[var(--dash-muted)] mt-0.5">{service.pricingNote}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => toast.message('Details del plan — coming soon')}
          className="dash-btn-secondary px-3 py-1.5 text-sm whitespace-nowrap"
        >
          View plan details
        </button>
      </div>
    </div>
  );
}

export default function PlanesSettingsPage() {
  const [activeTab, setActiveTab] = useState<PlanesTabId>('planes');

  return (
    <>
      <SettingsPageHeader
        title="Plans and fees"
        description="View active products, processing rates, and Luxor Pay billing."
      />

      <div className="px-6 md:px-8 border-b border-[var(--dash-border)]">
        <SettingsTabBar
          tabs={PLANES_TABS}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as PlanesTabId)}
        />
      </div>

      <div className="p-6 md:p-8 max-w-4xl mx-auto pb-12">
        {activeTab === 'planes' && (
          <div role="tabpanel" id="comm-panel-planes" aria-labelledby="comm-tab-planes">
            <section className="dash-card overflow-hidden">
              {PLAN_SERVICES.map((service) => (
                <PlanServiceRow key={service.id} service={service} />
              ))}
            </section>
          </div>
        )}

        {activeTab === 'facturas' && (
          <div role="tabpanel" id="comm-panel-facturas" aria-labelledby="comm-tab-facturas">
            <section className="dash-card overflow-hidden">
              <SettingsTable
                columns={INVOICE_COLUMNS}
                data={[]}
                rowKey={(row) => row.id}
                showHeadersWhenEmpty
                emptyMessage="No invoices"
                footer={
                  <p className="px-5 py-3 text-xs text-[var(--dash-muted)] border-t border-[var(--dash-border)]">
                    Showing 0 of 0 results
                  </p>
                }
              />
            </section>
          </div>
        )}

        {activeTab === 'comisiones' && (
          <div role="tabpanel" id="comm-panel-comisiones" aria-labelledby="comm-tab-comisiones">
            <section className="dash-card overflow-hidden">
              <SettingsTable
                columns={COMMISSION_COLUMNS}
                data={[]}
                rowKey={(row) => row.id}
                showHeadersWhenEmpty
                emptyMessage="No custom fees configured."
                footer={
                  <p className="px-5 py-3 text-xs text-[var(--dash-muted)] border-t border-[var(--dash-border)]">
                    Showing 0 of 0 results
                  </p>
                }
              />
            </section>
          </div>
        )}
      </div>
    </>
  );
}

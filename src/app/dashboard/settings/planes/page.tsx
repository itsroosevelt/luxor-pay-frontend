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
  { id: 'planes', label: 'Planes' },
  { id: 'facturas', label: 'Historial de facturas' },
  { id: 'comisiones', label: 'Comisiones' },
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
      'Acepta pagos en SOL y USDC en Solana con confirmación on-chain y liquidación directa a tu wallet.',
    pricing: '1,4 % + 0,05 USDC',
    pricingNote: 'por transacción exitosa',
    icon: CreditCard,
  },
  {
    id: 'billing',
    name: 'Billing',
    description:
      'Suscripciones recurrentes, facturación medida y recuperación de ingresos para tu comercio.',
    pricing: '0,5 %',
    pricingNote: 'sobre volumen facturado',
    icon: Receipt,
  },
  {
    id: 'invoicing',
    name: 'Invoicing',
    description: 'Facturas con enlaces de pago Solana Pay y seguimiento de cobros pendientes.',
    pricing: '0,4 %',
    pricingNote: 'por factura pagada',
    icon: FileText,
  },
  {
    id: 'tax',
    name: 'Tax',
    description:
      'Cálculo automático de impuestos según jurisdicción e integración con reportes fiscales.',
    pricing: '0,5 %',
    pricingNote: 'por transacción con impuesto',
    icon: Percent,
  },
  {
    id: 'workflows',
    name: 'Workflows',
    description:
      'Automatiza flujos de pago, webhooks y acciones post-transacción en la red Solana.',
    pricing: 'Incluido',
    pricingNote: 'en plan estándar',
    icon: GitBranch,
  },
];

interface InvoiceRow {
  id: string;
}

const INVOICE_COLUMNS: SettingsTableColumn<InvoiceRow>[] = [
  { key: 'date', header: 'Fecha', render: () => null },
  { key: 'amount', header: 'Importe', render: () => null },
  { key: 'status', header: 'Estado', render: () => null },
  { key: 'invoice', header: 'Factura', render: () => null },
];

interface CommissionRow {
  id: string;
}

const COMMISSION_COLUMNS: SettingsTableColumn<CommissionRow>[] = [
  { key: 'product', header: 'Producto', render: () => null },
  { key: 'rate', header: 'Tarifa', render: () => null },
  { key: 'effective', header: 'Vigente desde', render: () => null },
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
          onClick={() => toast.message('Detalles del plan — próximamente')}
          className="dash-btn-secondary px-3 py-1.5 text-sm whitespace-nowrap"
        >
          Ver datos del plan
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
        title="Planes y comisiones"
        description="Consulta los productos activos, tarifas de procesamiento y facturación de Luxor Pay."
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
                emptyMessage="Sin facturas"
                footer={
                  <p className="px-5 py-3 text-xs text-[var(--dash-muted)] border-t border-[var(--dash-border)]">
                    Viendo 0 de 0 resultados
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
                emptyMessage="No hay comisiones personalizadas configuradas."
                footer={
                  <p className="px-5 py-3 text-xs text-[var(--dash-muted)] border-t border-[var(--dash-border)]">
                    Viendo 0 de 0 resultados
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

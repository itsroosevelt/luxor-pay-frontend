'use client';

import { useState } from 'react';
import { EmptyState } from '@/components/dashboard';
import {
  SettingsPageHeader,
  SettingsSectionRow,
  SettingsTabBar,
} from '@/components/dashboard/settings';
import { cn } from '@/lib/cn';
import { Link2, SlidersHorizontal, Gauge } from 'lucide-react';

const IMPUESTO_TABS = [
  { id: 'empresa', label: 'Información de la empresa' },
  { id: 'integraciones', label: 'Integraciones' },
  { id: 'umbrales', label: 'Umbrales' },
  { id: 'avanzadas', label: 'Opciones avanzadas' },
] as const;

type ImpuestoTabId = (typeof IMPUESTO_TABS)[number]['id'];

const PRODUCT_PRICING_OPTIONS = [
  {
    id: 'general',
    label: 'Bienes y servicios generales',
    description: 'Productos físicos, digitales y servicios estándar sujetos a IVA o impuesto local.',
  },
  {
    id: 'saas',
    label: 'Software como servicio',
    description: 'Suscripciones SaaS y licencias digitales con reglas fiscales específicas.',
  },
  {
    id: 'exempt',
    label: 'Exento o fuera de alcance',
    description: 'Transacciones exentas o no sujetas según la jurisdicción configurada.',
  },
] as const;

function CompanyInfoTab() {
  const [productCategory, setProductCategory] = useState<string>('');

  return (
    <section className="dash-card overflow-hidden">
      <SettingsSectionRow
        label="Información de la empresa"
        description="Datos fiscales utilizados para calcular y registrar impuestos en tus transacciones."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="tax-legal-name" className="text-sm font-medium text-[var(--dash-text)]">
              Nombre legal
            </label>
            <input
              id="tax-legal-name"
              type="text"
              placeholder="Nombre legal de la empresa"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="tax-id" className="text-sm font-medium text-[var(--dash-text)]">
              Identificación fiscal
            </label>
            <input
              id="tax-id"
              type="text"
              placeholder="NIF / CIF / EIN"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-sm font-medium text-[var(--dash-text)]">Sede principal</span>
            <input
              type="text"
              placeholder="País o región de la sede fiscal"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
              aria-label="Sede principal"
            />
          </div>
        </div>
      </SettingsSectionRow>

      <SettingsSectionRow
        label="Producto y precios"
        description="Indica qué tipo de productos vendes para aplicar las reglas fiscales correctas."
      >
        <div className="space-y-3">
          {PRODUCT_PRICING_OPTIONS.map((option) => {
            const selected = productCategory === option.id;
            return (
              <label
                key={option.id}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors',
                  selected
                    ? 'border-[var(--dash-accent)] bg-[var(--dash-accent-soft)]'
                    : 'border-[var(--dash-border)] hover:border-[var(--dash-muted)]'
                )}
              >
                <input
                  type="radio"
                  name="product-category"
                  value={option.id}
                  checked={selected}
                  onChange={() => setProductCategory(option.id)}
                  className="mt-1 accent-[var(--dash-accent)]"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-[var(--dash-text)]">
                    {option.label}
                  </span>
                  <span className="block text-sm text-[var(--dash-muted)] mt-1 leading-relaxed">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </SettingsSectionRow>

      <SettingsSectionRow label="Categoría de producto">
        <input
          type="text"
          placeholder="Selecciona o describe tu categoría principal"
          className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
          aria-label="Categoría de producto"
        />
      </SettingsSectionRow>
    </section>
  );
}

export default function ImpuestoSettingsPage() {
  const [activeTab, setActiveTab] = useState<ImpuestoTabId>('empresa');

  return (
    <>
      <SettingsPageHeader
        title="Impuesto"
        description="Registros fiscales, cálculo automático y documentación de impuestos para tu comercio."
      />

      <div className="px-6 md:px-8 border-b border-[var(--dash-border)] overflow-x-auto">
        <SettingsTabBar
          tabs={IMPUESTO_TABS}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as ImpuestoTabId)}
          className="min-w-max"
        />
      </div>

      <div className="p-6 md:p-8 max-w-4xl mx-auto pb-12">
        {activeTab === 'empresa' && (
          <div role="tabpanel" id="comm-panel-empresa" aria-labelledby="comm-tab-empresa">
            <CompanyInfoTab />
          </div>
        )}

        {activeTab === 'integraciones' && (
          <div role="tabpanel" id="comm-panel-integraciones" aria-labelledby="comm-tab-integraciones">
            <EmptyState
              icon={Link2}
              title="Sin integraciones fiscales"
              description="Conecta proveedores de cálculo de impuestos y plataformas de cumplimiento normativo."
            />
          </div>
        )}

        {activeTab === 'umbrales' && (
          <div role="tabpanel" id="comm-panel-umbrales" aria-labelledby="comm-tab-umbrales">
            <EmptyState
              icon={Gauge}
              title="Sin umbrales configurados"
              description="Define límites de registro fiscal y avisos cuando se superen volúmenes de venta."
            />
          </div>
        )}

        {activeTab === 'avanzadas' && (
          <div role="tabpanel" id="comm-panel-avanzadas" aria-labelledby="comm-tab-avanzadas">
            <EmptyState
              icon={SlidersHorizontal}
              title="Opciones avanzadas"
              description="Configura reglas personalizadas, exenciones y comportamiento de redondeo fiscal."
            />
          </div>
        )}
      </div>
    </>
  );
}

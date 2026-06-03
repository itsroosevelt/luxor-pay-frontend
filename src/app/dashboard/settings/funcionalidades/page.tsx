'use client';

import { useState } from 'react';
import { EmptyState } from '@/components/dashboard';
import {
  SettingsPageHeader,
  SettingsSectionRow,
  SettingsTabBar,
} from '@/components/dashboard/settings';
import { cn } from '@/lib/cn';
import { FlaskConical } from 'lucide-react';
import { toast } from 'sonner';

const FUNCIONALIDADES_TABS = [
  { id: 'productos', label: 'Productos' },
  { id: 'vista-previa', label: 'Vista previa' },
] as const;

type FuncionalidadesTabId = (typeof FUNCIONALIDADES_TABS)[number]['id'];

const FEATURE_FLAGS = [
  {
    id: 'solana-pay-links',
    name: 'Enlaces Solana Pay mejorados',
    description: 'Metadatos enriquecidos y expiración configurable en enlaces de pago.',
    enabled: false,
  },
  {
    id: 'metered-billing',
    name: 'Facturación medida',
    description: 'Cobra según uso on-chain con agregación automática de eventos.',
    enabled: false,
  },
  {
    id: 'workflow-builder',
    name: 'Constructor de workflows',
    description: 'Automatiza acciones post-pago con reglas visuales.',
    enabled: false,
  },
] as const;

function ProductosTab() {
  return (
    <section className="dash-card overflow-hidden">
      {FEATURE_FLAGS.map((feature) => (
        <SettingsSectionRow key={feature.id} label={feature.name} description={feature.description}>
          <button
            type="button"
            role="switch"
            aria-checked={feature.enabled}
            onClick={() => toast.message(`${feature.name} — próximamente`)}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors',
              feature.enabled ? 'bg-[var(--dash-accent)]' : 'bg-[var(--dash-border)]'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform',
                feature.enabled ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </SettingsSectionRow>
      ))}
    </section>
  );
}

export default function FuncionalidadesSettingsPage() {
  const [activeTab, setActiveTab] = useState<FuncionalidadesTabId>('productos');

  return (
    <>
      <SettingsPageHeader
        title="Funcionalidades y versiones preliminares"
        description="Activa productos nuevos y accede a funciones en vista previa antes del lanzamiento general."
      />

      <div className="px-6 md:px-8 border-b border-[var(--dash-border)]">
        <SettingsTabBar
          tabs={FUNCIONALIDADES_TABS}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as FuncionalidadesTabId)}
        />
      </div>

      <div className="p-6 md:p-8 max-w-4xl mx-auto pb-12">
        {activeTab === 'productos' && (
          <div role="tabpanel" id="comm-panel-productos" aria-labelledby="comm-tab-productos">
            <ProductosTab />
          </div>
        )}

        {activeTab === 'vista-previa' && (
          <div role="tabpanel" id="comm-panel-vista-previa" aria-labelledby="comm-tab-vista-previa">
            <EmptyState
              icon={FlaskConical}
              title="Sin funciones en vista previa"
              description="Cuando Luxor Pay publique betas, podrás activarlas aquí antes del lanzamiento general."
            />
          </div>
        )}
      </div>
    </>
  );
}

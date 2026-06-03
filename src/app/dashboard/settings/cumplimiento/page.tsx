'use client';

import { useState } from 'react';
import { EmptyState } from '@/components/dashboard';
import {
  SettingsPageHeader,
  SettingsSectionRow,
  SettingsTabBar,
  SettingsTable,
  type SettingsTableColumn,
} from '@/components/dashboard/settings';
import { FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';

const CUMPLIMIENTO_TABS = [
  { id: 'verificacion', label: 'Verificación' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'requisitos', label: 'Requisitos' },
] as const;

type CumplimientoTabId = (typeof CUMPLIMIENTO_TABS)[number]['id'];

interface DocumentRow {
  id: string;
}

const DOCUMENT_COLUMNS: SettingsTableColumn<DocumentRow>[] = [
  { key: 'type', header: 'Tipo', render: () => null },
  { key: 'status', header: 'Estado', render: () => null },
  { key: 'updated', header: 'Actualizado', render: () => null },
];

function VerificacionTab() {
  return (
    <section className="dash-card overflow-hidden">
      <SettingsSectionRow
        label="Estado de verificación"
        description="Completa la verificación de identidad para habilitar todas las capacidades de pago."
      >
        <div className="space-y-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border border-[var(--dash-border)] bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)]">
            No iniciada
          </span>
          <p className="text-sm text-[var(--dash-muted)] leading-relaxed">
            Aún no has enviado información para verificar tu cuenta de comercio.
          </p>
          <button
            type="button"
            onClick={() => toast.message('Verificación — próximamente')}
            className="dash-btn-primary px-4 py-2 text-sm"
          >
            Iniciar verificación
          </button>
        </div>
      </SettingsSectionRow>

      <SettingsSectionRow label="Capacidades">
        <ul className="space-y-2 text-sm text-[var(--dash-muted)]">
          <li>Pagos en SOL y USDC — pendiente de verificación</li>
          <li>Límites elevados — no disponible</li>
          <li>Pagos internacionales — no disponible</li>
        </ul>
      </SettingsSectionRow>
    </section>
  );
}

export default function CumplimientoSettingsPage() {
  const [activeTab, setActiveTab] = useState<CumplimientoTabId>('verificacion');

  return (
    <>
      <SettingsPageHeader
        title="Cumplimiento y documentos"
        description="Verificación de identidad, documentos y requisitos regulatorios para tu comercio."
      />

      <div className="px-6 md:px-8 border-b border-[var(--dash-border)]">
        <SettingsTabBar
          tabs={CUMPLIMIENTO_TABS}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as CumplimientoTabId)}
        />
      </div>

      <div className="p-6 md:p-8 max-w-4xl mx-auto pb-12">
        {activeTab === 'verificacion' && (
          <div role="tabpanel" id="comm-panel-verificacion" aria-labelledby="comm-tab-verificacion">
            <VerificacionTab />
          </div>
        )}

        {activeTab === 'documentos' && (
          <div role="tabpanel" id="comm-panel-documentos" aria-labelledby="comm-tab-documentos">
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => toast.message('Subir documento — próximamente')}
                  className="dash-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-sm"
                >
                  <Upload size={16} />
                  Subir documento
                </button>
              </div>
              <section className="dash-card overflow-hidden">
                <SettingsTable
                  columns={DOCUMENT_COLUMNS}
                  data={[]}
                  rowKey={(row) => row.id}
                  showHeadersWhenEmpty
                  emptyMessage="No hay documentos cargados."
                />
              </section>
            </div>
          </div>
        )}

        {activeTab === 'requisitos' && (
          <div role="tabpanel" id="comm-panel-requisitos" aria-labelledby="comm-tab-requisitos">
            <EmptyState
              icon={FileText}
              title="Sin requisitos pendientes"
              description="Los requisitos regulatorios específicos de tu jurisdicción aparecerán aquí cuando apliquen."
            />
          </div>
        )}
      </div>
    </>
  );
}

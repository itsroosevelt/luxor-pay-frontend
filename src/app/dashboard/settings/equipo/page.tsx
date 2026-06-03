'use client';

import { useState } from 'react';
import { EmptyState } from '@/components/dashboard';
import { FilterChip, FilterRow } from '@/components/dashboard/FilterRow';
import {
  SettingsPageHeader,
  SettingsTabBar,
  SettingsTable,
  type SettingsTableColumn,
} from '@/components/dashboard/settings';
import { cn } from '@/lib/cn';
import {
  Download,
  Fingerprint,
  History,
  KeyRound,
  Plus,
  Shield,
  UserCog,
  Users,
  UsersRound,
} from 'lucide-react';
import { toast } from 'sonner';

const EQUIPO_TABS = [
  { id: 'equipo', label: 'Equipo' },
  { id: 'grupos', label: 'Grupos' },
  { id: 'sso', label: 'Inicio de sesión único' },
  { id: 'scim', label: 'SCIM' },
  { id: '2fa', label: 'Autenticación en dos pasos' },
  { id: 'historial', label: 'Historial de seguridad' },
  { id: 'acceso', label: 'Solicitudes de acceso' },
  { id: 'mcp', label: 'Acceso MCP' },
] as const;

type EquipoTabId = (typeof EQUIPO_TABS)[number]['id'];

type MemberFilter = 'todos' | 'activos' | 'pendientes' | 'inactivos';

const MEMBER_FILTERS: { id: MemberFilter; label: string; count: number }[] = [
  { id: 'todos', label: 'Todos', count: 0 },
  { id: 'activos', label: 'Activos', count: 0 },
  { id: 'pendientes', label: 'Pendientes', count: 0 },
  { id: 'inactivos', label: 'Inactivos', count: 0 },
];

interface TeamMember {
  id: string;
}

const MEMBER_COLUMNS: SettingsTableColumn<TeamMember>[] = [
  { key: 'name', header: 'Nombre', render: () => null },
  { key: 'email', header: 'Email', render: () => null },
  { key: 'roles', header: 'Funciones', render: () => null },
  { key: 'lastLogin', header: 'Último inicio de sesión', render: () => null },
];

const EMPTY_TAB_CONFIG: Partial<
  Record<EquipoTabId, { icon: typeof Users; title: string; description: string }>
> = {
  grupos: {
    icon: UsersRound,
    title: 'Sin grupos configurados',
    description: 'Organiza miembros del equipo en grupos para gestionar permisos de forma conjunta.',
  },
  sso: {
    icon: KeyRound,
    title: 'Inicio de sesión único no configurado',
    description: 'Permite que tu equipo acceda con el proveedor de identidad de tu organización.',
  },
  scim: {
    icon: UserCog,
    title: 'SCIM no habilitado',
    description: 'Sincroniza usuarios y grupos automáticamente desde tu directorio corporativo.',
  },
  '2fa': {
    icon: Shield,
    title: 'Autenticación en dos pasos',
    description: 'Configura políticas de 2FA para proteger el acceso a tu cuenta de comercio.',
  },
  historial: {
    icon: History,
    title: 'Sin eventos de seguridad',
    description: 'Los inicios de sesión, cambios de permisos y actividad de API aparecerán aquí.',
  },
  acceso: {
    icon: Fingerprint,
    title: 'Sin solicitudes de acceso',
    description: 'Las solicitudes pendientes de nuevos miembros se mostrarán en esta sección.',
  },
  mcp: {
    icon: KeyRound,
    title: 'Acceso MCP no configurado',
    description: 'Gestiona tokens de acceso para integraciones MCP con Luxor Pay.',
  },
};

function EquipoTabPanel() {
  const [memberFilter, setMemberFilter] = useState<MemberFilter>('todos');

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {MEMBER_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setMemberFilter(filter.id)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-colors',
                memberFilter === filter.id
                  ? 'border-[var(--dash-accent)] bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]'
                  : 'border-[var(--dash-border)] bg-[var(--dash-surface-elevated)] text-[var(--dash-text)] hover:bg-[rgba(255,255,255,0.06)]'
              )}
            >
              {filter.label}
              <span className="text-[var(--dash-muted)]">{filter.count}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterRow>
            <FilterChip label="Función" onClick={() => toast.message('Filtro — próximamente')} />
            <FilterChip label="Estado" onClick={() => toast.message('Filtro — próximamente')} />
          </FilterRow>
          <button
            type="button"
            onClick={() => toast.message('Exportar — próximamente')}
            className="dash-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-sm"
          >
            <Download size={16} />
            Exportar
          </button>
          <button
            type="button"
            onClick={() => toast.message('Agregar miembro — próximamente')}
            className="dash-btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-sm"
          >
            <Plus size={16} />
            Agregar miembro
          </button>
        </div>
      </div>

      <section className="dash-card overflow-hidden">
        <SettingsTable
          columns={MEMBER_COLUMNS}
          data={[]}
          rowKey={(row) => row.id}
          showHeadersWhenEmpty
          emptyMessage="No hay miembros en el equipo."
          footer={
            <p className="px-5 py-3 text-xs text-[var(--dash-muted)] border-t border-[var(--dash-border)]">
              Viendo 0 de 0 resultados
            </p>
          }
        />
      </section>
    </div>
  );
}

export default function EquipoSettingsPage() {
  const [activeTab, setActiveTab] = useState<EquipoTabId>('equipo');

  const emptyConfig = EMPTY_TAB_CONFIG[activeTab];

  return (
    <>
      <SettingsPageHeader
        title="Equipo y seguridad"
        description="Invita colaboradores, asigna roles y revisa la actividad de inicio de sesión y API."
      />

      <div className="px-6 md:px-8 border-b border-[var(--dash-border)] overflow-x-auto">
        <SettingsTabBar
          tabs={EQUIPO_TABS}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as EquipoTabId)}
          className="min-w-max border-b-0"
        />
      </div>

      <div className="p-6 md:p-8 max-w-5xl mx-auto pb-12">
        {activeTab === 'equipo' ? (
          <div role="tabpanel" id="comm-panel-equipo" aria-labelledby="comm-tab-equipo">
            <EquipoTabPanel />
          </div>
        ) : emptyConfig ? (
          <div role="tabpanel" id={`comm-panel-${activeTab}`} aria-labelledby={`comm-tab-${activeTab}`}>
            <EmptyState
              icon={emptyConfig.icon}
              title={emptyConfig.title}
              description={emptyConfig.description}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}

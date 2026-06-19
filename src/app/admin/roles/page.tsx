'use client';

import { PageHeader } from '@/components/dashboard/PageHeader';
import { DetailSection } from '@/components/dashboard/DetailSection';
import { AdminPreviewNotice } from '@/components/admin/AdminPreviewNotice';
import {
  PERMISSION_GROUPS,
  ROLE_PERMISSIONS,
  ROLE_LABELS,
  type AdminTeamRole,
} from '@/lib/admin-users';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';

const ROLES: AdminTeamRole[] = ['owner', 'admin', 'support', 'viewer'];

export default function AdminRolesPage() {
  return (
    <div>
      <PageHeader
        title="Roles y permisos"
        description="Matriz de permisos por rol del equipo de administración (referencia — asignación en Equipo y seguridad)."
      />

      <div className="px-4 sm:px-6 md:px-8 pb-8 space-y-6 max-w-5xl mx-auto">
        <AdminPreviewNotice />
        <DetailSection
          title="Roles disponibles"
          description="Cada miembro del equipo admin tiene un rol que determina sus capacidades."
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ROLES.map((role) => (
              <div
                key={role}
                className="p-4 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-elevated)]"
              >
                <p className="text-sm font-semibold">{ROLE_LABELS[role]}</p>
                <p className="text-xs text-[var(--dash-muted)] mt-1">
                  {role === 'owner' && 'Acceso total incluyendo seguridad'}
                  {role === 'admin' && 'Configuración operativa sin gestión de equipo'}
                  {role === 'support' && 'Consulta y soporte a comercios'}
                  {role === 'viewer' && 'Solo lectura de métricas y listados'}
                </p>
              </div>
            ))}
          </div>
        </DetailSection>

        <DetailSection
          title="Matriz de permisos"
          description="Grupos de permisos y acceso por rol (stub — se sincronizará con backend)."
        >
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-[var(--dash-border)]">
                  <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
                    Grupo
                  </th>
                  {ROLES.map((role) => (
                    <th
                      key={role}
                      className="py-3 px-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]"
                    >
                      {ROLE_LABELS[role]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSION_GROUPS.map((group) => (
                  <tr key={group.id} className="border-b border-[var(--dash-border)] last:border-0">
                    <td className="py-3.5 pr-4">
                      <p className="font-medium text-[var(--dash-text)]">{group.label}</p>
                      <ul className="mt-1 space-y-0.5">
                        {group.permissions.map((perm) => (
                          <li key={perm} className="text-xs text-[var(--dash-muted)]">
                            {perm}
                          </li>
                        ))}
                      </ul>
                    </td>
                    {ROLES.map((role) => {
                      const allowed = ROLE_PERMISSIONS[role][group.id];
                      return (
                        <td key={role} className="py-3.5 px-3 text-center">
                          <span
                            className={cn(
                              'inline-flex items-center justify-center w-7 h-7 rounded-full',
                              allowed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/10 text-red-400/70'
                            )}
                          >
                            {allowed ? <Check size={14} /> : <X size={14} />}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DetailSection>
      </div>
    </div>
  );
}

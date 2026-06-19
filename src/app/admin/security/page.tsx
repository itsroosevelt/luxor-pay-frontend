'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/dashboard/DataTable';
import { DetailSection } from '@/components/dashboard/DetailSection';
import { AdminPreviewNotice } from '@/components/admin/AdminPreviewNotice';
import {
  loadAdminTeam,
  loadSecurityLog,
  upsertAdminTeamMember,
  ROLE_LABELS,
  type AdminTeamMember,
  type AdminTeamRole,
  type SecurityLogEntry,
} from '@/lib/admin-users';
import { Plus, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

const LOG_TYPE_LABELS: Record<SecurityLogEntry['type'], string> = {
  login: 'Inicio de sesión',
  logout: 'Cierre de sesión',
  config_change: 'Cambio de config',
  permission_change: 'Permisos',
  session_revoked: 'Sesión revocada',
};

const EMPTY_FORM = {
  id: '',
  name: '',
  email: '',
  role: 'admin' as AdminTeamRole,
  status: 'active' as 'active' | 'inactive',
};

export default function AdminSecurityPage() {
  const [team, setTeam] = useState<AdminTeamMember[]>(() => loadAdminTeam());
  const [log, setLog] = useState<SecurityLogEntry[]>(() => loadSecurityLog());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const refresh = () => {
    setTeam(loadAdminTeam());
    setLog(loadSecurityLog());
  };

  const teamColumns: DataTableColumn<AdminTeamMember>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Nombre',
        render: (row) => <span className="font-medium">{row.name}</span>,
      },
      {
        key: 'email',
        header: 'Email',
        render: (row) => <span className="text-[var(--dash-muted)]">{row.email}</span>,
      },
      {
        key: 'role',
        header: 'Rol',
        render: (row) => (
          <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-[var(--dash-surface-elevated)]">
            {ROLE_LABELS[row.role]}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Estado',
        render: (row) => (
          <span
            className={cn(
              'text-xs font-medium',
              row.status === 'active' ? 'text-emerald-400' : 'text-[var(--dash-muted)]'
            )}
          >
            {row.status === 'active' ? 'Activo' : 'Inactivo'}
          </span>
        ),
      },
      {
        key: 'lastLogin',
        header: 'Último acceso',
        render: (row) => (
          <span className="text-[var(--dash-muted)] text-xs whitespace-nowrap">
            {row.lastLoginAt ? formatDateTime(row.lastLoginAt) : '—'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        className: 'w-20',
        render: (row) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setForm({
                id: row.id,
                name: row.name,
                email: row.email,
                role: row.role,
                status: row.status,
              });
              setShowForm(true);
            }}
            className="text-xs text-[var(--dash-accent)] hover:underline"
          >
            Editar
          </button>
        ),
      },
    ],
    []
  );

  const logColumns: DataTableColumn<SecurityLogEntry>[] = useMemo(
    () => [
      {
        key: 'type',
        header: 'Evento',
        render: (row) => (
          <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-[var(--dash-surface-elevated)]">
            {LOG_TYPE_LABELS[row.type]}
          </span>
        ),
      },
      {
        key: 'email',
        header: 'Usuario',
        render: (row) => <span className="text-[var(--dash-muted)]">{row.email}</span>,
      },
      {
        key: 'description',
        header: 'Descripción',
        render: (row) => <span>{row.description}</span>,
      },
      {
        key: 'ip',
        header: 'IP',
        render: (row) => (
          <span className="font-mono text-xs text-[var(--dash-muted)]">{row.ip ?? '—'}</span>
        ),
      },
      {
        key: 'timestamp',
        header: 'Fecha',
        render: (row) => (
          <span className="text-[var(--dash-muted)] text-xs whitespace-nowrap">
            {formatDateTime(row.timestamp)}
          </span>
        ),
      },
    ],
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Nombre y email son obligatorios');
      return;
    }

    upsertAdminTeamMember({
      id: form.id || undefined,
      name: form.name,
      email: form.email,
      role: form.role,
      status: form.status,
    });

    toast.success(form.id ? 'Miembro actualizado' : 'Miembro añadido');
    setForm(EMPTY_FORM);
    setShowForm(false);
    refresh();
  };

  return (
    <div>
      <PageHeader
        title="Equipo y seguridad"
        description="Miembros del equipo de administración, sesiones e historial de accesos."
        actions={
          <button
            type="button"
            onClick={() => {
              setForm(EMPTY_FORM);
              setShowForm((v) => !v);
            }}
            className="dash-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2"
          >
            <Plus size={16} />
            {showForm ? 'Cancelar' : 'Añadir miembro'}
          </button>
        }
      />

      <div className="px-4 sm:px-6 md:px-8 pb-8 space-y-6 max-w-6xl mx-auto">
        <AdminPreviewNotice />
        {showForm && (
          <DetailSection
            title={form.id ? 'Editar miembro' : 'Nuevo miembro del equipo'}
            description="Los miembros se guardan en localStorage (luxor_admin_users)."
          >
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
              <div>
                <label htmlFor="team-name" className="block text-sm font-medium mb-1.5">
                  Nombre
                </label>
                <input
                  id="team-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="dash-input w-full px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="team-email" className="block text-sm font-medium mb-1.5">
                  Email
                </label>
                <input
                  id="team-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="dash-input w-full px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="team-role" className="block text-sm font-medium mb-1.5">
                    Rol
                  </label>
                  <select
                    id="team-role"
                    value={form.role}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, role: e.target.value as AdminTeamRole }))
                    }
                    className="dash-input w-full px-4 py-2.5 text-sm"
                  >
                    <option value="owner">Propietario</option>
                    <option value="admin">Administrador</option>
                    <option value="support">Soporte</option>
                    <option value="viewer">Solo lectura</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="team-status" className="block text-sm font-medium mb-1.5">
                    Estado
                  </label>
                  <select
                    id="team-status"
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        status: e.target.value as 'active' | 'inactive',
                      }))
                    }
                    className="dash-input w-full px-4 py-2.5 text-sm"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="dash-btn-primary px-5 py-2 text-sm">
                {form.id ? 'Guardar cambios' : 'Añadir miembro'}
              </button>
            </form>
          </DetailSection>
        )}

        <DetailSection
          title="Equipo de administración"
          description={`${team.length} miembro(s) con acceso al panel.`}
          action={
            <span className="text-xs text-[var(--dash-muted)] inline-flex items-center gap-1">
              <Shield size={12} />
              Persistido en localStorage
            </span>
          }
        >
          <DataTable
            columns={teamColumns}
            data={team}
            rowKey={(row) => row.id}
            loading={false}
            loadingMessage="Cargando equipo…"
          />
        </DetailSection>

        <DetailSection
          title="Historial de sesiones y autenticación"
          description="Registro de accesos y cambios de seguridad (demo en localStorage)."
        >
          <DataTable
            columns={logColumns}
            data={log}
            rowKey={(row) => row.id}
            loading={false}
            loadingMessage="Cargando historial…"
          />
        </DetailSection>
      </div>
    </div>
  );
}

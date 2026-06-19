'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/dashboard/DataTable';
import { DetailSection } from '@/components/dashboard/DetailSection';
import { scanLocalMerchants, type AdminMerchantRow } from '@/lib/admin-merchants';
import {
  loadPlatformUsers,
  upsertPlatformUser,
  ROLE_LABELS,
  type PlatformUser,
  type PlatformUserRole,
} from '@/lib/admin-users';
import { Plus, Pencil, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

type CombinedRow = {
  id: string;
  source: 'merchant' | 'platform';
  name: string;
  email: string;
  role: string;
  wallet: string;
  status: string;
  createdAt: string;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function merchantToRow(m: AdminMerchantRow): CombinedRow {
  return {
    id: m.id,
    source: 'merchant',
    name: m.businessName,
    email: m.email,
    role: 'Comercio',
    wallet: m.hasWallet ? 'Configurada' : 'Pendiente',
    status: 'Activo',
    createdAt: m.createdAt,
  };
}

function platformUserToRow(u: PlatformUser): CombinedRow {
  return {
    id: u.id,
    source: 'platform',
    name: u.name,
    email: u.email,
    role: ROLE_LABELS[u.role],
    wallet: u.walletAddress ? `${u.walletAddress.slice(0, 6)}…${u.walletAddress.slice(-4)}` : '—',
    status: u.status === 'active' ? 'Activo' : 'Inactivo',
    createdAt: u.createdAt,
  };
}

const EMPTY_FORM = {
  id: '',
  name: '',
  email: '',
  role: 'merchant' as PlatformUserRole,
  walletAddress: '',
  status: 'active' as 'active' | 'inactive',
};

function loadCombinedRows(): CombinedRow[] {
  const merchants = scanLocalMerchants().map(merchantToRow);
  const platform = loadPlatformUsers().map(platformUserToRow);
  return [...platform, ...merchants];
}

export default function AdminUsersPage() {
  const [rows, setRows] = useState<CombinedRow[]>(loadCombinedRows);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const refresh = () => {
    setRows(loadCombinedRows());
  };

  const columns: DataTableColumn<CombinedRow>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Nombre / Negocio',
        render: (row) => (
          <span className="font-medium">{row.name}</span>
        ),
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
            {row.role}
          </span>
        ),
      },
      {
        key: 'wallet',
        header: 'Wallet',
        render: (row) => (
          <span
            className={cn(
              'text-xs',
              row.wallet === 'Configurada' ? 'text-emerald-400 font-medium' : 'text-[var(--dash-muted)]'
            )}
          >
            {row.wallet}
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
              row.status === 'Activo' ? 'text-emerald-400' : 'text-[var(--dash-muted)]'
            )}
          >
            {row.status}
          </span>
        ),
      },
      {
        key: 'createdAt',
        header: 'Registro',
        render: (row) => (
          <span className="text-[var(--dash-muted)] whitespace-nowrap">
            {formatDate(row.createdAt)}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        className: 'w-24',
        render: (row) =>
          row.source === 'platform' ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const user = loadPlatformUsers().find((u) => u.id === row.id);
                if (!user) return;
                setForm({
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  walletAddress: user.walletAddress ?? '',
                  status: user.status,
                });
                setShowForm(true);
              }}
              className="text-xs text-[var(--dash-accent)] hover:underline"
            >
              Editar
            </button>
          ) : (
            <span className="text-xs text-[var(--dash-muted)]">Perfil local</span>
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

    upsertPlatformUser({
      id: form.id || undefined,
      name: form.name,
      email: form.email,
      role: form.role,
      status: form.status,
      walletAddress: form.walletAddress || undefined,
    });

    toast.success(form.id ? 'Usuario actualizado' : 'Usuario creado');
    setForm(EMPTY_FORM);
    setShowForm(false);
    refresh();
  };

  const handleDeactivate = () => {
    if (!form.id) return;
    upsertPlatformUser({
      id: form.id,
      name: form.name,
      email: form.email,
      role: form.role,
      status: 'inactive',
      walletAddress: form.walletAddress || undefined,
    });
    toast.success('Usuario desactivado');
    setForm(EMPTY_FORM);
    setShowForm(false);
    refresh();
  };

  return (
    <div>
      <PageHeader
        title="Comercios y usuarios"
        description="Gestiona cuentas merchant detectadas localmente y usuarios de plataforma (demo en localStorage)."
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
            {showForm ? 'Cancelar' : 'Nuevo usuario'}
          </button>
        }
      />

      <div className="px-4 sm:px-6 md:px-8 pb-8 space-y-6 max-w-6xl mx-auto">
        {showForm && (
          <DetailSection
            title={form.id ? 'Editar usuario' : 'Crear usuario'}
            description="Los usuarios de plataforma se guardan en localStorage. Los comercios provienen de perfiles merchant locales."
          >
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
              <div>
                <label htmlFor="user-name" className="block text-sm font-medium mb-1.5">
                  Nombre
                </label>
                <input
                  id="user-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="dash-input w-full px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="user-email" className="block text-sm font-medium mb-1.5">
                  Email
                </label>
                <input
                  id="user-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="dash-input w-full px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="user-role" className="block text-sm font-medium mb-1.5">
                    Rol
                  </label>
                  <select
                    id="user-role"
                    value={form.role}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, role: e.target.value as PlatformUserRole }))
                    }
                    className="dash-input w-full px-4 py-2.5 text-sm"
                  >
                    <option value="merchant">Comercio</option>
                    <option value="admin">Administrador</option>
                    <option value="support">Soporte</option>
                    <option value="viewer">Solo lectura</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="user-status" className="block text-sm font-medium mb-1.5">
                    Estado
                  </label>
                  <select
                    id="user-status"
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
              <div>
                <label htmlFor="user-wallet" className="block text-sm font-medium mb-1.5">
                  Wallet (opcional)
                </label>
                <input
                  id="user-wallet"
                  value={form.walletAddress}
                  onChange={(e) => setForm((f) => ({ ...f, walletAddress: e.target.value }))}
                  placeholder="Dirección Solana"
                  className="dash-input w-full px-4 py-2.5 text-sm font-mono"
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button type="submit" className="dash-btn-primary px-5 py-2 text-sm">
                  {form.id ? 'Guardar cambios' : 'Crear usuario'}
                </button>
                {form.id && form.status === 'active' && (
                  <button
                    type="button"
                    onClick={handleDeactivate}
                    className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-1.5 text-red-400"
                  >
                    <UserX size={14} />
                    Desactivar
                  </button>
                )}
              </div>
            </form>
          </DetailSection>
        )}

        <DetailSection
          title="Listado de cuentas"
          description={`${rows.length} cuenta(s) — comercios locales + usuarios de plataforma.`}
          action={
            <span className="text-xs text-[var(--dash-muted)] inline-flex items-center gap-1">
              <Pencil size={12} />
              Editable solo usuarios de plataforma
            </span>
          }
        >
          {rows.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--dash-text)] font-medium">No hay cuentas registradas</p>
              <p className="text-sm text-[var(--dash-muted)] mt-2">
                Crea un usuario de plataforma o inicia sesión como comercio para ver perfiles locales.
              </p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              rowKey={(row) => `${row.source}:${row.id}`}
              loading={false}
            />
          )}
        </DetailSection>
      </div>
    </div>
  );
}

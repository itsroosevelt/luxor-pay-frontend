'use client';

import { useState } from 'react';
import {
  MerchantWalletSection,
  SettingsPageHeader,
  SettingsRow,
  SettingsSection,
  SettingsTable,
} from '@/components/dashboard/settings';
import { LANGUAGE_OPTIONS } from '@/lib/dashboard/personal-settings-mock';
import type {
  AccountRow,
  PasskeyRow,
  SessionRow,
  TwoFactorMethod,
} from '@/lib/dashboard/personal-settings-mock';
import { dashStatusBadges } from '@/lib/dashboard/dashboard-styles';
import { Globe, KeyRound, Plus } from 'lucide-react';
import { toast } from 'sonner';

function SettingsLinkButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick ?? (() => toast.message('Disponible próximamente'))}
      className="text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
    >
      {children}
    </button>
  );
}

function SettingsOutlineButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick ?? (() => toast.message('Disponible próximamente'))}
      className="dash-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-sm"
    >
      {children}
    </button>
  );
}

export default function SettingsProfilePage() {
  const [language, setLanguage] = useState('auto');
  const [savingLanguage, setSavingLanguage] = useState(false);

  const handleSaveLanguage = async () => {
    setSavingLanguage(true);
    await new Promise((r) => setTimeout(r, 400));
    toast.success('Preferencia de idioma guardada');
    setSavingLanguage(false);
  };

  return (
    <>
      <SettingsPageHeader
        title={
          <span className="inline-flex flex-wrap items-center gap-2.5">
            Datos personales
            <span className={dashStatusBadges.neutral}>Entorno global</span>
          </span>
        }
        description="Información de contacto, contraseña, métodos de autenticación y sesiones activas."
      />

      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6 pb-12">
        <SettingsSection
          title="Usuario"
          action={<SettingsOutlineButton>Editar</SettingsOutlineButton>}
        >
          <SettingsRow label="Nombre">
            <span className="text-[var(--dash-muted)]">Sin configurar</span>
          </SettingsRow>
          <SettingsRow label="Contraseña">
            <span className="text-[var(--dash-muted)]">No configurada</span>
          </SettingsRow>
          <SettingsRow label="Correo electrónico">
            <span className="text-[var(--dash-muted)]">Sin configurar</span>
          </SettingsRow>
          <SettingsRow
            label="Correo de respaldo"
            action={<SettingsLinkButton>Agregar</SettingsLinkButton>}
          >
            <span className="text-[var(--dash-muted)]">No configurado</span>
          </SettingsRow>
          <SettingsRow
            label="Teléfono de contacto"
            action={<SettingsLinkButton>Agregar</SettingsLinkButton>}
          >
            <span className="text-[var(--dash-muted)]">No configurado</span>
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="Cuenta de Google">
          <div className="px-5 py-4">
            <p className="text-sm text-[var(--dash-muted)] mb-3">No conectada</p>
            <SettingsOutlineButton>Conectar cuenta de Google</SettingsOutlineButton>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Claves de acceso"
          description="Las claves de acceso te permiten iniciar sesión de forma segura con huella dactilar, reconocimiento facial o PIN del dispositivo."
          footer={
            <button
              type="button"
              onClick={() => toast.message('Disponible próximamente')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
            >
              <Plus size={16} />
              Agrega una clave de acceso
            </button>
          }
        >
          <SettingsTable
            columns={[
              { key: 'name', header: 'Nombre', render: (row) => row.name },
              { key: 'added', header: 'Fecha de adición', render: (row) => row.addedAt },
              {
                key: 'lastUsed',
                header: 'Última vez que se usó',
                render: (row) => row.lastUsed,
              },
            ]}
            data={[] as PasskeyRow[]}
            rowKey={(row) => row.id}
            emptyMessage="No tienes claves de acceso registradas."
          />
        </SettingsSection>

        <SettingsSection
          title="Autenticación en dos pasos"
          description="Protege tu cuenta con un segundo factor además de la contraseña."
          footer={
            <button
              type="button"
              onClick={() => toast.message('Disponible próximamente')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
            >
              <Plus size={16} />
              Agregar un método de autenticación
            </button>
          }
        >
          <SettingsTable
            columns={[
              {
                key: 'method',
                header: 'Método',
                render: (row) => row.label,
              },
              {
                key: 'detail',
                header: 'Detalle',
                render: (row) => (
                  <span className="text-[var(--dash-muted)]">{row.detail}</span>
                ),
              },
            ]}
            data={[] as TwoFactorMethod[]}
            rowKey={(row) => row.id}
            emptyMessage="No hay métodos de autenticación configurados."
          />
          <div className="px-5 py-4 border-t border-[var(--dash-border)] flex items-start gap-3">
            <KeyRound size={16} className="text-[var(--dash-muted)] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-[var(--dash-text)]">Códigos de respaldo</p>
              <p className="text-sm text-[var(--dash-muted)] mt-0.5">
                No hay códigos de respaldo generados.
              </p>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Idioma">
          <div className="px-5 py-4 space-y-4">
            <div>
              <label
                htmlFor="language-select"
                className="text-sm font-medium text-[var(--dash-text)] block mb-1.5"
              >
                Idioma del panel
              </label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="dash-input w-full max-w-xs px-4 py-2.5 text-sm"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-[var(--dash-muted)] inline-flex items-center gap-1.5">
              <Globe size={14} aria-hidden />
              Idioma detectado: Español (España)
            </p>
            <button
              type="button"
              onClick={handleSaveLanguage}
              disabled={savingLanguage}
              className="dash-btn-primary px-5 py-2 text-sm disabled:opacity-50"
            >
              {savingLanguage ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Sesiones"
          description="Dispositivos donde has iniciado sesión recientemente."
          action={
            <SettingsOutlineButton>Cerrar el resto de las sesiones</SettingsOutlineButton>
          }
        >
          <SettingsTable
            columns={[
              { key: 'location', header: 'Ubicación', render: (row) => row.location },
              { key: 'device', header: 'Dispositivo', render: (row) => row.device },
              {
                key: 'ip',
                header: 'Dirección IP',
                render: (row) => (
                  <span className="font-mono text-xs text-[var(--dash-muted)]">{row.ip}</span>
                ),
              },
              {
                key: 'lastActive',
                header: 'Última actividad',
                render: (row) => row.lastActive,
              },
            ]}
            data={[] as SessionRow[]}
            rowKey={(row) => row.id}
            emptyMessage="No hay sesiones activas registradas."
          />
        </SettingsSection>

        <SettingsSection title="Cuentas">
          <SettingsTable
            columns={[
              { key: 'name', header: 'Nombre', render: (row) => row.name },
              {
                key: 'accountId',
                header: 'Identificación',
                render: (row) => (
                  <span className="font-mono text-xs text-[var(--dash-muted)]">
                    {row.accountId}
                  </span>
                ),
              },
            ]}
            data={[] as AccountRow[]}
            rowKey={(row) => row.id}
            emptyMessage="No hay cuentas vinculadas."
          />
        </SettingsSection>

        <MerchantWalletSection />
      </div>
    </>
  );
}

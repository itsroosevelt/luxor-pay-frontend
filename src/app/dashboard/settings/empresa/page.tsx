'use client';

import { useEffect, useRef, useState } from 'react';
import { EmptyState } from '@/components/dashboard';
import {
  SettingsPageHeader,
  SettingsRow,
  SettingsSection,
  SettingsTabBar,
} from '@/components/dashboard/settings';
import {
  EMPRESA_MORE_TABS,
  EMPRESA_PRIMARY_TABS,
  TIMEZONE_OPTIONS,
  US_STATES,
  buildEmptyBusinessAccountForm,
  buildEmptyCompanyData,
  buildEmptyPublicData,
  buildEmptyTaxData,
  displayValue,
  isEmpresaMoreTab,
  loadBusinessAccountForm,
  loadBusinessOwners,
  loadCompanyData,
  loadPublicData,
  loadTaxData,
  saveBusinessAccountForm,
  saveCompanyData,
  savePublicData,
  saveTaxData,
  type BusinessAccountFormData,
  type BusinessOwner,
  type CompanyBusinessData,
  type EmpresaTabId,
  type PublicBusinessData,
  type TaxBusinessData,
} from '@/lib/dashboard/business-account-settings';
import { dashStatusBadges } from '@/lib/dashboard/dashboard-styles';
import { cn } from '@/lib/cn';
import {
  Building2,
  Check,
  ChevronDown,
  Copy,
  Landmark,
  Link2,
  Palette,
  Plus,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

const ALL_EMPRESA_TABS = [...EMPRESA_PRIMARY_TABS, ...EMPRESA_MORE_TABS];

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

function CopyAccountIdButton({ accountId }: { accountId: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!accountId.trim()) return;
    try {
      await navigator.clipboard.writeText(accountId);
      setCopied(true);
      toast.success('ID copiado al portapapeles');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar el ID');
    }
  };

  return (
    <div className="flex items-center gap-2 max-w-md">
      <code className="flex-1 text-sm font-mono text-[var(--dash-muted)] bg-[var(--dash-surface-elevated)] border border-[var(--dash-border)] rounded-md px-3 py-2 truncate min-h-[42px] flex items-center">
        {accountId.trim() ? accountId : 'Se generará al guardar'}
      </code>
      <button
        type="button"
        onClick={() => void copy()}
        disabled={!accountId.trim()}
        className="shrink-0 p-2 rounded-md border border-[var(--dash-border)] text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Copiar ID de la cuenta"
      >
        {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
      </button>
    </div>
  );
}

function AccountDataForm({
  form,
  onChange,
  onSave,
  saving,
}: {
  form: BusinessAccountFormData;
  onChange: (patch: Partial<BusinessAccountFormData>) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <form
      className="dash-card p-6 md:p-8 space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <div className="space-y-1.5">
        <label htmlFor="account-name" className="text-sm font-medium text-[var(--dash-text)]">
          Nombre de la cuenta
        </label>
        <input
          id="account-name"
          type="text"
          value={form.accountName}
          onChange={(e) => onChange({ accountName: e.target.value })}
          placeholder="Nombre de la cuenta"
          className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <span className="text-sm font-medium text-[var(--dash-text)]">ID de la cuenta</span>
        <CopyAccountIdButton accountId={form.accountId} />
      </div>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-[var(--dash-text)]">Dirección comercial</legend>
        <input
          type="text"
          value={form.addressLine1}
          onChange={(e) => onChange({ addressLine1: e.target.value })}
          placeholder="Línea de dirección 1"
          className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
          aria-label="Línea de dirección 1"
        />
        <input
          type="text"
          value={form.addressLine2}
          onChange={(e) => onChange({ addressLine2: e.target.value })}
          placeholder="Línea de dirección 2 (opcional)"
          className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
          aria-label="Línea de dirección 2"
        />
        <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
          <input
            type="text"
            value={form.city}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="Ciudad"
            className="dash-input flex-1 px-4 py-2.5 text-sm"
            aria-label="Ciudad"
          />
          <select
            value={form.state}
            onChange={(e) => onChange({ state: e.target.value })}
            className="dash-input sm:w-40 px-4 py-2.5 text-sm"
            aria-label="Estado"
          >
            <option value="">Estado</option>
            {US_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={form.zip}
            onChange={(e) => onChange({ zip: e.target.value })}
            placeholder="Código postal"
            className="dash-input sm:w-32 px-4 py-2.5 text-sm"
            aria-label="Código postal"
          />
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <span className="text-sm font-medium text-[var(--dash-text)]">Verificación por teléfono</span>
        {form.phoneVerified ? (
          <div className="space-y-2">
            <span className={dashStatusBadges.success}>Verificado</span>
            {form.phone && (
              <p className="text-sm text-[var(--dash-muted)]">{form.phone}</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <span className={dashStatusBadges.neutral}>No verificado</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => onChange({ phone: e.target.value, phoneVerified: false })}
              placeholder="Número de teléfono"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
              aria-label="Número de teléfono"
            />
            <p className="text-sm text-[var(--dash-muted)]">
              Agrega un número y verifica tu teléfono para proteger tu cuenta.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="timezone" className="text-sm font-medium text-[var(--dash-text)]">
          Zona horaria
        </label>
        <select
          id="timezone"
          value={form.timezone}
          onChange={(e) => onChange({ timezone: e.target.value })}
          className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
        >
          <option value="">Selecciona una zona horaria</option>
          {TIMEZONE_OPTIONS.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="dash-btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

function CompanyDataSection({
  data,
  editing,
  onEdit,
  onCancel,
  onChange,
  onSave,
  saving,
}: {
  data: CompanyBusinessData;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onChange: (patch: Partial<CompanyBusinessData>) => void;
  onSave: () => void;
  saving: boolean;
}) {
  if (editing) {
    return (
      <SettingsSection
        title="Datos de la empresa"
        action={
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
          >
            Cancelar
          </button>
        }
      >
        <form
          className="px-5 py-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <div className="space-y-1.5">
            <label htmlFor="company-name" className="text-sm font-medium text-[var(--dash-text)]">
              Nombre de la empresa
            </label>
            <input
              id="company-name"
              type="text"
              value={data.companyName}
              onChange={(e) => onChange({ companyName: e.target.value })}
              placeholder="Nombre legal de la empresa"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="website" className="text-sm font-medium text-[var(--dash-text)]">
              Sitio web
            </label>
            <input
              id="website"
              type="url"
              value={data.website}
              onChange={(e) => onChange({ website: e.target.value })}
              placeholder="https://"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="public-name" className="text-sm font-medium text-[var(--dash-text)]">
              Nombre público
            </label>
            <input
              id="public-name"
              type="text"
              value={data.publicName}
              onChange={(e) => onChange({ publicName: e.target.value })}
              placeholder="Nombre visible para clientes"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-[var(--dash-text)]">Dirección</legend>
            <input
              type="text"
              value={data.addressLine1}
              onChange={(e) => onChange({ addressLine1: e.target.value })}
              placeholder="Línea de dirección 1"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
            <input
              type="text"
              value={data.addressLine2}
              onChange={(e) => onChange({ addressLine2: e.target.value })}
              placeholder="Línea de dirección 2 (opcional)"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <input
                type="text"
                value={data.city}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="Ciudad"
                className="dash-input flex-1 px-4 py-2.5 text-sm"
              />
              <input
                type="text"
                value={data.state}
                onChange={(e) => onChange({ state: e.target.value })}
                placeholder="Estado / provincia"
                className="dash-input sm:w-40 px-4 py-2.5 text-sm"
              />
              <input
                type="text"
                value={data.zip}
                onChange={(e) => onChange({ zip: e.target.value })}
                placeholder="Código postal"
                className="dash-input sm:w-32 px-4 py-2.5 text-sm"
              />
            </div>
            <input
              type="text"
              value={data.country}
              onChange={(e) => onChange({ country: e.target.value })}
              placeholder="País"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </fieldset>
          <button
            type="submit"
            disabled={saving}
            className="dash-btn-primary px-5 py-2 text-sm disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title="Datos de la empresa"
      action={<SettingsOutlineButton onClick={onEdit}>Editar</SettingsOutlineButton>}
    >
      <div className="px-5 py-4 border-b border-[var(--dash-border)]">
        <h3 className="text-lg font-semibold text-[var(--dash-text)]">
          {displayValue(data.companyName)}
        </h3>
      </div>
      <SettingsRow label="Sitio web">{displayValue(data.website)}</SettingsRow>
      <SettingsRow label="Nombre público">{displayValue(data.publicName)}</SettingsRow>
      <SettingsRow label="Dirección">
        {data.addressLine1.trim() ||
        data.city.trim() ||
        data.state.trim() ||
        data.zip.trim() ||
        data.country.trim() ? (
          <span className="block space-y-0.5 text-[var(--dash-text)]">
            {data.addressLine1.trim() && <span className="block">{data.addressLine1}</span>}
            {data.addressLine2.trim() && <span className="block">{data.addressLine2}</span>}
            {(data.city.trim() || data.state.trim() || data.zip.trim()) && (
              <span className="block">
                {[data.city, data.state, data.zip].filter((v) => v.trim()).join(', ')}
              </span>
            )}
            {data.country.trim() && <span className="block">{data.country}</span>}
          </span>
        ) : (
          '—'
        )}
      </SettingsRow>
      <SettingsRow label="Otra información proporcionada">
        {data.otherInfo.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 text-[var(--dash-text)]">
            {data.otherInfo.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : (
          <span className="text-[var(--dash-muted)]">No hay información adicional</span>
        )}
      </SettingsRow>
    </SettingsSection>
  );
}

function PublicDataSection({
  data,
  editing,
  onEdit,
  onCancel,
  onChange,
  onSave,
  saving,
}: {
  data: PublicBusinessData;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onChange: (patch: Partial<PublicBusinessData>) => void;
  onSave: () => void;
  saving: boolean;
}) {
  if (editing) {
    return (
      <SettingsSection
        title="Datos públicos"
        action={
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
          >
            Cancelar
          </button>
        }
      >
        <form
          className="px-5 py-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <div className="space-y-1.5">
            <label htmlFor="support-email" className="text-sm font-medium text-[var(--dash-text)]">
              Correo de atención al cliente
            </label>
            <input
              id="support-email"
              type="email"
              value={data.supportEmail}
              onChange={(e) => onChange({ supportEmail: e.target.value })}
              placeholder="soporte@empresa.com"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="support-phone" className="text-sm font-medium text-[var(--dash-text)]">
              Teléfono de atención al cliente
            </label>
            <input
              id="support-phone"
              type="tel"
              value={data.supportPhone}
              onChange={(e) => onChange({ supportPhone: e.target.value })}
              placeholder="+34 …"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="support-url" className="text-sm font-medium text-[var(--dash-text)]">
              URL de soporte
            </label>
            <input
              id="support-url"
              type="url"
              value={data.supportUrl}
              onChange={(e) => onChange({ supportUrl: e.target.value })}
              placeholder="https://"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="privacy-url" className="text-sm font-medium text-[var(--dash-text)]">
              Política de privacidad
            </label>
            <input
              id="privacy-url"
              type="url"
              value={data.privacyPolicyUrl}
              onChange={(e) => onChange({ privacyPolicyUrl: e.target.value })}
              placeholder="https://"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="terms-url" className="text-sm font-medium text-[var(--dash-text)]">
              Términos del servicio
            </label>
            <input
              id="terms-url"
              type="url"
              value={data.termsOfServiceUrl}
              onChange={(e) => onChange({ termsOfServiceUrl: e.target.value })}
              placeholder="https://"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="dash-btn-primary px-5 py-2 text-sm disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title="Datos públicos"
      action={<SettingsOutlineButton onClick={onEdit}>Editar</SettingsOutlineButton>}
    >
      <SettingsRow label="Correo de atención al cliente">
        {displayValue(data.supportEmail)}
      </SettingsRow>
      <SettingsRow label="Teléfono de atención al cliente">
        {displayValue(data.supportPhone)}
      </SettingsRow>
      <SettingsRow label="URL de soporte">{displayValue(data.supportUrl)}</SettingsRow>
      <SettingsRow label="Política de privacidad">{displayValue(data.privacyPolicyUrl)}</SettingsRow>
      <SettingsRow label="Términos del servicio">{displayValue(data.termsOfServiceUrl)}</SettingsRow>
    </SettingsSection>
  );
}

function OwnersSection({
  owners,
  onAdd,
}: {
  owners: BusinessOwner[];
  onAdd: () => void;
}) {
  return (
    <SettingsSection
      title="Directores y propietarios"
      description="Personas con control significativo o propiedad de la empresa."
      footer={
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
        >
          <Plus size={16} />
          Agrega un propietario
        </button>
      }
    >
      {owners.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-[var(--dash-muted)]">
            No hay directores ni propietarios registrados.
          </p>
        </div>
      ) : (
        owners.map((owner) => (
          <SettingsRow key={owner.id} label={owner.role || 'Propietario'}>
            <span className="text-[var(--dash-text)]">{owner.name}</span>
            {owner.email && (
              <span className="block text-[var(--dash-muted)] mt-0.5">{owner.email}</span>
            )}
          </SettingsRow>
        ))
      )}
    </SettingsSection>
  );
}

function AccountRepresentativeSection() {
  return (
    <SettingsSection
      title="Cambiar representante de la cuenta"
      description="La persona autorizada para actuar en nombre de la empresa ante Luxor Pay."
    >
      <div className="px-5 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--dash-muted)]">
            No hay un representante de la cuenta asignado.
          </p>
        </div>
        <SettingsOutlineButton>Elegir</SettingsOutlineButton>
      </div>
    </SettingsSection>
  );
}

function AccountStatusTab() {
  return (
    <SettingsSection title="Estado de la cuenta">
      <SettingsRow label="Estado">
        <span className={dashStatusBadges.neutral}>Pendiente de configuración</span>
      </SettingsRow>
      <SettingsRow label="Verificación">
        <span className="text-[var(--dash-muted)]">Sin verificar</span>
      </SettingsRow>
      <SettingsRow label="Capacidades de pago">
        <span className="text-[var(--dash-muted)]">Ninguna activa</span>
      </SettingsRow>
      <SettingsRow label="Restricciones">
        <span className="text-[var(--dash-muted)]">Ninguna</span>
      </SettingsRow>
    </SettingsSection>
  );
}

function ExternalAccountsTab() {
  return (
    <EmptyState
      icon={Link2}
      title="Sin cuentas externas vinculadas"
      description="Vincula cuentas de plataformas externas para sincronizar datos con Luxor Pay."
      action={{ label: 'Vincular cuenta', onClick: () => toast.message('Disponible próximamente') }}
    />
  );
}

function BankAccountsTab() {
  return (
    <EmptyState
      icon={Landmark}
      title="Sin cuentas bancarias"
      description="Agrega una cuenta bancaria para recibir pagos y gestionar monedas de liquidación."
      action={{
        label: 'Agregar cuenta bancaria',
        onClick: () => toast.message('Disponible próximamente'),
      }}
    />
  );
}

function TaxDataTab({
  form,
  onChange,
  onSave,
  saving,
}: {
  form: TaxBusinessData;
  onChange: (patch: Partial<TaxBusinessData>) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <form
      className="dash-card p-6 md:p-8 space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <p className="text-sm text-[var(--dash-muted)] leading-relaxed">
        Información fiscal utilizada para facturación y cumplimiento normativo. Completa los datos
        cuando estés listo para operar.
      </p>
      <div className="space-y-1.5">
        <label htmlFor="tax-id" className="text-sm font-medium text-[var(--dash-text)]">
          Identificación fiscal
        </label>
        <input
          id="tax-id"
          type="text"
          value={form.taxId}
          onChange={(e) => onChange({ taxId: e.target.value })}
          placeholder="NIF / CIF / EIN"
          className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="tax-id-type" className="text-sm font-medium text-[var(--dash-text)]">
          Tipo de identificación
        </label>
        <input
          id="tax-id-type"
          type="text"
          value={form.taxIdType}
          onChange={(e) => onChange({ taxIdType: e.target.value })}
          placeholder="Tipo de identificación fiscal"
          className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="legal-name" className="text-sm font-medium text-[var(--dash-text)]">
          Nombre legal
        </label>
        <input
          id="legal-name"
          type="text"
          value={form.legalName}
          onChange={(e) => onChange({ legalName: e.target.value })}
          placeholder="Nombre legal para facturación"
          className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
        />
      </div>
      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-[var(--dash-text)]">Dirección fiscal</legend>
        <input
          type="text"
          value={form.addressLine1}
          onChange={(e) => onChange({ addressLine1: e.target.value })}
          placeholder="Línea de dirección 1"
          className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
        />
        <input
          type="text"
          value={form.addressLine2}
          onChange={(e) => onChange({ addressLine2: e.target.value })}
          placeholder="Línea de dirección 2 (opcional)"
          className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
        />
        <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
          <input
            type="text"
            value={form.city}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="Ciudad"
            className="dash-input flex-1 px-4 py-2.5 text-sm"
          />
          <input
            type="text"
            value={form.state}
            onChange={(e) => onChange({ state: e.target.value })}
            placeholder="Estado / provincia"
            className="dash-input sm:w-40 px-4 py-2.5 text-sm"
          />
          <input
            type="text"
            value={form.zip}
            onChange={(e) => onChange({ zip: e.target.value })}
            placeholder="Código postal"
            className="dash-input sm:w-32 px-4 py-2.5 text-sm"
          />
        </div>
        <input
          type="text"
          value={form.country}
          onChange={(e) => onChange({ country: e.target.value })}
          placeholder="País"
          className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
        />
      </fieldset>
      <button
        type="submit"
        disabled={saving}
        className="dash-btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
      >
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
    </form>
  );
}

function MoreTabPlaceholder({ tabId }: { tabId: EmpresaTabId }) {
  const tab = ALL_EMPRESA_TABS.find((t) => t.id === tabId);
  const icons: Partial<Record<EmpresaTabId, typeof Building2>> = {
    personalizacion: Palette,
    dominios: Link2,
    integraciones: Shield,
  };
  const Icon = icons[tabId] ?? Building2;

  return (
    <EmptyState
      icon={Icon}
      title={`Sin configuración de ${tab?.label?.toLowerCase() ?? 'esta sección'}`}
      description="Completa la configuración básica de tu cuenta para habilitar opciones avanzadas."
    />
  );
}

export default function EmpresaSettingsPage() {
  const [activeTab, setActiveTab] = useState<EmpresaTabId>('datos-cuenta');
  const [accountForm, setAccountForm] = useState<BusinessAccountFormData>(() =>
    buildEmptyBusinessAccountForm()
  );
  const [companyData, setCompanyData] = useState<CompanyBusinessData>(() => buildEmptyCompanyData());
  const [publicData, setPublicData] = useState<PublicBusinessData>(() => buildEmptyPublicData());
  const [taxForm, setTaxForm] = useState<TaxBusinessData>(() => buildEmptyTaxData());
  const [owners, setOwners] = useState<BusinessOwner[]>([]);
  const [editingCompany, setEditingCompany] = useState(false);
  const [editingPublic, setEditingPublic] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingPublic, setSavingPublic] = useState(false);
  const [savingTax, setSavingTax] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setAccountForm(loadBusinessAccountForm());
      setCompanyData(loadCompanyData());
      setPublicData(loadPublicData());
      setTaxForm(loadTaxData());
      setOwners(loadBusinessOwners());
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!moreOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [moreOpen]);

  const handleSaveAccount = async () => {
    setSavingAccount(true);
    const saved = saveBusinessAccountForm(accountForm);
    setAccountForm(saved);
    await new Promise((r) => setTimeout(r, 350));
    toast.success('Datos de la cuenta guardados');
    setSavingAccount(false);
  };

  const handleSaveCompany = async () => {
    setSavingCompany(true);
    saveCompanyData(companyData);
    await new Promise((r) => setTimeout(r, 350));
    toast.success('Datos de la empresa guardados');
    setEditingCompany(false);
    setSavingCompany(false);
  };

  const handleSavePublic = async () => {
    setSavingPublic(true);
    savePublicData(publicData);
    await new Promise((r) => setTimeout(r, 350));
    toast.success('Datos públicos guardados');
    setEditingPublic(false);
    setSavingPublic(false);
  };

  const handleSaveTax = async () => {
    setSavingTax(true);
    saveTaxData(taxForm);
    await new Promise((r) => setTimeout(r, 350));
    toast.success('Datos fiscales guardados');
    setSavingTax(false);
  };

  const handleAddOwner = () => {
    toast.message('Disponible próximamente');
  };

  const moreActive = isEmpresaMoreTab(activeTab);
  const moreLabel = EMPRESA_MORE_TABS.find((t) => t.id === activeTab)?.label ?? 'Más';

  if (!hydrated) {
    return (
      <>
        <SettingsPageHeader
          title="Empresa"
          description="Administra los datos de tu cuenta de comercio y la información legal del negocio."
        />
        <div className="p-6 md:p-8">
          <p className="text-sm text-[var(--dash-muted)]">Cargando…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SettingsPageHeader
        title="Empresa"
        description="Administra los datos de tu cuenta de comercio y la información legal del negocio."
      />

      <div className="px-6 md:px-8 border-b border-[var(--dash-border)]">
        <div className="flex flex-wrap items-end gap-1">
          <SettingsTabBar
            tabs={EMPRESA_PRIMARY_TABS}
            activeTab={moreActive ? '' : activeTab}
            onTabChange={(tabId) => {
              setMoreOpen(false);
              setActiveTab(tabId as EmpresaTabId);
            }}
            className="flex-1 border-b-0"
          />
          <div ref={moreRef} className="relative -mb-px pb-px">
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              className={cn(
                'inline-flex items-center gap-1 px-3 py-2.5 text-sm font-medium transition-colors border-b-2',
                moreActive
                  ? 'border-[var(--dash-accent)] text-[var(--dash-text)]'
                  : 'border-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:border-[var(--dash-border)]'
              )}
            >
              {moreActive ? moreLabel : 'Más'}
              <ChevronDown size={14} className={cn('transition-transform', moreOpen && 'rotate-180')} />
            </button>
            {moreOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-20 mt-1 min-w-[240px] dash-card py-1 shadow-lg"
              >
                {EMPRESA_MORE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMoreOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm transition-colors',
                      activeTab === tab.id
                        ? 'text-[var(--dash-accent)] bg-[var(--dash-accent-soft)]'
                        : 'text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)]'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-3xl mx-auto pb-12 space-y-6">
        {(activeTab === 'datos-cuenta' || activeTab === 'datos-empresa') && (
          <p className="text-sm text-[var(--dash-muted)] leading-relaxed">
            La identidad legal y la información fiscal pueden compartirse entre las cuentas de tu
            organización en Luxor Pay. Los cambios en esta sección solo afectan a la cuenta activa.
          </p>
        )}

        {activeTab === 'datos-cuenta' && (
          <div role="tabpanel" id="empresa-panel-datos-cuenta" aria-labelledby="comm-tab-datos-cuenta">
            <AccountDataForm
              form={accountForm}
              onChange={(patch) => setAccountForm((prev) => ({ ...prev, ...patch }))}
              onSave={() => void handleSaveAccount()}
              saving={savingAccount}
            />
          </div>
        )}

        {activeTab === 'estado-cuenta' && (
          <div role="tabpanel" id="empresa-panel-estado-cuenta" aria-labelledby="comm-tab-estado-cuenta">
            <AccountStatusTab />
          </div>
        )}

        {activeTab === 'datos-empresa' && (
          <div role="tabpanel" id="empresa-panel-datos-empresa" aria-labelledby="comm-tab-datos-empresa">
            <div className="space-y-6">
              <CompanyDataSection
                data={companyData}
                editing={editingCompany}
                onEdit={() => setEditingCompany(true)}
                onCancel={() => {
                  setCompanyData(loadCompanyData());
                  setEditingCompany(false);
                }}
                onChange={(patch) => setCompanyData((prev) => ({ ...prev, ...patch }))}
                onSave={() => void handleSaveCompany()}
                saving={savingCompany}
              />
              <PublicDataSection
                data={publicData}
                editing={editingPublic}
                onEdit={() => setEditingPublic(true)}
                onCancel={() => {
                  setPublicData(loadPublicData());
                  setEditingPublic(false);
                }}
                onChange={(patch) => setPublicData((prev) => ({ ...prev, ...patch }))}
                onSave={() => void handleSavePublic()}
                saving={savingPublic}
              />
              <OwnersSection owners={owners} onAdd={handleAddOwner} />
              <AccountRepresentativeSection />
            </div>
          </div>
        )}

        {activeTab === 'cuentas-externas' && (
          <div
            role="tabpanel"
            id="empresa-panel-cuentas-externas"
            aria-labelledby="comm-tab-cuentas-externas"
          >
            <ExternalAccountsTab />
          </div>
        )}

        {activeTab === 'cuentas-bancarias' && (
          <div
            role="tabpanel"
            id="empresa-panel-cuentas-bancarias"
            aria-labelledby="comm-tab-cuentas-bancarias"
          >
            <BankAccountsTab />
          </div>
        )}

        {activeTab === 'datos-fiscales' && (
          <div role="tabpanel" id="empresa-panel-datos-fiscales" aria-labelledby="comm-tab-datos-fiscales">
            <TaxDataTab
              form={taxForm}
              onChange={(patch) => setTaxForm((prev) => ({ ...prev, ...patch }))}
              onSave={() => void handleSaveTax()}
              saving={savingTax}
            />
          </div>
        )}

        {isEmpresaMoreTab(activeTab) && (
          <div role="tabpanel" id={`empresa-panel-${activeTab}`} aria-labelledby={`comm-tab-${activeTab}`}>
            <MoreTabPlaceholder tabId={activeTab} />
          </div>
        )}
      </div>
    </>
  );
}

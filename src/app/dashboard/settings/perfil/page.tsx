'use client';

import {
  SettingsPageHeader,
  SettingsSectionRow,
} from '@/components/dashboard/settings';
import { Palette } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function PerfilLuxorSettingsPage() {
  return (
    <>
      <SettingsPageHeader
        title="Perfil de Luxor Pay"
        description="Marca pública, políticas y apariencia del checkout para tus clientes."
      />

      <div className="p-6 md:p-8 max-w-4xl mx-auto pb-12">
        <section className="dash-card overflow-hidden">
          <SettingsSectionRow
            label="Nombre público"
            description="Cómo aparece tu comercio en enlaces de pago, checkout y recibos."
          >
            <input
              type="text"
              placeholder="Nombre visible para clientes"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
              aria-label="Nombre público"
            />
          </SettingsSectionRow>

          <SettingsSectionRow
            label="Apariencia del checkout"
            description="Personaliza colores y estilo del flujo de pago Solana Pay."
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--dash-surface-elevated)] border border-dashed border-[var(--dash-border)] flex items-center justify-center text-[var(--dash-muted)]">
                  <Palette size={18} />
                </div>
                <p className="text-sm text-[var(--dash-muted)]">Sin personalización configurada</p>
              </div>
              <button
                type="button"
                onClick={() => toast.message('Personalizar checkout — próximamente')}
                className="dash-btn-secondary px-3 py-1.5 text-sm"
              >
                Personalizar
              </button>
            </div>
          </SettingsSectionRow>

          <SettingsSectionRow label="Política de privacidad">
            <input
              type="url"
              placeholder="https://"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
              aria-label="URL de política de privacidad"
            />
          </SettingsSectionRow>

          <SettingsSectionRow label="Términos del servicio">
            <input
              type="url"
              placeholder="https://"
              className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
              aria-label="URL de términos del servicio"
            />
          </SettingsSectionRow>

          <SettingsSectionRow label="Dominio personalizado">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="pay.tudominio.com"
                className="dash-input w-full max-w-lg px-4 py-2.5 text-sm"
                aria-label="Dominio personalizado"
              />
              <p className="text-xs text-[var(--dash-muted)]">
                Configura DNS desde la sección{' '}
                <Link
                  href="/dashboard/settings/empresa"
                  className="text-[var(--dash-accent)] hover:underline"
                >
                  Empresa
                </Link>
                .
              </p>
            </div>
          </SettingsSectionRow>
        </section>
      </div>
    </>
  );
}

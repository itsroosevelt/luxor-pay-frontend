'use client';

import { SettingsPageHeader, SettingsSectionRow } from '@/components/dashboard/settings';
import { ExternalLink, Gift, Percent, Sparkles } from 'lucide-react';

const PARTNER_PERKS = [
  {
    id: 'solana-foundation',
    title: 'Programa para comercios Solana',
    description:
      'Accede a créditos de desarrollo y soporte técnico para integraciones Solana Pay.',
    badge: 'Socio',
  },
  {
    id: 'fee-discount',
    title: 'Descuento en comisiones',
    description: 'Reduce tarifas de procesamiento al alcanzar volúmenes mensuales elegibles.',
    badge: 'Volumen',
  },
  {
    id: 'analytics-plus',
    title: 'Analytics Plus',
    description: 'Informes avanzados de conversión y cohortes de clientes recurrentes.',
    badge: 'Producto',
  },
] as const;

export default function VentajasSettingsPage() {
  return (
    <>
      <SettingsPageHeader
        title="Ventajas"
        description="Beneficios para comercios y promociones de socios disponibles en Luxor Pay."
      />

      <div className="p-6 md:p-8 max-w-4xl mx-auto pb-12 space-y-6">
        <section className="dash-card overflow-hidden">
          <SettingsSectionRow
            label="Estado del programa"
            description="Beneficios activos en tu cuenta de comercio."
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--dash-accent-soft)] flex items-center justify-center text-[var(--dash-accent)]">
                <Gift size={20} />
              </div>
              <p className="text-sm text-[var(--dash-muted)]">
                No tienes ventajas activas. Explora las ofertas disponibles abajo.
              </p>
            </div>
          </SettingsSectionRow>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PARTNER_PERKS.map((perk) => (
            <article key={perk.id} className="dash-card p-6 space-y-3 flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
                  {perk.badge}
                </span>
                <Sparkles size={16} className="text-[var(--dash-accent)] shrink-0" aria-hidden />
              </div>
              <h3 className="text-sm font-semibold text-[var(--dash-text)]">{perk.title}</h3>
              <p className="text-sm text-[var(--dash-muted)] leading-relaxed flex-1">
                {perk.description}
              </p>
              <button
                type="button"
                className="dash-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-sm self-start"
              >
                Más información
                <ExternalLink size={14} aria-hidden />
              </button>
            </article>
          ))}
        </div>

        <section className="dash-card p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--dash-surface-elevated)] border border-[var(--dash-border)] flex items-center justify-center text-[var(--dash-muted)] shrink-0">
            <Percent size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[var(--dash-text)]">
              Referidos de comercio
            </h3>
            <p className="text-sm text-[var(--dash-muted)] mt-1 leading-relaxed">
              Invita a otros comercios a Luxor Pay. Las recompensas por referidos aparecerán aquí
              cuando el programa esté disponible en tu región.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

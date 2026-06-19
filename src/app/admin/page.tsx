'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { DashboardMetricCard } from '@/components/dashboard/DashboardMetricCard';
import { DetailSection } from '@/components/dashboard/DetailSection';
import { computePlatformMetrics } from '@/lib/admin-metrics';
import {
  Store,
  ArrowRightLeft,
  TrendingUp,
  Percent,
  Coins,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/cn';

function formatUsd(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatSuccessRate(value: number): string {
  if (value === 0) return '0%';
  return `${value.toLocaleString('es-ES', { maximumFractionDigits: 1 })}%`;
}

export default function AdminDashboardPage() {
  const metrics = useMemo(() => computePlatformMetrics(), []);

  const quickLinks = useMemo(
    () => [
      {
        href: '/admin/tokens',
        label: 'Tokens y treasury',
        description: 'Tokens soportados en checkout — lo más útil para probar pagos',
        primary: true,
      },
      {
        href: '/admin/users',
        label: 'Comercios y usuarios',
        description: 'Ver perfiles merchant detectados en este navegador',
        primary: true,
      },
      {
        href: '/admin/commissions',
        label: 'Fees y comisiones',
        description: 'Opcional — no afecta enlaces de pago en demo',
        primary: false,
      },
      {
        href: '/admin/reports',
        label: 'Reportes y analíticas',
        description: 'Gráficos agregados desde pagos locales',
        primary: false,
      },
    ],
    []
  );

  const volumeTrend =
    metrics.growthPercent !== null
      ? {
          value: `${metrics.growthPercent >= 0 ? '+' : ''}${metrics.growthPercent}%`,
          positive: metrics.growthPercent >= 0,
        }
      : undefined;

  return (
    <div>
      <PageHeader
        title="Métricas globales"
        description="Indicadores agregados desde pagos y comercios guardados en este navegador."
      />

      <div className="px-4 sm:px-6 md:px-8 pb-8 space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardMetricCard
            label="Volumen procesado"
            value={formatUsd(metrics.volumeUsd)}
            sublabel={
              metrics.hasActivity ? 'Últimos 30 días' : 'Sin actividad aún'
            }
            icon={TrendingUp}
            trend={volumeTrend}
          />
          <DashboardMetricCard
            label="Comercios activos"
            value={metrics.merchantCount > 0 ? String(metrics.merchantCount) : '0'}
            sublabel={
              metrics.merchantCount > 0
                ? 'Perfiles en este navegador'
                : 'Sin perfiles locales aún'
            }
            icon={Store}
            href="/admin/users"
          />
          <DashboardMetricCard
            label="Transacciones"
            value={metrics.transactionCount.toLocaleString('es-ES')}
            sublabel={
              metrics.hasActivity
                ? 'Confirmadas (últimos 30 días)'
                : 'Sin transacciones aún'
            }
            icon={ArrowRightLeft}
          />
          <DashboardMetricCard
            label="Ingresos de plataforma"
            value={formatUsd(metrics.revenueUsd)}
            sublabel={`Comisión ${metrics.commissionPercent}% sobre volumen`}
            icon={Percent}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <DashboardMetricCard
            label="Tokens activos"
            value={String(metrics.activeTokens)}
            sublabel={metrics.activeTokens > 0 ? 'Habilitados en checkout' : 'Ninguno configurado'}
            icon={Coins}
            href="/admin/tokens"
          />
          <div className="lg:col-span-2">
            <DetailSection
              title="Actividad reciente"
              description={
                metrics.hasActivity
                  ? 'Resumen de operaciones en este navegador.'
                  : 'Sin actividad aún — los números aparecerán cuando haya pagos locales.'
              }
            >
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-elevated)] p-4">
                  <p className="text-xs text-[var(--dash-muted)]">Pagos hoy</p>
                  <p className="text-xl font-semibold tabular-nums mt-1">
                    {metrics.paymentsToday.toLocaleString('es-ES')}
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-elevated)] p-4">
                  <p className="text-xs text-[var(--dash-muted)]">Nuevos comercios</p>
                  <p className="text-xl font-semibold tabular-nums mt-1">
                    {metrics.newMerchantsToday.toLocaleString('es-ES')}
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-elevated)] p-4">
                  <p className="text-xs text-[var(--dash-muted)]">Tasa de éxito</p>
                  <p
                    className={cn(
                      'text-xl font-semibold tabular-nums mt-1',
                      metrics.successRatePercent > 0 && 'text-emerald-400'
                    )}
                  >
                    {formatSuccessRate(metrics.successRatePercent)}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs text-[var(--dash-muted)] flex items-center gap-1.5">
                <Activity size={12} />
                Datos locales hasta conectar el backend de administración.
              </p>
            </DetailSection>
          </div>
        </div>

        <section>
          <h2 className="text-sm font-semibold text-[var(--dash-text)] mb-3">Accesos rápidos</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickLinks.map(({ href, label, description, primary }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'dash-card p-4 flex items-center justify-between gap-3 hover:bg-[var(--dash-surface-elevated)] transition-colors group',
                  primary && 'ring-1 ring-[var(--dash-accent)]/25'
                )}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--dash-text)] group-hover:text-[var(--dash-accent)] transition-colors">
                    {label}
                    {!primary && (
                      <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
                        Vista previa
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--dash-muted)] mt-0.5">{description}</p>
                </div>
                <ArrowRight
                  size={16}
                  className="text-[var(--dash-muted)] shrink-0 group-hover:text-[var(--dash-accent)]"
                />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

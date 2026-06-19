'use client';

import { useMemo } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { DetailSection } from '@/components/dashboard/DetailSection';
import { DashboardMetricCard } from '@/components/dashboard/DashboardMetricCard';
import { AdminPreviewNotice } from '@/components/admin/AdminPreviewNotice';
import { BarChartPlaceholder, DonutChartPlaceholder } from '@/components/admin/ChartPlaceholder';
import { computePlatformMetrics, computeReportChartData } from '@/lib/admin-metrics';
import { Download, TrendingUp, ArrowRightLeft, Store } from 'lucide-react';
import { toast } from 'sonner';

function formatUsd(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminReportsPage() {
  const metrics = useMemo(() => computePlatformMetrics(), []);
  const chartData = useMemo(() => computeReportChartData(), []);
  const hasChartData = chartData.volumeByMonth.some((m) => m.value > 0);

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
        title="Reportes y analíticas"
        description="Informes agregados desde pagos locales en este navegador."
        actions={
          <button
            type="button"
            onClick={() => toast.info('Exportación CSV — próximamente con backend')}
            className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
          >
            <Download size={14} />
            Exportar reporte
          </button>
        }
      />

      <div className="px-4 sm:px-6 md:px-8 pb-8 space-y-6 max-w-6xl mx-auto">
        <AdminPreviewNotice />
        <div className="grid gap-4 sm:grid-cols-3">
          <DashboardMetricCard
            label="Volumen total"
            value={formatUsd(metrics.volumeUsd)}
            sublabel={metrics.hasActivity ? 'Últimos 30 días' : 'Sin actividad aún'}
            icon={TrendingUp}
            trend={volumeTrend}
          />
          <DashboardMetricCard
            label="Transacciones"
            value={metrics.transactionCount.toLocaleString('es-ES')}
            sublabel={metrics.hasActivity ? 'Confirmadas' : 'Sin transacciones aún'}
            icon={ArrowRightLeft}
          />
          <DashboardMetricCard
            label="Comercios activos"
            value={String(metrics.merchantCount)}
            sublabel={
              metrics.merchantCount > 0
                ? 'Perfiles en este navegador'
                : 'Sin perfiles locales aún'
            }
            icon={Store}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <DetailSection
            title="Volumen mensual"
            description="Tendencia de pagos procesados en la plataforma."
          >
            <BarChartPlaceholder
              data={
                hasChartData
                  ? chartData.volumeByMonth
                  : [
                      { label: 'Ene', value: 0 },
                      { label: 'Feb', value: 0 },
                      { label: 'Mar', value: 0 },
                      { label: 'Abr', value: 0 },
                      { label: 'May', value: 0 },
                      { label: 'Jun', value: 0 },
                    ]
              }
            />
          </DetailSection>

          <DetailSection
            title="Transacciones por token"
            description="Distribución porcentual de pagos por activo."
          >
            <DonutChartPlaceholder
              data={
                chartData.transactionsByToken.length > 0
                  ? chartData.transactionsByToken
                  : [{ label: 'Sin datos', value: 100, color: 'var(--dash-border)' }]
              }
            />
          </DetailSection>
        </div>

        <DetailSection
          title="Top comercios por volumen"
          description={
            chartData.topMerchants.length > 0
              ? 'Ranking de comercios con mayor volumen en este navegador.'
              : 'Sin comercios con volumen aún.'
          }
        >
          <div className="space-y-3">
            {chartData.topMerchants.length === 0 ? (
              <p className="text-sm text-[var(--dash-muted)] py-4 text-center">
                Sin actividad aún
              </p>
            ) : (
              chartData.topMerchants.map((merchant, idx) => {
                const maxVolume = chartData.topMerchants[0].volume;
                const pct = maxVolume > 0 ? (merchant.volume / maxVolume) * 100 : 0;
                return (
                  <div key={merchant.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-[var(--dash-muted)] w-5">{idx + 1}.</span>
                        <span className="font-medium">{merchant.name}</span>
                      </span>
                      <span className="text-[var(--dash-muted)] tabular-nums">
                        {formatUsd(merchant.volume)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--dash-surface-elevated)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--dash-accent)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DetailSection>
      </div>
    </div>
  );
}

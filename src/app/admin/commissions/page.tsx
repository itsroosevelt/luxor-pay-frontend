'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { DetailSection } from '@/components/dashboard/DetailSection';
import { loadPlatformConfig, savePlatformConfig } from '@/lib/platform-config';
import { appendSecurityLog } from '@/lib/admin-users';
import { toast } from 'sonner';
import { ArrowRight, Info, AlertCircle } from 'lucide-react';

export default function AdminCommissionsPage() {
  const [commissionPercent, setCommissionPercent] = useState(() =>
    String(loadPlatformConfig().globalCommissionPercent)
  );
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(commissionPercent);
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      toast.error('Ingresa un porcentaje válido entre 0 y 100');
      return;
    }

    setSaving(true);
    savePlatformConfig({ globalCommissionPercent: value });
    appendSecurityLog({
      type: 'config_change',
      email: 'admin@luxor.pay',
      description: `Comisión global actualizada a ${value}%`,
    });
    toast.success('Comisión global guardada');
    setSaving(false);
  };

  const exampleAmount = 100;
  const luxorFee = ((Number(commissionPercent) || 0) / 100) * exampleAmount;
  const merchantReceives = exampleAmount - luxorFee;

  return (
    <div>
      <PageHeader
        title="Fees y comisiones"
        description="Vista previa de la comisión de plataforma. Opcional en modo demo."
      />

      <div className="px-4 sm:px-6 md:px-8 pb-8 space-y-6 max-w-3xl mx-auto">
        <div className="dash-card dash-banner-warning px-4 py-3 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-[var(--dash-text)]">
              No es necesario configurar comisiones para probar enlaces de pago
            </p>
            <p className="text-[var(--dash-muted)] mt-1 text-xs leading-relaxed">
              Los valores que guardes aquí solo se almacenan en localStorage y no se deducen de
              ningún pago. Esto aplicará cuando los pagos reales estén activos.
            </p>
          </div>
        </div>

        <DetailSection
          title="Comisión global de plataforma"
          description="Se aplicará sobre el monto bruto de cada pago confirmado cuando el backend esté conectado."
        >
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label
                htmlFor="global-commission"
                className="block text-sm font-medium text-[var(--dash-text)] mb-1.5"
              >
                Porcentaje de comisión (%)
              </label>
              <div className="relative max-w-xs">
                <input
                  id="global-commission"
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(e.target.value)}
                  className="dash-input w-full px-4 py-2.5 text-sm pr-10"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--dash-muted)]">
                  %
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-elevated)] p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
                Simulador de comisión
              </p>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-[var(--dash-muted)] text-xs">Pago bruto</p>
                  <p className="font-semibold tabular-nums">${exampleAmount.toFixed(2)} USDC</p>
                </div>
                <div>
                  <p className="text-[var(--dash-muted)] text-xs">Comisión Luxor</p>
                  <p className="font-semibold tabular-nums text-[var(--dash-accent)]">
                    ${luxorFee.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--dash-muted)] text-xs">Comercio recibe</p>
                  <p className="font-semibold tabular-nums text-emerald-400">
                    ${merchantReceives.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="dash-btn-primary px-5 py-2 text-sm disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar comisión'}
            </button>
          </form>
        </DetailSection>

        <DetailSection
          title="Estructura de fees"
          description="Resumen de cómo se aplican las comisiones en la plataforma."
        >
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--dash-surface-elevated)]">
              <Info size={16} className="text-[var(--dash-accent)] shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-[var(--dash-text)]">Comisión por transacción</p>
                <p className="text-[var(--dash-muted)] mt-0.5">
                  Se deducirá automáticamente al confirmar el pago on-chain (cuando esté activo). El
                  comercio recibirá el neto en su wallet configurada.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--dash-surface-elevated)]">
              <Info size={16} className="text-[var(--dash-accent)] shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-[var(--dash-text)]">Facturación recurrente</p>
                <p className="text-[var(--dash-muted)] mt-0.5">
                  Las suscripciones y recordatorios tienen configuración independiente.
                </p>
                <Link
                  href="/admin/billing"
                  className="inline-flex items-center gap-1 text-[var(--dash-accent)] text-xs mt-2 hover:underline"
                >
                  Ir a facturación recurrente
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </DetailSection>
      </div>
    </div>
  );
}

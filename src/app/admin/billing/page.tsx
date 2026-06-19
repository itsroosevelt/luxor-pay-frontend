'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { DetailSection } from '@/components/dashboard/DetailSection';
import { AdminToggle } from '@/components/admin/AdminToggle';
import { AdminPreviewNotice } from '@/components/admin/AdminPreviewNotice';
import {
  loadPlatformConfig,
  savePlatformConfig,
  type RecurringBillingConfig,
} from '@/lib/platform-config';
import { appendSecurityLog } from '@/lib/admin-users';
import { toast } from 'sonner';
import { Bell, Calendar, Clock } from 'lucide-react';

export default function AdminBillingPage() {
  const [config, setConfig] = useState<RecurringBillingConfig>(
    () => loadPlatformConfig().recurringBilling
  );
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    savePlatformConfig({ recurringBilling: config });
    appendSecurityLog({
      type: 'config_change',
      email: 'admin@luxor.pay',
      description: 'Configuración de facturación recurrente actualizada',
    });
    toast.success('Configuración de facturación guardada');
    setSaving(false);
  };

  return (
    <div>
      <PageHeader
        title="Facturación recurrente"
        description="Recordatorios y políticas de cobro para suscripciones y facturas periódicas."
      />

      <div className="px-4 sm:px-6 md:px-8 pb-8 space-y-6 max-w-3xl mx-auto">
        <AdminPreviewNotice />
        <DetailSection
          title="Recordatorios de pago"
          description="Define cuándo enviar avisos antes y después del vencimiento (demo — se conectará al backend)."
        >
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-[var(--dash-border)]">
              <div className="flex items-start gap-3">
                <Bell size={18} className="text-[var(--dash-accent)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Enviar recordatorios automáticos</p>
                  <p className="text-xs text-[var(--dash-muted)] mt-0.5">
                    Email y notificación in-app antes del vencimiento
                  </p>
                </div>
              </div>
              <AdminToggle
                checked={config.autoSendReminders}
                onChange={(autoSendReminders) => setConfig((c) => ({ ...c, autoSendReminders }))}
                label="Recordatorios automáticos"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="reminder-days"
                  className="flex items-center gap-2 text-sm font-medium mb-1.5"
                >
                  <Calendar size={14} className="text-[var(--dash-muted)]" />
                  Días antes del vencimiento
                </label>
                <input
                  id="reminder-days"
                  type="number"
                  min={0}
                  max={30}
                  value={config.reminderDaysBefore}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      reminderDaysBefore: Number(e.target.value) || 0,
                    }))
                  }
                  className="dash-input w-full px-4 py-2.5 text-sm"
                />
                <p className="text-xs text-[var(--dash-muted)] mt-1.5">
                  Primer recordatorio {config.reminderDaysBefore} día(s) antes
                </p>
              </div>
              <div>
                <label
                  htmlFor="grace-days"
                  className="flex items-center gap-2 text-sm font-medium mb-1.5"
                >
                  <Clock size={14} className="text-[var(--dash-muted)]" />
                  Período de gracia (días)
                </label>
                <input
                  id="grace-days"
                  type="number"
                  min={0}
                  max={30}
                  value={config.overdueGraceDays}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      overdueGraceDays: Number(e.target.value) || 0,
                    }))
                  }
                  className="dash-input w-full px-4 py-2.5 text-sm"
                />
                <p className="text-xs text-[var(--dash-muted)] mt-1.5">
                  Días adicionales antes de marcar como moroso
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="dash-btn-primary px-5 py-2 text-sm disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar configuración'}
            </button>
          </form>
        </DetailSection>

        <DetailSection
          title="Calendario de recordatorios (demo)"
          description="Vista previa del flujo de notificaciones para una factura recurrente."
        >
          <ol className="space-y-3">
            {[
              {
                day: `D-${config.reminderDaysBefore}`,
                label: 'Primer recordatorio',
                detail: 'Email al cliente con enlace de pago',
              },
              {
                day: 'D-0',
                label: 'Vencimiento',
                detail: 'Factura emitida y pendiente de cobro on-chain',
              },
              {
                day: `D+${config.overdueGraceDays}`,
                label: 'Fin de período de gracia',
                detail: 'Suscripción marcada como morosa si no hay pago',
              },
            ].map((step) => (
              <li
                key={step.day}
                className="flex items-start gap-4 p-3 rounded-lg bg-[var(--dash-surface-elevated)]"
              >
                <span className="text-xs font-mono font-semibold text-[var(--dash-accent)] w-12 shrink-0">
                  {step.day}
                </span>
                <div>
                  <p className="text-sm font-medium">{step.label}</p>
                  <p className="text-xs text-[var(--dash-muted)]">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </DetailSection>
      </div>
    </div>
  );
}

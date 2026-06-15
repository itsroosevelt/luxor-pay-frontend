'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { DetailSection } from '@/components/dashboard/DetailSection';
import { AdminPreviewNotice } from '@/components/admin/AdminPreviewNotice';
import { getPlatformAdminEmails } from '@/lib/platform-admin';
import { getEnabledTokens, loadPlatformConfig } from '@/lib/platform-config';
import { toast } from 'sonner';
import {
  ArrowRight,
  Bell,
  Coins,
  Percent,
  Repeat,
  Shield,
  Users,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const adminEmails = getPlatformAdminEmails();
  const config = loadPlatformConfig();
  const commissionPercent = config.globalCommissionPercent;
  const tokenCount = getEnabledTokens(config).length;

  const configLinks = [
    {
      href: '/admin/commissions',
      label: 'Fees y comisiones',
      value: `${commissionPercent}% global`,
      icon: Percent,
    },
    {
      href: '/admin/billing',
      label: 'Facturación recurrente',
      value: 'Recordatorios',
      icon: Repeat,
    },
    {
      href: '/admin/tokens',
      label: 'Tokens y treasury',
      value: `${tokenCount} activos`,
      icon: Coins,
    },
    {
      href: '/admin/users',
      label: 'Comercios y usuarios',
      value: 'Gestión de cuentas',
      icon: Users,
    },
    {
      href: '/admin/security',
      label: 'Equipo y seguridad',
      value: 'Miembros admin',
      icon: Shield,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Ajustes generales del panel de administración de plataforma."
      />

      <div className="px-4 sm:px-6 md:px-8 pb-8 space-y-6 max-w-3xl mx-auto">
        <AdminPreviewNotice />
        <DetailSection
          title="Administradores de plataforma (auth real)"
          description="Acceso concedido por correo verificado en Firebase. No editable desde la UI."
        >
          <ul className="space-y-1.5">
            {adminEmails.map((email) => (
              <li
                key={email}
                className="text-sm font-mono text-[var(--dash-text)] bg-[var(--dash-surface-elevated)] rounded-md px-3 py-2"
              >
                {email}
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--dash-muted)] mt-3">
            Para añadir más administradores, configura{' '}
            <code className="text-[var(--dash-accent)]">NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS</code>{' '}
            (correos separados por coma) y vuelve a desplegar.
          </p>
        </DetailSection>

        <DetailSection title="Accesos de configuración" description="Enlaces rápidos a secciones del panel.">
          <div className="space-y-2">
            {configLinks.map(({ href, label, value, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-[var(--dash-border)] hover:bg-[var(--dash-surface-elevated)] transition-colors group"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon size={16} className="text-[var(--dash-accent)] shrink-0" />
                  <span className="text-sm font-medium group-hover:text-[var(--dash-accent)] transition-colors">
                    {label}
                  </span>
                </span>
                <span className="flex items-center gap-2 text-xs text-[var(--dash-muted)] shrink-0">
                  {value}
                  <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </DetailSection>

        <DetailSection title="Notificaciones de plataforma" description="Alertas por email y webhooks.">
          <p className="text-sm text-[var(--dash-muted)] mb-4">
            Configura alertas para eventos críticos: fallos de pago, cambios de comisión, nuevos
            comercios y actividad sospechosa.
          </p>
          <button
            type="button"
            onClick={() => toast.info('Notificaciones de plataforma — próximamente con backend')}
            className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
          >
            <Bell size={14} />
            Configurar alertas
          </button>
        </DetailSection>

        <DetailSection title="Modo demo" description="Estado actual de la integración.">
          <p className="text-sm text-[var(--dash-muted)]">
            Este panel usa localStorage y valores simulados para configuración operativa. La
            autenticación de administrador es real (Firebase). La integración con el backend de
            administración se añadirá en una fase posterior.
          </p>
        </DetailSection>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { FlaskConical, X } from 'lucide-react';
import { cn } from '@/lib/cn';

const DISMISS_KEY = 'luxor-admin-demo-banner-dismissed';

interface AdminDemoBannerProps {
  className?: string;
}

export function AdminDemoBanner({ className }: AdminDemoBannerProps) {
  const [dismissed, setDismissed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1'
  );

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div
      className={cn(
        'dash-card dash-banner-warning mx-4 sm:mx-6 md:mx-8 mt-4 px-4 py-3 flex items-start gap-3',
        className
      )}
      role="status"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 shrink-0">
        <FlaskConical size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--dash-text)]">Modo demo</p>
        <p className="text-xs text-[var(--dash-muted)] mt-1 leading-relaxed">
          Este panel aún no está conectado al backend. La autenticación de administrador es real
          (Firebase); el resto se guarda en este navegador.
        </p>
        <ul className="mt-2 space-y-1 text-xs text-[var(--dash-muted)]">
          <li>
            <span className="text-emerald-400 font-medium">Funcional ahora:</span> métricas
            locales, tokens en checkout, listado de comercios del navegador.
          </li>
          <li>
            <span className="text-amber-400 font-medium">Vista previa:</span> comisiones,
            facturación, reportes, roles y equipo (no afectan pagos reales).
          </li>
        </ul>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="p-1 rounded-md text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)] shrink-0"
        aria-label="Ocultar aviso"
      >
        <X size={16} />
      </button>
    </div>
  );
}

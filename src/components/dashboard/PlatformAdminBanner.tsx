'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Shield, X } from 'lucide-react';
import { cn } from '@/lib/cn';

const DISMISS_KEY = 'luxor-platform-admin-banner-dismissed';

interface PlatformAdminBannerProps {
  className?: string;
}

export function PlatformAdminBanner({ className }: PlatformAdminBannerProps) {
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
        'dash-card dash-banner-info mx-4 sm:mx-6 md:mx-8 mt-4 px-4 py-3 flex items-start gap-3',
        className
      )}
      role="status"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--dash-accent-soft)] text-[var(--dash-accent)] shrink-0">
        <Shield size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--dash-text)]">
          También tienes acceso al panel de administración
        </p>
        <p className="text-xs text-[var(--dash-muted)] mt-0.5">
          Supervisa comercios, comisiones y ajustes de plataforma desde{' '}
          <Link href="/admin" className="text-[var(--dash-accent)] hover:underline font-medium">
            /admin
          </Link>
          .
        </p>
      </div>
      <Link
        href="/admin"
        className="dash-btn-primary px-3 py-1.5 text-xs shrink-0 hidden sm:inline-flex"
      >
        Ir al panel
      </Link>
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

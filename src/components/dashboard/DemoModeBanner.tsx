'use client';

import { useState } from 'react';
import { FlaskConical, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { isFrontendOnly } from '@/lib/frontend-only';

const DISMISS_KEY = 'luxor-demo-mode-banner-dismissed';

interface DemoModeBannerProps {
  className?: string;
  /** Smaller inline variant for footers and secondary surfaces. */
  compact?: boolean;
  /** Allow dismissing the banner (dashboard/links only). */
  dismissible?: boolean;
}

export function DemoModeBanner({
  className,
  compact = false,
  dismissible = true,
}: DemoModeBannerProps) {
  const [dismissed, setDismissed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1'
  );

  if (!isFrontendOnly()) return null;
  if (dismissible && dismissed) return null;

  const message =
    'Modo demo: datos solo en este navegador. Para compartir entre dispositivos se necesita backend.';

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  if (compact) {
    return (
      <p
        className={cn(
          'text-[10px] leading-relaxed text-gray-500 text-center',
          className
        )}
        role="status"
      >
        {message}
      </p>
    );
  }

  return (
    <div
      className={cn(
        'dash-card dash-banner-warning px-4 py-3 flex items-start gap-3',
        className
      )}
      role="status"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 shrink-0">
        <FlaskConical size={16} />
      </div>
      <p className="min-w-0 flex-1 text-xs text-[var(--dash-muted)] leading-relaxed">{message}</p>
      {dismissible ? (
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded-md text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)] shrink-0"
          aria-label="Ocultar aviso"
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}

/** Toast suffix when copying payment links in demo mode. */
export function demoCopyLinkToastMessage(): string {
  return isFrontendOnly()
    ? 'URL copiada — solo funciona en este navegador (modo demo)'
    : 'URL copiada';
}

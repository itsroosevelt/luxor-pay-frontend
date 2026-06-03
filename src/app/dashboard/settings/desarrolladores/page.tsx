'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SettingsPageHeader, SettingsSectionRow } from '@/components/dashboard/settings';
import {
  SDK_LANGUAGE_OPTIONS,
  WORKBENCH_THEME_OPTIONS,
  loadSdkLanguage,
  loadWorkbenchTheme,
  saveSdkLanguage,
  saveWorkbenchTheme,
  type SdkLanguageId,
  type WorkbenchTheme,
} from '@/lib/dashboard/developer-prefs';
import { cn } from '@/lib/cn';
import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

function SettingsInlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
    >
      {children}
    </Link>
  );
}

function SegmentedThemeControl({
  value,
  onChange,
}: {
  value: WorkbenchTheme;
  onChange: (theme: WorkbenchTheme) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Aspecto de Workbench"
      className="inline-flex flex-wrap gap-1 p-1 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-elevated)]"
    >
      {WORKBENCH_THEME_OPTIONS.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={selected}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              selected
                ? 'bg-[var(--dash-surface)] text-[var(--dash-text)] shadow-sm border border-[var(--dash-border)]'
                : 'text-[var(--dash-muted)] hover:text-[var(--dash-text)]'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function SdkLanguageGrid({
  value,
  onChange,
}: {
  value: SdkLanguageId;
  onChange: (id: SdkLanguageId) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {SDK_LANGUAGE_OPTIONS.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={selected}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-colors',
              selected
                ? 'border-[var(--dash-accent)] bg-[var(--dash-accent-soft)]'
                : 'border-[var(--dash-border)] hover:border-[var(--dash-muted)] bg-[var(--dash-surface-elevated)]'
            )}
          >
            <span
              className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                backgroundColor:
                  opt.id === 'none' ? 'var(--dash-surface)' : `${opt.accent}22`,
                color: opt.id === 'none' ? 'var(--dash-muted)' : opt.accent,
                border: `1px solid ${opt.id === 'none' ? 'var(--dash-border)' : `${opt.accent}44`}`,
              }}
              aria-hidden
            >
              {opt.initials}
            </span>
            <span className="text-sm font-medium text-[var(--dash-text)] leading-tight">
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function DesarrolladoresSettingsPage() {
  const [theme, setTheme] = useState<WorkbenchTheme>('light');
  const [sdkLanguage, setSdkLanguage] = useState<SdkLanguageId>('node');
  const [hydrated, setHydrated] = useState(false);
  const businessName = 'tu cuenta';

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setTheme(loadWorkbenchTheme());
      setSdkLanguage(loadSdkLanguage());
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleThemeChange = (next: WorkbenchTheme) => {
    setTheme(next);
    saveWorkbenchTheme(next);
    toast.success('Preferencia de aspecto guardada');
  };

  const handleSdkChange = (next: SdkLanguageId) => {
    setSdkLanguage(next);
    saveSdkLanguage(next);
    toast.success('Lenguaje SDK guardado');
  };

  return (
    <>
      <SettingsPageHeader
        title="Desarrolladores"
        description="Workbench, claves de API y preferencias de integración para tu comercio."
      />

      <div className="p-6 md:p-8 max-w-4xl mx-auto pb-12">
        <section className="dash-card overflow-hidden">
          <SettingsSectionRow label="Claves API">
            <p className="text-[var(--dash-muted)] leading-relaxed">
              Se puede acceder a las claves API desde el menú Desarrolladores.{' '}
              <SettingsInlineLink href="/dashboard/developers">
                Gestionar claves API
              </SettingsInlineLink>
            </p>
          </SettingsSectionRow>

          <SettingsSectionRow label="Workbench">
            <div className="space-y-3">
              <p className="text-[var(--dash-muted)] leading-relaxed">
                Workbench está activado para {businessName}.{' '}
                <button
                  type="button"
                  onClick={() => toast.message('Recorrido guiado — próximamente')}
                  className="font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
                >
                  Haz el recorrido
                </button>
              </p>
              <p className="text-[var(--dash-muted)] leading-relaxed">
                Explora la API de Luxor Pay, prueba solicitudes y revisa registros en un entorno
                seguro. Consulta la{' '}
                <a
                  href="https://docs.luxor.tech/pay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] inline-flex items-center gap-0.5"
                >
                  documentación de la API
                  <ExternalLink size={12} className="inline shrink-0" aria-hidden />
                </a>{' '}
                y la{' '}
                <a
                  href="https://docs.luxor.tech/pay/workbench"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] inline-flex items-center gap-0.5"
                >
                  guía de Workbench
                  <ExternalLink size={12} className="inline shrink-0" aria-hidden />
                </a>
                .
              </p>
            </div>
          </SettingsSectionRow>

          <SettingsSectionRow label="Aspecto">
            {hydrated ? (
              <SegmentedThemeControl value={theme} onChange={handleThemeChange} />
            ) : (
              <span className="text-[var(--dash-muted)]">Cargando…</span>
            )}
          </SettingsSectionRow>

          <SettingsSectionRow label="Lenguaje SDK">
            {hydrated ? (
              <SdkLanguageGrid value={sdkLanguage} onChange={handleSdkChange} />
            ) : (
              <span className="text-[var(--dash-muted)]">Cargando…</span>
            )}
          </SettingsSectionRow>
        </section>
      </div>
    </>
  );
}

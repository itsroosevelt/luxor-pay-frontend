'use client';

/**
 * PortalSwitcher — Meta Business Suite-style "apps grid" launcher.
 *
 * Lists all 3 Luxor Pay portals (main dashboard + the 2 satellites) and
 * marks whichever one you're currently in as non-clickable. Every other
 * entry opens in a NEW TAB — never in-place navigation — so switching
 * portals never replaces the app you were just looking at. Rendered both
 * in the main Sidebar (`current="main"`) and in `PortalTopBar` for each
 * satellite portal (`current="launcher"` / `current="pos"`).
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Check, ExternalLink, LayoutDashboard, Rocket, QrCode, ChevronRight } from 'lucide-react';
import { useMerchant } from '@/context/MerchantContext';
import { MAIN_PORTAL, SATELLITE_PORTALS, buildPortalSsoUrl, redirectPreopenedTab, type PortalTarget } from '@/lib/portal-sso';

const ALL_PORTALS: PortalTarget[] = [MAIN_PORTAL, ...SATELLITE_PORTALS];

const PORTAL_ICON: Record<PortalTarget['key'], typeof Rocket> = {
  main: LayoutDashboard,
  launcher: Rocket,
  pos: QrCode,
};

export function PortalSwitcher({
  isCollapsed,
  current = 'main',
}: {
  isCollapsed?: boolean;
  /** Which portal is rendering this switcher — that entry shows as "estás aquí" instead of a link. */
  current?: PortalTarget['key'];
}) {
  const { profile } = useMerchant();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<PortalTarget['key'] | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const openPortal = async (portal: PortalTarget) => {
    setOpen(false);

    // Internal route (main dashboard or a satellite under (portals)): same
    // origin, shared session — a direct window.open resolves against the
    // current page and always opens a new tab (portals never replace the
    // tab you were on). No token handoff needed — the browser already
    // carries the Firebase session here.
    if (portal.baseUrl.startsWith('/')) {
      window.open(portal.baseUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // Genuinely external deployment: pre-open a blank tab synchronously so
    // the popup blocker doesn't swallow it while we await the SSO token,
    // then redirect that tab once the signed URL is ready.
    const tab = window.open('', '_blank', 'noopener');
    setPending(portal.key);
    try {
      const url = await buildPortalSsoUrl(portal, profile?.id ?? null);
      redirectPreopenedTab(tab, url);
    } finally {
      setPending(null);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Cambiar de portal"
        title="Portales Luxor Pay"
        className="flex items-center justify-center rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
      >
        <LayoutGrid size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ type: 'spring', bounce: 0.25, duration: 0.35 }}
            className={isCollapsed ? 'absolute left-full top-0 ml-2 z-50' : 'absolute right-0 sm:left-0 top-full mt-2 z-50'}
            style={{
              width: 'min(300px, calc(100vw - 2rem))',
              background: '#0D0E14',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--lx-radius-lg)',
              boxShadow: '0 24px 60px -16px rgba(0, 0, 0, 0.95)',
              padding: 8,
            }}
          >
            <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--lx-text-dim)' }}>
              Portales Luxor Pay
            </p>

            {ALL_PORTALS.map((portal) => {
              const Icon = PORTAL_ICON[portal.key];
              const isCurrent = portal.key === current;
              const isPending = pending === portal.key;

              if (isCurrent) {
                return (
                  <div
                    key={portal.key}
                    className="flex items-center gap-3 rounded-lg px-2.5 py-2"
                    style={{ background: 'var(--lx-fill)' }}
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--lx-surface-2)', border: '1px solid var(--lx-border)' }}>
                      <Icon size={16} style={{ color: 'var(--lx-text)' }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold" style={{ color: 'var(--lx-text)' }}>{portal.label}</p>
                      <p className="truncate text-[11.5px]" style={{ color: 'var(--lx-text-dim)' }}>Estás aquí</p>
                    </div>
                    <Check size={15} style={{ color: 'var(--lx-success)' }} />
                  </div>
                );
              }

              return (
                <button
                  key={portal.key}
                  type="button"
                  role="menuitem"
                  disabled={isPending}
                  onClick={() => openPortal(portal)}
                  className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors disabled:opacity-60"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--lx-fill-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border)', color: 'var(--lx-text-muted)' }}>
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold" style={{ color: 'var(--lx-text)' }}>{portal.label}</p>
                    <p className="truncate text-[11.5px]" style={{ color: 'var(--lx-text-dim)' }}>{portal.description}</p>
                  </div>
                  {isPending ? (
                    <span className="text-[11px]" style={{ color: 'var(--lx-text-dim)' }}>Abriendo…</span>
                  ) : (
                    <ExternalLink size={13} className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ color: 'var(--lx-text-muted)' }} />
                  )}
                </button>
              );
            })}

            <div className="my-1.5 h-px" style={{ background: 'var(--lx-border)' }} />
            <p className="flex items-center gap-1 px-2.5 pb-1 pt-0.5 text-[11px]" style={{ color: 'var(--lx-text-dim)' }}>
              Cada portal se abre en su propia pestaña <ChevronRight size={11} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { HEADER_CREATE_OPTIONS } from '@/components/dashboard/create-payment-options';

function ShortcutBadges({ shortcut }: { shortcut: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 shrink-0">
      {shortcut.split('').map((key) => (
        <kbd
          key={key}
          className="text-[10px] font-normal px-1 py-0.5 rounded border border-[var(--dash-border)] bg-[var(--dash-panel-elevated)] text-[var(--dash-muted)] uppercase min-w-[1.125rem] text-center"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}

export function QuickCreateMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div ref={containerRef} className="relative ml-1">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn('dash-header-create-btn', open && 'ring-2 ring-[var(--dash-accent-soft)]')}
        aria-label="Create"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Quick create"
          className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,280px)] overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel)] py-1.5 shadow-xl"
        >
          {HEADER_CREATE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const label = option.headerTitle ?? option.title;
            return (
              <button
                key={option.id}
                type="button"
                role="menuitem"
                onClick={() => handleSelect(option.href)}
                className="w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors hover:bg-[var(--dash-surface-elevated)]"
              >
                <div className="w-8 h-8 shrink-0 rounded-lg bg-[var(--dash-accent-soft)] flex items-center justify-center text-[var(--dash-accent)]">
                  <Icon size={16} />
                </div>
                <span className="flex-1 min-w-0 font-medium text-sm text-[var(--dash-text)]">
                  {label}
                </span>
                <ShortcutBadges shortcut={option.shortcut} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { CREATE_PAYMENT_OPTIONS } from '@/components/dashboard/create-payment-options';

function ShortcutBadges({ shortcut }: { shortcut: string }) {
  return (
    <span className="hidden sm:inline-flex items-center gap-0.5 shrink-0">
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

export function CreatePaymentMenu() {
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
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="dash-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Plus size={16} />
        Create payment
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Create payment options"
          className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,380px)] overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel)] py-1.5 shadow-xl"
        >
          {CREATE_PAYMENT_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                role="menuitem"
                onClick={() => handleSelect(option.href)}
                className="w-full text-left px-3 py-2.5 flex items-start gap-3 transition-colors hover:bg-[var(--dash-surface-elevated)]"
              >
                <div className="mt-0.5 w-9 h-9 shrink-0 rounded-lg bg-[var(--dash-accent-soft)] flex items-center justify-center text-[var(--dash-accent)]">
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-[var(--dash-text)]">
                      {option.title}
                    </span>
                    <ShortcutBadges shortcut={option.shortcut} />
                  </div>
                  <p className="text-xs text-[var(--dash-muted)] mt-0.5 leading-snug">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
